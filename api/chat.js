export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided' });
  }

  const SYSTEM_PROMPT = `You are Aria, a friendly and patient study assistant for students.

CONTEXT:
You are helping a student understand academic topics across any subject (science, math, history, etc.). Break concepts down simply.

INSTRUCTION:
1. Break the explanation into clear steps.
2. After explaining, ask ONE short question to check understanding.
3. Keep each explanation under 150 words per turn; use simple examples.
4. End each response with a short "Quick Check" question.
5. If the user asks in Hindi or another language, explain in that language.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable missing in Vercel' });
  }

  try {
    // Keep last 4 messages to save tokens and avoid quota limits
    const recentMessages = messages.slice(-4);

    const formattedContents = recentMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.content?.[0]?.text || '') }]
    }));

    // Target the primary verified active model directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: formattedContents
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const replyText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({
        content: [{ type: 'text', text: replyText }]
      });
    }

    // Fallback to 3.7-flash if 2.5 is unavailable
    if (data.error) {
      const fallbackRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: formattedContents
          })
        }
      );
      const fallbackData = await fallbackRes.json();

      if (fallbackData.candidates && fallbackData.candidates[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({
          content: [{ type: 'text', text: fallbackData.candidates[0].content.parts[0].text }]
        });
      }

      return res.status(500).json({ error: fallbackData.error?.message || data.error.message });
    }

    return res.status(500).json({ error: 'No response received from Google AI' });

  } catch (err) {
    return res.status(500).json({ error: `Server catch: ${err.message}` });
  }
}
