import { NextResponse } from "next/server";
import {
  REALTIME_MODEL,
  REALTIME_SYSTEM_PROMPT,
  REALTIME_TOOLS,
  REALTIME_VOICE,
} from "@/lib/openai/realtime";
import {
  realtimeSessionRequestSchema,
  realtimeSessionResponseSchema,
} from "@/lib/openai/schemas";

const OPENAI_API_KEY = [REDACTED]

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = realtimeSessionRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "realtime=v1",
    },
    body: JSON.stringify({
      model: REALTIME_MODEL,
      voice: REALTIME_VOICE,
      instructions: REALTIME_SYSTEM_PROMPT,
      tools: REALTIME_TOOLS,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to create Realtime session" }, { status: 502 });
  }

  const data = await response.json();
  const parsedResponse = realtimeSessionResponseSchema.safeParse(data);

  if (!parsedResponse.success) {
    return NextResponse.json({ error: "Invalid Realtime session response" }, { status: 502 });
  }

  return NextResponse.json({
    client_secret: parsedResponse.data.client_secret.value,
    model: REALTIME_MODEL,
    voice: REALTIME_VOICE,
  });
}
