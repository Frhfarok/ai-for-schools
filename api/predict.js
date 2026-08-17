export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, temperature = 0.7 } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("Error: GROQ_API_KEY is missing in environment variables.");
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  // Define a root object schema for strict json_object compatibility
  const systemInstruction = `You are a next-word prediction engine for an educational tool.
Analyze the input text and generate the top 5 most likely next words.
You MUST respond with raw JSON only matching this exact object structure:
{
  "predictions": [
    {"word": "word1", "prob": percentage_number},
    {"word": "word2", "prob": percentage_number},
    {"word": "word3", "prob": percentage_number},
    {"word": "word4", "prob": percentage_number},
    {"word": "word5", "prob": percentage_number}
  ]
}
Percentages must sum to 100. Do not include markdown formatting, backticks, or extra explanation.`;

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
          { role: "user", content: `Input text: "${prompt || ''}"` }
        ],
        temperature: parseFloat(temperature),
        response_format: { type: "json_object" }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Groq API Error Detail:", data);
      throw new Error(data.error?.message || 'Groq API Error');
    }

    const rawText = data.choices[0].message.content;
    const jsonParsed = JSON.parse(rawText);

    // Extract the array from the structured object
    let parsedChoices = [];
    if (Array.isArray(jsonParsed)) {
      parsedChoices = jsonParsed;
    } else if (Array.isArray(jsonParsed.predictions)) {
      parsedChoices = jsonParsed.predictions;
    } else if (Array.isArray(jsonParsed.words)) {
      parsedChoices = jsonParsed.words;
    } else if (Array.isArray(jsonParsed.choices)) {
      parsedChoices = jsonParsed.choices;
    } else {
      const arrayKey = Object.keys(jsonParsed).find(k => Array.isArray(jsonParsed[k]));
      parsedChoices = arrayKey ? jsonParsed[arrayKey] : [];
    }

    if (parsedChoices.length === 0) {
      throw new Error("Invalid or empty response format from model");
    }

    return res.status(200).json({ choices: parsedChoices.slice(0, 5) });

  } catch (error) {
    console.error("Proxy error:", error);
    
    // Return explicit error details during testing to identify failures
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error'
    });
  }
}
