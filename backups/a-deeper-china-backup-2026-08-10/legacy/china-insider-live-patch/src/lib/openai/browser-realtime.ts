import { CATEGORIES, type Category } from "@/lib/constants";
import { REALTIME_MODEL, REALTIME_SYSTEM_PROMPT, REALTIME_TOOLS, REALTIME_VOICE } from "./realtime";

export type BrowserRealtimeEvent = {
  type?: string;
  transcript?: string;
  text?: string;
  delta?: string;
  item?: {
    name?: string;
    arguments?: string;
    type?: string;
    content?: Array<{
      text?: string;
      transcript?: string;
    }>;
  };
  arguments?: string;
  name?: string;
};

export type BrowserRealtimeSession = {
  close: () => void;
  send: (payload: unknown) => void;
};

export type StartBrowserRealtimeSessionArgs = {
  clientSecret: string;
  onTrack?: (stream: MediaStream) => void;
  onMessage?: (event: BrowserRealtimeEvent) => void;
};

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readJson(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractTranscript(event: BrowserRealtimeEvent) {
  if (!event.type) return null;

  const transcriptFields = [
    event.transcript,
    event.text,
    event.delta,
    event.item?.content?.map((item) => item.transcript ?? item.text).find(Boolean),
  ];

  for (const value of transcriptFields) {
    const text = readText(value);
    if (text) return text;
  }

  return null;
}

export function extractMatchedCategory(event: BrowserRealtimeEvent) {
  const name = event.item?.name ?? event.name;
  if (name !== "match_expert") return null;

  const payload = readJson(event.item?.arguments ?? event.arguments);
  const category = payload?.category;

  return typeof category === "string" && CATEGORIES.includes(category as Category)
    ? (category as Category)
    : null;
}

export function isThinkingEvent(event: BrowserRealtimeEvent) {
  return event.type === "response.created" || event.type === "response.output_item.added";
}

export function isMatchedEvent(event: BrowserRealtimeEvent) {
  return event.type === "response.done";
}

export async function startBrowserRealtimeSession({
  clientSecret,
  onTrack,
  onMessage,
}: StartBrowserRealtimeSessionArgs): Promise<BrowserRealtimeSession> {
  const peerConnection = new RTCPeerConnection();
  const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const dataChannel = peerConnection.createDataChannel("oai-events");
  const pendingMessages: unknown[] = [];

  let closed = false;

  const flushPendingMessages = () => {
    while (pendingMessages.length > 0 && dataChannel.readyState === "open") {
      const payload = pendingMessages.shift();
      if (payload !== undefined) {
        dataChannel.send(JSON.stringify(payload));
      }
    }
  };

  const close = () => {
    if (closed) return;
    closed = true;

    pendingMessages.length = 0;

    if (dataChannel.readyState === "open" || dataChannel.readyState === "connecting") {
      dataChannel.close();
    }

    for (const sender of peerConnection.getSenders()) {
      if (sender.track) {
        sender.track.stop();
      }
    }

    for (const track of microphoneStream.getTracks()) {
      track.stop();
    }

    if (peerConnection.signalingState !== "closed") {
      peerConnection.close();
    }
  };

  try {
    for (const track of microphoneStream.getTracks()) {
      peerConnection.addTrack(track, microphoneStream);
    }

    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) onTrack?.(stream);
    };

    dataChannel.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as BrowserRealtimeEvent;
        onMessage?.(payload);
      } catch {
        onMessage?.({ type: "unexpected.message" });
      }
    };

    dataChannel.onopen = () => {
      dataChannel.send(
        JSON.stringify({
          type: "session.update",
          session: {
            model: REALTIME_MODEL,
            voice: REALTIME_VOICE,
            instructions: REALTIME_SYSTEM_PROMPT,
            tools: REALTIME_TOOLS,
          },
        }),
      );
      flushPendingMessages();
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const response = await fetch(
      `https://api.openai.com/v1/realtime?model=${encodeURIComponent(REALTIME_MODEL)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1",
        },
        body: offer.sdp ?? "",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to connect to Realtime");
    }

    const answer = await response.text();
    await peerConnection.setRemoteDescription({ type: "answer", sdp: answer });

    return {
      close,
      send(payload: unknown) {
        if (closed) return;
        if (dataChannel.readyState === "open") {
          dataChannel.send(JSON.stringify(payload));
          return;
        }

        pendingMessages.push(payload);
      },
    };
  } catch (error) {
    close();
    throw error;
  }
}
