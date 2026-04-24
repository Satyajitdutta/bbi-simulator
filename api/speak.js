// Vercel serverless function — proxies Sarvam TTS so the API key stays server-side
// Matches the same pattern used in JEVA (pithonix-ai-global/temp_jeva)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Support multiple Vercel env var naming conventions
  const key =
    process.env.SARVAM_API_KEY ||
    process.env.VITE_SARVAM_KEY ||
    process.env.SARVAM_KEY ||
    '';

  if (!key) {
    console.error('[BBI/speak] Sarvam key not set. Add VITE_SARVAM_KEY to Vercel environment variables.');
    return res.status(500).json({ error: 'Sarvam API key not configured on server.' });
  }

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key,
      },
      body: JSON.stringify({
        inputs: [text.slice(0, 500)],
        target_language_code: 'en-IN',
        speaker: 'meera',
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v1',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[BBI/speak] Sarvam error:', response.status, data);
      return res.status(response.status).json({ error: data });
    }

    const audio = data?.audios?.[0];
    if (!audio) return res.status(500).json({ error: 'No audio in Sarvam response' });

    return res.status(200).json({ audio });
  } catch (err) {
    console.error('[BBI/speak] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
