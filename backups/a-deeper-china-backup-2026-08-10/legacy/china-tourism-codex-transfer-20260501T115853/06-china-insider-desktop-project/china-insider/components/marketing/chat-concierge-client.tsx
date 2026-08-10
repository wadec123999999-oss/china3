"use client";

import { Mic, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";

type ChatApiResponse = {
  reply: string;
  routeBookPreview: string[];
  contextSource: "supabase" | "mock" | "none";
  usedModel: boolean;
};

export function ChatConciergeClient({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query }),
      });

      const data = (await response.json()) as ChatApiResponse | { error?: string };

      if (!response.ok || "error" in data) {
        setError(data.error ?? "Something went wrong.");
        setResult(null);
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to reach the concierge right now.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[2.25rem] border border-black/5 bg-white/70 p-6 shadow-[0_30px_90px_-42px_rgba(24,24,24,0.22)] backdrop-blur-2xl sm:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/6 bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#7f776c]">
          <Sparkles className="size-3.5" />
          China concierge
        </div>

        <h1 className="mt-6 font-serif text-4xl tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
          Start with a feeling.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6d655c] sm:text-base sm:leading-8">
          Tell the concierge what kind of China you want to enter. The AI will
          interpret your intent, retrieve relevant context from your system, and
          shape the conversation toward a bespoke route book.
        </p>
      </div>

      <form className="mx-auto mt-10 max-w-3xl" onSubmit={onSubmit}>
        <div className="rounded-[2rem] border border-black/6 bg-white/88 p-3 shadow-[0_24px_60px_-36px_rgba(21,21,21,0.2)]">
          <div className="flex items-center gap-3 rounded-[1.6rem] bg-[#fbfaf7] px-4 py-3 sm:px-5 sm:py-4">
            <Volume2 className="size-5 shrink-0 text-[#8e867b]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-base text-[#1f1f1f] outline-none placeholder:text-[#9b9388] sm:text-lg"
              name="q"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tea mountains, old neighborhoods, porcelain kilns, slower days…"
              type="text"
              value={query}
            />
            <button
              aria-label="Voice input"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-black/6 bg-white text-[#3b3a36] transition hover:bg-[#f3efe7]"
              type="button"
            >
              <Mic className="size-5" />
            </button>
          </div>
        </div>
      </form>

      <div className="mx-auto mt-4 max-w-3xl text-center">
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || query.trim().length === 0}
          onClick={() => {
            const form = document.querySelector("form");
            form?.requestSubmit();
          }}
          type="button"
        >
          {loading ? "Thinking…" : "Send to concierge"}
        </button>
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-[#857d72]">
        <span className="rounded-full bg-black/[0.03] px-3 py-1.5">Text input</span>
        <span className="rounded-full bg-black/[0.03] px-3 py-1.5">Voice trigger</span>
        <span className="rounded-full bg-black/[0.03] px-3 py-1.5">Database retrieval</span>
        <span className="rounded-full bg-black/[0.03] px-3 py-1.5">Route book output</span>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-black/5 bg-[#fcfbf8] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f877c]">
            Concierge reply
          </p>
          <div className="mt-5 rounded-[1.25rem] bg-white px-4 py-4 text-sm leading-7 text-[#564f47] shadow-[0_12px_30px_-24px_rgba(0,0,0,0.25)]">
            {error
              ? error
              : result?.reply ??
                "Your conversation will appear here after you send a first prompt."}
          </div>
        </section>

        <aside className="rounded-[1.75rem] border border-black/5 bg-[#fcfbf8] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8f877c]">
            Route book preview
          </p>
          <div className="mt-5 space-y-3 text-sm leading-7 text-[#5d564d]">
            {(result?.routeBookPreview ?? [
              "Intent capture",
              "Context retrieval",
              "Concierge shaping",
              "Bespoke route output",
            ]).map((item) => (
              <div key={item} className="rounded-[1.1rem] bg-white px-4 py-3">
                {item}
              </div>
            ))}
          </div>
          {result ? (
            <p className="mt-4 text-xs text-[#8a8277]">
              Context source: {result.contextSource}
              {result.usedModel ? " · live model" : " · fallback planner"}
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
