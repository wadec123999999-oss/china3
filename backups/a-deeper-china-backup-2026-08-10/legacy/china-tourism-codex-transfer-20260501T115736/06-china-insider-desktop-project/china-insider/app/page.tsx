"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cityShowcase } from "@/lib/city-showcase";
import { en } from "@/lib/i18n/en";

const curatedCities = [
  "beijing",
  "chongqing",
  "chengdu",
  "jingdezhen",
  "quanzhou",
  "jingmai-mountain",
  "wudang-mountain",
] as const;

export default function Home() {
  const router = useRouter();

  const orderedCities = curatedCities
    .map((slug) => cityShowcase.find((city) => city.slug === slug))
    .filter((city): city is (typeof cityShowcase)[number] => Boolean(city));

  return (
    <main className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#fff8f7] px-6 pb-3 text-[#261816]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/hero-bg.png"
          alt="Hero background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="scale-[1.03] object-cover object-center blur-[8px] saturate-[0.24] sepia-[0.38] brightness-[1] contrast-[0.58] hue-rotate-[350deg]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,251,240,0.38),rgba(245,231,200,0.3)_20%,rgba(238,220,176,0.3)_44%,rgba(250,239,214,0.5)_68%,rgba(252,246,233,0.82)),radial-gradient(circle_at_16%_24%,rgba(255,247,228,0.26),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(232,192,112,0.12),transparent_18%),radial-gradient(circle_at_50%_18%,rgba(255,250,243,0.3),transparent_28%),radial-gradient(circle_at_42%_38%,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_60%_34%,rgba(240,202,118,0.1),transparent_18%)]" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-76px)] flex-col justify-between">
        <section className="grain-overlay relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen overflow-hidden bg-transparent px-6 pt-8 pb-2">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fff4e6]/62 via-[#fff4e8]/24 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[250px] max-w-4xl flex-col items-center justify-start pt-44 text-center sm:min-h-[280px] sm:pt-48">
            <h1 className="mx-auto max-w-4xl font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#261816] sm:text-7xl lg:text-[5.2rem]">
              {en.site.name}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#725b57] sm:mt-4 sm:text-xl sm:leading-8">
              Discover the nuanced heritage, untold stories, and tactile
              artistry of a land where antiquity meets tomorrow.
            </p>
          </div>
        </section>

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-end pb-3">
          <section className="grid gap-3 md:grid-cols-7">
            {orderedCities.map((city) => (
              <Link
                key={city.slug}
                href={city.href}
                className="group relative block min-h-[152px] overflow-hidden rounded-[0.2rem] border border-[#d8c29a]/55 bg-[#fff8f7] text-left shadow-[0_10px_40px_-18px_rgba(110,78,28,0.12)] sm:min-h-[164px]"
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, 14vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(38,24,22,0.76),rgba(38,24,22,0.14)_42%,transparent)]" />
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <h3 className="font-serif text-[1.42rem] text-white">
                    {city.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4.5 text-white/70">
                    {city.blurb}
                  </p>
                </div>
              </Link>
            ))}
          </section>

          <section className="mt-3 flex justify-center">
            <form
              className="group block w-full max-w-3xl rounded-[999px] border border-[#d9d9d9] bg-[#f4f4f1]/94 p-2.5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:shadow-[0_28px_64px_-26px_rgba(0,0,0,0.2)]"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const query = String(formData.get("q") ?? "").trim();
                router.push(
                  query ? `/chat?q=${encodeURIComponent(query)}` : "/chat",
                );
              }}
            >
              <div className="rounded-[999px] border border-white/80 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(245,244,239,0.95))] px-4 py-2.5 sm:px-5 sm:py-3">
                <div className="flex items-center gap-3 rounded-[999px] bg-white/92 px-4 py-2.5 text-left text-[#5b554d] shadow-[0_10px_30px_-18px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <span className="text-lg text-[#8e867b]">⌕</span>
                  <input
                    name="q"
                    type="text"
                    placeholder="Search for a deeper China journey"
                    className="w-full bg-transparent text-[15px] text-[#5b554d] outline-none placeholder:text-[#8e867b] sm:text-base"
                  />
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
