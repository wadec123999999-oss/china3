import Link from "next/link";

const cityContent = {
  beijing: {
    name: "Beijing",
    eyebrow: "Classic China, carefully explained",
    title: "A first doorway into China through hutongs, memory, and lived rhythm.",
    description:
      "For many international travelers, Beijing is the most natural first stop in China. But the real appeal is not checking off monuments — it is learning how old lanes, imperial order, neighborhood life, and modern change all sit together in one city.",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Hutongs, courtyards, old-city texture",
      "Capital history explained without feeling academic",
      "A calm, private pace instead of a rushed checklist",
    ],
    sample: [
      "Begin in a quiet hutong lane and read Beijing through courtyards, thresholds, and everyday rituals.",
      "Pause for tea and conversation about what makes the capital feel different from every other Chinese city.",
      "End with a tailored recommendation for where to go next in China based on your pace and curiosity.",
    ],
  },
  chengdu: {
    name: "Chengdu",
    eyebrow: "Slow China, local life, and Sichuan ease",
    title: "A softer introduction to China through tea houses, food, and unhurried city life.",
    description:
      "Chengdu works because it feels immediately human. Travelers do not only come for pandas or famous dishes — they come for a city where long afternoons, tea houses, neighborhood streets, and deeply rooted food culture make China feel warm, legible, and easy to enter.",
    image:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Tea houses and neighborhood pace",
      "Sichuan food as culture, not just spice",
      "A city product that feels intimate and easy to love",
    ],
    sample: [
      "Start in a traditional tea house and unpack why Chengdu's pace feels so distinct.",
      "Move through a local market or food street with context on ingredients, flavor, and ritual.",
      "Shape the rest of the trip around appetite, energy, and whether the traveler wants more city life or a deeper regional route.",
    ],
  },
  chongqing: {
    name: "Chongqing",
    eyebrow: "Urban drama, mountain structure, and contemporary China",
    title: "A city of impossible geography, layered history, and unforgettable atmosphere.",
    description:
      "Chongqing is one of the strongest visual entries into China, but it becomes truly valuable when explained beyond the skyline. The slopes, bridges, wartime memory, river edges, and everyday intensity make it a living lesson in how Chinese cities can feel dense, vertical, and emotionally charged all at once.",
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Vertical streets and layered movement",
      "A stronger story than just social-media viewpoints",
      "Ideal for travelers curious about contemporary urban China",
    ],
    sample: [
      "Read the mountain city through stairways, roads, river edges, and older neighborhoods.",
      "Fold in food, night atmosphere, and urban history so the city feels coherent instead of chaotic.",
      "Offer a second-step route into nearby themes: food culture, photography, or wartime Chongqing.",
    ],
  },
  jingdezhen: {
    name: "Jingdezhen",
    eyebrow: "Craft, porcelain, and the material intelligence of China",
    title: "A flagship journey into making, touch, kilns, and the long life of objects.",
    description:
      "Jingdezhen is one of the clearest places to express China's aesthetic depth to an international traveler. Porcelain is already a global language. What this city adds is access to process, studio culture, kiln history, and the quiet authority of a place where making has shaped life for centuries.",
    image:
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Porcelain and ceramics as an instantly legible entry point",
      "Studio visits, kiln stories, materials, and making",
      "A strong brand-defining route for higher-intent travelers",
    ],
    sample: [
      "Begin with porcelain history and what made Jingdezhen globally important.",
      "Enter working studios and discuss material, fire, glaze, and contemporary making.",
      "Build onward into a two- or three-day journey for craft, design, collecting, or photography-focused guests.",
    ],
  },
  quanzhou: {
    name: "Quanzhou",
    eyebrow: "Ports, belief, exchange, and layered urban memory",
    title: "A deeper China city where trade, faith, and daily life still speak to each other.",
    description:
      "Quanzhou is not a mass-market destination — that is precisely why it is powerful. It offers a dense, elegant story about maritime exchange, religious coexistence, and urban continuity. For the right traveler, it feels like access to a more intelligent, less overexposed China.",
    image:
      "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Maritime Silk Road and port-city history",
      "Religion, architecture, and local continuity",
      "A culture-rich product with strong differentiation",
    ],
    sample: [
      "Walk through temples, lanes, and civic spaces as one connected story about exchange.",
      "Frame Quanzhou not as scattered heritage points but as a living port civilization.",
      "Extend into a one- or two-day cultural route for travelers drawn to history and complexity.",
    ],
  },
  "jingmai-mountain": {
    name: "Jingmai Mountain",
    eyebrow: "Tea landscapes, mountain villages, and slow-time China",
    title: "A high-intent journey into tea, terrain, and a quieter form of Chinese life.",
    description:
      "Jingmai Mountain is not for everyone, which is exactly what makes it valuable. Tea is a globally understood doorway, but here it becomes landscape, rhythm, village life, and memory. The experience can feel less like sightseeing and more like entering a way of living shaped by mountain time.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Tea as culture, place, and pace",
      "Village life and mountain atmosphere",
      "Strong potential for premium, slower, multi-day travel",
    ],
    sample: [
      "Introduce the route through tea landscapes and why they matter culturally, not only visually.",
      "Slow the pace around tea, villages, conversation, and observation.",
      "Develop the journey into a multi-day flagship for travelers seeking retreat, culture, and depth.",
    ],
  },
  "wudang-mountain": {
    name: "Wudang Mountain",
    eyebrow: "Taoist rhythm, mountain stillness, and embodied culture",
    title: "A body-and-mind entry into China through Taoism, temples, and disciplined calm.",
    description:
      "Wudang Mountain can easily be reduced to kung fu imagery, but its real potential is more refined. It offers an international traveler a route into Chinese philosophy through movement, mountain order, sacred space, and the feeling of being physically guided into a different tempo.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    highlights: [
      "Taoism and temple landscapes",
      "Movement, stillness, and embodied understanding",
      "A focused niche route for wellness and martial-arts interest",
    ],
    sample: [
      "Use the mountain and temple setting to frame Taoist rhythm and spatial order.",
      "Add beginner-friendly movement or stillness practice as part of the travel narrative.",
      "Shape it into a retreat-style offer for guests drawn to philosophy, ritual, and body-based experience.",
    ],
  },
} as const;

type CitySlug = keyof typeof cityContent;

const defaultCity: CitySlug = "jingdezhen";

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ChatPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const cityParam = pickFirst(searchParams?.city) as CitySlug | undefined;
  const city = cityParam && cityParam in cityContent ? cityParam : defaultCity;
  const content = cityContent[city];
  const interestParam = pickFirst(searchParams?.interests);
  const paceParam = pickFirst(searchParams?.pace);

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f8f1e8] px-6 py-10 text-[#241716]">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[2rem] border border-[#d7bf9d]/70 bg-[#f7ecdd] shadow-[0_24px_80px_-40px_rgba(88,54,19,0.28)]">
          <div
            className="relative min-h-[340px] border-b border-[#dbc8af]/60 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(24,13,10,0.72), rgba(24,13,10,0.12)), url(${content.image})`,
            }}
          >
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <p className="text-sm uppercase tracking-[0.24em] text-white/72">
                {content.eyebrow}
              </p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl">
                {content.title}
              </h1>
            </div>
          </div>

          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#8b6b4b]">
                {content.name} introduction
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f4941] sm:text-[1.05rem]">
                {content.description}
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-[#dcc7ab] bg-[#fbf5ed] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6b4b]">
                  Why this route works
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5f4941] sm:text-[0.98rem]">
                  {content.highlights.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-[#dcc7ab] bg-[#fffaf4] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6b4b]">
                  A sample flow
                </p>
                <ol className="mt-4 space-y-4 text-sm leading-7 text-[#5f4941] sm:text-[0.98rem]">
                  {content.sample.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c08a4a] text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-[1.5rem] border border-[#dcc7ab] bg-[#fffaf4] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6b4b]">
                  Traveler brief
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-7 text-[#5f4941]">
                  <div className="flex items-start justify-between gap-4 border-b border-[#ead9c2] pb-3">
                    <dt>Selected city</dt>
                    <dd className="text-right font-medium text-[#241716]">{content.name}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-[#ead9c2] pb-3">
                    <dt>Interest cues</dt>
                    <dd className="max-w-[14rem] text-right">{interestParam ?? "Craft, culture, local life"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Preferred pace</dt>
                    <dd className="text-right capitalize">{paceParam ?? "Balanced"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[#d7bf9d]/70 bg-[#fffaf4] p-7 shadow-[0_20px_60px_-42px_rgba(88,54,19,0.35)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4b]">
              What happens next
            </p>
            <h2 className="mt-3 font-serif text-3xl text-[#241716]">
              Turn this mood into a real journey.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5f4941]">
              In the finished product, this page becomes the bridge between the emotional first impression and a tailored concierge flow: the traveler shares interests, we narrow the route, then match them to a vetted local expert.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href={`/experts?city=${city.replaceAll("-", "_")}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#2c1b17] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1d100d]"
              >
                Browse experts for {content.name}
              </Link>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#d7bf9d] px-5 py-3 text-sm font-medium text-[#5f4941] transition hover:bg-[#f5eadb]"
              >
                Back to city showcase
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d7bf9d]/70 bg-[#f5eadb] p-7">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4b]">
              V1 page purpose
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5f4941]">
              <li>• Preserve the emotional tone of the homepage.</li>
              <li>• Explain why a city is worth entering more deeply.</li>
              <li>• Translate search intent into a more concrete route shape.</li>
              <li>• Push the traveler toward concierge matching and booking.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
