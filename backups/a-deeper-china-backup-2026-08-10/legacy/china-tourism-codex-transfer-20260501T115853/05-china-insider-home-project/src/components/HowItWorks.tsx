export function HowItWorks() {
  return (
    <section className="space-y-4 pt-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-black/55">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            One screen from curiosity to a local match
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-black/60">
          The demo stays intentionally narrow so the core value is obvious in one glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["1. Say what you love", "Tell the concierge about food, art, history, tea, or any niche interest."],
          ["2. Narrow the brief", "The system turns your answer into a clear city, category, and depth signal."],
          ["3. See a match", "A vetted expert card appears with a real city, role, and booking path."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-black/85">{title}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
