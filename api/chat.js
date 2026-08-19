export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided' });
  }

  const SYSTEM_PROMPT = `You are Aria, a friendly, patient, and knowledgeable female AI study assistant for students. Speak and respond in a natural female conversational tone (in Hindi use feminine forms like 'सकती हूँ', 'बता सकती हूँ', 'समझाऊँगी').

CRITICAL LANGUAGE RULE:
- Always reply in the exact same language, script, or style (English, Hindi, or Hinglish) that the user uses in their latest message. 
- If the user writes in English, reply entirely in English. 
- If the user writes in Hindi or Hinglish, reply in Hindi/Hinglish using feminine verb forms.

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
