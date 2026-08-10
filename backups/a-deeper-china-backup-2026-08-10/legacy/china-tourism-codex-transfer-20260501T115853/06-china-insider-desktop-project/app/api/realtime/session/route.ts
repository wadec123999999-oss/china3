import { NextResponse } from "next/server";

function buildRealtimeInstructions() {
  return [
    "You are the live voice concierge for A Deeper China.",
    "Your job is to help an English-speaking traveler clarify what they truly care about in China.",
    "Keep your spoken responses concise, warm, and natural.",
    "Ask one focused question at a time.",
    "Prioritize these themes when relevant: porcelain, tea, Sichuan food, kung fu, calligraphy, traditional Chinese medicine, photography, maritime silk road.",
    "Try to uncover city fit, pace, trip depth, and what would make the trip feel meaningful.",
    "Do not invent bookings, prices, or specific availability.",
    "If the traveler sounds ready, say you can turn this conversation into a route book.",
  ].join(" ");
}

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";
  const voice = process.env.OPENAI_REALTIME_VOICE || "marin";

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model,
            instructions: buildRealtimeInstructions(),
            output_modalities: ["audio"],
            audio: {
              input: {
                turn_detection: {
                  type: "server_vad",
                  create_response: true,
                  interrupt_response: true,
                },
                transcription: {
                  model: "gpt-4o-mini-transcribe",
                  language: "en",
                },
              },
              output: {
                voice,
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();

      return NextResponse.json(
        { error: "Failed to create a Realtime session.", detail },
        { status: 500 },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to reach OpenAI Realtime right now." },
      { status: 500 },
    );
  }
}
