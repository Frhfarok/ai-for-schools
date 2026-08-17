export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, temperature = 0.7 } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("GROQ_API_KEY environment variable is missing.");
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid "prompt" in request body.' });
  }

  const systemInstruction = `You are a next-word prediction engine. Output only valid JSON.
Format:
{
  "predictions": [
    {"word": "example", "prob": 50}
  ]
}
Return the top 5 most likely words with their probabilities summing to 100.`;

  try {
    const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `Predict next words for: ${prompt}` }
        ],
        temperature: Number(temperature) || 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Groq API error response:", data);
      return res.status(apiResponse.status).json({ 
        error: data.error?.message || 'Error from Groq API' 
      });
    }

    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) {
      return res.status(502).json({ error: 'Empty content received from model' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("JSON parse failure on raw content:", rawText);
      return res.status(502).json({ error: 'Model did not return valid JSON' });
    }

    // Extract list of predictions
    const predictions = Array.isArray(parsed)
      ? parsed
      : (parsed.predictions || parsed.words || parsed.choices || []);

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return res.status(502).json({ error: 'No predictions found in model output' });
    }

    return res.status(200).json({ choices: predictions.slice(0, 5) });

  } catch (error) {
    console.error("Unexpected runtime error:", error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
