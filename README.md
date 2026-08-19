# 🎓 Aria — AI Study Assistant

A polished, fully-working study assistant chatbot, built to demonstrate practical prompt engineering — the **CIFC framework** (Context, Instruction, Format, Constraint), role prompting, step-by-step reasoning instructions, and structured output formatting.

🔗 **Live demo:** _add your live Vercel URL here after deploying_

![Aria preview]
## 🚀 Key Features & Capabilities

* **🧠 CIFC Framework Prompt Engineering:** System prompt structured around Context, Instruction, Format, and Constraint to ensure pedagogical, step-by-step guidance without direct homework spoon-feeding.
* **🗣️ Voice Support (Speech-to-Text & Text-to-Speech):** Integrated browser Web Speech APIs allowing users to speak their questions and listen to Aria's responses with a natural female Indian accent.
* **🌐 Smart Multilingual Support:** Dynamically matches the user's language—seamlessly responding in English, Hindi, or Hinglish based on the user's input.
* **💾 Persistent Chat History:** Saves conversation state using browser `localStorage`, ensuring a seamless user experience across page refreshes and mobile sessions.
* **🎯 Quick Quiz Mode:** Dedicated quick-action button to instantly test students on any study topic.
* **📐 Clean Formatting & Math Support:** Strips raw markdown artifacts for speech clarity while supporting clean layout rendering for academic concepts.
* **🔒 Secure Serverless Architecture:** The API key is kept completely secure on the backend, exposing no sensitive keys to the client side.

## Why this project is architected this way

A production-grade AI app requires keeping private API keys secure:

| Approach | What happens |
|---|---|
| ❌ Key lives in the browser (plain static site) | Anyone viewing the page source can inspect and steal your API key. |
| ✅ Key lives on a server, browser calls the server | The key remains private and hidden — this is what real products implement. |

This project uses **Vercel Serverless Functions** (`/api/chat.js`) to securely host the **Groq API** key as a private environment variable. The frontend proxies all requests through this serverless function, allowing anyone to chat with Aria securely with zero setup.

---

## Project structure

```
aria-study-assistant/
├── index.html        ← Frontend (Chat UI, Voice, LocalStorage, Responsive Design)
├── api/
│   └── chat.js       ← Secure serverless backend proxying Groq API
└── README.md
```

## How to deploy (Vercel — free, ~3 minutes)

1. Push this project folder to a new GitHub repository.
2. Go to vercel.com → Sign in with GitHub → Add New → Project.
3. Import your aria-study-assistant repository. Leave build settings as default.
4. Before clicking deploy, add your Environment Variable under Settings → Environment Variables:
   - Name: GROQ_API_KEY
   - Value: Your Groq API key (from console.groq.com)
5. Click **Deploy**. Vercel will provide a live URL (e.g.,
   `https://aria-study-assistant.vercel.app' )
 Every subsequent git push will trigger automatic redeployments on Vercel.

## Running it locally (optional, for development)

```bash
npm install -g vercel
vercel dev
```
This runs both the frontend and the `/api/chat` function locally, using a `.env` file for `GROQ_API_KEY` (don't commit that file).

## What it demonstrates

| Technique | Where it shows up |
|---|---|
| **CIFC framework** | The system prompt (visible in the app's "How it's built" panel) is explicitly structured as Context → Instruction → Format → Constraint |
| **Role prompting** | Aria is assigned a clear identity: "a friendly and patient study assistant" |
| **Step-by-step instructions** | Explanations are broken into numbered steps before an answer is given |
| **Constraints/boundaries** | Aria won't complete graded homework directly, stays on-topic, keeps a word limit |
| **Output format** | Bullets/numbered steps + a mandatory "Quick Check" question every reply |
| **Secure architecture** | API key is never exposed client-side — held server-side in a serverless function |

## Tech stack

- Frontend: Plain HTML5, Modern CSS3 (Grid/Flexbox, Custom Properties), Vanilla JavaScript (No heavy frameworks).

- Backend: Node.js via Vercel Serverless Functions.

- AI Model: Groq API (openai/gpt-oss-120b or equivalent Groq chat completion models).

- APIs & Libraries: Web Speech API (SpeechRecognition & SpeechSynthesis), Google Fonts (Fraunces, Inter, IBM Plex Mono).

## Creator & Course Context
- Created by: Jonpal Singh

- Program: Developed as part of the Masai × IIT Patna AI & ML Training Program.

- Framework Focus: Prompt-engineered using the CIFC framework for intelligent workflow automation and educational support.

## License

Free to use and adapt for learning purposes.
