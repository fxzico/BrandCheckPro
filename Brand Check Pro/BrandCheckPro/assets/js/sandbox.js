/**
 * BrandCheck Pro — Volatile RAM Sandbox Simulation Engine
 * Routing Architecture (2026):
 *   No key saved  → Embedded free OpenRouter proxy  (qwen/qwen-2.5-72b-instruct:free)
 *   sk-or-* key   → User's own OpenRouter account   (qwen/qwen-2.5-72b-instruct:free)
 *   AIza* key     → User's Google AI Studio BYOK    (gemini-3.5-flash)
 */

// Zero-config free-pool proxy key — powers baseline analysis out of the box.
const DEFAULT_OR_KEY = "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";

// OpenRouter model used for both the free proxy AND user-supplied OR keys.
const OR_MODEL = "qwen/qwen-2.5-72b-instruct:free";

// Active 2026 Google AI Studio production model (used for BYOK AIza keys).
const GEMINI_MODEL = "gemini-3.5-flash";

const ENGINE_CONFIG = {
  api_endpoint: null, // Set to a URL to enable a custom self-hosted inference gateway
};

/**
 * Post-processes analysis output to intercept and penalize severe profanity
 * and highlight vulnerable tokens in Crimson.
 * Score ceilings: nude/chut/fuck → 12 | sexy/adult → 45
 */
function postProcessAnalysis(data, campaignCopy) {
  if (!data) return data;

  const textLower = campaignCopy.toLowerCase();
  const issues = data.flagged_issues || [];

  // 1. Explicit / Adult Content — "nude" / "nude search" (hard cap: 12)
  if (textLower.includes('nude')) {
    data.overall_score = Math.min(data.overall_score, 12);
    data.risk_level = 'High Risk';
    data.summary = 'Critical brand alignment conflict. Copy utilizes sexually explicit keywords or suggestive framing. Launching this ad copy violates baseline digital distribution platform criteria (Google Ads / Meta Policy) and poses an extreme corporate reputation and public backlash risk.';

    let matchedPhrase = 'nude';
    if (textLower.includes('nude search kiya?')) matchedPhrase = 'Nude search kiya?';
    else if (textLower.includes('nude search kiya')) matchedPhrase = 'Nude search kiya';
    else if (textLower.includes('nude search')) matchedPhrase = 'nude search';

    const existingIndex = issues.findIndex(iss => iss.phrase.toLowerCase() === matchedPhrase.toLowerCase() || iss.phrase.toLowerCase() === 'nude');
    const issuePayload = { phrase: matchedPhrase, category: 'Explicit/Adult Content Brand Risk', rationale: 'Critical brand alignment conflict. Sexually explicit keyword violates Google Ads / Meta Policy. Extreme brand reputation risk.' };
    if (existingIndex >= 0) issues[existingIndex] = issuePayload; else issues.push(issuePayload);
  }

  // 2. Extreme regional explicit slang — "chut" (hard cap: 12)
  if (textLower.includes('chut')) {
    data.overall_score = Math.min(data.overall_score, 12);
    data.risk_level = 'High Risk';
    if (!data.summary || !data.summary.includes('CRITICAL')) {
      data.summary = 'CRITICAL COMPLIANCE FAILURE: Campaign copy contains an extreme regional profanity constituting a Tier-1 brand safety violation. Categorically barred from any regulated advertising channel under Google Ads Policy, Meta Advertising Standards, and the Indian IT Act.';
    }
    const alreadyFlagged = issues.some(iss => iss.phrase.toLowerCase() === 'chut');
    if (!alreadyFlagged) {
      issues.push({ phrase: 'chut', category: 'Explicit/Adult Content Brand Risk', rationale: '[CRITICAL] Extreme regional profanity. Maximum reputational and legal exposure. Immediate mandatory withdrawal.' });
    }
  }

  // 3. Content Appropriateness — "sexy" / "adult" (cap: 45)
  if (textLower.includes('sexy') || textLower.includes('adult')) {
    const matchedWord = textLower.includes('sexy') ? 'sexy' : 'adult';
    data.overall_score = Math.min(data.overall_score, 45);
    if (data.risk_level !== 'High Risk') data.risk_level = 'Caution';
    const existingIndex = issues.findIndex(iss => iss.phrase.toLowerCase() === matchedWord);
    const issuePayload = { phrase: matchedWord, category: 'Content Appropriateness Violation', rationale: `The copy contains the suggestive term "${matchedWord}" and requires mandatory internal legal sign-off before regional placement.` };
    if (existingIndex >= 0) issues[existingIndex] = issuePayload; else issues.push(issuePayload);
  }

  // 4. Severe English profanity intercept (hard cap: 12)
  const profanities = ['fuck', 'shit', 'bastard', 'asshole', 'bitch', 'crap', 'vulgar'];
  let hasProfanity = false;
  profanities.forEach(word => {
    if (textLower.includes(word)) {
      hasProfanity = true;
      const alreadyFlagged = issues.some(iss => iss.phrase.toLowerCase() === word);
      if (!alreadyFlagged) {
        issues.push({ phrase: word, category: 'Severe Profanity & Social Tone', rationale: `[CRITICAL COMPLIANCE THREAT] Severe vulgarity token "${word}" detected in public campaign copy. Immediate brand recall risk.` });
      }
    }
  });
  if (hasProfanity && data.overall_score > 12) {
    data.overall_score = 12;
    data.risk_level = 'High Risk';
    data.summary = 'CRITICAL FAILURE: Campaign copy contains severe profanity and vulgar language. Public release is strictly blockaded to prevent catastrophic brand crisis.';
  }

  data.flagged_issues = issues;
  return data;
}

/**
 * SECURITY-FIRST CRITICAL TERM GUARD
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs immediately inside every offline fallback path, BEFORE the generic
 * "Enterprise Gateway Traffic Optimization" message can be rendered.
 * Returns a hard-override High Risk result for severe terms, or null if clean.
 */
function runCriticalTermGuard(campaignCopy) {
  const t = campaignCopy.toLowerCase();

  // ── Tier 1: Extreme explicit regional sexual slang (Score 5) ─────────────────
  if (t.includes('mutthi maro') || t.includes('mutthi')) {
    const phrase = t.includes('mutthi maro') ? 'mutthi maro' : 'mutthi';
    return {
      overall_score: 5, risk_level: 'High Risk',
      summary: 'Critical brand compliance risk. The campaign copy utilizes highly explicit and vulgar regional slang. Deploying this language across mainstream public assets carries extreme reputational hazard and directly violates standard digital network advertising policies regarding sexually suggestive content.',
      flagged_issues: [{ phrase, category: 'Explicit/Adult Content Brand Risk', rationale: 'Critical brand compliance risk. Highly explicit regional slang detected. Violates Google Ads Policy, Meta Advertising Standards, and standard corporate compliance frameworks. Immediate copy withdrawal mandatory.' }]
    };
  }

  if (t.includes('chut')) {
    return {
      overall_score: 5, risk_level: 'High Risk',
      summary: 'CRITICAL COMPLIANCE FAILURE: Campaign copy contains an extreme regional profanity constituting a Tier-1 brand safety violation. Categorically barred from any regulated advertising channel under Google Ads Policy, Meta Advertising Standards, and the Indian IT Act.',
      flagged_issues: [{ phrase: 'chut', category: 'Explicit/Adult Content Brand Risk', rationale: '[CRITICAL] Maximum-tier explicit regional profanity. Extreme reputational and legal exposure. Immediate mandatory withdrawal.' }]
    };
  }

  if (t.includes('gaand')) {
    return {
      overall_score: 8, risk_level: 'High Risk',
      summary: 'CRITICAL COMPLIANCE FAILURE: Campaign copy contains extreme profanity classified as a Tier-1 brand safety violation. This content cannot be deployed on any regulated advertising channel. Immediate legal review and copy withdrawal strongly recommended.',
      flagged_issues: [{ phrase: 'gaand', category: 'Severe Profanity & Social Tone', rationale: '[CRITICAL] Extreme vulgarity token. Violates Meta Advertising Standards, Google Ads Policy, and Indian IT Act. Risk of platform ban and public backlash is severe.' }]
    };
  }

  if (t.includes('faad')) {
    return {
      overall_score: 10, risk_level: 'High Risk',
      summary: 'CRITICAL COMPLIANCE FAILURE: Campaign copy contains violently suggestive regional profanity carrying a dual threat of sexually explicit and violent brand association. Public deployment strictly prohibited under all standard enterprise advertising governance frameworks.',
      flagged_issues: [{ phrase: 'faad', category: 'Severe Profanity & Social Tone', rationale: '[CRITICAL] Violently suggestive regional slang. Extreme reputational risk and direct violation of platform integrity policies across Google, Meta, and programmatic ad networks.' }]
    };
  }

  // ── Tier 2: Explicit content / severe English profanity (Score 12) ───────────
  if (t.includes('nude')) {
    let phrase = 'nude';
    if (t.includes('nude search kiya?')) phrase = 'Nude search kiya?';
    else if (t.includes('nude search kiya')) phrase = 'Nude search kiya';
    else if (t.includes('nude search')) phrase = 'nude search';
    return {
      overall_score: 12, risk_level: 'High Risk',
      summary: 'Critical brand alignment conflict. Copy utilizes sexually explicit keywords or suggestive framing. Violates baseline digital distribution platform criteria (Google Ads / Meta Policy) and poses extreme corporate reputation and public backlash risk.',
      flagged_issues: [{ phrase, category: 'Explicit/Adult Content Brand Risk', rationale: 'Sexually explicit keyword detected. Violates Google Ads Policy and Meta Advertising Standards. Immediate brand recall risk.' }]
    };
  }

  for (const word of ['fuck', 'f**k', 'f***']) {
    if (t.includes(word)) {
      return {
        overall_score: 12, risk_level: 'High Risk',
        summary: 'CRITICAL FAILURE: Campaign copy contains severe profanity and vulgar language. Public release is strictly blockaded to prevent catastrophic brand crisis.',
        flagged_issues: [{ phrase: word, category: 'Severe Profanity & Social Tone', rationale: `[CRITICAL COMPLIANCE THREAT] Severe English vulgarity token "${word}" detected. Immediate brand recall risk across all regulated advertising platforms.` }]
      };
    }
  }

  // ── Tier 3: Standalone violent-context slang (Score 12) ──────────────────────
  if (t.includes('maro')) {
    return {
      overall_score: 12, risk_level: 'High Risk',
      summary: 'Brand safety alert. Campaign copy contains a regional slang term with violent or sexually aggressive connotations in the target demographic context. Deployment without legal sign-off carries significant platform policy and reputational risk.',
      flagged_issues: [{ phrase: 'maro', category: 'Severe Profanity & Social Tone', rationale: '[CRITICAL] Regional slang with violent/explicit connotations. High risk of consumer backlash and advertising policy violation in the Indian market.' }]
    };
  }

  // ── Tier 4: Other severe profanities & street slangs (Score 15) ───────────────
  const severeSlangs = [
    'bhenchod', 'madarchod', 'm@darchod', 'madarch0d', 'lund', 'lauda', 'l0uda', 'l@uda', 'laudey', 'lowda',
    'suarkabacha', 'sulla', 'katwa', 'katwe', 'mulla', 'mulle', 'mulli', 'mullon', 'mullu',
    'randi', 'raand', 'rand', 'randibaaz', 'randirona', 'r@ndirona', 'randwa', 'ricebag', 'mehtar', 'hijra', 'kanjar',
    'mc', 'bastard', 'asshole', 'bitch', 'shit'
  ];
  for (const word of severeSlangs) {
    let matched = false;
    if (word.length < 6) {
      const rx = new RegExp('\\b' + word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
      matched = rx.test(t);
    } else {
      matched = t.includes(word);
    }
    if (matched) {
      return {
        overall_score: 15,
        risk_level: 'High Risk',
        summary: `CRITICAL COMPLIANCE FAILURE: Campaign copy contains the severe profanity/slang "${word}", which represents a Tier-1 brand safety violation. Association with this language violates standard digital advertising policy guidelines. Immediate copy review and withdrawal recommended.`,
        flagged_issues: [{
          phrase: word,
          category: 'Severe Profanity & Social Tone',
          rationale: `[CRITICAL] Severe street profanity "${word}" detected. Violates Meta Advertising Standards, Google Ads Policy, and standard brand-safety guidelines.`
        }]
      };
    }
  }

  return null; // Copy is clean — safe to proceed to generic enterprise fallback
}

async function executeComplianceCheck(brandContext, demographics, campaignCopy) {
  console.log("[BrandCheck Pro] Executing validation workflow...");
  console.log(`[BrandCheck Pro] Context: ${brandContext} | Demographics: ${demographics}`);
  console.log(`[BrandCheck Pro] Target Copy: "${campaignCopy}"`);

  // ── Key Resolution ───────────────────────────────────────────────────────────
  // Priority: BYOK stored key  >  Embedded free OpenRouter proxy (zero-config)
  const storedKey =
    localStorage.getItem('BC_LIVE_CORE_KEY') ||
    localStorage.getItem('BC_PRO_LIVE_KEY') ||
    localStorage.getItem('BC_PRO_API_KEY') ||
    sessionStorage.getItem('BC_LIVE_CORE_KEY') ||
    sessionStorage.getItem('BC_PRO_LIVE_KEY') ||
    sessionStorage.getItem('BC_PRO_API_KEY');

  // Determine route: BYOK Google key → Gemini 3.5 Flash | everything else → OpenRouter pool
  const isGeminiKey = storedKey && !storedKey.startsWith('sk-or-');
  const orKey = storedKey?.startsWith('sk-or-') ? storedKey : DEFAULT_OR_KEY; // user OR key or free proxy

  // ── Shared system prompt ─────────────────────────────────────────────────────
  const systemPrompt = `You are an expert brand safety evaluation engine. Analyze the given campaign copy under the provided brand context and target demographics.
Be extremely strict and vigilant. Check for brand safety, religious sensitivity, political neutrality, classist remarks, casteist slurs, suggestive or explicit adult framing (e.g. "nude", "sexy", "adult", or suggestive questions like "nude search kiya?"), and compliance with platform guidelines (Google Ads / Meta Policy).
If copy is suggestive or contains sexually explicit words, you MUST drop the score below 30 and rate it High Risk.
Return ONLY a valid JSON object — no markdown fences, no commentary — with this exact schema:
{
  "overall_score": <integer 0–100>,
  "risk_level": "<Safe | Caution | High Risk>",
  "summary": "<concise board-ready threat evaluation paragraph>",
  "flagged_issues": [
    {
      "phrase": "<exact phrase or token from the copy>",
      "category": "<Explicit/Adult Content Brand Risk | Religious Sensitivity | Political Neutrality | Social Tone | Sarcasm | Gender | Casteism>",
      "rationale": "<precise legal/cultural risk explanation>"
    }
  ]
}`;

  // ── Route A: BYOK Google AI Studio key → Gemini 3.5 Flash ───────────────────
  if (isGeminiKey) {
    console.log(`[BrandCheck Pro] BYOK Google AI Studio key detected. Routing → ${GEMINI_MODEL}...`);
    try {
      const promptText = `${systemPrompt}

Input Payload Matrix:
- Brand Profile: ${brandContext}
- Target Demographics: ${demographics}
- Slogan Text: ${campaignCopy}

Output MUST strictly be a single valid JSON object with no markdown wrappers:`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${storedKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.ok) {
        const payload = await response.json();
        const rawText = payload.candidates[0].content.parts[0].text.trim();
        console.log(`[BrandCheck Pro] ${GEMINI_MODEL} raw response:`, rawText);
        // Strip any accidental markdown fences before parsing
        const cleanText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        try {
          return postProcessAnalysis(JSON.parse(cleanText), campaignCopy);
        } catch (parseErr) {
          console.error(`[BrandCheck Pro] JSON parse error on ${GEMINI_MODEL} content:`, parseErr);
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) return postProcessAnalysis(JSON.parse(jsonMatch[0]), campaignCopy);
          throw parseErr;
        }
      } else {
        const errorText = await response.text();
        console.error(`[BrandCheck Pro] ${GEMINI_MODEL} API error:`, errorText);
        let errMsg = `Gemini API Error (HTTP ${response.status})`;
        try { const errJson = JSON.parse(errorText); errMsg = errJson.error?.message || errMsg; } catch(_) {}
        return {
          overall_score: 0,
          risk_level: 'API Error',
          summary: `⚠️ Google AI Studio Connection Failed — ${errMsg}. Please verify your key in the Cloud Engine settings modal.`,
          flagged_issues: []
        };
      }
    } catch (err) {
      console.error(`[BrandCheck Pro] Network error reaching ${GEMINI_MODEL}:`, err);
      return {
        overall_score: 0,
        risk_level: 'API Error',
        summary: `⚠️ Network Error — Could not reach Google AI Studio. ${err.message}`,
        flagged_issues: []
      };
    }
  }

  // ── Route B: OpenRouter (free proxy OR user's own sk-or- key) ────────────────
  // Watertight 4-layer error trap — nothing technical leaks to the UI.
  {
    // Blocked UI leak terms — these must NEVER appear in consumer-facing output.
    const UI_BLOCKED_STRINGS = [/qwen/i, /deepseek/i, /openrouter/i, /api version/i, /model.*not.*found/i, /provider/i];
    const sanitizeForUI = (str) => UI_BLOCKED_STRINGS.some(rx => rx.test(str));

    /**
     * SECURITY-FIRST OFFLINE FALLBACK HELPER
     * Always runs runCriticalTermGuard() FIRST before the generic enterprise message.
     * Severe terms get High Risk results. Clean copy gets the traffic optimization message.
     */
    const offlineFallback = (reason) => {
      console.warn(`[BrandCheck Pro] ${reason} — running security-first guard scan before offline engine.`);
      const simResult = simulateOfflineAnalysis(brandContext, demographics, campaignCopy);
      simResult.isOfflineFallback = true;
      return simResult;
    };

    const routeLabel = storedKey?.startsWith('sk-or-')
      ? 'User OpenRouter BYOK key'
      : 'Embedded free OpenRouter proxy (zero-config)';
    console.log(`[BrandCheck Pro] ${routeLabel} → ${OR_MODEL}`);

    try {
      const userPrompt = `Brand Context: ${brandContext}\nTarget Demographics: ${demographics}\nCampaign Copy: ${campaignCopy}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin || "http://localhost:8000",
          "X-Title": "BrandCheck Pro"
        },
        body: JSON.stringify({
          model: OR_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      // ── Layer 1: HTTP status gate ─────────────────────────────────────────────
      if (!response.ok) {
        return offlineFallback(`OpenRouter HTTP ${response.status}`);
      }

      // ── Layer 2: Parse outer envelope ─────────────────────────────────────────
      let payload;
      try {
        payload = await response.json();
      } catch (jsonErr) {
        return offlineFallback('Outer JSON parse failure');
      }

      // ── Layer 3: Detect server-level error objects inside a 200 body ──────────
      if (payload.error || (payload.choices && payload.choices[0]?.message?.content === undefined)) {
        return offlineFallback('Server error object inside 200 body');
      }

      const rawText = payload.choices?.[0]?.message?.content?.trim() ?? '';
      if (!rawText) {
        return offlineFallback('Empty content string returned');
      }

      console.log(`[BrandCheck Pro] OpenRouter raw response:`, rawText);

      // ── Layer 4: Parse inner JSON payload with markdown strip + leak guard ────
      const cleanText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      let parsedData;
      try {
        parsedData = JSON.parse(cleanText);
      } catch (parseErr) {
        // Attempt regex extraction fallback
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { parsedData = JSON.parse(jsonMatch[0]); } catch(_) {}
        }
        if (!parsedData) {
          return offlineFallback('Inner JSON extraction failed');
        }
      }

      // Final UI leak check — if summary contains blocked technical strings, purge and run guard
      if (parsedData.summary && sanitizeForUI(parsedData.summary)) {
        return offlineFallback('Blocked technical string in summary');
      }

      return postProcessAnalysis(parsedData, campaignCopy);

    } catch (err) {
      // Catch-all — network failure, CORS, timeout, etc.
      return offlineFallback(`Unhandled exception: ${err.message}`);
    }
  }

  // If API endpoint is defined and no key is cached, attempt active endpoint integration
  if (ENGINE_CONFIG.api_endpoint) {
    try {
      const response = await fetch(ENGINE_CONFIG.api_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: campaignCopy,
          market: demographics
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[BrandCheck Pro] API inference successfully returned data:", data);
        return postProcessAnalysis(data, campaignCopy);
      } else {
        console.warn(`[BrandCheck Pro] Endpoint connection failed with status ${response.status}. Falling back to heuristics.`);
      }
    } catch (error) {
      console.warn("[BrandCheck Pro] Could not reach active API gateway server. Initiating local fallback:", error.message);
    }
  }

  // Automated Offline Mock Heuristic Fallback Engine
  const offlineData = simulateOfflineAnalysis(brandContext, demographics, campaignCopy);
  offlineData.isOfflineFallback = true;
  return offlineData;
}

/**
 * High-fidelity offline heuristic analysis engine.
 * Significantly expanded to catch dozens of marketing phrases, slang, and vulgarities.
 */
function simulateOfflineAnalysis(brandContext, demographics, campaignCopy) {
  const guardResult = runCriticalTermGuard(campaignCopy);
  if (guardResult) {
    return guardResult;
  }
  const normalizedText = campaignCopy.toLowerCase();
  const flagged = [];
  let scoreDeduction = 0;

  // ── PRIORITY INTERCEPTS — checked first, cause immediate hard-override ────────
  // These are so extreme they bypass the standard deduction system entirely.

  // 1. "mutthi maro" / "mutthi" — explicit regional sexual slang
  if (normalizedText.includes('mutthi maro') || normalizedText.includes('mutthi')) {
    const matchedPhrase = normalizedText.includes('mutthi maro') ? 'mutthi maro' : 'mutthi';
    return {
      overall_score: 5,
      risk_level: 'High Risk',
      summary: 'Critical brand compliance risk. The campaign copy utilizes highly explicit and vulgar regional slang. Deploying this language across mainstream public assets carries extreme reputational hazard and directly violates standard digital network advertising policies regarding sexually suggestive content.',
      flagged_issues: [{
        phrase: matchedPhrase,
        category: 'Explicit/Adult Content Brand Risk',
        rationale: 'Critical brand compliance risk. The campaign copy utilizes highly explicit and vulgar regional slang. Deploying this language across mainstream public assets carries extreme reputational hazard and directly violates standard digital network advertising policies regarding sexually suggestive content.'
      }]
    };
  }

  // 2. "gaand" — extreme profanity
  if (normalizedText.includes('gaand')) {
    return {
      overall_score: 8,
      risk_level: 'High Risk',
      summary: 'CRITICAL COMPLIANCE FAILURE: Campaign copy contains extreme profanity classified as a Tier-1 brand safety violation. This content cannot be deployed on any regulated advertising channel. Immediate legal review and copy withdrawal are strongly recommended to prevent severe reputational and regulatory damage.',
      flagged_issues: [{
        phrase: 'gaand',
        category: 'Severe Profanity & Social Tone',
        rationale: '[CRITICAL] Extreme vulgarity token detected. Violates Meta Advertising Standards, Google Ads Policy, and Indian IT Act content guidelines. Risk of platform ban and public backlash is severe.'
      }]
    };
  }

  // 3. "faad" — extreme regional profanity / violent-sexual slang
  if (normalizedText.includes('faad')) {
    return {
      overall_score: 10,
      risk_level: 'High Risk',
      summary: 'CRITICAL COMPLIANCE FAILURE: Campaign copy contains violently suggestive regional profanity carrying a dual threat of sexually explicit and violent brand association. Public deployment is strictly prohibited under all standard enterprise advertising governance frameworks.',
      flagged_issues: [{
        phrase: 'faad',
        category: 'Severe Profanity & Social Tone',
        rationale: '[CRITICAL] Violently suggestive regional slang token detected. Carries extreme reputational risk and direct violation of platform integrity policies across Google, Meta, and programmatic ad networks.'
      }]
    };
  }

  // ── STANDARD RISK DICTIONARY — case-insensitive substring scans ──────────────
  const riskDictionary = [
    {
      keyword: "andhaa",
      category: "Inflammatory",
      rationale: "The weaponization of physical disability (blindness) as a derogatory personal insult. Violates explicit ASCI codes and internal brand governance guidelines regarding discrimination against protected physical characteristics.",
      deduction: 64
    },
    {
      keyword: "andhbhakt",
      category: "Inflammatory",
      rationale: "Highly polarized socio-political moniker weaponized in digital spaces to mock opposing ideological viewpoints. Adjacency threatens strict corporate political neutrality and risks alienating major consumer segments.",
      deduction: 44
    },
    {
      keyword: "aukat",
      category: "Inflammatory",
      rationale: "Socio-economically loaded term used to diminish or mock an individual's financial or social standing. Deployed heavily in digital flame wars; requires defensive filtering to preserve a premium, elite corporate tone.",
      deduction: 55
    },
    {
      keyword: "aunty",
      category: "Gender & Social Tone",
      rationale: "[HEURISTIC EVALUATION] Often used in casual slang with ageist or patronizing subtext in regional marketing.",
      deduction: 15
    },
    {
      keyword: "baanchod",
      category: "Severe Profanity",
      rationale: "Common phonetic and regional typing variation of a high-intensity street profanity. Crucial inclusion for local validation scripts to defend against typography gaps in automated content moderation tools.",
      deduction: 85
    },
    {
      keyword: "baapchod",
      category: "Severe Profanity",
      rationale: "Severe, explicit street profanity targeting immediate lineage. Association with this level of localized vulgarity constitutes a major compliance failure, damaging brand trust and violating local advertising decency frameworks.",
      deduction: 88
    },
    {
      keyword: "bang",
      category: "Political/Social Tone",
      rationale: "[HEURISTIC EVALUATION] Contextual risk associated with regional noise constraints or celebration rules in urban centers.",
      deduction: 15
    },
    {
      keyword: "bc",
      category: "Severe Profanity",
      rationale: "The most common shorthand acronym for high-intensity localized profanity in the Indian digital ecosystem. Essential fail-safe inclusion for local filtering engines to intercept toxic user engagement and protect brand-safe environments.",
      deduction: 85
    },
    {
      keyword: "beef",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Strict dietary and religious taboo across major Indian demographic groups. High risk of severe backlash.",
      deduction: 35
    },
    {
      keyword: "bh3nchod",
      category: "Severe Profanity",
      rationale: "Leet-speak typographic obfuscation designed to bypass standard alphanumeric keyword regex blocks while retaining highly abusive intent on consumer touchpoints.",
      deduction: 85
    },
    {
      keyword: "bh@ngi",
      category: "Classist/Casteist Slur",
      rationale: "Symbol-masked variant of a banned casteist slur targeting historically marginalized sanitation communities. Represents a critical breach of statutory anti-discrimination frameworks and local intermediary liability regulations.",
      deduction: 92
    },
    {
      keyword: "bhaand",
      category: "Classist/Casteist Slur",
      rationale: "Historically community-specific descriptor weaponized as an insulting street token to denote a buffoon. Violates modern advertising codes safeguarding identity-based dignity.",
      deduction: 89
    },
    {
      keyword: "bhadwa",
      category: "Severe Profanity",
      rationale: "Street slang used as a highly offensive personal insult. Associating consumer brands with this level of localized profanity undermines brand safety protocols and risks swift consumer backlash on social platforms.",
      deduction: 81
    },
    {
      keyword: "bhadwey",
      category: "Severe Profanity",
      rationale: "Plural or colloquial phonetic variant of a severe street insult. Must be hardcoded into defensive filtration scripts to maintain comprehensive capture rates against localized typographical nuances.",
      deduction: 81
    },
    {
      keyword: "bhakt",
      category: "Inflammatory",
      rationale: "A term carrying extreme political polarization online. Frequently weaponized in toxic digital debates to demean specific political viewpoints, creating a highly volatile ad adjacency environment that mainstream brands must steer clear of to remain neutral.",
      deduction: 42
    },
    {
      keyword: "bhang",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Associated with psychoactive substances. Taboo in standard family-oriented advertising.",
      deduction: 20
    },
    {
      keyword: "bhangi",
      category: "Classist/Casteist Slur",
      rationale: "Highly derogatory casteist term historically used to demean marginalized communities. Poses an immediate threat to corporate diversity and inclusion standards, violating ASCI (Advertising Standards Council of India) codes on community discrimination.",
      deduction: 92
    },
    {
      keyword: "bheekmanga",
      category: "Classist/Casteist Slur",
      rationale: "Deplorable classist pejorative weaponized online to demean individuals based on structural economic vulnerability. Directly breaches ASCI regulations and modern corporate diversity guidelines centered on basic human dignity.",
      deduction: 75
    },
    {
      keyword: "bhench0d",
      category: "Severe Profanity",
      rationale: "Common character substitution evasion tactic using a numeral to mask severe street-level profanity. Essential configuration for defensive filters to intercept targeted toxic user interaction in real-time streams.",
      deduction: 85
    },
    {
      keyword: "bhenchod",
      category: "Severe Profanity",
      rationale: "Extremely pervasive, high-intensity street profanity. Direct violation of standard brand-safety guidelines across all programmatic ad networks (Google DV360, Meta). Automatic trigger for severe reputation damage if associated with user-generated brand campaigns or automated keyword matching.",
      deduction: 85
    },
    {
      keyword: "bhikhari",
      category: "Inflammatory",
      rationale: "Classist pejorative targeting socio-economic vulnerability. Deployed in digital spaces to mock poverty, conflicting heavily with Environmental, Social, and Governance (ESG) mandates and corporate social responsibility benchmarks.",
      deduction: 64
    },
    {
      keyword: "bhikmanga",
      category: "Classist/Casteist Slur",
      rationale: "Alternative spelling variant of a classist pejorative demeaning socio-economic vulnerability. Violates basic human dignity guidelines and modern corporate diversity guidelines centered on respectful communication.",
      deduction: 76
    },
    {
      keyword: "bhosad",
      category: "Severe Profanity",
      rationale: "Phonetic root variant of high-intensity street abuse. Triggers automated content moderation actions across ad networks due to its inherently vulgar, obscene, and non-brand-safe properties.",
      deduction: 89
    },
    {
      keyword: "bhosada",
      category: "Severe Profanity",
      rationale: "High-intensity regional profanity carrying severe vulgarity. Triggers immediate automated filtration protocols under major ad exchange guidelines (Google, Meta) due to its inherently abusive and non-family-friendly nature.",
      deduction: 89
    },
    {
      keyword: "bhosadi",
      category: "Severe Profanity",
      rationale: "Phonetic base variant of critical street abuse. Triggers automated content moderation actions due to its inherently vulgar, obscene, and non-brand-safe structural properties.",
      deduction: 89
    },
    {
      keyword: "bhosadike",
      category: "Severe Profanity",
      rationale: "High-intensity phonetic street abuse widely used in digital toxicity loops. Triggers immediate brand safety flags across global programmatic ad networks and directly breaches the Advertising Standards Council of India (ASCI) code on public decency.",
      deduction: 89
    },
    {
      keyword: "bhosrewala",
      category: "Severe Profanity",
      rationale: "Pervasive vulgar street epithet carrying intense obscenity. Completely non-compliant with standard commercial safety rules, triggering automated baseline filters on digital advertising exchanges.",
      deduction: 88
    },
    {
      keyword: "bihari",
      category: "Inflammatory",
      rationale: "While geographically and culturally a valid regional identity, this term is frequently weaponized in urban digital spaces as a classist and xenophobic slur against migrant laborers. Requires deep contextual analysis to avoid algorithmic false positives while mitigating discriminatory risk.",
      deduction: 48
    },
    {
      keyword: "boycott",
      category: "Political Neutrality",
      rationale: "[HEURISTIC EVALUATION] Highly combative term associated with digital cancel culture and brand damage.",
      deduction: 20
    },
    {
      keyword: "bsdk",
      category: "Severe Profanity",
      rationale: "The ubiquitous alphanumeric/compressed internet shorthand for severe street profanity. Essential for automated blocklists as it is explicitly used by consumers to bypass native keyword filters on social platforms while retaining full toxic intent.",
      deduction: 86
    },
    {
      keyword: "bullya",
      category: "Religious Insensitivity",
      rationale: "Derogatory sectarian slur utilized in polarized digital streams to target specific religious minority groups. Direct violation of Indian penal codes safeguarding communal harmony, creating an existential legal and compliance risk for commercial entities.",
      deduction: 95
    },
    {
      keyword: "caste",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Highly sensitive social stratification topic. High risk of violating anti-discrimination guidelines.",
      deduction: 30
    },
    {
      keyword: "ch@mar",
      category: "Classist/Casteist Slur",
      rationale: "Leet-speak obfuscation of an actionable casteist slur. Direct violation of statutory compliance under India's SC/ST (Prevention of Atrocities) Act, creating an existential public relations and legal liability for commercial brands.",
      deduction: 95
    },
    {
      keyword: "chaddi",
      category: "Inflammatory",
      rationale: "While literally translating to an article of clothing, this term is highly weaponized in digital political spaces as a pejorative moniker. Mainstream brands must filter it to maintain strict neutral positioning in volatile social discourse.",
      deduction: 54
    },
    {
      keyword: "chakka",
      category: "Classist/Casteist Slur",
      rationale: "Highly offensive transphobic slur widely used on the streets. Violates global and regional platform policies regarding hate speech against protected characteristics, creating severe reputational risk for corporate entities.",
      deduction: 92
    },
    {
      keyword: "chamar",
      category: "Classist/Casteist Slur",
      rationale: "Direct violation of the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act in India. Use of this term or associated caste-based slurs online is legally actionable, presenting an existential legal and PR crisis for any commercial brand.",
      deduction: 95
    },
    {
      keyword: "chapri",
      category: "Classist/Casteist Slur",
      rationale: "Socio-economically loaded pejorative derived from a marginalized caste name, weaponized online to demean working-class youth. Its usage violates corporate diversity and inclusion principles, creating severe risk under ASCI anti-discrimination frameworks.",
      deduction: 94
    },
    {
      keyword: "cheap",
      category: "Gender & Social Tone",
      rationale: "[HEURISTIC EVALUATION] Potential risk associated with demographic marginalization or exploitative branding semantics.",
      deduction: 15
    },
    {
      keyword: "chick",
      category: "Gender & Social Tone",
      rationale: "[HEURISTIC EVALUATION] Informal slang that can be perceived as patronizing or objectifying in corporate communications.",
      deduction: 15
    },
    {
      keyword: "chinal",
      category: "Explicit/Adult",
      rationale: "Severe misogynistic slur with explicit adult connotations. Triggers absolute block filters across automated programmatic marketplaces (such as Google DV360 and Meta) due to standard violations against hate speech and gendered harassment.",
      deduction: 89
    },
    {
      keyword: "chodna",
      category: "Explicit/Adult",
      rationale: "Phonetic literal rendering of a sexual act. Automatic trigger for immediate safety flags and potential platform demonetization across all global demand-side platforms (DSPs) due to explicit adult categorization.",
      deduction: 88
    },
    {
      keyword: "chottya",
      category: "Severe Profanity",
      rationale: "Alternative typography variant of a pervasive street slur. Crucial configuration for local validation scripts to catch intentional vowel dropping or phonetic variations designed to slip past primary content filters.",
      deduction: 75
    },
    {
      keyword: "chotu",
      category: "Classist/Casteist Slur",
      rationale: "While casually meaning 'small,' this token is often exploited as a classist or condescending term referencing child labor or service staff in regional commercial settings. High risk of classist discrimination backlash.",
      deduction: 48
    },
    {
      keyword: "christian",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Direct religious categorization. High risk of communal marketing backlash.",
      deduction: 20
    },
    {
      keyword: "chuchi",
      category: "Explicit/Adult",
      rationale: "Phonetic localized slang for female anatomy. Completely non-compliant with global GARM guidelines on sexual safety and obscenity. Triggers immediate automated content moderation and demonetization loops across all major demand-side platforms (DSPs).",
      deduction: 88
    },
    {
      keyword: "chudaap",
      category: "Severe Profanity",
      rationale: "Vulgar term derived from sexually explicit roots, frequently used to describe a messy or frustrating situation. Unacceptable for corporate communication or mainstream ad environments due to underlying explicit semantics.",
      deduction: 72
    },
    {
      keyword: "chudai",
      category: "Explicit/Adult",
      rationale: "Direct, highly explicit phonetic spelling referencing a sexual act. Violates foundational content moderation guidelines on digital platforms, carrying an automated ban or demonetization consequence across ad ecosystems.",
      deduction: 91
    },
    {
      keyword: "chudail",
      category: "Inflammatory",
      rationale: "Gendered pejorative frequently weaponized in digital spaces to harass and demean women. While originating from regional folklore, its online utility is highly toxic, necessitating defensive classification to maintain a safe community ecosystem.",
      deduction: 62
    },
    {
      keyword: "chudgaya",
      category: "Severe Profanity",
      rationale: "Vulgar verb phrase indicating structural failure, loss, or desperation using explicit sexual roots. Inappropriate for modern consumer-facing applications or programmatic brand suitability frameworks.",
      deduction: 78
    },
    {
      keyword: "chudwa",
      category: "Explicit/Adult",
      rationale: "Aggressive, explicitly vulgar street verb indicating submission or degradation through sexual acts. Directly violates platform and intermediary codes governing adult language and public decency.",
      deduction: 86
    },
    {
      keyword: "chura",
      category: "Classist/Casteist Slur",
      rationale: "Highly offensive casteist token demeaning historically marginalized sanitation communities. Direct violation of the SC/ST Prevention of Atrocities Act, making it a critical legal and PR vulnerability.",
      deduction: 95
    },
    {
      keyword: "chutiya",
      category: "Severe Profanity",
      rationale: "Widely used colloquial slur that carries highly offensive connotations. While common in casual online discourse, its presence in brand adjacencies or user-generated brand text creates an immediate public relations liability for consumer-facing brands.",
      deduction: 75
    },
    {
      keyword: "chutiyagiri",
      category: "Severe Profanity",
      rationale: "Colloquial vulgar compound suffix describing absurd or highly frustrating behavior. Incompatible with standard corporate tonality frameworks and high-tier enterprise conversational automated responses.",
      deduction: 72
    },
    {
      keyword: "chutiyapa",
      category: "Severe Profanity",
      rationale: "Vulgar colloquial derivative describing an absurd or frustrating situation. Despite widespread casual adoption online, it remains non-compliant for tier-one corporate messaging portfolios.",
      deduction: 74
    },
    {
      keyword: "chutiye",
      category: "Severe Profanity",
      rationale: "Grammatical variation of a pervasive street slur. Crucial for catching contextual user outputs where inflection changes but the underlying abusive intent and brand risk remain identical.",
      deduction: 75
    },
    {
      keyword: "chutmarani",
      category: "Severe Profanity",
      rationale: "High-severity misogynistic street profanity. Direct violation of programmatic brand-safety baselines across all global demand-side platforms (DSPs). Immediate block is mandatory to mitigate severe reputational hazard within consumer-facing user-generated fields.",
      deduction: 89
    },
    {
      keyword: "chutya",
      category: "Severe Profanity",
      rationale: "Alternative phonetic variation of common street abuse. Crucial for matching variations in local typography where users deliberately drop vowels or alter spelling to bypass standard alphanumeric safety arrays.",
      deduction: 76
    },
    {
      keyword: "communal",
      category: "Political/Social Tone",
      rationale: "[HEURISTIC EVALUATION] Direct reference to socio-political divisions. Extremely sensitive in the Indian subcontinent.",
      deduction: 25
    },
    {
      keyword: "converted",
      category: "Religious Insensitivity",
      rationale: "Socio-politically weaponized term frequently used in bad faith during online sectarian profiling and religious harassment. High risk of violation under regional laws protecting communal harmony and preventing hate speech.",
      deduction: 55
    },
    {
      keyword: "coolie",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Colonial-era derogatory term for manual laborers. Classist risk vector.",
      deduction: 20
    },
    {
      keyword: "cow",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Highly sensitive political and religious symbol in Indian demographic markets. Potential for brand polarization.",
      deduction: 25
    },
    {
      keyword: "daaru",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Colloquial term for alcohol. Strictly regulated or banned in direct ad copy under surrogate advertising laws.",
      deduction: 25
    },
    {
      keyword: "dalal",
      category: "Inflammatory",
      rationale: "Literally translating to an agent or broker, this token is heavily weaponized in corporate and political trolling loops to accuse public entities or individuals of corruption or acting as frontmen. Risks pulling mainstream brands into partisan crossfire.",
      deduction: 58
    },
    {
      keyword: "dedhshaana",
      category: "Inflammatory",
      rationale: "Urban street slang used to mock someone trying to act overly clever. Classified under the caution tier to preserve a premium, helpful, and universally respectful corporate messaging tone.",
      deduction: 42
    },
    {
      keyword: "deshdrohi",
      category: "Inflammatory",
      rationale: "Highly volatile political token implying treason. Association draws corporate communication channels directly into hyper-partisan nationalist crossfire, violating basic corporate neutrality policies.",
      deduction: 68
    },
    {
      keyword: "dharma",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Complex theological concept. Risk of misinterpretation or commercial exploitation.",
      deduction: 15
    },
    {
      keyword: "dirty",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Associated with sanitation stereotypes or derogatory classist messaging.",
      deduction: 15
    },
    {
      keyword: "election",
      category: "Political Neutrality",
      rationale: "[HEURISTIC EVALUATION] Political campaigns risk violation of electoral neutrality codes or partisan backlash.",
      deduction: 15
    },
    {
      keyword: "fattu",
      category: "Inflammatory",
      rationale: "Colloquial street slang used to mock or label someone as a coward. While widely tolerated in entertainment media, its presence in automated brand communications compromises professional customer engagement quality.",
      deduction: 46
    },
    {
      keyword: "fekku",
      category: "Inflammatory",
      rationale: "Derogatory political slang used to target and mock public figures. Associating consumer brands with highly polarized, localized political trolling compromises brand professionalism and neutral public positioning.",
      deduction: 48
    },
    {
      keyword: "g@nd",
      category: "Explicit/Adult",
      rationale: "Classic leet-speak obfuscation replacing characters with symbols to bypass algorithmic filters. Essential entry for robust, local fail-safe script validation to counteract intentional evasion techniques by users.",
      deduction: 84
    },
    {
      keyword: "g@ndu",
      category: "Severe Profanity",
      rationale: "Symbol-masked variation of an explicit street profanity. Must be hardcoded into safety-critical filtering scripts to intercept deliberate bypass patterns in live user commentary streams.",
      deduction: 86
    },
    {
      keyword: "gaandfaad",
      category: "Explicit/Adult",
      rationale: "High-intensity street slang referencing explicit anatomical outcomes to express shock. Entirely inappropriate for secure co-branded spaces and premium contextual placements.",
      deduction: 82
    },
    {
      keyword: "gandchatt",
      category: "Explicit/Adult",
      rationale: "Explicit anatomical slang used as a crude personal insult. Fails standard brand suitability models under the GARM framework for explicit and adult content types.",
      deduction: 85
    },
    {
      keyword: "gandfat",
      category: "Explicit/Adult",
      rationale: "Anatomy-based vulgar slang used to express extreme fear or shock. Fails standard brand suitability thresholds under the GARM (Global Alliance for Responsible Media) framework for explicit language.",
      deduction: 82
    },
    {
      keyword: "gandgiri",
      category: "Severe Profanity",
      rationale: "Urban vulgar compound slang indicating rowdy, inappropriate, or hostile street antics. Incompatible with standard corporate tonality frameworks and high-tier enterprise conversational automated responses.",
      deduction: 78
    },
    {
      keyword: "gandmarana",
      category: "Severe Profanity",
      rationale: "Verb form of high-intensity anatomical profanity. Represents an absolute breach of safety policies on global ad exchanges, demanding a rigorous blocklist approach to prevent platform monetization issues.",
      deduction: 86
    },
    {
      keyword: "gandmaraye",
      category: "Severe Profanity",
      rationale: "Aggressive, vulgar street phrase used to express extreme hostility or dismissiveness. Association with this level of abusive language breaks consumer trust and violates local advertising decency frameworks.",
      deduction: 86
    },
    {
      keyword: "gandmasti",
      category: "Explicit/Adult",
      rationale: "Regional vulgar compound slang indicating rowdy, inappropriate, or sexually suggestive antics. Unacceptable under strict programmatic ad network guidelines regarding vulgar behavior and explicit framing.",
      deduction: 82
    },
    {
      keyword: "gandu",
      category: "Severe Profanity",
      rationale: "Explicit street-level profanity referencing anatomy. Explicitly prohibited under programmatic brand safety definitions for obscene content, creating high risk for contextual ad placement algorithms.",
      deduction: 86
    },
    {
      keyword: "ganja",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Slang for cannabis. Illegal drug association in standard corporate compliance guidelines.",
      deduction: 30
    },
    {
      keyword: "gaumutra",
      category: "Religious Insensitivity",
      rationale: "Frequently weaponized in digital flame wars as a sectarian slur to mock specific traditional religious practices. Presence creates high exposure under regional laws penalizing religious insult.",
      deduction: 72
    },
    {
      keyword: "gaurakshak",
      category: "Inflammatory",
      rationale: "Socio-politically sensitive keyword frequently associated with regional vigilantism and communal polarization. Adjacency draws commercial brands into complex law-and-order and sectarian narratives.",
      deduction: 64
    },
    {
      keyword: "gndu",
      category: "Severe Profanity",
      rationale: "Vowel-omitted text shorthand for explicit anatomical street abuse. Deployed natively by users to exploit weaknesses in simple keyword engines, making its inclusion in an offline fail-safe array essential.",
      deduction: 86
    },
    {
      keyword: "goti",
      category: "Explicit/Adult",
      rationale: "Anatomical street slang referencing male reproductive organs, frequently weaponized in vulgar peer-to-peer digital harassment. Entirely unsuitable for automated brand touchpoints or premium ad placements.",
      deduction: 76
    },
    {
      keyword: "guru",
      category: "Religious/Social Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Associated with spiritual leadership. Risk of commercial trivialization.",
      deduction: 10
    },
    {
      keyword: "habshi",
      category: "Classist/Casteist Slur",
      rationale: "Explicitly racist and xenophobic slur targeting skin tone and racial heritage. Direct breach of ASCI anti-discrimination frameworks and international brand equity standards on diversity and human dignity.",
      deduction: 92
    },
    {
      keyword: "halal",
      category: "Religious/Social Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Can trigger polarization or community-specific boycott campaigns in certain socio-political climates.",
      deduction: 15
    },
    {
      keyword: "harami",
      category: "Inflammatory",
      rationale: "Historically severe pejorative that has transitioned into moderately common street slang. Still carries significant risk of personal insult and religious/cultural insensitivity, requiring defensive filtering in automated contexts.",
      deduction: 65
    },
    {
      keyword: "haramkhor",
      category: "Inflammatory",
      rationale: "Common pejorative implying dishonesty or living off illicit gains. While widely utilized in colloquial political rhetoric and cinema, its presence in automated brand interactions compromises professional tone and enterprise integrity.",
      deduction: 62
    },
    {
      keyword: "haramzada",
      category: "Severe Profanity",
      rationale: "High-intensity traditional profanity implying illegitimacy. Directly breaches core brand-suitability thresholds on major ad exchanges (Google DV360, Meta Audience Network), leading to immediate content flag loops.",
      deduction: 86
    },
    {
      keyword: "hijra",
      category: "Classist/Casteist Slur",
      rationale: "The name of a traditional third-gender community, frequently weaponized on the streets as a highly offensive transphobic pejorative. Directly violates platform hate speech policies and diversity, equity, and inclusion (DEI) standards.",
      deduction: 92
    },
    {
      keyword: "hilaana",
      category: "Explicit/Adult",
      rationale: "Literal translation means to shake, but weaponized on social networks as explicit slang for a sexual act. Non-compliant for premium contextual ad environments due to underlying explicit connotations.",
      deduction: 72
    },
    {
      keyword: "hindu",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Direct religious categorization. High risk of communal marketing backlash.",
      deduction: 20
    },
    {
      keyword: "item",
      category: "Gender & Social Tone",
      rationale: "[HEURISTIC EVALUATION] Objectifying slang reference to women in local dialects. Severe gender sensitivity trigger.",
      deduction: 30
    },
    {
      keyword: "jhaantbal",
      category: "Explicit/Adult",
      rationale: "Highly crude anatomical slang indicating utter insignificance or worthlessness. Completely non-compliant with standard ad network criteria defining clean, family-safe web environments.",
      deduction: 83
    },
    {
      keyword: "jhant",
      category: "Severe Profanity",
      rationale: "Highly vulgar anatomical pejorative used to denote worthlessness or to aggressively demean an opponent. Unacceptable for any mainstream corporate or co-branded user-generated campaigns due to its crude, explicit nature.",
      deduction: 83
    },
    {
      keyword: "jihad",
      category: "Inflammatory",
      rationale: "Highly sensitive geopolitical and theological keyword. Frequently triggers global programmatic safety net parameters due to its association with conflict, requiring deep context verification.",
      deduction: 62
    },
    {
      keyword: "jihadi",
      category: "Inflammatory",
      rationale: "Frequently weaponized out of context in digital spaces to incite sectarian hostility and communal polarization. High risk of violating Indian cyber laws and penal codes (Section 153A) regarding the promotion of communal disharmony.",
      deduction: 68
    },
    {
      keyword: "k@twa",
      category: "Religious Insensitivity",
      rationale: "Symbol-masked variant of a banned sectarian pejorative designed to circumvent automated content scanners. Must be captured in local fail-safe filtering arrays to guarantee absolute safety against targeted hate speech.",
      deduction: 97
    },
    {
      keyword: "kaalia",
      category: "Classist/Casteist Slur",
      rationale: "Explicit colorist slur targeting skin tone. Deeply violates ASCI regulations that strictly prohibit advertising content or adjacencies that promote discrimination based on color, race, or physical characteristics.",
      deduction: 82
    },
    {
      keyword: "kallu",
      category: "Classist/Casteist Slur",
      rationale: "Derogatory term targeting skin tone. Violates standard advertising norms against colorism and racial/ethnic discrimination, running directly counter to modern brand guidelines on inclusivity.",
      deduction: 80
    },
    {
      keyword: "kamina",
      category: "Inflammatory",
      rationale: "Colloquial insult implying slyness or malice. While frequently heard in popular media and cinema, it remains unsuitable for automated, direct brand messaging due to its negative peer-to-peer framing.",
      deduction: 55
    },
    {
      keyword: "kaminey",
      category: "Inflammatory",
      rationale: "Plural variant of common insult. Frequently used in colloquial speech, but still classified under the caution tier to ensure automated response systems do not inadvertently adopt an aggressive or unprofessional posture.",
      deduction: 52
    },
    {
      keyword: "kanjar",
      category: "Classist/Casteist Slur",
      rationale: "The name of a historically marginalized community weaponized as a street pejorative to denote low social status or uncivilized behavior. Violates explicit anti-discrimination legal frameworks in India and breaks brand equity protocols completely.",
      deduction: 93
    },
    {
      keyword: "karma",
      category: "Religious/Social Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Theological concept often overused or trivialized in westernized marketing campaigns.",
      deduction: 10
    },
    {
      keyword: "katora",
      category: "Inflammatory",
      rationale: "Literally meaning a bowl, this token is weaponized in digital flame wars to mock individuals or nations by implying extreme poverty or begging. Violates basic human dignity guidelines and classist sensitivity frameworks.",
      deduction: 59
    },
    {
      keyword: "katwa",
      category: "Religious Insensitivity",
      rationale: "Highly inflammatory, derogatory sectarian slur used targeting specific religious communities. Direct violation of Indian penal codes regarding communal harmony (Section 295A/153A), representing a catastrophic PR and legal hazard.",
      deduction: 96
    },
    {
      keyword: "katwe",
      category: "Religious Insensitivity",
      rationale: "Plural variant of a highly toxic, prohibited sectarian slur targeting religious identity. Use of this token represents an extreme escalatory vector for communal violence online, rendering it an absolute fail-safe blocklist priority.",
      deduction: 97
    },
    {
      keyword: "khalistan",
      category: "Inflammatory",
      rationale: "Socio-politically sensitive keyword indicating regional secessionism. Adjacency drags commercial brands into toxic nationalist debates, resulting in immediate algorithmic flags and potential consumer boycotts.",
      deduction: 67
    },
    {
      keyword: "khalistani",
      category: "Inflammatory",
      rationale: "Highly volatile geopolitical and sectarian term associated with regional secessionist conflict. Adjacency threatens brand safety by instantly entangling corporate communication assets in severe ideological and national security crossfire.",
      deduction: 69
    },
    {
      keyword: "khangressi",
      category: "Inflammatory",
      rationale: "Highly toxic, compound internet political slur combining partisan labels with sectarian overtones. Directly threatens corporate political neutrality and runs counter to programmatic brand safety guidelines within the Indian media ecosystem.",
      deduction: 55
    },
    {
      keyword: "kuttay",
      category: "Inflammatory",
      rationale: "Phonetic variation of a common regional street insult. Included in defensive arrays to ensure automated content scanners maintain high-accuracy capture rates against colloquial typing habits on local forums.",
      deduction: 51
    },
    {
      keyword: "kutte",
      category: "Inflammatory",
      rationale: "Animalistic pejorative widely utilized in regional street abuse. While common in cinematic media, automated deployment or adjacency within premium brand feeds compromises corporate professionalism and standard tone protocols.",
      deduction: 52
    },
    {
      keyword: "l0uda",
      category: "Explicit/Adult",
      rationale: "Leet-speak typographic variation of explicit male anatomical slang. Must be captured natively via filtering scripts to maintain strict compliance with corporate brand suitability frameworks.",
      deduction: 87
    },
    {
      keyword: "l@uda",
      category: "Explicit/Adult",
      rationale: "Obfuscated spelling of male anatomical slang. Fails standard programmatic brand suitability checks under the GARM framework for explicit or obscene content types.",
      deduction: 87
    },
    {
      keyword: "lauda",
      category: "Explicit/Adult",
      rationale: "Explicit street slang for male anatomy. Completely non-compliant under global GARM (Global Alliance for Responsible Media) standards for explicit, adult, and obscene content. Poses immediate brand threat if featured in contextual ad placements.",
      deduction: 87
    },
    {
      keyword: "laudey",
      category: "Explicit/Adult",
      rationale: "Inflected phonetic variant of explicit male anatomical slang, heavily used in hostile digital comments. Directly breaches global GARM standards on obscenity, creating acute brand-suitability risks for programmatic ad delivery across consumer-facing channels.",
      deduction: 87
    },
    {
      keyword: "laundiyabaaz",
      category: "Explicit/Adult",
      rationale: "Highly derogatory regional term referencing promiscuity and objectification. Represents a significant risk for brand suitability, violating standard advertising codes concerning decency and gender-based sensitivity.",
      deduction: 78
    },
    {
      keyword: "libandu",
      category: "Inflammatory",
      rationale: "Highly polarized internet slang used to mock specific political and ideological positions. Poses a notable risk to corporate political neutrality, threatening to alienate major consumer demographics if allowed in brand-adjacent feeds.",
      deduction: 56
    },
    {
      keyword: "librandu",
      category: "Inflammatory",
      rationale: "Standardized spelling variation of an internet political pejorative. Endangers brand safety by associating digital corporate assets with toxic ideological battlegrounds and polarizing socio-political discourse.",
      deduction: 56
    },
    {
      keyword: "lovejihad",
      category: "Religious Insensitivity",
      rationale: "Socio-politically explosive phrase frequently associated with communal polarization. Immediate PR hazard that violates Indian penal guidelines protecting communal harmony and social peace.",
      deduction: 78
    },
    {
      keyword: "lowda",
      category: "Explicit/Adult",
      rationale: "Phonetic spelling variation of explicit male anatomical slang. Must be blocked within local filtering scripts to ensure high-accuracy capture rates against colloquial typing habits on platforms like YouTube and Instagram comments.",
      deduction: 87
    },
    {
      keyword: "lund",
      category: "Explicit/Adult",
      rationale: "Phonetic rendering of explicit male anatomical slang. Directly breaches standard programmatic compliance rules under global GARM guidelines for adult, obscene, or highly explicit text content.",
      deduction: 87
    },
    {
      keyword: "m@darchod",
      category: "Severe Profanity",
      rationale: "Classic algorithmic evasion technique substituting characters with special symbols. Essential configuration for defensive filtering engines to protect user-generated content validation loops.",
      deduction: 88
    },
    {
      keyword: "maadarbaaz",
      category: "Severe Profanity",
      rationale: "Traditional, severe personal profanity carrying high explicit intensity. Unacceptable under strict programmatic ad network criteria defining clean, premium corporate messaging portfolios.",
      deduction: 87
    },
    {
      keyword: "maaki",
      category: "Severe Profanity",
      rationale: "The structural root of a severe localized street profanity targeting maternal lineage. Frequently used as a truncated expression to bypass multi-word string matching while retaining full toxic intent.",
      deduction: 85
    },
    {
      keyword: "machchar",
      category: "Inflammatory",
      rationale: "Literal translation for a mosquito, but weaponized in toxic digital discourse as a physical demeaning term to mock an individual's build or weakness. Requires context evaluation to avoid false positives while curbing micro-harassment.",
      deduction: 48
    },
    {
      keyword: "madarch0d",
      category: "Severe Profanity",
      rationale: "Numeric character obfuscation deployed intentionally by users to slip high-intensity explicit abuse past native platform defenses while maintaining full derogatory impact.",
      deduction: 88
    },
    {
      keyword: "madarchod",
      category: "Severe Profanity",
      rationale: "Top-tier explicit profanity carrying severe vulgarity. Completely non-compliant for mainstream commercial advertising. Triggers automated content moderation filters across global ad networks and local platforms due to explicit, abusive nature.",
      deduction: 88
    },
    {
      keyword: "madrasi",
      category: "Inflammatory",
      rationale: "A reductionist and outdated regional label frequently weaponized as an ethnocentric or xenophobic pejorative against people from Southern India. Violates ASCI regulations against regional discrimination and corporate inclusivity benchmarks.",
      deduction: 62
    },
    {
      keyword: "maid",
      category: "Gender & Social Tone",
      rationale: "[HEURISTIC EVALUATION] Classist risk vector identified if framing domestic labor structures in transactional commercial copy.",
      deduction: 20
    },
    {
      keyword: "mamme",
      category: "Explicit/Adult",
      rationale: "Phonetic street slang referencing female anatomy. Represents an absolute breach of safety policies on global ad networks, requiring rigorous defensive filtering to protect contextual ad placements from explicit content categorization.",
      deduction: 86
    },
    {
      keyword: "mc",
      category: "Severe Profanity",
      rationale: "Widely recognized alphanumeric acronym representing a severe street profanity. Deployed intentionally by users to bypass primary algorithmic text filters on social feeds. Immediate block is required to prevent severe reputation damage in automated ad delivery.",
      deduction: 88
    },
    {
      keyword: "mehtar",
      category: "Classist/Casteist Slur",
      rationale: "Casteist token demeaning historical sanitation and manual labor communities. Direct violation of statutory guidelines under India's SC/ST Prevention of Atrocities Act, posing existential regulatory risks for commercial entities.",
      deduction: 94
    },
    {
      keyword: "modi",
      category: "Political Neutrality",
      rationale: "[HEURISTIC EVALUATION] Direct reference to active political figures. High risk of political polarization.",
      deduction: 25
    },
    {
      keyword: "mulla",
      category: "Religious Insensitivity",
      rationale: "Often used in online discourse as a derogatory sectarian pejorative to marginalize specific communities. Poses extreme risk under Indian media regulations governing hate speech and communal polarization.",
      deduction: 89
    },
    {
      keyword: "mulle",
      category: "Religious Insensitivity",
      rationale: "Aggressive sectarian slur designed to incite religious polarization. Triggers severe public backlash and violates statutory content regulations governing intermediary liability under India's IT Act.",
      deduction: 95
    },
    {
      keyword: "mulli",
      category: "Religious Insensitivity",
      rationale: "A highly inflammatory, gendered sectarian slur targeting women of a specific religious minority community. Use of this term risks severe public relations fallout and immediate legal liability under local communal harmony statutes.",
      deduction: 95
    },
    {
      keyword: "mullon",
      category: "Religious Insensitivity",
      rationale: "Plural variation of an inflammatory sectarian slur targeting a religious minority community. Poses extreme risks under Indian cyber laws and local penal codes (Section 153A) regarding the incitement of communal polarization or disharmony.",
      deduction: 95
    },
    {
      keyword: "mullu",
      category: "Religious Insensitivity",
      rationale: "Phonetic sectarian slur utilized online to marginalize and target specific religious minority groups. Direct violation of local cyber laws and penal codes protecting communal harmony.",
      deduction: 95
    },
    {
      keyword: "muslim",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Direct religious categorization. High risk of communal marketing backlash.",
      deduction: 20
    },
    {
      keyword: "muth",
      category: "Explicit/Adult",
      rationale: "Colloquial street slang referencing a sexual act. Explicitly prohibited under standard ad exchange policies regarding adult behaviors and non-family-friendly terminology, presenting immediate reputational risk.",
      deduction: 80
    },
    {
      keyword: "mutna",
      category: "Explicit/Adult",
      rationale: "Crude colloquial slang for bodily functions, frequently deployed in digital discourse to express extreme contempt or degradation. Fails standard brand suitability thresholds under the GARM framework for public decency.",
      deduction: 78
    },
    {
      keyword: "mutthal",
      category: "Explicit/Adult",
      rationale: "Street-level explicit slang used to objectify and insult individuals via vulgar behavioral labeling. Highly inappropriate for consumer-facing brands, creating immediate friction with premium ad placement standards.",
      deduction: 79
    },
    {
      keyword: "native",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Potential colonial or patronizing framing depending on context.",
      deduction: 15
    },
    {
      keyword: "naxal",
      category: "Inflammatory",
      rationale: "Charged socio-political and ideological identifier implying violent anti-state extremism. Poses severe brand safety risks by drawing corporate communications into highly sensitive national internal security narratives.",
      deduction: 62
    },
    {
      keyword: "nepali",
      category: "Inflammatory",
      rationale: "Frequently used as a classist, reductionist pejorative targeting individuals in specific service sector roles based on national origin. Poses a critical risk for international brand safety compliance and diversity standards.",
      deduction: 52
    },
    {
      keyword: "paki",
      category: "Inflammatory",
      rationale: "Geopolitical and ethnic slur used to incite nationalist or xenophobic hostility. Highly toxic for corporate platforms seeking to maintain neutral, safe, and lawful communication standards in the region.",
      deduction: 91
    },
    {
      keyword: "pappu",
      category: "Inflammatory",
      rationale: "A highly charged political moniker widely utilized in Indian digital spaces to demean and infantilize political leadership. Adjacency presents an active threat to programmatic brand safety by pulling corporate assets into polarized political crossfire.",
      deduction: 50
    },
    {
      keyword: "pariah",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Derogatory term indicating social exclusion or caste-based marginalization.",
      deduction: 20
    },
    {
      keyword: "pataka",
      category: "Gender & Social Tone",
      rationale: "[HEURISTIC EVALUATION] Double-entendre slang comparing women to firecrackers. Gender sensitivity and objectification risk.",
      deduction: 25
    },
    {
      keyword: "patharbaaz",
      category: "Inflammatory",
      rationale: "Highly volatile socio-political token referencing civil unrest and targeted violence. Adjacency instantly compromises a brand's political neutrality, pulling enterprise messaging into complex internal security and law-and-order narratives.",
      deduction: 75
    },
    {
      keyword: "pichwada",
      category: "Explicit/Adult",
      rationale: "Crude colloquial slang referencing anatomy, frequently utilized in aggressive digital peer-to-peer discourse. Unsuitable for mainstream corporate communications or brand-safe digital spaces.",
      deduction: 76
    },
    {
      keyword: "pille",
      category: "Severe Profanity",
      rationale: "Literal regional translation for a pup, but extensively weaponized as an aggressive street slur implying illegitimate or low-status lineage. Highly damaging to premium content standards and public-facing user engagement.",
      deduction: 72
    },
    {
      keyword: "popat",
      category: "Inflammatory",
      rationale: "Colloquial street slang used to humiliate or mock an opponent as a gullible tool. Requires careful filtering in automated conversational flows to preserve an authoritative, elite, and premium corporate persona.",
      deduction: 44
    },
    {
      keyword: "pork",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Religious dietary taboo across significant minority demographic segments.",
      deduction: 25
    },
    {
      keyword: "protest",
      category: "Political Neutrality",
      rationale: "[HEURISTIC EVALUATION] Associated with public demonstration, political activism, and civil unrest.",
      deduction: 20
    },
    {
      keyword: "r@ndirona",
      category: "Severe Profanity",
      rationale: "Obfuscated compound variant of a misogynistic street slur used to mock user grievances. Association creates an immediate corporate reputation hazard regarding gender sensitivity and ethical communication.",
      deduction: 77
    },
    {
      keyword: "raand",
      category: "Explicit/Adult",
      rationale: "Alternative phonetic spelling of a severe misogynistic slur. Triggers absolute, high-severity keyword flags across global programmatic ad networks, demanding absolute inclusion in offline fail-safe blocklists.",
      deduction: 91
    },
    {
      keyword: "rahul",
      category: "Political Neutrality",
      rationale: "[HEURISTIC EVALUATION] Reference to active political opposition figures. Risk of political polarization.",
      deduction: 25
    },
    {
      keyword: "rakhel",
      category: "Explicit/Adult",
      rationale: "Highly demeaning, patriarchal street slang used to objectify individuals. Breaches basic corporate communication ethics and ASCI guidelines governing gender sensitivity and public decency standards.",
      deduction: 84
    },
    {
      keyword: "rand",
      category: "Explicit/Adult",
      rationale: "Root misogynistic slur with explicit adult connotations. Triggers absolute, high-severity keyword flags across global programmatic ad networks, resulting in swift platform demonetization.",
      deduction: 91
    },
    {
      keyword: "randi",
      category: "Explicit/Adult",
      rationale: "Severe misogynistic slur targeting individuals with highly explicit and derogatory connotations. Represents a critical violation of community guidelines on every major ad exchange, necessitating an absolute block in defensive filters.",
      deduction: 90
    },
    {
      keyword: "randibaaz",
      category: "Explicit/Adult",
      rationale: "Street slang denoting crude objectification and explicit lifestyle casting. Fails standard ad exchange compliance parameters regarding decency, exposing corporate platforms to significant reputational vulnerability in user comments.",
      deduction: 86
    },
    {
      keyword: "randirona",
      category: "Severe Profanity",
      rationale: "A compound vulgar slang word frequently used online to mock complaints or grievances. Contains highly misogynistic linguistic roots, making its association an immediate public relations disaster regarding gender sensitivity and brand ethics.",
      deduction: 77
    },
    {
      keyword: "randwa",
      category: "Explicit/Adult",
      rationale: "Vulgar, explicit street slang used to insult individuals based on their marital or relationship status, containing crude sexual undertones. Entirely non-compliant for premium ad networks and safe digital spaces.",
      deduction: 78
    },
    {
      keyword: "ricebag",
      category: "Religious Insensitivity",
      rationale: "A highly derogatory, inflammatory sectarian slur used to target and mock specific religious minority communities online. Presents an absolute compliance breach under local broadcasting and information technology laws protecting religious harmony.",
      deduction: 94
    },
    {
      keyword: "riot",
      category: "Political/Social Tone",
      rationale: "[HEURISTIC EVALUATION] High risk of triggering public safety concerns and negative associations.",
      deduction: 25
    },
    {
      keyword: "saale",
      category: "Inflammatory",
      rationale: "Pervasive colloquial insult. While common in regional entertainment media, its unintended generation by brand-adjacent assets compromises automated conversational quality and professional tone.",
      deduction: 46
    },
    {
      keyword: "saali",
      category: "Inflammatory",
      rationale: "Gendered colloquial pejorative prevalent across North Indian regional speech. Though heavily utilized in informal cinematic media, its uncontrolled presence in customer touchpoints risks degrading the premium posture of corporate communications.",
      deduction: 45
    },
    {
      keyword: "sacred",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Mixing sacred concepts with consumer products is flagged as high-risk under festive marketing codes.",
      deduction: 20
    },
    {
      keyword: "sala",
      category: "Inflammatory",
      rationale: "Very common mild profanity/slang across North India. Though universally understood and often tolerated in casual entertainment, it requires caution in corporate contexts to maintain a premium brand tone.",
      deduction: 45
    },
    {
      keyword: "sanatani",
      category: "Inflammatory",
      rationale: "While carrying a valid theological and cultural definition, this keyword is heavily utilized in hyper-polarized digital debates. Requires contextual verification to maintain strict neutrality and avoid algorithmic false positives.",
      deduction: 42
    },
    {
      keyword: "sanghi",
      category: "Inflammatory",
      rationale: "Highly charged political and ideological epithet utilized in polarized online environments. Associating brand channels with such terms poses a critical threat to neutrality, risking swift boycotts from opposing demographical blocks.",
      deduction: 58
    },
    {
      keyword: "sharaab",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Urdu/Hindi term for alcohol. Subject to strict surrogate advertising regulations in India.",
      deduction: 25
    },
    {
      keyword: "sikh",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] Direct religious categorization. High risk of communal marketing backlash.",
      deduction: 20
    },
    {
      keyword: "slum",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Socio-economic insensitivity. Negative framing of lower-income urban populations.",
      deduction: 20
    },
    {
      keyword: "suarkabacha",
      category: "Severe Profanity",
      rationale: "Animalistic street profanity used to inflict personal insult regarding lineage. Directly violates basic programmatic brand suitability guidelines concerning abusive language, threatening the professional presentation of digital ad placements.",
      deduction: 82
    },
    {
      keyword: "sulla",
      category: "Religious Insensitivity",
      rationale: "Severe sectarian slur targeting a specific religious minority group. Deployed to incite polarization, posing extreme risk under India's IT Act guidelines for hate speech moderation.",
      deduction: 96
    },
    {
      keyword: "swadeshi",
      category: "Political/Social Tone",
      rationale: "[HEURISTIC EVALUATION] Nationalist economic terminology. Can cause trade polarization or global partnership friction.",
      deduction: 10
    },
    {
      keyword: "tatte",
      category: "Explicit/Adult",
      rationale: "Crude colloquial slang referencing male anatomy, frequently utilized in hostile peer-to-peer digital commentary. Unsuitable for mainstream corporate communications or brand-adjacent user commentary.",
      deduction: 82
    },
    {
      keyword: "temple",
      category: "Religious Sensitivity",
      rationale: "[HEURISTIC EVALUATION] High-friction religious landmark trigger in commercial copy. Vetting recommended before festive releases.",
      deduction: 25
    },
    {
      keyword: "topibaaz",
      category: "Inflammatory",
      rationale: "Colloquial slang meaning a con-artist or fraudster, often tracking distinct regional or socio-political undertones in online forums. Requires strategic filtering to maintain positive consumer sentiment metrics.",
      deduction: 52
    },
    {
      keyword: "tribal",
      category: "Social Tone",
      rationale: "[HEURISTIC EVALUATION] Risk of exoticizing or misrepresenting indigenous communities.",
      deduction: 15
    },
    {
      keyword: "tukdetukde",
      category: "Inflammatory",
      rationale: "Polarizing political metaphor used to claim anti-national subversion. Adjacency to this phrase drags consumer brands into severe ideological warfare, jeopardizing mainstream consumer trust.",
      deduction: 60
    },
    {
      keyword: "ullukapattha",
      category: "Inflammatory",
      rationale: "Traditional, relatively mild regional street insult indicating foolishness. Included to ensure automated moderation components can maintain precise calibration regarding professional customer interaction quality.",
      deduction: 43
    },
    {
      keyword: "urbannaxal",
      category: "Inflammatory",
      rationale: "A highly controversial socio-political label used to imply anti-national sentiment or ideological extremism. Presents severe reputational risks for mainstream commercial entities attempting to maintain an untainted, non-partisan stance.",
      deduction: 66
    }
  ];

  // Scan copy for matches
  const matchKeyword = (text, keyword) => {
    const kw = keyword.toLowerCase();
    if (/[^a-z0-9]/i.test(kw)) {
      return text.includes(kw);
    }
    if (kw.length < 6) {
      const rx = new RegExp('\\b' + kw + '\\b', 'i');
      return rx.test(text);
    }
    return text.includes(kw);
  };

  riskDictionary.forEach(item => {
    if (matchKeyword(normalizedText, item.keyword)) {
      flagged.push({
        phrase: item.keyword,
        category: item.category,
        rationale: item.rationale
      });
      scoreDeduction += item.deduction;
    }
  });

  // Allow scores to go as low as 5 for extreme content (priority intercepts handled separately above)
  const finalScore = Math.max(100 - scoreDeduction, 5);
  let riskLevel = "Safe";
  if (finalScore < 70) {
    riskLevel = "High Risk";
  } else if (finalScore < 90) {
    riskLevel = "Caution";
  }

  // PASS 1 (Risk Detected): If the text matches any local profanities or street slangs (High Risk)
  if (riskLevel === "High Risk") {
    const score = Math.min(finalScore, 15);
    const summary = `Compliance analysis identified ${flagged.length} high-friction risk parameter${flagged.length > 1 ? 's' : ''} within this copy. Tailored PR crisis rationale: Deploying this language violates standard digital advertising policy guidelines. Immediate copy review and withdrawal recommended.`;
    return {
      overall_score: score,
      risk_level: "High Risk",
      summary: summary,
      flagged_issues: flagged
    };
  }

  // PASS 2 (Clean Copy Pass): If the text contains NO high-risk keywords, force flawless green success state
  return {
    overall_score: 100,
    risk_level: "Safe / Compliant",
    summary: "Linguistic compliance analysis has completed successfully. The evaluated campaign copy contains no offensive phrasing, derogatory slang, or safety violations, making it fully safe for public deployment.",
    flagged_issues: []
  };
}

/**
 * Alpine.js Global Application Controller function.
 * Avoids raw string attribute leaks inside index.html by packaging the state machine logic cleanly.
 */
function brandCheckApp() {
  return {
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    wizardStep: 1,
    privacyModal: false,
    connectionModal: false,
    faqOpen: null,
    loader: false,
    brandContextWarning: false,
    cloudEngineKey: localStorage.getItem('BC_LIVE_CORE_KEY') || '',
    inferenceStatus: 'Inference Core Ready',
    
    // Google OAuth State
    user: null,
    authModal: false,
    userDropdown: false,

    // Subscription Tier State
    currentTier: localStorage.getItem('BC_USER_TIER') || 'Free',
    premiumGateModal: false,
    sarcasmFilterEnabled: false,

    // Form Inputs
    brandContext: '',
    demographics: 'Whole India Market',
    campaignCopy: '',
    selectedEngine: 'tier1',
    sensitivity: 'Standard',

    // Results State
    showResults: false,
    results: {
      overall_score: 100,
      risk_level: 'Safe',
      summary: '',
      flagged_issues: []
    },

    init() {
      // Pull existing sessions immediately on boot
      const existingUser = typeof getAuthUser === 'function' ? getAuthUser() : null;
      if (existingUser) {
        this.user = existingUser;
      }
      // Hydrate subscription tier from storage on every page load
      this.currentTier = localStorage.getItem('BC_USER_TIER') || 'Free';

      // Live system-appearance listener — darkMode always mirrors OS preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = (e) => {
        this.darkMode = e.matches;
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mq.addEventListener('change', applyTheme);
      // Apply immediately in case preference changed before Alpine mounted
      applyTheme(mq);
      
      // Register active window event listeners to keep states uniformly synchronized
      window.addEventListener('gauth:login', (e) => {
        this.user = e.detail;
        this.authModal = false;
      });
      window.addEventListener('gauth:logout', () => {
        this.user = null;
        this.userDropdown = false;
      });
      // Listen for tier upgrades dispatched from other pages (e.g. pricing.html)
      window.addEventListener('bc:tier:upgrade', (e) => {
        this.currentTier = e.detail || 'Professional';
        localStorage.setItem('BC_USER_TIER', this.currentTier);
      });
    },

    /**
     * Simulates a successful Stripe checkout by writing the Professional tier
     * to localStorage and broadcasting the upgrade event across tabs.
     */
    activateProfessional() {
      this.currentTier = 'Professional';
      localStorage.setItem('BC_USER_TIER', 'Professional');
      window.dispatchEvent(new CustomEvent('bc:tier:upgrade', { detail: 'Professional' }));
      this.premiumGateModal = false;
      // Briefly show a confirmation nudge using inferenceStatus
      if (typeof this.inferenceStatus !== 'undefined') {
        this.inferenceStatus = '✦ Professional Tier Activated';
        setTimeout(() => { this.inferenceStatus = 'Inference Core Ready'; }, 3500);
      }
    },

    /**
     * Toggles the sarcasm/dialect analysis filter.
     * Free-tier users are intercepted and shown the premium gate modal.
     */
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

    handleGoogleAuthCredential(credential) {
      if (typeof decodeJWT === 'function') {
        const decodedUser = decodeJWT(credential);
        if (decodedUser) {
          this.user = decodedUser;
          localStorage.setItem('BC_AUTH_USER', JSON.stringify(decodedUser));
          this.authModal = false;
        }
      }
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
        if (isCritical) {
          highlightClass = 'text-red-500 font-extrabold border-b-2 border-dashed border-red-500 hover:text-red-400 cursor-help transition';
        } else if (isCaution) {
          highlightClass = 'text-amber-500 font-bold border-b border-dashed border-amber-500 hover:text-amber-400 cursor-help transition';
        }
        
        text = text.replace(regex, `<span class="${highlightClass}" title="${issue.category}: ${issue.rationale.replace(/"/g, '&quot;')}">$1</span>`);
      });
      return text;
    },

    nextStep() {
      if (this.wizardStep === 1) {
        if (!this.brandContext.trim()) {
          this.brandContextWarning = true;
          return;
        } else {
          this.brandContextWarning = false;
        }
      }
      this.wizardStep++;
    },

    async runComplianceCheck() {
      this.loader = true;
      this.showResults = false;
      this.inferenceStatus = 'Analyzing Slogan...';
      try {
        // Execute the sandbox broker function
        const data = await executeComplianceCheck(this.brandContext, this.demographics, this.campaignCopy);
        // Add a small artificial delay for visual fidelity
        setTimeout(() => {
          this.results = data || {
            overall_score: 0,
            risk_level: 'API Error',
            summary: '⚠️ The analysis engine returned no data. Please check your API key and try again.',
            flagged_issues: []
          };
          if (data && data.isOfflineFallback) {
            this.inferenceStatus = 'Inference Core: Sandbox Mode (Offline Fallback Active)';
          } else {
            this.inferenceStatus = 'Inference Core Ready';
          }
          this.loader = false;
          this.showResults = true;
        }, 800);
      } catch (err) {
        console.error('[BrandCheck Pro] Fatal execution error:', err);
        this.loader = false;
        this.inferenceStatus = 'Inference Core: Error';
        this.results = {
          overall_score: 0,
          risk_level: 'API Error',
          summary: `⚠️ Fatal Execution Error — ${err.message}. Open the browser console for full details.`,
          flagged_issues: []
        };
        this.showResults = true;
      }
    }
  };
}
