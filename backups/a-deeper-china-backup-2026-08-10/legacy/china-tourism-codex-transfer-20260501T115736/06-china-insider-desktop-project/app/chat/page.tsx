import { ChatConciergeClient } from "@/components/marketing/chat-concierge-client";

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ChatPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const initialQuery = pickFirst(searchParams?.q) ?? "";
  const initialCity = pickFirst(searchParams?.city) ?? "";
  const initialInterests = pickFirst(searchParams?.interests) ?? "";
  const initialPace = pickFirst(searchParams?.pace) ?? "";

  return (
    <main className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#f6efe6] text-[#201411]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,248,236,0.9),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(193,118,75,0.16),transparent_24%),linear-gradient(180deg,#f8f1e8_0%,#f3eadf_42%,#efe4d8_100%)]" />
        <div className="absolute left-[10%] top-[12%] h-40 w-40 rounded-full bg-[#d09a67]/10 blur-3xl" />
        <div className="absolute bottom-[16%] right-[12%] h-56 w-56 rounded-full bg-[#7b2f25]/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8b6b4b]">
            AI concierge
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl lg:text-[4rem]">
            Tell us what you love, and we&apos;ll shape your China journey.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6e5a50] sm:text-base sm:leading-8">
            Start with a feeling, an obsession, or a city you can&apos;t stop
            thinking about. The concierge turns that into a travel brief, a
            shortlist of local experts, and a first route book you can actually
            build from.
          </p>
        </div>

        <div className="mt-10">
          <ChatConciergeClient
            initialCity={initialCity}
            initialInterests={initialInterests}
            initialPace={initialPace}
            initialQuery={initialQuery}
          />
        </div>
      </div>
    </main>
  );
}
