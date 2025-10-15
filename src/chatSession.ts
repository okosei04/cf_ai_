export interface Env {
    AI: Ai;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string; ts: number };

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Be concise and accurate.";
const DEFAULT_MODEL = "@cf/meta/llama-3.3-8b-instruct"; // Change if unavailable in your account
const MAX_HISTORY_MESSAGES = 20; // keep last N exchanges

export class ChatSession implements DurableObject {
    private state: DurableObjectState;
    private env: Env;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.env = env;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        if (request.method === "POST" && url.pathname === "/chat") {
            const body = await request.json();
            const { message, systemPrompt, model } = body as any;
            if (typeof message !== "string" || message.trim().length === 0) {
                return new Response(JSON.stringify({ error: "'message' must be a non-empty string" }), { status: 400, headers: { "Content-Type": "application/json" } });
            }

            // Load and prune history
            const stored = await this.state.storage.get("history");
            const history: ChatMessage[] = (stored as ChatMessage[]) ?? [];
            const prunedHistory = history.slice(-MAX_HISTORY_MESSAGES);

            const now = Date.now();
            prunedHistory.push({ role: "user", content: message, ts: now });

            const messages = this.convertToOpenAIMessages(prunedHistory, systemPrompt ?? DEFAULT_SYSTEM_PROMPT);
            const modelToUse = typeof model === "string" && model.length > 0 ? model : DEFAULT_MODEL;

            let aiResponseText = "";
            try {
                const aiResult: any = await this.env.AI.run(modelToUse, { messages });
                // Workers AI commonly returns { response: string }
                aiResponseText = aiResult?.response ?? aiResult?.output_text ?? String(aiResult);
            } catch (err: any) {
                return new Response(JSON.stringify({ error: "AI inference failed", details: err?.message ?? String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
            }

            prunedHistory.push({ role: "assistant", content: aiResponseText, ts: Date.now() });
            await this.state.storage.put("history", prunedHistory);

            return new Response(JSON.stringify({ reply: aiResponseText }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        if (request.method === "GET" && url.pathname === "/history") {
            const stored = await this.state.storage.get("history");
            const history: ChatMessage[] = (stored as ChatMessage[]) ?? [];
            return new Response(JSON.stringify({ history }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response("Not found", { status: 404 });
    }

    private convertToOpenAIMessages(history: ChatMessage[], systemPrompt: string) {
        const openAiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
        openAiMessages.push({ role: "system", content: systemPrompt });
        for (const m of history) {
            if (m.role === "system") continue;
            openAiMessages.push({ role: m.role, content: m.content });
        }
        return openAiMessages;
    }
}


