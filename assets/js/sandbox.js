/**
 * BrandCheck Pro — Volatile RAM Sandbox Simulation Engine v3
 * Routing Architecture (2026):
 *   1. BYOK key (any provider)      → Direct provider API call with model fallback chain
 *   2. No BYOK + backend configured  → Backend gateway uses operator-paid key securely
 *   3. No BYOK + no backend          → Offline RAG/heuristic engine (never returns hard 100)
 *
 * The operator-paid DEFAULT_API_KEY is stored ONLY on the backend (backend/.env).
 * It is never exposed in front-end code.
 *
 * Supported BYOK key prefixes (auto-detected):
 *   sk-or-*              → OpenRouter
 *   AIza*                → Google AI Studio (Gemini)
 *   sk-* / sk-proj-*     → OpenAI
 *   sk-ant-*             → Anthropic
 *   anything else        → OpenRouter-compatible fallback
 *
 * Backend gateway:
 *   Set BACKEND_URL below. The backend resolves keys server-side:
 *     • Signed-in users get the operator-paid key on every run
 *     • Anonymous visitors get one complimentary paid run (first-use-per-IP)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BACKEND / EDGE GATEWAY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const BACKEND_URL = "";  // e.g. "http://localhost:8000" or "/api"

// Optional Supabase Edge Function or Vercel Function proxy for secure key handling.
// If set, it overrides BACKEND_URL for the primary gateway call.
const SUPABASE_EDGE_FUNCTION = "";  // e.g. "https://<project>.supabase.co/functions/v1/analyze"
const SUPABASE_ANON_KEY = "";       // public anon key; secrets stay server-side

// OpenRouter model pool (tried in order)
const OR_MODEL_POOL = [
  "openrouter/auto",
  "google/gemini-2.0-flash-001",
  "qwen/qwen-2.5-72b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free"
];

// Google AI Studio model pool (tried in order)
const GEMINI_POOL = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

// OpenAI / Anthropic defaults
const OPENAI_MODEL = "gpt-4o-mini";
const ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";

// Custom self-hosted inference gateway (optional)
const ENGINE_CONFIG = { api_endpoint: null };

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL UTILITY FUNCTIONS (shared across all pages)
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeAnalysisPayload(data, engineLabel) {
  const issues = Array.isArray(data.flagged_issues) ? data.flagged_issues : [];
  return {
    overall_score: Number.isFinite(Number(data.overall_score))
      ? Math.max(0, Math.min(100, Math.round(Number(data.overall_score))))
      : 0,
    risk_level: data.risk_level || 'API Error',
    summary: data.summary || 'The analysis engine returned an empty threat evaluation.',
    flagged_issues: issues.map((issue, index) => ({
      id: `${engineLabel}-${index}-${issue.phrase || issue.category || 'issue'}`,
      phrase: issue.phrase || issue.message || 'Contextual anomaly',
      category: issue.category || 'Contextual Risk',
      rationale: issue.rationale || issue.message || 'The engine flagged this item for review.'
    })),
    engine: engineLabel
  };
}

function extractJsonPayload(rawText) {
  const clean = String(rawText || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(clean);
  } catch (_) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('The AI response did not contain valid JSON.');
    return JSON.parse(match[0]);
  }
}

async function readErrorMessage(response) {
  const text = await response.text();
  try {
    return JSON.parse(text).error?.message || text;
  } catch (_) {
    return text;
  }
}

function detectProvider(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return 'unknown';
  const key = apiKey.trim();
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('AIza')) return 'google';
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-proj-') || key.startsWith('sk-') || key.startsWith('sk_live_') || key.startsWith('sk_test_')) return 'openai';
  return 'unknown';
}

function providerLabel(apiKey) {
  const map = {
    openrouter: 'OpenRouter BYOK',
    google: 'Google AI Studio BYOK',
    openai: 'OpenAI BYOK',
    anthropic: 'Anthropic BYOK',
    unknown: 'Custom BYOK'
  };
  return map[detectProvider(apiKey)] || 'AI scan';
}

function isFirstUseDefaultConsumed() {
  return localStorage.getItem('BC_FIRST_USE_DEFAULT_CONSUMED') === '1';
}

function markFirstUseDefaultConsumed() {
  localStorage.setItem('BC_FIRST_USE_DEFAULT_CONSUMED', '1');
}

function resetFirstUseDefault() {
  localStorage.removeItem('BC_FIRST_USE_DEFAULT_CONSUMED');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(brandContext, demographics, campaignCopy, sensitivity) {
  const caseNames = (window.BRANDCHECK_RAG_KB?.case_studies || [])
    .map(c => `"${c.brand} — ${c.incident}"`).join(', ');

  const riskPatterns = (window.BRANDCHECK_RAG_KB?.risk_patterns || [])
    .slice(0, 8)
    .map(p => `- ${p.pattern}: ${p.score_impact}, ${p.rationale}`)
    .join('\n');

  return `You are BrandCheck Pro, an enterprise linguistic compliance engine for Indian markets.
Analyze the campaign copy below through the lens of documented Indian marketing crises.

Return ONLY a valid JSON object — no markdown fences, no commentary — with this exact schema:
{
  "overall_score": <integer 0-100>,
  "risk_level": "<Safe | Caution | High Risk | Critical>",
  "summary": "<2-3 sentence board-ready threat evaluation with specific reasoning>",
  "flagged_issues": [
    { "phrase": "<exact trigger>", "category": "<risk category>", "rationale": "<specific Indian-market rationale grounded in a real risk pattern>" }
  ]
}

SCORING RUBRIC (use it):
- 91-100 Safe: copy is clean, inclusive, and aligned with ASCI / platform policies.
- 71-90 Caution: minor tonal or contextual risks; refine before broad launch.
- 41-70 High Risk: clear religious, political, caste, gender, class, or profanity signals.
- 0-40 Critical: legal/communal/platform-ban level violations.

IMPORTANT: Do NOT award 100/100 unless the copy is demonstrably flawless. Most real-world campaigns merit 88-96 when clean. Always deduct a few points for any ambiguity, regional double-meaning, or platform-policy edge case.

Reference cases: ${caseNames || 'Fabindia Jashn-e-Riwaaz, Tanishq Ekatvam, Zomato Kachra, Layer\'s Shot, Manyavar Kanyamaan'}.
Reference patterns:
${riskPatterns || '- Religious festival renamed with non-Hindu terminology: high backlash risk.\n- Inter-faith portrayal in polarized climate: boycott risk.\n- Caste/community slur or stereotype: legal and PR crisis.\n- Profanity or sexually suggestive slang: platform policy violation.'}

Input:
Brand/Product Context: ${brandContext || 'Not provided'}
Target Market: ${demographics || 'Whole India Market'}
Risk Sensitivity: ${sensitivity || 'Standard'}
Campaign Copy: ${campaignCopy}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER CALLERS WITH MODEL FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

async function resolveGoogleModel(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
    if (res.ok) {
      const payload = await res.json();
      const candidates = (payload.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => String(m.name || '').replace(/^models\//, ''));
      const hit = GEMINI_POOL.find(name => candidates.includes(name));
      if (hit) return hit;
      if (candidates.length) return candidates[0];
    }
  } catch (err) {
    console.warn('[BrandCheck Pro] Google model discovery failed:', err.message);
  }
  return GEMINI_POOL[0];
}

async function callGoogleModel(apiKey, model, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    }
  );
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const payload = await res.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function runGoogleAnalysis(apiKey, prompt) {
  const discoveredModel = await resolveGoogleModel(apiKey);
  const models = [discoveredModel, ...GEMINI_POOL].filter((m, i, a) => m && a.indexOf(m) === i);
  const errors = [];
  for (const model of models) {
    try {
      const rawText = await callGoogleModel(apiKey, model, prompt);
      const data = normalizeAnalysisPayload(extractJsonPayload(rawText), `AI scan: Google AI Studio (${model})`);
      return data;
    } catch (err) {
      errors.push(`${model}: ${err.message}`);
      if (!/not found|not supported|permission|quota|api key/i.test(err.message)) break;
    }
  }
  throw new Error(`Google AI Studio could not find an available text model. ${errors.slice(-1)[0] || 'Unknown error'}`);
}

async function callOpenRouterModel(apiKey, model, prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'BrandCheck Pro'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Return only strict JSON. No markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const payload = await res.json();
  return payload.choices?.[0]?.message?.content;
}

async function runOpenRouterAnalysis(apiKey, prompt) {
  const errors = [];
  for (const model of OR_MODEL_POOL) {
    try {
      const rawText = await callOpenRouterModel(apiKey, model, prompt);
      const data = normalizeAnalysisPayload(extractJsonPayload(rawText), `AI scan: OpenRouter (${model})`);
      return data;
    } catch (err) {
      errors.push(`${model}: ${err.message}`);
      if (/invalid api key|unauthorized|authentication/i.test(err.message)) break;
    }
  }
  throw new Error(`OpenRouter could not route this key to an available model. ${errors.slice(-1)[0] || 'Unknown error'}`);
}

async function runOpenAIAnalysis(apiKey, prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'Return only strict JSON. No markdown.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    })
  });
  if (!res.ok) {
    const err = await readErrorMessage(res);
    throw new Error(`OpenAI: ${err}`);
  }
  const payload = await res.json();
  const rawText = payload.choices?.[0]?.message?.content;
  return normalizeAnalysisPayload(extractJsonPayload(rawText), 'AI scan: OpenAI BYOK');
}

async function runAnthropicAnalysis(apiKey, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: 'Return only strict JSON. No markdown.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  });
  if (!res.ok) {
    const err = await readErrorMessage(res);
    throw new Error(`Anthropic: ${err}`);
  }
  const payload = await res.json();
  const rawText = payload.content?.[0]?.text;
  return normalizeAnalysisPayload(extractJsonPayload(rawText), 'AI scan: Anthropic BYOK');
}

async function runAPIAnalysis(brandContext, demographics, campaignCopy, sensitivity, apiKey) {
  const prompt = buildSystemPrompt(brandContext, demographics, campaignCopy, sensitivity);
  const provider = detectProvider(apiKey);

  if (provider === 'openrouter' || provider === 'unknown') {
    return runOpenRouterAnalysis(apiKey, prompt);
  }
  if (provider === 'openai') {
    return runOpenAIAnalysis(apiKey, prompt);
  }
  if (provider === 'anthropic') {
    return runAnthropicAnalysis(apiKey, prompt);
  }
  return runGoogleAnalysis(apiKey, prompt);
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST-PROCESSING & CRITICAL GUARD
// ═══════════════════════════════════════════════════════════════════════════════

function runCriticalTermGuard(campaignCopy) {
  const t = campaignCopy.toLowerCase();

  const critical = [
    { tokens: ['mutthi maro'], score: 5, category: 'Explicit/Adult Content Brand Risk', rationale: 'Highly explicit regional sexual slang. Immediate withdrawal mandatory.' },
    { tokens: ['chut'], score: 5, category: 'Explicit/Adult Content Brand Risk', rationale: 'Extreme regional profanity. Maximum legal and reputational exposure.' },
    { tokens: ['gaand'], score: 8, category: 'Severe Profanity & Social Tone', rationale: 'Extreme vulgarity. Violates platform policies and Indian IT Act content norms.' },
    { tokens: ['faad'], score: 10, category: 'Severe Profanity & Social Tone', rationale: 'Violently suggestive regional slang. Extreme reputational risk.' },
    { tokens: ['nude'], score: 12, category: 'Explicit/Adult Content Brand Risk', rationale: 'Sexually explicit keyword. Violates Google Ads / Meta Advertising Standards.' }
  ];

  for (const rule of critical) {
    if (rule.tokens.some(tok => t.includes(tok))) {
      const phrase = rule.tokens.find(tok => t.includes(tok));
      return {
        overall_score: rule.score,
        risk_level: 'High Risk',
        summary: `CRITICAL COMPLIANCE FAILURE: Campaign copy contains "${phrase}", a Tier-1 brand safety violation. Public deployment is prohibited under standard advertising governance frameworks.`,
        flagged_issues: [{ phrase, category: rule.category, rationale: rule.rationale }]
      };
    }
  }

  const profanities = ['fuck', 'f**k', 'f***', 'bhenchod', 'madarchod', 'bhosadike', 'bsdk', 'chutiya', 'randi', 'chamar'];
  for (const word of profanities) {
    if (t.includes(word)) {
      return {
        overall_score: 15,
        risk_level: 'High Risk',
        summary: `CRITICAL COMPLIANCE FAILURE: Campaign copy contains severe profanity/slang "${word}". This represents a Tier-1 brand safety violation. Immediate copy review and withdrawal recommended.`,
        flagged_issues: [{ phrase: word, category: 'Severe Profanity & Social Tone', rationale: 'Severe street profanity. Violates platform brand-safety guidelines and ASCI public decency codes.' }]
      };
    }
  }

  return null;
}

function postProcessAnalysis(data, campaignCopy) {
  if (!data) return data;
  const textLower = campaignCopy.toLowerCase();
  const issues = data.flagged_issues || [];

  if (textLower.includes('sexy') || textLower.includes('adult')) {
    const word = textLower.includes('sexy') ? 'sexy' : 'adult';
    data.overall_score = Math.min(data.overall_score, 45);
    if (!['High Risk', 'Critical'].includes(data.risk_level)) data.risk_level = 'Caution';
    const existingIndex = issues.findIndex(i => i.phrase.toLowerCase() === word);
    const payload = { phrase: word, category: 'Content Appropriateness Violation', rationale: `The term "${word}" is suggestive and requires legal sign-off before regional placement.` };
    if (existingIndex >= 0) issues[existingIndex] = payload; else issues.push(payload);
  }

  // Calibrate: avoid 100 unless truly flawless
  if (Number(data.overall_score) === 100) {
    data.overall_score = 96;
    data.risk_level = 'Safe';
    if (!data.summary.includes('96')) {
      data.summary = data.summary.replace(/100/g, '96');
    }
  }

  data.flagged_issues = issues;
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE RAG/HEURISTIC ENGINE (calibrated, believable, no hard 100)
// ═══════════════════════════════════════════════════════════════════════════════

function simulateOfflineAnalysis(brandContext, demographics, campaignCopy, sensitivity = 'Standard') {
  const guard = runCriticalTermGuard(campaignCopy);
  if (guard) return guard;

  const text = (brandContext + ' ' + campaignCopy).toLowerCase();
  const flagged = [];
  let deduction = 0;
  const multiplier = sensitivity === 'Maximum' ? 1.4 : sensitivity === 'Low' ? 0.6 : 1.0;

  const kb = window.BRANDCHECK_RAG_KB || { risk_patterns: [], case_studies: [] };

  // RAG pattern matches
  for (const pattern of kb.risk_patterns || []) {
    const triggers = Array.isArray(pattern.triggers) ? pattern.triggers : [];
    for (const trigger of triggers) {
      if (text.includes(trigger.toLowerCase())) {
        flagged.push({
          phrase: trigger,
          category: pattern.category,
          rationale: `${pattern.rationale} Real precedent: ${pattern.precedent}.`
        });
        deduction += Math.round(pattern.score_impact * multiplier);
        break;
      }
    }
  }

  // Case-study narrative matches (broader semantic triggers)
  for (const cs of kb.case_studies || []) {
    const narrative = (cs.narrative_signals || []).join(' ').toLowerCase();
    const tokens = narrative.split(/\s+/).filter(w => w.length > 4);
    for (const token of tokens) {
      if (text.includes(token)) {
        flagged.push({
          phrase: token,
          category: cs.category,
          rationale: `Echoes the ${cs.brand} case: ${cs.lesson}`
        });
        deduction += Math.round(8 * multiplier);
        break;
      }
    }
  }

  // Hard-coded keyword backstop for items not in RAG KB
  const keywordBackstop = [
    { kw: 'sacred', cat: 'Religious Sensitivity', reason: 'Mixing sacred concepts with consumer products is high-risk under festive marketing codes.', score: 18 },
    { kw: 'holy', cat: 'Religious Sensitivity', reason: 'Juxtaposing holy framing with commercial offers invites PR risk.', score: 18 },
    { kw: 'mandir', cat: 'Religious Sensitivity', reason: 'Direct temple references carry significant religious sensitivity risk.', score: 20 },
    { kw: 'jihad', cat: 'Religious Sensitivity', reason: 'Highly charged religious/political term.', score: 40 },
    { kw: 'kafir', cat: 'Religious Sensitivity', reason: 'Religiously derogatory slur.', score: 50 },
    { kw: 'nationalist', cat: 'Political Neutrality', reason: 'Brand alignment with political ideology risks alienation.', score: 22 },
    { kw: 'protest', cat: 'Political Neutrality', reason: 'Associating a brand with protest imagery carries political risk.', score: 18 },
    { kw: 'fair skin', cat: 'Gender & Social Tone', reason: 'Colorist language is a documented PR crisis vector.', score: 35 },
    { kw: 'whitening', cat: 'Gender & Social Tone', reason: 'Explicit skin-whitening claims are banned under ASCI/DTCP guidelines.', score: 40 },
    { kw: 'lower caste', cat: 'Caste & Community Risk', reason: 'Direct caste-referencing is legally sensitive.', score: 50 },
    { kw: 'dalit', cat: 'Caste & Community Risk', reason: 'Using community identity terms commercially is exploitative.', score: 45 },
    { kw: 'brahmin', cat: 'Caste & Community Risk', reason: 'Caste identity references polarise audiences.', score: 40 },
    { kw: 'chamar', cat: 'Caste & Community Risk', reason: 'Actionable casteist slur under SC/ST Act.', score: 95 },
    { kw: 'ch@mar', cat: 'Caste & Community Risk', reason: 'Obfuscated casteist slur.', score: 95 },
    { kw: 'boycott', cat: 'Political Neutrality', reason: 'Combative term associated with cancel culture and brand damage.', score: 20 }
  ];

  for (const rule of keywordBackstop) {
    if (text.includes(rule.kw)) {
      const already = flagged.some(f => f.phrase.toLowerCase() === rule.kw);
      if (!already) {
        flagged.push({ phrase: rule.kw, category: rule.cat, rationale: rule.reason });
        deduction += Math.round(rule.score * multiplier);
      }
    }
  }

  // Contextual boosts for combinations
  const hasReligious = flagged.some(f => f.category === 'Religious Sensitivity');
  const hasPolitical = flagged.some(f => f.category === 'Political Neutrality');
  const hasCaste = flagged.some(f => f.category.includes('Caste'));
  if ((hasReligious && hasPolitical) || hasCaste) {
    deduction += 15;
  }

  // Score calibration
  let finalScore = Math.max(100 - deduction, 5);
  if (flagged.length === 0) {
    // No hard 100: reserve a small margin for edge cases / human review
    finalScore = 94;
  }

  let riskLevel = 'Safe';
  if (finalScore < 40) riskLevel = 'Critical';
  else if (finalScore < 70) riskLevel = 'High Risk';
  else if (finalScore < 90) riskLevel = 'Caution';

  const summary = (() => {
    if (finalScore >= 90) return `Offline screening found no high-friction signals. Score capped at ${finalScore}/100 because no automated scan can guarantee zero risk in India's diverse market; a final human review is still recommended before launch.`;
    if (finalScore >= 70) return `${flagged.length} caution-level signal(s) detected. The flagged elements may cause misinterpretation in specific Indian demographics. Refine before going live.`;
    if (finalScore >= 40) return `${flagged.length} high-risk pattern(s) identified. The copy contains language with documented PR-crisis potential in India. Immediate revision is strongly advised.`;
    return `${flagged.length} critical violation(s) detected. This copy contains language that poses severe legal, religious, or social harm risk in the Indian cultural context. Do NOT publish without complete revision and legal review.`;
  })();

  return {
    overall_score: finalScore,
    risk_level: riskLevel,
    summary,
    flagged_issues: flagged,
    engine: 'Offline RAG/Heuristic Engine'
  };
}

// Legacy alias used by some pages
function localHeuristicEngine(brandContext, demographics, campaignCopy, sensitivity = 'Standard') {
  return simulateOfflineAnalysis(brandContext, demographics, campaignCopy, sensitivity);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GATEWAY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function callSecureGateway(endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const signedInUser = (typeof getAuthUser === 'function') ? getAuthUser() : null;
  if (signedInUser?.credential) {
    headers['X-BrandCheck-Auth'] = signedInUser.credential;
  }
  if (SUPABASE_EDGE_FUNCTION && SUPABASE_ANON_KEY) {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Gateway HTTP ${res.status}`);
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION BROKER
// ═══════════════════════════════════════════════════════════════════════════════

async function executeComplianceCheck(brandContext, demographics, campaignCopy, sensitivity = 'Standard') {
  console.log('[BrandCheck Pro] Executing validation workflow...');

  const byokKey =
    localStorage.getItem('BC_LIVE_CORE_KEY') ||
    localStorage.getItem('BC_PRO_LIVE_KEY') ||
    localStorage.getItem('BC_PRO_API_KEY') ||
    sessionStorage.getItem('BC_LIVE_CORE_KEY') ||
    sessionStorage.getItem('BC_PRO_LIVE_KEY') ||
    sessionStorage.getItem('BC_PRO_API_KEY') ||
    '';

  const body = {
    text: campaignCopy,
    market: demographics || 'IN-NAT',
    brand_context: brandContext,
    demographics: demographics,
    sensitivity: sensitivity
  };

  // 1) Secure edge gateway (Supabase / Vercel function) — hides API keys server-side
  const edgeEndpoint = SUPABASE_EDGE_FUNCTION || (ENGINE_CONFIG.api_endpoint ? ENGINE_CONFIG.api_endpoint : null);
  if (edgeEndpoint) {
    try {
      const data = await callSecureGateway(edgeEndpoint, body);
      console.log('[BrandCheck Pro] Edge gateway result:', data);
      return postProcessAnalysis(normalizeAnalysisPayload(data, 'Live AI Pipeline: Secure Edge Gateway'), campaignCopy);
    } catch (err) {
      console.warn('[BrandCheck Pro] Edge gateway unreachable:', err.message);
    }
  }

  // 2) Backend gateway — hides operator-paid keys
  if (!byokKey && BACKEND_URL) {
    try {
      const data = await callSecureGateway(`${BACKEND_URL}/v1/analyze`, body);
      console.log('[BrandCheck Pro] Backend gateway result:', data);
      return postProcessAnalysis(normalizeAnalysisPayload(data, data.engine || 'Live AI Pipeline: Backend Gateway'), campaignCopy);
    } catch (err) {
      console.warn('[BrandCheck Pro] Backend gateway unreachable:', err.message);
    }
  }

  // 3) BYOK direct routes
  if (byokKey) {
    try {
      const data = await runAPIAnalysis(brandContext, demographics, campaignCopy, sensitivity, byokKey);
      return postProcessAnalysis(data, campaignCopy);
    } catch (err) {
      console.warn('[BrandCheck Pro] Live AI failed, falling back to offline engine:', err.message);
      const offline = simulateOfflineAnalysis(brandContext, demographics, campaignCopy, sensitivity);
      offline.isOfflineFallback = true;
      offline.summary = `[Live AI temporarily unavailable — offline fallback active] ${offline.summary}`;
      return offline;
    }
  }

  // 4) Fully offline fallback
  const offlineData = simulateOfflineAnalysis(brandContext, demographics, campaignCopy, sensitivity);
  offlineData.isOfflineFallback = true;
  return offlineData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALPINE.JS APPLICATION CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

function brandCheckApp() {
  return {
    darkMode: localStorage.getItem('theme') ? (localStorage.getItem('theme') === 'dark') : window.matchMedia('(prefers-color-scheme: dark)').matches,
    wizardStep: 1,
    privacyModal: false,
    connectionModal: false,
    connectionToast: false,
    faqOpen: null,
    loader: false,
    brandContextWarning: false,
    cloudEngineKey: localStorage.getItem('BC_LIVE_CORE_KEY') || '',
    inferenceStatus: 'Ready',
    engineUsed: 'Built-in scan',
    user: null,
    authModal: false,
    userDropdown: false,
    currentTier: localStorage.getItem('BC_USER_TIER') || 'Free',
    premiumGateModal: false,
    sarcasmFilterEnabled: false,
    brandContext: '',
    demographics: 'Whole India Market',
    campaignCopy: '',
    selectedEngine: 'tier1',
    sensitivity: 'Standard',
    showResults: false,
    results: { overall_score: 94, risk_level: 'Safe', summary: 'System operational.', flagged_issues: [] },

    init() {
      if (this.cloudEngineKey) {
        this.inferenceStatus = 'AI connected';
        this.engineUsed = 'AI scan: ' + providerLabel(this.cloudEngineKey);
      }
      const existingUser = typeof getAuthUser === 'function' ? getAuthUser() : null;
      if (existingUser) this.user = existingUser;

      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = (e) => {
        if (localStorage.getItem('theme')) {
          this.darkMode = localStorage.getItem('theme') === 'dark';
        } else {
          this.darkMode = e.matches;
        }
        document.documentElement.classList.toggle('dark', this.darkMode);
      };
      mq.addEventListener('change', applyTheme);
      applyTheme(mq);

      window.addEventListener('gauth:login', (e) => {
        this.user = e.detail;
        this.authModal = false;
      });
      window.addEventListener('gauth:logout', () => {
        this.user = null;
        this.userDropdown = false;
      });
      window.addEventListener('bc:tier:upgrade', (e) => {
        this.currentTier = e.detail || 'Professional';
        localStorage.setItem('BC_USER_TIER', this.currentTier);
      });
    },

    saveKey() {
      const cleanKey = this.cloudEngineKey.trim();
      if (cleanKey) {
        this.cloudEngineKey = cleanKey;
        localStorage.setItem('BC_LIVE_CORE_KEY', cleanKey);
        this.inferenceStatus = 'AI connected';
        this.engineUsed = 'AI scan: ' + providerLabel(cleanKey);
        this.connectionModal = false;
        this.connectionToast = true;
        setTimeout(() => { this.connectionToast = false; }, 2600);
      }
    },

    disconnectKey() {
      localStorage.removeItem('BC_LIVE_CORE_KEY');
      this.cloudEngineKey = '';
      this.inferenceStatus = 'Ready';
      this.engineUsed = 'Built-in scan';
      this.connectionModal = false;
    },

    activateProfessional() {
      this.currentTier = 'Professional';
      localStorage.setItem('BC_USER_TIER', 'Professional');
      window.dispatchEvent(new CustomEvent('bc:tier:upgrade', { detail: 'Professional' }));
      this.premiumGateModal = false;
      this.inferenceStatus = '✦ Professional Tier Activated';
      setTimeout(() => { this.inferenceStatus = 'Inference Core Ready'; }, 3500);
    },

    tryToggleSarcasm() {
      if (this.currentTier !== 'Professional' && this.currentTier !== 'Enterprise') {
        this.premiumGateModal = true;
        return;
      }
      this.sarcasmFilterEnabled = !this.sarcasmFilterEnabled;
    },

    signOut() {
      if (typeof signOutUser === 'function') {
        signOutUser();
      } else {
        this.user = null;
        this.userDropdown = false;
        window.dispatchEvent(new CustomEvent('gauth:logout'));
      }
    },

    nextStep() {
      if (this.wizardStep === 1) {
        if (!this.brandContext.trim()) {
          this.brandContextWarning = true;
          return;
        }
        this.brandContextWarning = false;
      }
      this.wizardStep++;
    },

    renderHighlightedSlogan() {
      let text = this.campaignCopy;
      if (!text) return '<span class="text-slate-500 italic">No copy entered yet.</span>';
      if (!this.results || !this.results.flagged_issues || this.results.flagged_issues.length === 0) {
        return text;
      }
      const sortedIssues = [...this.results.flagged_issues].sort((a, b) => b.phrase.length - a.phrase.length);
      sortedIssues.forEach(issue => {
        const word = issue.phrase;
        if (!word) return;
        const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, 'gi');
        const isCritical = this.results.overall_score <= 30 || issue.category.toLowerCase().includes('profanity') || issue.category.toLowerCase().includes('vulgar') || issue.rationale.toLowerCase().includes('critical') || issue.phrase.toLowerCase().includes('nude');
        const isCaution = this.results.overall_score <= 50 || this.results.risk_level === 'Caution' || issue.category.toLowerCase().includes('appropriateness');
        let highlightClass = 'text-brandNeon font-semibold border-b border-dashed border-brandNeon/50 hover:text-brandNeon/80 cursor-help transition';
        if (isCritical) highlightClass = 'text-red-500 font-extrabold border-b-2 border-dashed border-red-500 hover:text-red-400 cursor-help transition';
        else if (isCaution) highlightClass = 'text-amber-500 font-bold border-b border-dashed border-amber-500 hover:text-amber-400 cursor-help transition';
        text = text.replace(regex, `<span class="${highlightClass}" title="${issue.category}: ${issue.rationale.replace(/"/g, '&quot;')}">$1</span>`);
      });
      return text;
    },

    async runComplianceCheck() {
      if (!this.campaignCopy.trim()) {
        this.results = {
          overall_score: 0,
          risk_level: 'API Error',
          summary: 'Please enter your ad or slogan before scanning.',
          flagged_issues: []
        };
        this.engineUsed = 'Validation';
        this.showResults = true;
        return;
      }

      this.loader = true;
      this.showResults = false;
      this.inferenceStatus = 'Scanning...';

      try {
        const data = await executeComplianceCheck(this.brandContext, this.demographics, this.campaignCopy, this.sensitivity);
        this.results = data || {
          overall_score: 0,
          risk_level: 'API Error',
          summary: 'The scan returned no data. Check your API key and try again.',
          flagged_issues: []
        };
        this.engineUsed = data?.engine || (data?.isOfflineFallback ? 'Built-in scan' : 'AI scan');
        this.inferenceStatus = data?.isOfflineFallback
          ? 'Offline scan active'
          : (this.cloudEngineKey ? 'AI connected' : 'Ready');
      } catch (err) {
        console.error('[BrandCheck Pro] Fatal execution error:', err);
        this.inferenceStatus = 'Scan error';
        this.results = {
          overall_score: 0,
          risk_level: 'API Error',
          summary: `Scan could not be completed. ${err.message || 'Please try again.'}`,
          flagged_issues: []
        };
      } finally {
        this.loader = false;
        this.showResults = true;
      }
    }
  };
}
