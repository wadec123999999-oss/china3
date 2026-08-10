import { NextResponse } from "next/server";
import WebSocket from "ws";
import { z } from "zod";

export const runtime = "nodejs";

const transcribeRequestSchema = z.object({
  audioBase64: z.string().min(1),
  sampleRate: z.union([z.literal(8000), z.literal(16000)]).default(16000),
  language: z.string().min(2).max(8).optional().default("en"),
});

type DashScopeServerEvent = {
  type?: string;
  transcript?: string;
  language?: string;
  emotion?: string;
  error?: {
    code?: string;
    message?: string;
    param?: string;
  };
};

function createEventId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function chunkBuffer(buffer: Buffer, chunkSize: number) {
  const chunks: Buffer[] = [];

  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    chunks.push(buffer.subarray(offset, offset + chunkSize));
  }

  return chunks;
}

async function transcribeWithDashScope(input: {
  audioBase64: string;
  sampleRate: 8000 | 16000;
  language: string;
}) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error("DashScope ASR is not configured.");
  }

  const model = process.env.DASHSCOPE_ASR_MODEL || "qwen3-asr-flash-realtime";
  const audioBuffer = Buffer.from(input.audioBase64, "base64");

  if (audioBuffer.length === 0) {
    throw new Error("The recorded audio was empty.");
  }

  return await new Promise<{
    transcript: string;
    language: string | null;
    emotion: string | null;
    modelName: string;
  }>((resolve, reject) => {
    const websocket = new WebSocket(
      `wss://dashscope.aliyuncs.com/api-ws/v1/realtime?model=${encodeURIComponent(model)}`,
      {
        headers: {
          Authorization: `bearer ${apiKey}`,
        },
      },
    );

    let transcript = "";
    let detectedLanguage: string | null = null;
    let detectedEmotion: string | null = null;
    let settled = false;

    const closeConnection = () => {
      if (settled) {
        return false;
      }

      settled = true;
      websocket.close();

      return true;
    };

    const fail = (error: Error) => {
      if (!closeConnection()) {
        return;
      }

      reject(error);
    };

    const succeed = (value: {
      transcript: string;
      language: string | null;
      emotion: string | null;
      modelName: string;
    }) => {
      if (!closeConnection()) {
        return;
      }

      resolve(value);
    };

    websocket.on("open", () => {
      websocket.send(
        JSON.stringify({
          event_id: createEventId("session"),
          type: "session.update",
          session: {
            input_audio_format: "pcm",
            sample_rate: input.sampleRate,
            input_audio_transcription: {
              language: input.language,
            },
            turn_detection: null,
          },
        }),
      );
    });

    websocket.on("message", (rawMessage) => {
      try {
        const event = JSON.parse(rawMessage.toString()) as DashScopeServerEvent;

        if (event.type === "session.updated") {
          const chunks = chunkBuffer(audioBuffer, 32 * 1024);

          for (const chunk of chunks) {
            websocket.send(
              JSON.stringify({
                event_id: createEventId("append"),
                type: "input_audio_buffer.append",
                audio: chunk.toString("base64"),
              }),
            );
          }

          websocket.send(
            JSON.stringify({
              event_id: createEventId("commit"),
              type: "input_audio_buffer.commit",
            }),
          );

          websocket.send(
            JSON.stringify({
              event_id: createEventId("finish"),
              type: "session.finish",
            }),
          );

          return;
        }

        if (event.type === "conversation.item.input_audio_transcription.completed") {
          transcript = (event.transcript || "").trim();
          detectedLanguage = event.language ?? null;
          detectedEmotion = event.emotion ?? null;
          return;
        }

        if (event.type === "conversation.item.input_audio_transcription.failed") {
          fail(
            new Error(
              event.error?.message || "DashScope could not transcribe this recording.",
            ),
          );
          return;
        }

        if (event.type === "error") {
          fail(new Error(event.error?.message || "DashScope ASR returned an error."));
          return;
        }

        if (event.type === "session.finished") {
          if (!transcript) {
            fail(new Error("No transcript was returned for this recording."));
            return;
          }

          succeed({
            transcript,
            language: detectedLanguage,
            emotion: detectedEmotion,
            modelName: model,
          });
        }
      } catch (error) {
        fail(
          error instanceof Error
            ? error
            : new Error("Unable to parse the ASR response."),
        );
      }
    });

    websocket.on("error", (error) => {
      fail(error instanceof Error ? error : new Error("Voice transcription failed."));
    });

    websocket.on("close", () => {
      if (settled) {
        return;
      }

      fail(new Error("The ASR connection closed before transcription completed."));
    });
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = transcribeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide recorded audio." },
      { status: 400 },
    );
  }

  try {
    const result = await transcribeWithDashScope(parsed.data);

    return NextResponse.json({
      transcript: result.transcript,
      language: result.language,
      emotion: result.emotion,
      modelProvider: "dashscope",
      modelName: result.modelName,
      inputFormat: "pcm16",
      sampleRate: parsed.data.sampleRate,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Voice transcription is unavailable right now.",
      },
      { status: 502 },
    );
  }
}
