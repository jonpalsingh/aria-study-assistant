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
    // Keep the last 6 messages to prevent token overload on free tier
    const recentMessages = messages.slice(-6);

    const formattedContents = recentMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.content?.[0]?.text || '') }]
    }));

    // List of high-availability Google models
    const targetModels = [
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-3.7-flash'
    ];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const model of targetModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

          // If temporary rate limit / high demand, wait 1s before retrying
          if (data.error) {
            await sleep(1000);
          }
        } catch (err) {
          await sleep(1000);
        }
      }
    }

    return res.status(500).json({ error: 'Google AI is currently processing heavy traffic. Please click send again.' });

  } catch (err) {
    return res.status(500).json({ error: `Server catch: ${err.message}` });
  }
}
