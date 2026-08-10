"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CITIES, type Category } from "@/lib/constants";
import { demoExperts } from "@/lib/demo-data";

type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "matched" | "fallback";

type PromptOption = {
  label: string;
  category: Category;
  userLine: string;
};

type VoiceTranscriptionResponse = {
  transcript: string;
  modelProvider: "dashscope";
  modelName: string;
  sampleRate: number;
};

const scriptedConversation = [
  "Hi, welcome to China Insider. What brings you to China?",
  "What kind of experiences do you usually go deep on when you travel?",
  "That helps. Let me think about who would be the best local match for you.",
] as const;

const categoryLabels: Record<Category, string> = {
  porcelain: "Porcelain",
  tea: "Tea",
  sichuan_food: "Sichuan food",
  kung_fu: "Kung fu",
  calligraphy: "Calligraphy",
  tcm: "Traditional Chinese medicine",
  photography: "Photography",
  maritime_silk_road: "Maritime Silk Road",
};

const demoPrompts: PromptOption[] = [
  {
    label: "Porcelain lover",
    category: "porcelain",
    userLine: "I love porcelain and I want to understand how it is actually made.",
  },
  {
    label: "Food explorer",
    category: "sichuan_food",
    userLine: "I want a deep Sichuan food day, not just a tourist food tour.",
  },
  {
    label: "History nerd",
    category: "maritime_silk_road",
    userLine: "I am fascinated by trade routes, religions, and old port cities.",
  },
];

const categoryHints: Record<Category, string[]> = {
  porcelain: ["porcelain", "ceramic", "pottery", "kiln", "clay", "glaze", "jingdezhen"],
  tea: ["tea", "teahouse", "tea house", "gongfu", "puer", "pu'er"],
  sichuan_food: ["food", "sichuan", "hotpot", "spicy", "kitchen", "chengdu"],
  kung_fu: ["kung fu", "martial", "taichi", "tai chi", "wudang"],
  calligraphy: ["calligraphy", "brush", "ink", "painting", "beijing"],
  tcm: ["tcm", "medicine", "herb", "wellness", "healing", "clinic"],
  photography: ["photography", "photo", "camera", "night scene", "chongqing"],
  maritime_silk_road: ["maritime", "silk road", "trade", "port", "religion", "quanzhou", "history"],
};

function pickPrompt(category: Category) {
  return demoPrompts.find((prompt) => prompt.category === category) ?? demoPrompts[0];
}

function formatInterest(category: Category | null) {
  if (!category) return "Press Start voice match or choose a sample prompt to simulate the match.";
  return `Interest recognized: ${categoryLabels[category]}`;
}

function getBrowserSupport() {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && !!window.AudioContext;
}

function getStatusLabel(voiceState: VoiceState, statusMessage: string) {
  if (voiceState === "connecting") return "Connecting";
  if (voiceState === "listening") return "Listening";
  if (voiceState === "thinking") return "Matching";
  if (voiceState === "matched") return "Matched";
  if (voiceState === "fallback") return "Fallback";
  return statusMessage;
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

function inferCategoryFromTranscript(transcript: string) {
  const lowered = transcript.toLowerCase();
  let bestMatch: { category: Category; score: number } | null = null;

  for (const [category, hints] of Object.entries(categoryHints) as Array<[Category, string[]]>) {
    const score = hints.reduce(
      (count, hint) => count + (lowered.includes(hint) ? 1 : 0),
      0,
    );

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }

  return bestMatch && bestMatch.score > 0 ? bestMatch.category : "porcelain";
}

export default function VoiceDemo() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("DashScope voice intake");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [bookingPanelOpen, setBookingPanelOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [voiceModelLabel, setVoiceModelLabel] = useState("DashScope ASR ready");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    dates: "",
    budget: "",
  });

  const openBookingPanel = useCallback(() => {
    setBookingPanelOpen(true);
    setBookingSubmitted(false);
  }, []);

  const closeBookingPanel = useCallback(() => {
    setBookingPanelOpen(false);
  }, []);

  const updateBookingField = useCallback(
    (field: keyof typeof bookingForm, value: string) => {
      setBookingForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const submitBookingRequest = useCallback(() => {
    setBookingSubmitted(true);
  }, []);

  const matchedExpert = useMemo(() => {
    if (!selectedCategory) return null;
    return demoExperts.find((expert) => expert.category === selectedCategory) ?? null;
  }, [selectedCategory]);

  const timeoutsRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sinkNodeRef = useRef<GainNode | null>(null);
  const recordedChunksRef = useRef<Float32Array[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timeoutsRef.current) {
      window.clearTimeout(timer);
    }
    timeoutsRef.current = [];
  }, []);

  const cleanupVoiceCapture = useCallback(() => {
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
  }, []);

  useEffect(() => {
    return () => {
      cleanupVoiceCapture();
      clearTimers();
      window.speechSynthesis?.cancel();
    };
  }, [cleanupVoiceCapture, clearTimers]);

  const finalizeMatch = useCallback(
    (nextCategory: Category, source: "voice" | "sample") => {
      setSelectedCategory(nextCategory);
      setVoiceState("matched");
      setStatusMessage(`Matched ${categoryLabels[nextCategory]}`);
      setFallbackMessage(
        source === "voice"
          ? `Live transcript processed through ${voiceModelLabel}.`
          : "Using a sample prompt to simulate the match instantly.",
      );

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `I would match you with our ${categoryLabels[nextCategory]} specialist in ${demoExperts.find((expert) => expert.category === nextCategory)?.city ?? "China"}.`,
        );
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    },
    [voiceModelLabel],
  );

  const startSampleDemo = useCallback(
    (category: Category) => {
      const prompt = pickPrompt(category);
      clearTimers();
      cleanupVoiceCapture();
      setTranscript(prompt.userLine);
      setSelectedCategory(category);
      setVoiceState("fallback");
      setStatusMessage("Sample prompt");

      timeoutsRef.current.push(
        window.setTimeout(() => setVoiceState("thinking"), 450),
        window.setTimeout(() => finalizeMatch(category, "sample"), 1250),
      );
    },
    [cleanupVoiceCapture, clearTimers, finalizeMatch],
  );

  const startVoiceCapture = useCallback(async () => {
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
  }, []);

  const stopVoiceCaptureAndMatch = useCallback(async () => {
    const context = audioContextRef.current;

    cleanupVoiceCapture();

    if (!context) {
      setVoiceState("idle");
      return;
    }

    const merged = mergeFloat32Chunks(recordedChunksRef.current);
    recordedChunksRef.current = [];

    if (merged.length === 0) {
      setVoiceState("idle");
      setStatusMessage("No audio captured");
      setFallbackMessage("We did not capture any voice audio. Please try once more.");
      return;
    }

    setVoiceState("thinking");
    setStatusMessage("Transcribing");

    try {
      const downsampled = downsampleBuffer(merged, context.sampleRate, 16000);
      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioBase64: pcm16ToBase64(downsampled),
          sampleRate: 16000,
          language: "en",
        }),
      });

      const data = (await response.json()) as VoiceTranscriptionResponse | { error?: string };

      if (!response.ok || ("error" in data && data.error)) {
        throw new Error(("error" in data && data.error) || "Voice transcription failed.");
      }

      setTranscript(data.transcript);
      setVoiceModelLabel(`Alibaba DashScope · ${data.modelName}`);
      setStatusMessage("Matching");
      finalizeMatch(inferCategoryFromTranscript(data.transcript), "voice");
    } catch (error) {
      setVoiceState("fallback");
      setStatusMessage("Fallback");
      setFallbackMessage(
        error instanceof Error
          ? error.message
          : "Voice transcription is unavailable right now.",
      );
    }
  }, [cleanupVoiceCapture, finalizeMatch]);

  const onPrimaryAction = useCallback(async () => {
    if (voiceState === "listening") {
      await stopVoiceCaptureAndMatch();
      return;
    }

    clearTimers();
    setBookingPanelOpen(false);
    setBookingSubmitted(false);
    setFallbackMessage(null);
    setSelectedCategory(null);

    if (!getBrowserSupport()) {
      startSampleDemo("porcelain");
      return;
    }

    try {
      setTranscript("");
      setStatusMessage("Connecting microphone");
      setVoiceState("connecting");
      await startVoiceCapture();
      setVoiceState("listening");
      setStatusMessage("Listening");
    } catch {
      setVoiceState("fallback");
      setStatusMessage("Fallback");
      setFallbackMessage("Microphone access failed. Please use a sample prompt instead.");
    }
  }, [clearTimers, startSampleDemo, startVoiceCapture, stopVoiceCaptureAndMatch, voiceState]);

  const resetDemo = useCallback(() => {
    cleanupVoiceCapture();
    clearTimers();
    setSelectedCategory(null);
    setVoiceState("idle");
    setTranscript("");
    setFallbackMessage(null);
    setStatusMessage("DashScope voice intake");
  }, [cleanupVoiceCapture, clearTimers]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-8" id="voice-demo">
      <div className="space-y-8 pt-8 sm:pt-14">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-black/60">China Insider</p>

        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Tell us what you love. Meet someone in China who lives it.
          </h1>
          <p className="max-w-xl text-base leading-7 text-black/70 sm:text-lg">
            This demo now records a real English voice intake, transcribes it with DashScope,
            and turns that signal into a tailored expert match in one screen.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black/90"
            onClick={onPrimaryAction}
            type="button"
          >
            {voiceState === "listening" ? "Stop and match" : "Start voice match"}
          </button>
          <a
            className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-black/80"
            href="/#cities"
          >
            Explore cities
          </a>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.18em] text-black/55">
          <span className="rounded-full border border-black/10 bg-white px-3 py-2">
            Voice input · {voiceModelLabel}
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-2">
            Voice output · Browser speech
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Voice-first", "Short English intake on any laptop."],
            ["Expert matching", "One interest signal turns into a real local match."],
            ["Expandable", "City data stays centralized so more cities can be added later."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="font-medium">{title}</p>
              <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/55">
                Demo conversation
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Try a sample prompt</h2>
            </div>
            <div className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/60">
              {getStatusLabel(voiceState, statusMessage)}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {demoPrompts.map((prompt) => (
              <button
                key={prompt.label}
                className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black hover:text-white"
                onClick={() => startSampleDemo(prompt.category)}
                type="button"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.75rem] border border-black/10 bg-[#f6f0e6] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/50">
                    Voice intake
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/70">
                    {voiceState === "idle"
                      ? "Press start and say what you care about."
                      : voiceState === "listening"
                        ? "Speak naturally, then press the button again to stop."
                        : "The call stays short while the match is found."}
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/70 shadow-sm">
                  {getStatusLabel(voiceState, statusMessage)}
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] bg-white px-4 py-4 text-sm leading-6 text-black/80 shadow-sm">
                <span className="mr-2 font-medium text-black">Traveler</span>
                {transcript || "Your voice input will appear here."}
              </div>
            </div>

            {scriptedConversation.map((line, index) => {
              const visible = voiceState !== "idle";

              if (!visible) return null;

              return (
                <div
                  key={line}
                  className="rounded-2xl bg-[#f7f3ea] px-4 py-3 text-sm leading-6 text-black/75"
                >
                  <span className="mr-2 font-medium text-black">AI</span>
                  {line}
                  {index === 1 && transcript ? (
                    <span className="mt-2 block rounded-xl bg-white px-3 py-2 text-black/80">
                      <span className="mr-2 font-medium text-black">Traveler</span>
                      {transcript}
                    </span>
                  ) : null}
                  {index === 2 && voiceState === "thinking" ? (
                    <span className="mt-2 block rounded-xl bg-white px-3 py-2 text-black/70">
                      <span className="mr-2 font-medium text-black">Status</span>
                      Searching the expert pool...
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-[#fbfaf7] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
              Current match signal
            </p>
            <p className="mt-2 text-sm text-black/70">{formatInterest(selectedCategory)}</p>
            {fallbackMessage ? (
              <p className="mt-3 text-sm leading-6 text-black/60">{fallbackMessage}</p>
            ) : null}
            {transcript ? (
              <p className="mt-3 text-sm leading-6 text-black/60">
                Last transcript: &ldquo;{transcript}&rdquo;
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-black/55">
            Matched expert
          </p>

          {voiceState === "matched" && matchedExpert ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-[1.75rem] bg-[#f4efe4] p-5">
                <div className="flex h-44 items-end rounded-[1.5rem] bg-gradient-to-br from-[#d8c6a5] to-[#8e6d4b] p-5 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/75">
                      {matchedExpert.city}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">{matchedExpert.name}</h3>
                    <p className="mt-1 text-sm text-white/85">{matchedExpert.role}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-black/70">
                    {categoryLabels[matchedExpert.category]}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/70">{matchedExpert.shortBio}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-black/65">
                  <span className="rounded-full border border-black/10 px-3 py-1">
                    From ${matchedExpert.pricePerDayUsd}/day
                  </span>
                  <span className="rounded-full border border-black/10 px-3 py-1">
                    {matchedExpert.videoLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
                  href="https://tally.so"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Request to book
                </a>
                <button
                  className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black/75"
                  onClick={openBookingPanel}
                  type="button"
                >
                  Book request
                </button>
                <button
                  className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black/75"
                  onClick={resetDemo}
                  type="button"
                >
                  Reset match
                </button>
              </div>

              {bookingPanelOpen ? (
                <div className="rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] p-4 text-sm text-black/70 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">
                        Book request
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        Send a quick request and we’ll follow up with the right local expert.
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/45"
                      onClick={closeBookingPanel}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      placeholder="Your name"
                      value={bookingForm.name}
                      onChange={(event) => updateBookingField("name", event.target.value)}
                    />
                    <input
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      placeholder="Email"
                      value={bookingForm.email}
                      onChange={(event) => updateBookingField("email", event.target.value)}
                    />
                    <input
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      placeholder="Dates / duration"
                      value={bookingForm.dates}
                      onChange={(event) => updateBookingField("dates", event.target.value)}
                    />
                    <input
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                      placeholder="Budget"
                      value={bookingForm.budget}
                      onChange={(event) => updateBookingField("budget", event.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
                      onClick={submitBookingRequest}
                      type="button"
                    >
                      Send request
                    </button>
                    <button
                      className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black/75"
                      onClick={closeBookingPanel}
                      type="button"
                    >
                      Save for later
                    </button>
                  </div>
                  {bookingSubmitted ? (
                    <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-black/60">
                      Thanks. We’ll follow up with the right local expert.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.75rem] border border-dashed border-black/15 bg-[#fbfaf7] p-5 text-sm leading-6 text-black/60">
              {voiceState === "idle"
                ? "No expert match yet. Start the voice intake to trigger the matching flow."
                : "We are still shaping the best local match for this traveler."}
            </div>
          )}

          <div className="mt-6 rounded-[1.5rem] bg-[#f7f3ea] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">Launch cities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/65"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
