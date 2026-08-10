import Image from "next/image";
import VoiceDemo from "@/components/VoiceDemo";
import { CityNotes } from "@/components/CityNotes";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustBar } from "@/components/TrustBar";
import { CITIES, CITY_CARDS, CITY_DETAILS } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#111111]">
      <section className="mx-auto max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-black/50">
            <span className="rounded-full border border-black/10 bg-white px-3 py-2">
              China Insider demo
            </span>
            <span className="rounded-full border border-black/10 bg-white px-3 py-2">
              English voice concierge
            </span>
            <span className="rounded-full border border-black/10 bg-white px-3 py-2">
              5 launch cities, more later
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-black/55">
                China, Closely
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                A Deeper China
              </h1>
              <p className="max-w-2xl text-base leading-7 text-black/70 sm:text-lg">
                China, Closely: See the unseen.
              </p>
              <p className="max-w-xl text-base leading-7 text-black/65 sm:text-lg">
                China Insider matches English-speaking travelers with vetted local experts
                for deep-interest experiences in China, starting with a fast voice-style intake.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
                  href="#voice-demo"
                >
                  Start voice match
                </a>
                <a
                  className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-black/80"
                  href="/#cities"
                >
                  Explore cities
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5">
              {CITIES.map((city) => (
                <a
                  key={city}
                  className="group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  href={`/cities/${CITY_DETAILS[city].slug}`}
                >
                  <div className="relative h-28">
                    <Image
                      alt={city}
                      className="object-cover transition duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1280px) 20vw, 180px"
                      src={CITY_CARDS[city].image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <p className="absolute left-3 top-3 text-xs uppercase tracking-[0.18em] text-white/85">
                      {city}
                    </p>
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="text-sm font-medium text-black">{city}</p>
                    <p className="text-xs leading-5 text-black/60">{CITY_CARDS[city].note}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <TrustBar />
        </div>

        <div className="pt-10">
          <VoiceDemo />
        </div>

        <HowItWorks />
        <CityNotes />
      </section>
    </main>
  );
}
