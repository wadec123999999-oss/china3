# A Deeper China — curated design system

> Project-specific override. This replaces the automatic blue/orange “travel
> agency” recommendation. Use `outputs/site-preview-v0.2/design-dna.json` as the
> full machine-readable source.

## Design thesis

A Deeper China should feel like a small, discerning travel publication that
edits routes for real life. The interface is quiet and specific: warm paper,
black ink, one vermilion decision mark, documentary China photography and
visible editorial rules.

The signature move is not an animation or a dashboard. It is a real itinerary
shown before and after editorial review.

## Commercial hierarchy

1. Ask: `Is your China itinerary actually doable?`
2. Show: one concrete route repaired.
3. Sell: `China Trip Reality Check — US$39`.
4. Expand: `Deep City Roadbook — from US$99`.
5. State: turnaround, revisions and the no-bookings boundary beside the CTA.

## Core tokens

```css
:root {
  --paper: #f5f1e9;
  --paper-deep: #e7e1d6;
  --white: #fbf9f4;
  --ink: #151512;
  --muted: #706a62;
  --accent: #a63d2d;
  --green: #526a56;
  --gold: #b48d4e;
  --serif: 'Instrument Serif', Georgia, serif;
  --sans: 'Manrope', system-ui, sans-serif;
  --mono: 'DM Mono', ui-monospace, monospace;
  --ease: cubic-bezier(.2,.85,.2,1);
  --max: 1240px;
}
```

## Typography

- Display: Instrument Serif, very large, tight tracking, sentence case.
- Body/UI: Manrope, 16px minimum for reading copy.
- Metadata only: DM Mono, 10–11px, restrained uppercase.
- Keep body copy to roughly 65–75 characters per line.

## Layout

- 12-column editorial grid, 1240px maximum width.
- Deliberate asymmetry; generous vertical space.
- Separate sections with 1px rules and tonal fields, not floating cards.
- Desktop hero: copy left, one documentary image right.
- Mobile: preserve type scale and priority; do not compress into tiny cards.

## Components

- Buttons are rectangular, high-contrast and at least 44px high.
- One primary CTA per view: `Check my itinerary`.
- Forms always have visible labels and nearby scope/privacy reassurance.
- Pricing is presented as a ruled service table, not three equal SaaS cards.
- City portfolio is secondary proof; show four launch cities first.

## Photography

- Use owned or licensed documentary photographs from Shanghai, Chongqing,
  Beijing and Chengdu.
- Prefer inhabited streets, urban texture and real scale over landmark clichés.
- Slight desaturation is acceptable; avoid heavy filters and stock overlays.
- Never use invented customer imagery or fake reviewer portraits.

## Motion

- Minimal functional motion only: 160–260ms hover and focus feedback.
- No aurora, gradient mesh, glassmorphism, particles, parallax or custom cursor.
- Respect `prefers-reduced-motion`.

## Forbidden patterns

- Blue/orange generic travel palette.
- Centered SaaS hero followed by three rounded cards.
- Fake AI dashboards, fake metrics or decorative database counts.
- “Hidden gems,” “authentic China,” “AI concierge” or expert-marketplace copy.
- More than one dominant CTA in the same viewport.
- Claims of field verification until a local-review task is actually completed.
