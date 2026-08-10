import { CITIES } from "@/lib/constants";

export function SitesSection() {
  return (
    <div id="cities" className="space-y-4 pb-10 pt-16">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-black/55">
        First launch cities
      </p>
      <div className="flex flex-wrap gap-3">
        {CITIES.map((city) => (
          <span key={city} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">
            {city}
          </span>
        ))}
      </div>
    </div>
  );
}
