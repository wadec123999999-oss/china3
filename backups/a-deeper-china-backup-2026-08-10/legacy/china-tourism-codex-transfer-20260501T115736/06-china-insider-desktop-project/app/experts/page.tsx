import { ExpertCard } from "@/components/marketing/expert-card";
import { CATEGORIES, FIRST_BATCH_CITIES } from "@/lib/constants";
import { formatCategory, formatCity } from "@/lib/format";
import { mockExperts } from "@/lib/mock-data";

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ExpertsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const city = pickFirst(searchParams?.city);
  const category = pickFirst(searchParams?.category);

  const filteredExperts = mockExperts.filter((expert) => {
    const cityMatch = city ? expert.city === city : true;
    const categoryMatch = category
      ? expert.categories.includes(
          category as (typeof expert.categories)[number],
        )
      : true;

    return cityMatch && categoryMatch;
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Expert directory</p>
        <h1 className="text-3xl font-semibold">
          Browse a curated first batch of local experts
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          These founder-curated mock profiles are here to demonstrate taste,
          category coverage, pricing shape, and how the V1 browsing flow should
          feel.
        </p>
      </div>

      <section className="mt-8 rounded-3xl border bg-muted/30 p-6">
        <form
          action="/experts"
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="city">
              City
            </label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              defaultValue={city}
              id="city"
              name="city"
            >
              <option value="">All first-batch cities</option>
              {FIRST_BATCH_CITIES.map((item) => (
                <option key={item} value={item}>
                  {formatCity(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="category">
              Category
            </label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              defaultValue={category}
              id="category"
              name="category"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {formatCategory(item)}
                </option>
              ))}
            </select>
          </div>

          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background"
            type="submit"
          >
            Update shortlist
          </button>
        </form>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>{filteredExperts.length} expert profiles</p>
        <p>Curated demo directory</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {filteredExperts.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
      </div>
    </main>
  );
}
