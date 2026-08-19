# 🎓 Aria — AI Study Assistant

A polished, fully-working study assistant chatbot, built to demonstrate practical prompt engineering — the **CIFC framework** (Context, Instruction, Format, Constraint), role prompting, step-by-step reasoning instructions, and structured output formatting.

🔗 **Live demo:** _add your live Vercel URL here after deploying_

![Aria preview](preview-empty.png)

## Why this project is architected this way

A study bot needs an API key to talk to Claude. There are two ways to handle that key:

| Approach | What happens |
|---|---|
| ❌ Key lives in the browser (plain static site) | Anyone viewing the page's source can see and steal the key |
| ✅ Key lives on a server, browser calls the server | The key is never exposed — this is what real products do |

This project uses the second approach: a tiny **serverless function** (`/api/chat.js`) holds the Claude API key as a private environment variable and proxies requests to Anthropic. The frontend never sees the key — so **anyone visiting the live link can chat with Aria immediately, with no setup.**

## Project structure

```
aria-study-assistant/
├── index.html        ← frontend (chat UI)
├── api/
│   └── chat.js        ← serverless function that calls Claude securely
└── README.md
```

## How to deploy (Vercel — free, ~3 minutes)

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project**.
3. Import your `aria-study-assistant` repo. Leave build settings as default (Vercel auto-detects the `/api` folder).
4. Before deploying, add an environment variable:
   - Go to **Settings → Environment Variables**
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Claude API key (from [console.anthropic.com](https://console.anthropic.com))
5. Click **Deploy**. In under a minute you'll get a live URL like:
   `https://aria-study-assistant.vercel.app`
6. Add that link to the top of this README and to your LinkedIn post.

Every time you `git push` to this repo afterward, Vercel automatically redeploys — so your GitHub repo stays the single source of truth for your portfolio.

## Running it locally (optional, for development)

```bash
npm install -g vercel
vercel dev
```
This runs both the frontend and the `/api/chat` function locally, using a `.env` file for `ANTHROPIC_API_KEY` (don't commit that file).

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

- Frontend: plain HTML/CSS/JS — no framework, no build step
- Backend: one Vercel serverless function (Node.js)
- Model: Claude (`claude-sonnet-5`) via the Anthropic API
- Fonts: Fraunces, Inter, IBM Plex Mono (Google Fonts)

## Course context

Built for **Session 3 — Prompting for Workflows & Hands-On Practice**, covering the CIFC framework, role-based prompting, chain-of-thought reasoning instructions, and structured prompt templates.

## License

Free to use and adapt for learning purposes.
