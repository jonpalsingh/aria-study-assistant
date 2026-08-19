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
3. Keep each explanation concise and use simple examples.
4. End each response with a short "Quick Check" question.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable missing' });
  }

  try {
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.content?.[0]?.text || '') }]
    }));

    // System prompt attached to contents for clean legacy support
    const contentsPayload = [
      {
        role: 'user',
        parts: [{ text: `Instructions for Aria: ${SYSTEM_PROMPT}` }]
      },
      ...formattedContents
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contentsPayload
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    return res.status(200).json({
      content: [{ type: 'text', text: replyText }],
      reply: replyText
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
