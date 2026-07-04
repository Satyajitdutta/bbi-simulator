// Serverless proxy — Gemini generateContent (key never exposed to browser)
const PREFERRED_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-pro',
  'gemini-pro',
];

async function listModels(key) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const json = await res.json();
    if (!res.ok) return [];
    return (json.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
  } catch { return []; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });

  const { prompt, schema } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const available = await listModels(key);
  const toTry = available.length > 0
    ? PREFERRED_MODELS.filter(m => available.includes(m)).concat(available.filter(m => !PREFERRED_MODELS.includes(m)))
    : PREFERRED_MODELS;

  let lastErr = '';
  for (const model of toTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.7,
          },
        }),
      });
      const json = await r.json();
      if (!r.ok) { lastErr = `${model} (${r.status}): ${json?.error?.message || r.statusText}`; continue; }
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastErr = `${model}: empty response`; continue; }
      return res.status(200).json({ result: JSON.parse(text) });
    } catch (e) {
      lastErr = `${model}: ${e?.message || e}`;
    }
  }

  return res.status(500).json({ error: `All models failed: ${lastErr}` });
}
