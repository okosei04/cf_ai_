# Cloudflare Workers AI Chat

A practical starter that lets you chat with an LLM on Cloudflare. It uses Workers AI for inference, a Durable Object for memory, and a simple web UI (with optional voice input).

## What’s inside
- LLM: Workers AI (default `@cf/meta/llama-3.3-8b-instruct`)
- Orchestration: Workers + Durable Objects
- UI: Static chat (HTML/CSS/JS) served by the Worker
- Memory: Per-session history stored in a Durable Object

## Get started (PowerShell)
```powershell
npm i
npx wrangler@latest login
npx wrangler@latest dev --remote
```
Then open http://localhost:8787 and start chatting.

## Deploy
```powershell
npx wrangler@latest deploy
```
If you installed Wrangler locally: `npm run dev -- --remote` and `npm run deploy`.

## Customize
- Model: Edit `DEFAULT_MODEL` in `src/chatSession.ts`, or pass `model` in the API body.
- System prompt: Pass `systemPrompt` in the API body to steer the assistant.
- History length: Adjust `MAX_HISTORY_MESSAGES` in `src/chatSession.ts`.

## API
- POST `/api/chat`
  - Body: `{ message: string, model?: string, systemPrompt?: string }`
  - Response: `{ reply: string }`

## How memory works
The browser gets a `cf_chat_session` cookie. That cookie maps to a Durable Object instance (`ChatSession`) that stores recent messages so the model has context.

## Troubleshooting
- Wrangler not found: use `npx wrangler@latest ...` or `npm i -D wrangler` and run scripts.
- Workers types error in your IDE: either install `@cloudflare/workers-types` (`npm i -D @cloudflare/workers-types`) or remove the explicit `types` entry in `tsconfig.json`.



