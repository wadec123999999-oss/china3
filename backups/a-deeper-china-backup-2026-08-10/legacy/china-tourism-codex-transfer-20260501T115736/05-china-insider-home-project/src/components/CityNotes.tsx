import { CITIES, CITY_DETAILS, CITY_NOTES } from "@/lib/constants";

export function CityNotes() {
  return (
    <section id="cities" className="space-y-4 pt-16">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-black/55">
        First launch cities
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CITIES.map((city) => (
          <a
            key={city}
            className="rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            href={`/cities/${CITY_DETAILS[city].slug}`}
          >
            <p className="font-medium text-black">{city}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">{CITY_NOTES[city]}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
