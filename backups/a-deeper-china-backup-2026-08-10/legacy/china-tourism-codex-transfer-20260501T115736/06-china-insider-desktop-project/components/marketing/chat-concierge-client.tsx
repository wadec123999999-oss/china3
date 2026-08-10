"use client";

import Link from "next/link";
import { Mic, MicOff, Sparkles, Volume2, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES, CITIES } from "@/lib/constants";
import { formatCity } from "@/lib/format";

type ContextSource = "supabase" | "mock" | "none";
type Pace = "slow" | "balanced" | "immersive";

type ExpertMatch = {
  slug: string;
  name: string;
  city: string;
  headline: string;
  reason: string;
  sampleSession: string;
};

type TravelBrief = {
  city: string | null;
  category: string | null;
  interests: string;
  pace: Pace;
  durationDays: number;
  budgetBand: string;
  travelStyle: string;
  whyThisFits: string;
};

type RouteDay = {
  day: number;
  title: string;
  focus: string;
  activities: string[];
};

type RouteBook = {
  title: string;
  overview: string;
  days: RouteDay[];
  nextStep: string;
};

type ChatApiResponse = {
  reply: string;
  contextSource: ContextSource;
  usedModel: boolean;
  modelProvider: "dashscope" | "openai" | "fallback";
  modelName: string;
  travelBrief: TravelBrief;
  routeBook: RouteBook;
  expertMatches: ExpertMatch[];
};

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type VoiceTranscriptionResponse = {
  transcript: string;
  language: string | null;
  emotion: string | null;
  modelProvider: "dashscope";
  modelName: string;
  inputFormat: "pcm16";
  sampleRate: number;
};

type VoicePlaybackResponse = {
  error?: string;
};

type VoiceStackState = {
  transcript: string;
  asrProvider: string;
  asrModel: string;
  speechProvider: "azure-speech" | "browser" | null;
};

function isChatApiError(
  data: ChatApiResponse | { error?: string },
): data is { error?: string } {
  return "error" in data;
}

function hasErrorMessage(data: unknown): data is { error?: string } {
  return typeof data === "object" && data !== null && "error" in data;
}

const quickPrompts = [
  "I love porcelain and want a 3-day deep dive in China.",
  "I want a slower tea-focused journey with villages and mountain views.",
  "I care about calligraphy, old neighborhoods, and a thoughtful first trip.",
  "I want a photographer-led city route with strong visual atmosphere.",
] as const;

const trustSignals = [
  "Private expert-led matching",
  "First route book in minutes",
  "Booking path ready for high-intent travelers",
] as const;

const deliverables = [
  "A clarified travel brief you can keep refining",
  "A shortlist of local experts matched to your interests",
  "A first route book that turns mood into a real itinerary",
] as const;

const nextStepOptions = [
  "Refine the brief and keep iterating",
  "Browse experts that fit this route",
  "Move toward a private booking request",
] as const;

function providerLabel(provider: ChatApiResponse["modelProvider"]) {
  if (provider === "dashscope") {
    return "Alibaba DashScope";
  }

  if (provider === "openai") {
    return "OpenAI";
  }

  return "Fallback planner";
}

const emptyBrief: TravelBrief = {
  city: null,
  category: null,
  interests: "Your preferences will appear here after the first consultation.",
  pace: "balanced",
  durationDays: 3,
  budgetBand: "Premium",
  travelStyle: "Private expert-led cultural journey",
  whyThisFits:
    "We will clarify your interests, pace, and depth level before shaping the first route.",
};

const emptyRouteBook: RouteBook = {
  title: "Your route book will appear here",
  overview:
    "Once you send a prompt, the concierge will turn it into a first-pass travel brief and route shape.",
  days: [
    {
      day: 1,
      title: "Intent capture",
      focus: "Understand the traveler",
      activities: [
        "Identify the main cultural interest",
        "Clarify pace, city fit, and trip depth",
      ],
    },
    {
      day: 2,
      title: "Expert shaping",
      focus: "Find the right local fit",
      activities: [
        "Shortlist vetted local experts",
        "Translate curiosity into a route shape",
      ],
    },
  ],
  nextStep: "Send your first prompt to generate a route outline.",
};

function titleCase(value: string | null) {
  if (!value) {
    return "To be refined";
  }

  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeCitySlug(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", "_");
}

function formatCityLabel(value: string | null) {
  if (!value) {
    return "To be refined";
  }

  const normalized = normalizeCitySlug(value);

  if (CITIES.includes(normalized as (typeof CITIES)[number])) {
    return formatCity(normalized as (typeof CITIES)[number]);
  }

  return titleCase(value);
}

function formatCategoryLabel(value: string | null) {
  if (!value) {
    return "To be refined";
  }

  if (CATEGORIES.includes(value as (typeof CATEGORIES)[number])) {
    return titleCase(value.replaceAll("_", " "));
  }

  return titleCase(value);
}

function mergeFloat32Chunks(chunks: Float32Array[]) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
) {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;

    for (
      let index = offsetBuffer;
      index < nextOffsetBuffer && index < buffer.length;
      index += 1
    ) {
      accum += buffer[index] ?? 0;
      count += 1;
    }

    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function pcm16ToBase64(samples: Float32Array) {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(
      index * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const slice = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...Array.from(slice));
  }

  return window.btoa(binary);
}

export function ChatConciergeClient({
  initialQuery = "",
  initialCity = "",
  initialInterests = "",
  initialPace = "",
}: {
  initialQuery?: string;
  initialCity?: string;
  initialInterests?: string;
  initialPace?: string;
}) {
  const seededQuery =
    initialQuery ||
    [
      initialCity ? `I'm considering ${titleCase(initialCity)}.` : "",
      initialInterests ? `I'm interested in ${initialInterests}.` : "",
      initialPace ? `I prefer a ${initialPace} pace.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  const [query, setQuery] = useState(seededQuery);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      text:
        initialCity
          ? `I can already see you're considering ${titleCase(initialCity)}. Tell me what you care about most, and I'll turn it into a sharper route.`
          : "Tell me what you love, what kind of pace you want, or what kind of China you hope to enter. I’ll translate it into a first travel brief.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [result, setResult] = useState<ChatApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [voiceStack, setVoiceStack] = useState<VoiceStackState | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sinkNodeRef = useRef<GainNode | null>(null);
  const recordedChunksRef = useRef<Float32Array[]>([]);
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const playbackUrlRef = useRef<string | null>(null);

  const canSubmit = query.trim().length > 0 && !loading && !voiceProcessing;

  const suggestedPrompt = useMemo(() => {
    if (initialCity) {
      return `I'm considering ${titleCase(initialCity)} and I want something thoughtful, private, and culturally deep.`;
    }

    return "";
  }, [initialCity]);

  useEffect(() => {
    return () => {
      processorNodeRef.current?.disconnect();
      sourceNodeRef.current?.disconnect();
      sinkNodeRef.current?.disconnect();
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close();
      playbackRef.current?.pause();
      if (playbackUrlRef.current) {
        URL.revokeObjectURL(playbackUrlRef.current);
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  function cleanupVoiceCapture() {
    processorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    sinkNodeRef.current?.disconnect();
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());

    processorNodeRef.current = null;
    sourceNodeRef.current = null;
    sinkNodeRef.current = null;
    audioStreamRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;

    if (context) {
      void context.close();
    }
  }

  function stopPlaybackAudio() {
    playbackRef.current?.pause();
    playbackRef.current = null;

    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = null;
    }
  }

  async function submitPrompt(message: string, inputMode: "text" | "voice") {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          inputMode,
          initialCity: normalizeCitySlug(initialCity) || null,
          initialInterests: initialInterests || null,
          initialPace: initialPace || null,
        }),
      });

      const data = (await response.json()) as ChatApiResponse | { error?: string };

      if (!response.ok) {
        setError(
          isChatApiError(data) ? data.error ?? "Something went wrong." : "Something went wrong.",
        );
        return;
      }

      if (isChatApiError(data)) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult(data);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.reply,
        },
      ]);
      setQuery("");
    } catch {
      setError("Unable to reach the concierge right now.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitPrompt(query, "text");
  }

  async function stopVoiceCapture({
    transcribe,
  }: {
    transcribe: boolean;
  }) {
    const context = audioContextRef.current;

    cleanupVoiceCapture();
    setListening(false);

    if (!transcribe || !context) {
      recordedChunksRef.current = [];
      return;
    }

    setVoiceProcessing(true);

    try {
      const merged = mergeFloat32Chunks(recordedChunksRef.current);
      recordedChunksRef.current = [];

      if (merged.length === 0) {
        setError("We did not capture any voice audio. Please try once more.");
        return;
      }

      const downsampled = downsampleBuffer(merged, context.sampleRate, 16000);
      const audioBase64 = pcm16ToBase64(downsampled);
      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioBase64,
          sampleRate: 16000,
          language: "en",
        }),
      });

      const data = (await response.json()) as
        | VoiceTranscriptionResponse
        | { error?: string };

      if (!response.ok) {
        setError(
          hasErrorMessage(data)
            ? data.error ?? "Voice transcription failed."
            : "Voice transcription failed.",
        );
        return;
      }

      if (hasErrorMessage(data)) {
        setError(data.error ?? "Voice transcription failed.");
        return;
      }

      setVoiceStack((current) => ({
        transcript: data.transcript,
        asrProvider: "Alibaba DashScope",
        asrModel: data.modelName,
        speechProvider: current?.speechProvider ?? null,
      }));
      setQuery(data.transcript);
      await submitPrompt(data.transcript, "voice");
    } catch {
      setError("Unable to transcribe your voice right now.");
    } finally {
      setVoiceProcessing(false);
    }
  }

  async function startVoiceCapture() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const sink = audioContext.createGain();

    sink.gain.value = 0;

    recordedChunksRef.current = [];
    processor.onaudioprocess = (event) => {
      const channel = event.inputBuffer.getChannelData(0);
      recordedChunksRef.current.push(new Float32Array(channel));
    };

    source.connect(processor);
    processor.connect(sink);
    sink.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    audioStreamRef.current = stream;
    sourceNodeRef.current = source;
    processorNodeRef.current = processor;
    sinkNodeRef.current = sink;
    setListening(true);
  }

  async function onStartVoice() {
    if (loading || voiceProcessing) {
      return;
    }

    if (listening) {
      await stopVoiceCapture({ transcribe: true });
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof window.AudioContext === "undefined"
    ) {
      setError(
        "Voice input is not supported in this browser yet. Please type for now.",
      );
      return;
    }

    try {
      setError(null);
      await startVoiceCapture();
    } catch {
      cleanupVoiceCapture();
      setListening(false);
      setError("Voice capture failed. Please allow microphone access and try again.");
    }
  }

  async function playReply() {
    const text = result?.reply || messages.at(-1)?.text;

    if (!text) {
      return;
    }

    if (speaking) {
      stopPlaybackAudio();
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    setError(null);
    stopPlaybackAudio();
    window.speechSynthesis?.cancel();

    try {
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | VoicePlaybackResponse
          | null;

        throw new Error(data?.error || "Speech playback is unavailable.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      setVoiceStack((current) =>
        current
          ? {
              ...current,
              speechProvider: "azure-speech",
            }
          : current,
      );
      playbackUrlRef.current = url;
      playbackRef.current = audio;

      audio.onended = () => {
        stopPlaybackAudio();
        setSpeaking(false);
      };
      audio.onerror = () => {
        stopPlaybackAudio();
        setSpeaking(false);
        setError("We could not play the synthesized reply.");
      };

      await audio.play();
      return;
    } catch {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        setVoiceStack((current) =>
          current
            ? {
                ...current,
                speechProvider: "browser",
              }
            : current,
        );
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => {
          setSpeaking(false);
          setError("We could not play the reply audio.");
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      setSpeaking(false);
      setError("Speech playback is unavailable in this browser.");
    }
  }

  async function copyRouteBook() {
    const activeBrief = result?.travelBrief ?? emptyBrief;
    const activeRouteBook = result?.routeBook ?? emptyRouteBook;
    const expertLines =
      result?.expertMatches.map(
        (expert) =>
          `- ${expert.name} (${titleCase(expert.city)}): ${expert.headline}`,
      ) ?? [];

    const markdown = [
      `# ${activeRouteBook.title}`,
      "",
      activeRouteBook.overview,
      "",
      "## Travel brief",
      `- City: ${titleCase(activeBrief.city)}`,
      `- Category: ${titleCase(activeBrief.category)}`,
      `- Pace: ${activeBrief.pace}`,
      `- Duration: ${activeBrief.durationDays} days`,
      `- Budget: ${activeBrief.budgetBand}`,
      `- Interests: ${activeBrief.interests}`,
      "",
      "## Route book",
      ...activeRouteBook.days.flatMap((day) => [
        `### Day ${day.day}: ${day.title}`,
        day.focus,
        ...day.activities.map((activity) => `- ${activity}`),
        "",
      ]),
      "## Matched experts",
      ...(expertLines.length > 0
        ? expertLines
        : ["- Expert matches will appear after the first consultation."]),
      "",
      `Next step: ${activeRouteBook.nextStep}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      setError("Unable to copy the route book right now.");
    }
  }

  const expertsHref = useMemo(() => {
    if (!result?.travelBrief.city && !result?.travelBrief.category) {
      return "/experts";
    }

    const params = new URLSearchParams();

    if (result?.travelBrief.city) {
      params.set("city", result.travelBrief.city);
    }

    if (result?.travelBrief.category) {
      params.set("category", result.travelBrief.category);
    }

    return `/experts?${params.toString()}`;
  }, [result]);

  const bookingHref = useMemo(() => {
    const topMatch = result?.expertMatches[0];

    if (!topMatch) {
      return "/experts";
    }

    return `/booking?expert=${topMatch.slug}&duration=3`;
  }, [result]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="rounded-[2.25rem] border border-[#dbc7ad]/70 bg-[rgba(255,252,247,0.84)] p-5 shadow-[0_30px_80px_-40px_rgba(83,54,21,0.24)] backdrop-blur-2xl sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7c4aa] bg-white/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-[#8a6d4c]">
            <Sparkles className="size-3.5" />
            Consultation
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f3e8da] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#7a6454]">
            {loading
              ? "Thinking"
              : voiceProcessing
                ? "Transcribing"
                : listening
                  ? "Listening"
                  : speaking
                    ? "Speaking"
                    : "Ready"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {trustSignals.map((item) => (
            <div
              key={item}
              className="rounded-full border border-[#ddccb6] bg-white/75 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#7f6b5f]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="rounded-full border border-[#d8c6af] bg-white/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#7f6a5e]">
            Voice input · {voiceStack ? `${voiceStack.asrProvider} · ${voiceStack.asrModel}` : "DashScope ASR ready"}
          </div>
          <div className="rounded-full border border-[#d8c6af] bg-white/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#7f6a5e]">
            Voice output · {voiceStack?.speechProvider === "azure-speech" ? "Azure Speech" : voiceStack?.speechProvider === "browser" ? "Browser speech" : "Browser fallback ready"}
          </div>
        </div>

        <div className="mt-5 rounded-[1.75rem] border border-[#e6d7c4] bg-[#fcf7f1] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2a1a17]">
                Start with a feeling, not a destination list
              </p>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#6b5649]">
                Mention a craft, a mood, a city, or something oddly specific.
                The concierge will refine it into a route you can actually buy.
              </p>
            </div>
            <div className="voice-orb hidden rounded-full border border-[#eadbc8] bg-white/80 p-3 shadow-[0_14px_30px_-22px_rgba(51,34,17,0.3)] sm:flex">
              <WandSparkles className="size-5 text-[#9a5c46]" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-[#e5d5c0] bg-white/72 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a6d4c]">
              Step 1
            </p>
            <p className="mt-2 text-sm leading-7 text-[#5f4b41]">
              Tell the concierge what you love, what pace you prefer, or which
              city is calling you.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[#e5d5c0] bg-white/72 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a6d4c]">
              Step 2
            </p>
            <p className="mt-2 text-sm leading-7 text-[#5f4b41]">
              We shape that into a clearer brief with stronger city, category,
              and expert fit.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[#e5d5c0] bg-white/72 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a6d4c]">
              Step 3
            </p>
            <p className="mt-2 text-sm leading-7 text-[#5f4b41]">
              You leave with a route book you can refine, copy, and turn into a
              private booking request.
            </p>
          </div>
        </div>

        <div className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto pr-1 no-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "assistant"
                  ? "mr-10 rounded-[1.5rem] rounded-tl-[0.5rem] bg-[#fff8f2] px-4 py-3 text-sm leading-7 text-[#5a463e] shadow-[0_14px_28px_-24px_rgba(24,10,5,0.28)]"
                  : "ml-10 rounded-[1.5rem] rounded-tr-[0.5rem] bg-[#2a1a17] px-4 py-3 text-sm leading-7 text-white shadow-[0_18px_32px_-24px_rgba(17,11,8,0.4)]"
              }
            >
              {message.text}
            </div>
          ))}
          {loading ? (
            <div className="mr-10 rounded-[1.5rem] rounded-tl-[0.5rem] bg-[#fff8f2] px-4 py-3 text-sm text-[#7b6458]">
              Shaping your brief and route book…
            </div>
          ) : null}
        </div>

        <form className="mt-5" onSubmit={onSubmit}>
          <div className="rounded-[1.8rem] border border-[#decdb6] bg-white/88 p-3 shadow-[0_20px_60px_-42px_rgba(20,20,20,0.22)]">
            <div className="rounded-[1.35rem] bg-[#fbfaf7] px-4 py-3">
              <div className="flex items-start gap-3">
                <Volume2 className="mt-1 size-5 shrink-0 text-[#8e867b]" />
                <textarea
                  className="min-h-[112px] w-full resize-none bg-transparent text-[15px] leading-7 text-[#1f1f1f] outline-none placeholder:text-[#9b9388] sm:text-base"
                  name="q"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="I love porcelain, I prefer a slower pace, and I want a private 3-day route that feels thoughtful rather than touristy."
                  value={query}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dbc7ad] bg-[#fff8f2] px-4 py-2.5 text-sm font-medium text-[#32211d] transition hover:bg-[#f8efe6]"
                onClick={onStartVoice}
                type="button"
              >
                {listening ? (
                  <>
                    <MicOff className="size-4" />
                    Stop and transcribe
                  </>
                ) : (
                  <>
                    <Mic className="size-4" />
                    Record voice prompt
                  </>
                )}
              </button>

              <button
                className="inline-flex items-center justify-center rounded-full bg-[#231714] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canSubmit}
                type="submit"
              >
                {loading ? "Generating route book…" : "Generate my route book"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {(suggestedPrompt ? [suggestedPrompt, ...quickPrompts] : quickPrompts).map(
            (prompt) => (
              <button
                key={prompt}
                className="rounded-full border border-[#dbcbb7] bg-white/70 px-3 py-2 text-left text-xs leading-5 text-[#695648] transition hover:bg-[#fffaf4]"
                onClick={() => setQuery(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ),
          )}
        </div>

        {error ? (
          <p className="mt-4 rounded-[1.25rem] border border-[#e8c2bc] bg-[#fff5f4] px-4 py-3 text-sm text-[#8b4238]">
            {error}
          </p>
        ) : null}

        <div className="mt-5 rounded-[1.7rem] border border-[#e2d2be] bg-[linear-gradient(180deg,rgba(255,251,246,0.96),rgba(247,239,230,0.96))] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a6d4c]">
                What you get
              </p>
              <h3 className="mt-2 font-serif text-2xl text-[#231714]">
                More than an answer, less than a generic itinerary
              </h3>
            </div>
            <div className="rounded-full bg-[#efe1d0] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#7e6759]">
              Founder-style concierge flow
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {deliverables.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] bg-white/82 px-4 py-3 text-sm leading-7 text-[#5b483f]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-[2.1rem] border border-[#dbc7ad]/70 bg-[linear-gradient(135deg,rgba(124,43,31,0.96),rgba(48,24,20,0.96))] p-6 text-white shadow-[0_26px_72px_-44px_rgba(48,24,20,0.5)]">
          <p className="text-[11px] uppercase tracking-[0.26em] text-white/68">
            Concierge outcome
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight">
            This page should move a traveler from curiosity to conviction.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74">
            The goal is not to overwhelm them with options. It is to translate a
            vague desire into a route shape, a best-fit expert, and a natural
            next step toward booking.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/56">
                Lead signal
              </p>
              <p className="mt-2 text-sm leading-7 text-white/86">
                Strong intent around one real interest, not generic tourism.
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/56">
                Trust signal
              </p>
              <p className="mt-2 text-sm leading-7 text-white/86">
                A route that feels curated, specific, and explainable.
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/56">
                Conversion signal
              </p>
              <p className="mt-2 text-sm leading-7 text-white/86">
                One clear expert or city path they can confidently continue with.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/72">
              {result
                ? `${providerLabel(result.modelProvider)} · ${result.modelName}`
                : "Waiting for first request"}
            </div>
            <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/72">
              {result ? `Context · ${result.contextSource}` : "Context pending"}
            </div>
          </div>
        </section>

        <section className="rounded-[2.1rem] border border-[#dbc7ad]/70 bg-[rgba(255,250,244,0.88)] p-6 shadow-[0_26px_72px_-44px_rgba(83,54,21,0.24)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8a6d4c]">
            Travel brief
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#201411]">
            {formatCityLabel(result?.travelBrief.city ?? emptyBrief.city)} ·{" "}
            {formatCategoryLabel(result?.travelBrief.category ?? emptyBrief.category)}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#645145]">
            {(result?.travelBrief ?? emptyBrief).whyThisFits}
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.3rem] bg-white/88 p-4">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8f7b69]">
                Interest
              </dt>
              <dd className="mt-2 text-sm leading-7 text-[#34221f]">
                {(result?.travelBrief ?? emptyBrief).interests}
              </dd>
            </div>
            <div className="rounded-[1.3rem] bg-white/88 p-4">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8f7b69]">
                Style
              </dt>
              <dd className="mt-2 text-sm leading-7 text-[#34221f]">
                {(result?.travelBrief ?? emptyBrief).travelStyle}
              </dd>
            </div>
            <div className="rounded-[1.3rem] bg-white/88 p-4">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8f7b69]">
                Pace
              </dt>
              <dd className="mt-2 text-sm leading-7 capitalize text-[#34221f]">
                {(result?.travelBrief ?? emptyBrief).pace}
              </dd>
            </div>
            <div className="rounded-[1.3rem] bg-white/88 p-4">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-[#8f7b69]">
                Duration and budget
              </dt>
              <dd className="mt-2 text-sm leading-7 text-[#34221f]">
                {(result?.travelBrief ?? emptyBrief).durationDays} days ·{" "}
                {(result?.travelBrief ?? emptyBrief).budgetBand}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center justify-center rounded-full bg-[#231714] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-92"
              onClick={copyRouteBook}
              type="button"
            >
              {copied ? "Copied route book" : "Copy route book"}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full border border-[#dbc7ad] bg-white/80 px-4 py-2.5 text-sm font-medium text-[#32211d] transition hover:bg-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!result?.reply}
              onClick={playReply}
              type="button"
            >
              {speaking ? "Stop reply audio" : "Play reply"}
            </button>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[#dbc7ad] bg-white/80 px-4 py-2.5 text-sm font-medium text-[#32211d] transition hover:bg-[#fff8f2]"
              href={expertsHref}
            >
              Browse matched experts
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[#dbc7ad] bg-[#f4e8d9] px-4 py-2.5 text-sm font-medium text-[#32211d] transition hover:bg-[#f1e1cf]"
              href={bookingHref}
            >
              Request private booking
            </Link>
          </div>
        </section>

        <section className="rounded-[2.1rem] border border-[#dbc7ad]/70 bg-[rgba(255,250,244,0.88)] p-6 shadow-[0_26px_72px_-44px_rgba(83,54,21,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#8a6d4c]">
                Matched experts
              </p>
              <h3 className="mt-2 font-serif text-2xl text-[#201411]">
                Who could lead this journey
              </h3>
            </div>
            <p className="text-xs text-[#8a7c70]">
              {result
                ? `${providerLabel(result.modelProvider)} · ${result.modelName}`
                : "Waiting for your first prompt"}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {(result?.expertMatches ?? []).length > 0 ? (
              result?.expertMatches.map((expert) => (
                <div
                  key={expert.slug}
                  className="rounded-[1.4rem] border border-[#e7d9c6] bg-white/92 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#251713]">
                        {expert.name}
                      </p>
                      <p className="mt-1 text-sm text-[#765e53]">
                        {formatCityLabel(expert.city)}{" "}
                        · {expert.headline}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f3e7d7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8b6b4b]">
                      Match
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#5b483f]">
                    {expert.reason}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#7d695f]">
                    {expert.sampleSession}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[#dfcfbb] bg-white/72 p-4 text-sm leading-7 text-[#7a675b]">
                Expert matches will appear once the concierge understands what
                you care about.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2.1rem] border border-[#dbc7ad]/70 bg-[rgba(255,250,244,0.88)] p-6 shadow-[0_26px_72px_-44px_rgba(83,54,21,0.24)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#8a6d4c]">
            Route book
          </p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-[#201411]">
            {(result?.routeBook ?? emptyRouteBook).title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[#645145]">
            {(result?.routeBook ?? emptyRouteBook).overview}
          </p>

          <div className="mt-5 space-y-3">
            {(result?.routeBook ?? emptyRouteBook).days.map((day) => (
              <div
                key={`${day.day}-${day.title}`}
                className="rounded-[1.4rem] border border-[#e7d9c6] bg-white/92 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b87550] text-xs font-semibold text-white">
                    {day.day}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#251713]">
                      {day.title}
                    </p>
                    <p className="mt-1 text-sm text-[#765e53]">{day.focus}</p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5b483f]">
                      {day.activities.map((activity) => (
                        <li key={activity}>• {activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[1.4rem] bg-[#f4e8d9] px-4 py-3 text-sm leading-7 text-[#5b483f]">
            {(result?.routeBook ?? emptyRouteBook).nextStep}
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-[#e5d5c0] bg-white/76 px-4 py-3 text-xs leading-6 text-[#74665d]">
            Voice on this page now records microphone audio, sends `16k PCM`
            through DashScope realtime ASR on the server, and then feeds the
            transcript straight into the same route-book flow as typing.
            Reply playback uses Azure Speech when configured, with browser
            speech synthesis as the fallback.
          </div>

          {voiceStack?.transcript ? (
            <div className="mt-4 rounded-[1.4rem] border border-[#e5d5c0] bg-[#fff9f3] px-4 py-3 text-sm leading-7 text-[#5b483f]">
              Last voice transcript: &ldquo;{voiceStack.transcript}&rdquo;
            </div>
          ) : null}

          <div className="mt-4 rounded-[1.4rem] border border-[#e5d5c0] bg-[#fff9f3] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a6d4c]">
              What should happen next
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {nextStepOptions.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.1rem] bg-white px-3 py-3 text-sm leading-6 text-[#5b483f]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
