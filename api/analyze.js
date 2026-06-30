// Vercel Serverless Function — Secure proxy to BrandCheck Pro backend.
// This function keeps API keys on the server side. It forwards requests to
// the configured BrandCheck Pro backend (e.g. a Python FastAPI service).
//
// Required environment variables in Vercel dashboard:
//   BRANDCHECK_BACKEND_URL   — e.g. https://api.brandcheckpro.in or http://localhost:8000
// Optional:
//   BRANDCHECK_API_KEY       — operator-paid key if the backend expects one

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const backendUrl = process.env.BRANDCHECK_BACKEND_URL || '';
  if (!backendUrl) {
    return res.status(500).json({
      error: 'BRANDCHECK_BACKEND_URL is not configured in Vercel environment variables.'
    });
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.BRANDCHECK_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.BRANDCHECK_API_KEY}`;
    }

    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/v1/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('[BrandCheck Pro /api/analyze] proxy error:', err);
    return res.status(502).json({
      error: 'Unable to reach BrandCheck Pro backend.',
      detail: err.message
    });
  }
}
