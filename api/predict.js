export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, temperature = 0.7 } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing in Vercel environment variables.");
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const systemInstruction = `You are a next-word prediction engine for an educational tool. 
Analyze the input text and generate the top 5 most likely next words. 
You MUST respond with raw JSON only matching this exact schema:
[
  {"word": "word1", "prob": percentage_number},
  {"word": "word2", "prob": percentage_number},
  {"word": "word3", "prob": percentage_number},
  {"word": "word4", "prob": percentage_number},
  {"word": "word5", "prob": percentage_number}
]
Percentages must sum to 100. Do not include markdown formatting or backticks.`;

  try {
    // Targeting active gemini model string
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nInput text: "${prompt}"` }] }
        ],
        generationConfig: {
          temperature: parseFloat(temperature),
          responseMimeType: "application/json"
        }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API Error Detail:", data);
      throw new Error(data.error?.message || 'Gemini API Error');
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const parsedChoices = JSON.parse(rawText);

    return res.status(200).json({ choices: parsedChoices });

  } catch (error) {
    console.error("Proxy error:", error);
    
    // Return structured fallback data on failure
    return res.status(200).json({
      choices: [
        { word: "next", prob: 50 },
        { word: "word", prob: 25 },
        { word: "here", prob: 15 },
        { word: "then", prob: 7 },
        { word: "more", prob: 3 }
      ]
    });
  }
}
