# A Deeper China Portfolio Router V0.1

Small, deterministic first layer for the independent-travel agent. It does **not** create an itinerary. It narrows city units, applies minimum-stay and scope rules, and exposes human-review boundaries before a city database generates a route.

## Run

```bash
npm run validate
npm test
npm run route
npm run audit:cities
npm run audit:runtimes
```

Pass a JSON request file as the first argument:

```json
{
  "nights": 3,
  "interests": ["tea", "landscape"],
  "constraints": ["private_access"]
}
```

```bash
npm run route -- request.json
```

Generate a customer-facing research roadbook from a complete client brief:

```bash
npm run client-roadbook -- path/to/client-brief.json
```

The command composes runtime selection, release assessment and the customer-facing Markdown draft. It remains `research_draft` until dated human-check evidence satisfies the release gate.

For customer delivery, print only the safe Markdown layer:

```bash
npm run client-roadbook -- path/to/client-brief.json --markdown
```

Generate the free lead-generation preview. It exposes the route direction,
client fit and one or two candidate modules, but deliberately omits the
complete day-by-day route:

```bash
npm run route-preview -- path/to/client-brief.json
```

The same preview is available to a future site adapter at `POST /api/route-preview`.
It cannot accept payment, quote, promise availability or expose internal module
IDs. The paid roadbook remains the separate `client-roadbook` output.

Score a Markdown roadbook's decision-led structure before customer delivery:

```bash
npm run score-roadbook -- path/to/roadbook.md
```

Validate the free preview contract before returning it from the site API:

```bash
npm run validate-route-preview -- path/to/preview.json
```

Prepare a human-review packet with the release evidence gaps and a blank review record:

```bash
npm run review-packet -- path/to/client-brief.json --markdown
```

The review packet now includes `current_source_tasks`: empty, date-bound tasks generated from the city's dated source-refresh file. They are not evidence until a reviewer fills `checked_by`, `checked_at`, `evidence_url` and `finding` for the exact client dates.

Both client-roadbook commands also accept `-` in place of the file path when JSON is piped on standard input.

The resulting `research_draft` must feed into the city-specific databases, the `travel_brief` schema and, when applicable, human review. It must never be represented as a live booking, safety guarantee or confirmed experience.

The site API now adds a customer-facing decision layer to legacy city renderers: route thesis, deliberate trade-offs, fallback logic and checks required before delivery. Shanghai has a city-specific V1.1 renderer; the other city runtimes receive the shared enhancement layer without exposing internal module IDs or raw source records.

`extractPortfolioRequest(text)` is a deliberately small first-pass helper for turning natural-language text into `cities`, `interests`, `nights`, and high-risk constraints. It is not a replacement for the language model or customer confirmation. In particular, private-access, booking, mobility, medical and allergy language must remain guarded and prompt human review.

`npm run audit:cities` checks the 13 current city databases for loadability, required collections, minimum dataset size and duplicate IDs. It deliberately accepts legacy Shanghai/Chongqing field names without rewriting their source content; it is a structural health check, not proof of live travel accuracy or field verification.

`npm run audit:runtimes` runs the validation, regression (where a package exposes it), and test commands for all 13 city runtimes. It accepts legacy script naming such as Shanghai's `validate:v1` and packages where regressions are folded into tests.
## Roadbook release bridge

After a city runtime chooses concrete module IDs, pass them to `bin/release.mjs`. It returns `draft_only` until a required current source or human dynamic-check task is recorded, and only then returns `human_checked_ready`. This does not enable booking or experience sales.
