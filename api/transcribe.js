// Serverless proxy — Sarvam STT (key never exposed to browser)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_KEY || process.env.SARVAM_KEY || '';
  if (!key) return res.status(500).json({ error: 'Sarvam API key not configured on server' });

  try {
    // Forward the raw multipart body directly to Sarvam
    const contentType = req.headers['content-type'] || '';
    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': key,
        'content-type': contentType,
      },
      body: req,
      duplex: 'half',
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });
    return res.status(200).json({ transcript: data.transcript || '', language: data.language_code || '' });
  } catch (err) {
    console.error('[BBI/transcribe]', err.message);
    return res.status(500).json({ error: err.message, transcript: '' });
  }
}
