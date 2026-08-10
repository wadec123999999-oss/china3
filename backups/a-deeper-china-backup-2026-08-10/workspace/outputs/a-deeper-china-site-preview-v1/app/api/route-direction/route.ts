import { resolve } from "node:path";

export async function POST(request: Request) {
  // Keep the formal router out of the page-render module graph. The direction
  // surface needs only the conversation layer; the heavier roadbook runtime
  // remains a separate future endpoint after deployment packaging is ready.
  process.env.A_DEEPER_CHINA_ROUTER_ROOT ||= resolve(process.cwd(), "../a-deeper-china-portfolio-router-v0.1");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json", message: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || typeof (body as { message?: unknown }).message !== "string" || !(body as { message: string }).message.trim()) {
    return Response.json({ error: "message_required", message: "Tell us a little about the route you are considering." }, { status: 400 });
  }
  // @ts-expect-error The formal router is a local ESM runtime outside this preview app.
  const { startConversation } = await import("../../../../a-deeper-china-portfolio-router-v0.1/src/conversation.mjs");
  return Response.json(startConversation((body as { message: string }).message));
}
