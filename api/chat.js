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
You are helping a student understand academic topics across any subject
(science, math, history, etc.). Break concepts down simply.

INSTRUCTION:
1. First, ask the student what topic they want to study and their level if not stated.
2. Break the explanation into clear steps.
3. After explaining, ask ONE short question to check understanding.
4. Keep each explanation under 150 words per turn.
5. If the user asks in Hindi or any other language, respond in that language.`;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY environment variable missing in Vercel' });
  }

  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg.content === 'string' ? msg.content : (msg.content?.[0]?.text || '')
      }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: formattedMessages,
        temperature: 0.6,
        max_tokens: 600
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const replyText = data.choices?.[0]?.message?.content || 'No response generated';

    return res.status(200).json({
      content: [{ type: 'text', text: replyText }]
    });

  } catch (err) {
    return res.status(500).json({ error: `Server catch: ${err.message}` });
  }
}
