// Vercel serverless — proxies Sarvam TTS server-side (key never exposed to browser)
// Exact same pattern as JEVA (jeva-pithonix.vercel.app) which is confirmed working.
// Only difference: key fallback includes VITE_SARVAM_KEY for this project's Vercel env.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });

    const cleanText = text
      .replace(/[*#_`•]/g, '')
      .slice(0, 1000);

    // JEVA uses SARVAM_API_KEY; BBI Vercel has VITE_SARVAM_KEY
    const key = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_KEY || process.env.SARVAM_KEY || '';
    if (!key) {
      console.error('[BBI/speak] No Sarvam key found in env');
      return res.status(500).json({ error: 'Sarvam API key not configured' });
    }

    console.log('[BBI/speak] key suffix:', key.slice(-4), '| text length:', cleanText.length);

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key
      },
      body: JSON.stringify({
        text: cleanText,
        target_language_code: 'en-IN',
        speaker: 'ishita',
        model: 'bulbul:v3',
        pace: 0.9,
        temperature: 0.4,
        speech_sample_rate: 24000
      })
    });

    const raw = await response.text();
    console.log('[BBI/speak] Sarvam status:', response.status);

    let data;
    try { data = JSON.parse(raw); }
    catch (e) { return res.status(500).json({ error: 'Bad JSON from Sarvam', raw }); }

    if (!response.ok) return res.status(response.status).json({ error: data });

    const audio = data?.audios?.[0];
    if (!audio) return res.status(500).json({ error: 'No audio in response', data });

    return res.status(200).json({ audio, format: 'wav' });

  } catch (err) {
    console.error('[BBI/speak] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
