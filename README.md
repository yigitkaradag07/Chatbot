# DarkWarro

Chatbot for Exposure AI Academy — a fast, self-hostable AI chatbot built with Next.js and the AI SDK. Multi-model chat with image input, persistent history, character-by-character streaming, and three built-in tools: live news lookup, LinkedIn profile lookup, and YouTube video summarization.

Forked from [vercel/ai-chatbot](https://github.com/vercel/ai-chatbot), with the artifacts/canvas feature removed, OpenRouter swapped in for multi-model support, and generic Postgres + local file storage so it runs anywhere Docker does — no Vercel account required.

## Features

- **Multi-model chat** via [OpenRouter](https://openrouter.ai) — switch between Gemini, GPT, Claude, and Llama models mid-conversation
- **Image input** — attach a photo, every listed model supports vision
- **Persistent chat history** — Postgres-backed, grouped by date, searchable sidebar
- **Streaming responses** — token-by-token via the AI SDK
- **Live news lookup** — "show me the last 5 BBC News stories" resolves to real, dated, linked results via [Exa](https://exa.ai)
- **LinkedIn profile lookup** — by name or URL, via Jina Reader with an Exa fallback
- **YouTube summarization** — Gemini natively watches the video and produces a structured summary
- Email/password auth (Auth.js) with automatic guest sessions
- A 20-message lifetime cap per account, for preview/demo deployments

## Running locally

1. Copy `.env.example` to `.env.local` and fill in the values (see comments in the file for where to get each key).
2. Start a local Postgres instance (or point `POSTGRES_URL` at one you already have).
3. Install dependencies and run migrations:

   ```bash
   pnpm install
   pnpm db:migrate
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Deploying (Docker / Dokploy)

The included `Dockerfile` builds a self-contained image (Next.js `output: standalone`) that runs migrations on container start, then serves the app. It expects a Postgres database — Dokploy can provision one as a service.

```bash
docker compose up --build
```

`docker-compose.yml` starts the app alongside a local Postgres container for a quick end-to-end check before deploying. Uploaded chat images are written to `/app/uploads`; mount a volume there for persistence.

Required environment variables are documented in `.env.example`. `REDIS_URL` is optional — without it the app runs single-instance with no cross-instance IP rate limiting or resumable streams.

## Stack

- [Next.js](https://nextjs.org) App Router, [AI SDK](https://ai-sdk.dev) v7
- [OpenRouter](https://openrouter.ai) for model access, [Exa](https://exa.ai) for news/LinkedIn search, [Gemini](https://ai.google.dev) for YouTube understanding
- [Drizzle ORM](https://orm.drizzle.team) + Postgres, [Auth.js](https://authjs.dev)
- Tailwind CSS v4, shadcn/ui, Streamdown for markdown rendering
