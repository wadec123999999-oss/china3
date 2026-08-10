import { z } from "zod";

export const runtime = "nodejs";

const speakRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().min(1).max(80).optional(),
});

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = speakRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Please provide text to synthesize." },
      { status: 400 },
    );
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json(
      { error: "Azure Speech is not configured." },
      { status: 503 },
    );
  }

  const voice = parsed.data.voice || process.env.AZURE_SPEECH_VOICE || "en-US-JennyNeural";
  const outputFormat =
    process.env.AZURE_SPEECH_OUTPUT_FORMAT || "audio-24khz-48kbitrate-mono-mp3";
  const locale = voice.split("-").slice(0, 2).join("-") || "en-US";
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml =
    `<speak version="1.0" xml:lang="${locale}">` +
    `<voice name="${voice}">${escapeXml(parsed.data.text)}</voice>` +
    `</speak>`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/ssml+xml",
      "Ocp-Apim-Subscription-Key": key,
      "User-Agent": "china-insider",
      "X-Microsoft-OutputFormat": outputFormat,
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorText = await response.text();

    return Response.json(
      {
        error: errorText || "Azure Speech could not synthesize this response.",
      },
      { status: 502 },
    );
  }

  const audio = await response.arrayBuffer();

  return new Response(audio, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "audio/mpeg",
      "X-Voice-Name": voice,
      "X-Voice-Provider": "azure-speech",
    },
  });
}
