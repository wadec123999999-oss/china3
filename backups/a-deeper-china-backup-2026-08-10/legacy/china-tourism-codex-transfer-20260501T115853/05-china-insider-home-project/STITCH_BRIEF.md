# China Insider — Stitch Brief

## One-line product definition
Foreign travelers speak English into a voice AI to say what they want, and the AI matches them with a China-based driver / local host / expert who can deliver a deep, interest-led experience.

## Brand
- Main title: **A Deeper China**
- Subtitle / brand line: **China, Closely**
- Tagline: **China, Closely: See the unseen.**
- Tone: premium, calm, editorial, travel-led, discovery-first

## Core role of the product
This is not a travel agency, not an OTA, and not a marketplace for generic tours.
It is an **interest-matching and experience-design layer**:
- understand what the traveler is deeply interested in
- route them to the right city and the right person
- package that into a high-quality, bookable experience
- keep quality control and trust high

## MVP shape
The first version should be a tight loop:
1. Visitor lands on the homepage
2. They start a voice conversation in English
3. AI extracts structured interests, city fit, day count, and budget
4. The system shows matched local experts / drivers / hosts
5. User can request to book or leave contact info
6. The experience is designed to be extensible to more cities later

## What the product should feel like
- A visually strong landing page
- A small set of city preview tiles near the top
- A very obvious voice CTA
- A clear matched-expert card
- A simple, elegant, scalable structure

## Initial launch cities
Start with only these 5 cities:
- Beijing
- Jingdezhen
- Chengdu
- Chongqing
- Quanzhou

These are the first launch cities. The architecture must support adding many more cities later without redesigning the whole product.

## Expansion requirement
This project must preserve extensibility from the beginning.
The first version launches with 5 cities, but later it should be able to grow into many more cities.
The design, information architecture, data structure, and navigation should all assume future city expansion.
Do not build the homepage or city system in a way that only works for five fixed cities.

## Why these cities
- **Beijing** — history, traditional Chinese medicine, calligraphy, hutong photography
- **Jingdezhen** — porcelain and kiln culture
- **Chengdu** — Sichuan food and tea culture
- **Chongqing** — photography, city texture, river and night scenes
- **Quanzhou** — Maritime Silk Road, local history, multi-religious heritage

## Future expansion direction
After the 5-city MVP works, the system can expand into more cities and themes such as:
- tea regions
- martial arts / kung fu
- Chinese medicine
- history / architecture
- silk / embroidery
- photography / street culture

Do not build all of that now. Keep the first version focused, but make the structure ready for many more cities later.

## Suggested product promise
- “Tell us what you love.”
- “We match you with someone in China who lives it.”
- “See the unseen.”

## Main homepage structure
### 1. Hero
- Title: **A Deeper China**
- Subtitle / brand line: **China, Closely**
- Tagline: **China, Closely: See the unseen.**
- Short supporting paragraph about matching travelers with vetted local experts

### 2. City image tiles
- A small row/grid of 5 city tiles for the first launch version
- Simple, replaceable visuals
- Easy to swap in user-provided images later
- Clicking a tile should jump somewhere useful, such as the city notes section or a city page later
- The tile system should be designed so more cities can be added later without redesigning the section

### 3. Voice entry point
- Primary button: **Start voice match**
- Sample prompt buttons
- Visible transcript / conversation panel
- Matching status
- Matched expert result card

### 4. City notes section
- A short summary card grid for the 5 launch cities
- Keep it lightweight and editorial
- This section should also be extensible so more city cards can be added later

## Voice interaction behavior
The first voice experience should do only one thing well:
- uncover the traveler’s true interest
- translate it into structured signals
- trigger a match

Good outputs from the conversation:
- interest tags
- city recommendation
- rough duration
- budget range
- preferred pace
- depth level

Do not overbuild the AI flow in v1.

## Matching logic
The product should support a simple matching pipeline:
- user interest brief
- city fit
- category tags
- expert shortlist
- 3 candidate experts shown to the user

The expert system must remain extensible.

## Expert profile concept
Each expert/host may include:
- name
- city
- languages
- specialty tags
- years of experience
- whether they have a car / driver service
- rate
- short bio
- intro video
- reviews
- availability

For the MVP, the exact schema can stay simple as long as it supports future expansion.

## Important business constraints
- The company is a **matchmaker + experience designer + quality gate**, not the operator of the tour itself.
- Fulfillment is done by the host / driver / expert.
- Keep the product trust-heavy and premium.
- Do not add a complex booking system too early.
- Do not build a full app or giant backend before the core loop works.

## Design guidance for Stitch
- Make it feel like a premium travel brand, not a directory.
- Keep the homepage clean and spacious.
- Use city tiles as visual entry points.
- Keep the voice CTA prominent.
- Keep the matched expert card visually distinct.
- Use placeholder visuals if needed, but keep the layout easy to replace.
- Ensure the structure can scale from 5 cities to many cities later.
- Keep the city system modular so future city pages, filters, and categories can be added cleanly.

## Extensibility requirements
The design and information architecture should support:
- many more cities later
- more interest categories
- more experts per city
- future city pages
- future booking flow
- future payment and deposit flow

## What to avoid in the first version
- Don’t launch all 7+ cities at once
- Don’t add payments before the core experience is clear
- Don’t add multi-language support yet
- Don’t build a full mobile app yet
- Don’t turn this into a generic travel marketplace

## Useful implementation notes
- The city data should be centralized so one list can power tiles, notes, and future pages.
- City images should be easy to replace.
- The voice UI should be the main interaction, not an accessory.
- The homepage should immediately communicate: travel, depth, matching, trust.
- The city section should not be hard-coded in a way that blocks future expansion.

## Recommended Stitch output
Ask Stitch to generate:
- a polished homepage
- 5 city image tiles for the initial version
- a prominent voice CTA panel
- a matched expert card
- a simple city notes section
- a structure that is clearly extensible to many more cities later

Keep it elegant, minimal, and easy to expand.
