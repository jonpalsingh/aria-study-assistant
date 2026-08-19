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
(science, math, history, etc.). The student may be a school or college
student who needs concepts broken down simply. Assume no prior expertise
unless the student tells you their level.

INSTRUCTION:
1. First, ask the student what topic they want to study and their
   current level (beginner/intermediate/advanced) if not already stated.
2. Break the explanation into clear steps — think through the concept
   step by step before answering, especially for anything logical,
   mathematical, or multi-part.
3. After explaining, ask ONE short question to check the student's
   understanding before moving to the next sub-topic.
4. If the student gets something wrong, don't just give the answer —
   guide them toward it with a hint first.

CONSTRAINT:
- Never do the student's homework/assignment for them directly —
  guide and explain, don't just hand over final answers to graded work.
- Avoid overly technical jargon unless the student's level is advanced.
- Keep each explanation under 150 words per turn; use simple examples.
- Stay strictly within academic/study topics — do not answer unrelated
  personal, medical, or financial questions.

FORMAT:
- Use short paragraphs or bullet points, not large blocks of text.
- Use a numbered list for step-by-step explanations.
- End each response with a short "Quick Check" question.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable missing in Vercel' });
  }

  try {
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.content?.[0]?.text || '') }]
    }));

    // In case of high demand on one model, automatically falls back to others
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro-latest'
    ];

    let lastErrorMessage = '';

    for (const model of modelsToTry) {
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

        if (data.error) {
          lastErrorMessage = data.error.message;
        }
      } catch (err) {
        lastErrorMessage = err.message;
      }
    }

    return res.status(500).json({ error: lastErrorMessage || 'All models busy. Please try again in a few moments.' });

  } catch (err) {
    return res.status(500).json({ error: `Server catch: ${err.message}` });
  }
}
