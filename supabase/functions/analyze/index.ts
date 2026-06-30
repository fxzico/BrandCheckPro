// Supabase Edge Function — Secure server-side analysis proxy for BrandCheck Pro.
// Keeps provider API keys out of the browser. Deploy with:
//   supabase functions deploy analyze
// Required Supabase secrets:
//   BRANDCHECK_BACKEND_URL   — URL of your BrandCheck Pro Python backend
//   BRANDCHECK_API_KEY       — operator-paid key (optional)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' }
    });
  }

  const backendUrl = Deno.env.get('BRANDCHECK_BACKEND_URL') || '';
  if (!backendUrl) {
    return new Response(
      JSON.stringify({ error: 'BRANDCHECK_BACKEND_URL secret is not set.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = Deno.env.get('BRANDCHECK_API_KEY');
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/v1/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[BrandCheck Pro analyze edge fn] error:', err);
    return new Response(
      JSON.stringify({ error: 'Unable to reach BrandCheck Pro backend.', detail: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
