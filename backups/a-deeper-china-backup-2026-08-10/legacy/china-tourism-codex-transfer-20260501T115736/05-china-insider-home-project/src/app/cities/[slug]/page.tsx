import { notFound } from "next/navigation";
import Image from "next/image";
import { CITIES, CITY_CARDS, CITY_DETAILS, CITIES_BY_SLUG } from "@/lib/constants";
import { demoExperts } from "@/lib/demo-data";

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: CITY_DETAILS[city].slug }));
}

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = CITIES_BY_SLUG[slug];
  if (!city) notFound();

  const details = CITY_DETAILS[city];
  const expert = demoExperts.find((item) => item.city === city) ?? null;

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#111111]">
      <section className="mx-auto max-w-5xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="mb-6 flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.2em] text-black/50">
          <a className="rounded-full border border-black/10 bg-white px-3 py-2" href="/">
            China Insider demo
          </a>
          <a className="rounded-full border border-black/10 bg-white px-3 py-2" href="/#voice-demo">
            Start voice match
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-black/55">
              City detail
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{city}</h1>
            <p className="max-w-2xl text-lg leading-8 text-black/70">{details.intro}</p>

            <div className="flex flex-wrap gap-2 pt-2 text-sm text-black/65">
              {details.highlights.map((highlight) => (
                <span key={highlight} className="rounded-full border border-black/10 px-3 py-1">
                  {highlight}
                </span>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-black/50">
                Why this city
              </p>
              <p className="mt-3 text-sm leading-6 text-black/65">{CITY_CARDS[city].note}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
              <div className="relative h-72">
                <Image alt={city} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" src={CITY_CARDS[city].image} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/75">Featured city</p>
                  <p className="mt-2 text-2xl font-semibold">{city}</p>
                  <p className="mt-1 text-sm text-white/85">{details.highlights[0]}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-black/50">
                Featured expert
              </p>
              {expert ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="font-medium text-black">{expert.name}</p>
                    <p className="text-sm text-black/65">{expert.role}</p>
                  </div>
                  <p className="text-sm leading-6 text-black/65">{expert.shortBio}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-black/65">
                    <span className="rounded-full border border-black/10 px-3 py-1">
                      From ${expert.pricePerDayUsd}/day
                    </span>
                    <span className="rounded-full border border-black/10 px-3 py-1">
                      {expert.videoLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-black/60">No featured expert yet.</p>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-black/10 bg-[#fbfaf7] p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-black/50">
                Next step
              </p>
              <p className="mt-3 text-sm leading-6 text-black/65">
                Use this city page as the destination for the homepage tile, then continue into the
                voice demo to refine the trip brief and request a booking.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white" href="/#voice-demo">
                  Start voice match
                </a>
                <a className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black/75" href="/">
                  Back home
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
