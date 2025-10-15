export interface Env {
    AI: Ai;
    CHAT_SESSIONS: DurableObjectNamespace;
    ASSETS: AssetFetcher; // static assets binding provided by [assets]
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        if (request.method === "POST" && url.pathname === "/api/chat") {
            return handleChat(request, env);
        }

        // Serve static assets for all other routes
        try {
            return await env.ASSETS.fetch(request);
        } catch {
            return new Response("Not found", { status: 404 });
        }
    }
};

async function handleChat(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json();
        const { message, sessionId: incomingSessionId, systemPrompt, model } = body as any;
        if (typeof message !== "string" || message.trim().length === 0) {
            return json({ error: "'message' must be a non-empty string" }, 400);
        }

        const cookies = parseCookies(request.headers.get("Cookie") || "");
        const sessionId = incomingSessionId || cookies["cf_chat_session"] || crypto.randomUUID();

        const id = env.CHAT_SESSIONS.idFromName(sessionId);
        const stub = env.CHAT_SESSIONS.get(id);

        const doResponse = await stub.fetch("https://do.internal/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, systemPrompt, model })
        });

        const result = await doResponse.json();
        const headers = new Headers({ "Content-Type": "application/json" });
        // Persist cookie for future requests
        headers.append("Set-Cookie", `cf_chat_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`);
        return new Response(JSON.stringify(result), { status: doResponse.status, headers });
    } catch (err: any) {
        return json({ error: "Unexpected server error", details: err?.message ?? String(err) }, 500);
    }
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

function parseCookies(cookieHeader: string): Record<string, string> {
    const out: Record<string, string> = {};
    cookieHeader.split(";").forEach((pair) => {
        const [rawName, ...rawVal] = pair.trim().split("=");
        if (!rawName) return;
        out[decodeURIComponent(rawName)] = decodeURIComponent(rawVal.join("="));
    });
    return out;
}

// Export the Durable Object class so wrangler can bind it
export { ChatSession } from "./chatSession";


