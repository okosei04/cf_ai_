# Prompts Guide (Human-friendly)

Clear prompts = better answers. You don’t need to be formal—just be specific.
This short guide gives you ready-to-use system prompts, example user prompts, and a few tips.

## Setting the system prompt
- At runtime: pass `systemPrompt` in the `POST /api/chat` body.
- If you don’t set one, we use: “You are a helpful AI assistant. Be concise and accurate.”

## Handy system prompts
Pick one as a starting point and tweak to taste.

### General assistant (balanced)
"""
You are a helpful, concise assistant. Prefer short, correct answers.
When code is useful, return runnable snippets. If unsure, say so briefly.
"""

### Productive coder
"""
You are a senior software engineer. Produce clear, safe, readable code.
- Only explain non-obvious decisions in 1–2 lines.
- Prefer correctness and clarity over cleverness.
- When returning code, include only a single code block unless asked otherwise.
"""

### JSON-only answers
"""
Return a strict JSON object matching the requested schema.
Do not include any text outside the JSON.
If you cannot satisfy the schema, return {"error": "reason"}.
"""

### Friendly and concise tone
"""
Write in a friendly, professional tone. Keep answers under 120 words unless asked.
Avoid filler. Use bullet points when listing more than two items.
"""

### Safety aware
"""
If the user asks for unsafe or disallowed actions, refuse politely and suggest safer alternatives.
"""

## How to write better prompts
- Give context: what you’re doing and why it matters.
- State constraints: time, length, audience, level, format.
- Ask for the format you want: JSON, Markdown, table, etc.
- If possible, show a tiny example of the desired output.

Examples:
- “Summarize this text in ≤5 bullets and end with a 1‑line takeaway.”
- “Return JSON: { title, tags: string[], summary: ≤40 words }.”
- “Generate TypeScript targeting ES2022, no external deps.”

## Response format examples

### JSON extraction
Request:
```json
{
  "message": "Extract entities from: 'Alice met Bob in Paris on 2023-10-10.' Return JSON with people[], locations[], dates[].",
  "systemPrompt": "Return strict JSON only.",
  "model": "@cf/meta/llama-3.3-8b-instruct"
}
```
Expected model response:
```json
{
  "people": ["Alice", "Bob"],
  "locations": ["Paris"],
  "dates": ["2023-10-10"]
}
```

### Code generation
Prompt:
```text
Write a function slugify(input: string): string in TypeScript.
Rules:
- lowercase
- spaces and underscores → '-'
- remove non‑alphanumerics except '-'
- collapse multiple '-' into one
- trim '-' at ends
Return only code.
```

### Checklist
Prompt:
```text
Turn these into a prioritized checklist (short, action verbs):
- set up wrangler
- add durable object
- style the chat UI
- deploy to production
```

## Working with memory
- We keep a rolling window of recent messages (see `MAX_HISTORY_MESSAGES`).
- If the model loses context, restate key facts in your next message.
- For longer tasks, add a 1–2 line recap every few turns.

## Voice input
- Keep it short and clear: “Summarize in 3 bullets” or “Draft a pricing reply.”
- Want structure? Say: “Return JSON with fields x, y, z.”

## Picking a model
- Default: `@cf/meta/llama-3.3-8b-instruct` (good quality/speed balance).
- For longer or trickier tasks, try a larger instruct model available in your account.

## API quick reminder
Send to `/api/chat`:
```json
{
  "message": "your question or instruction",
  "systemPrompt": "optional system prompt",
  "model": "optional model name"
}
```

You don’t have to be perfect—iterate. If the reply isn’t quite right, nudge it with one more sentence of guidance.
