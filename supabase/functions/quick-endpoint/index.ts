// Supabase Edge Function — quick-endpoint
// Secure server-side AI analysis for BrandCheck Pro.
//
// Calls Google Gemini (primary) or Anthropic Claude (fallback) using keys
// stored as Supabase secrets, so no provider key ever reaches the browser.
//
// Quota policy:
//   • Anonymous visitors  → FREE_SCANS_PER_DAY AI scans per IP per day,
//     then 429 { limit_reached: true } (frontend falls back to offline scan).
//   • Signed-in users (Google ID token in X-BrandCheck-Auth) → unlimited.
//   • Requests carrying a BYOK `customKey` → use that key, never metered.
//
// Deploy:
//   supabase functions deploy quick-endpoint
// Required secrets (either name variant works):
//   GEMINI_API_KEY | GOOGLE_AI_KEY | GOOGLE_AI_STUDIO_KEY | GOOGLE_API_KEY
//   ANTHROPIC_API_KEY | CLAUDE_API_KEY
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FREE_SCANS_PER_DAY = 5;

const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
const ANTHROPIC_MODEL = 'claude-5-sonnet';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, apikey, content-type, x-brandcheck-auth, x-client-info'
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

function getSecret(...names: string[]): string {
  for (const name of names) {
    const v = Deno.env.get(name);
    if (v && v.trim()) return v.trim();
  }
  return '';
}

// ─── Auth: verify Google ID token so signed-in users skip the meter ──────────

async function isValidGoogleUser(credential: string | null): Promise<boolean> {
  if (!credential) return false;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!res.ok) return false;
    const info = await res.json();
    // tokeninfo already validates signature; double-check expiry.
    return Number(info.exp) * 1000 > Date.now();
  } catch (_) {
    return false;
  }
}

// ─── Quota: per-IP daily counter in bc_anon_usage ────────────────────────────

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || 'unknown';
}

async function consumeAnonScan(req: Request): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  // If the quota store is unavailable, fail open rather than blocking scans.
  if (!url || !serviceKey) return true;
  try {
    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase.rpc('bc_consume_anon_scan', {
      p_ip: clientIp(req),
      p_limit: FREE_SCANS_PER_DAY
    });
    if (error) {
      console.error('[quick-endpoint] quota rpc error:', error.message);
      return true;
    }
    return data === true;
  } catch (err) {
    console.error('[quick-endpoint] quota check failed:', err);
    return true;
  }
}

// ─── Providers ───────────────────────────────────────────────────────────────

function extractJsonPayload(rawText: string): Record<string, unknown> {
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

async function callGemini(apiKey: string, prompt: string): Promise<Record<string, unknown>> {
  const errors: string[] = [];
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
          })
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const payload = await res.json();
      const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty Gemini response.');
      const data = extractJsonPayload(rawText);
      data.engine = `Live AI Pipeline: Gemini (${model})`;
      return data;
    } catch (err) {
      errors.push(`${model}: ${(err as Error).message}`);
    }
  }
  throw new Error(`Gemini failed. ${errors.join(' | ')}`);
}

async function callAnthropic(apiKey: string, prompt: string): Promise<Record<string, unknown>> {
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
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const payload = await res.json();
  const data = extractJsonPayload(payload.content?.[0]?.text);
  data.engine = `Live AI Pipeline: Anthropic (${ANTHROPIC_MODEL})`;
  return data;
}

async function runOperatorAnalysis(prompt: string): Promise<Record<string, unknown>> {
  const geminiKey = getSecret('GEMINI_API_KEY', 'GOOGLE_AI_KEY', 'GOOGLE_AI_STUDIO_KEY', 'GOOGLE_API_KEY');
  const anthropicKey = getSecret('ANTHROPIC_API_KEY', 'CLAUDE_API_KEY');
  if (!geminiKey && !anthropicKey) {
    throw new Error(
      'No provider secrets configured. Run: supabase secrets set GEMINI_API_KEY=... ANTHROPIC_API_KEY=...'
    );
  }
  const errors: string[] = [];
  if (geminiKey) {
    try {
      return await callGemini(geminiKey, prompt);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  if (anthropicKey) {
    try {
      return await callAnthropic(anthropicKey, prompt);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }
  throw new Error(errors.join(' | '));
}

// BYOK: caller supplied their own key — detect provider and use it directly.
async function runByokAnalysis(customKey: string, prompt: string): Promise<Record<string, unknown>> {
  if (customKey.startsWith('sk-ant-')) return callAnthropic(customKey, prompt);
  if (customKey.startsWith('AIza')) return callGemini(customKey, prompt);
  throw new Error('Unsupported BYOK key type for server-side routing.');
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const prompt = String(body.prompt || '');
    const customKey = String(body.customKey || '').trim();
    if (!prompt) return json({ error: 'Missing prompt.' }, 400);

    // BYOK requests use the caller's own key and are never metered.
    if (customKey) {
      const data = await runByokAnalysis(customKey, prompt);
      return json(data);
    }

    // Signed-in users are unlimited; anonymous users consume the daily meter.
    const signedIn = await isValidGoogleUser(req.headers.get('x-brandcheck-auth'));
    if (!signedIn) {
      const allowed = await consumeAnonScan(req);
      if (!allowed) {
        return json(
          {
            error: 'Free scan limit reached.',
            limit_reached: true,
            detail: `Anonymous visitors get ${FREE_SCANS_PER_DAY} AI scans per day. Sign in for unlimited scans.`
          },
          429
        );
      }
    }

    const data = await runOperatorAnalysis(prompt);
    return json(data);
  } catch (err) {
    console.error('[quick-endpoint] error:', err);
    return json({ error: 'Analysis engine unavailable.', detail: (err as Error).message }, 502);
  }
});
