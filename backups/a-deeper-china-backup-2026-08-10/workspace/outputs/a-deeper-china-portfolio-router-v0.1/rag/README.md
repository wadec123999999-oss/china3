# Portfolio RAG V1

This directory is the portable, auditable knowledge layer for all 13 active city databases. It is generated from the city decision databases; it does not modify the public website or declare any route field-verified.

## Files

- `portfolio-city-knowledge-v1.jsonl` — 13-city, English-first retrieval records.
- `portfolio-city-knowledge-v1.summary.json` — coverage and evidence counts.
- `portfolio-rag-field-worklist-v1.json` — live review tasks for local reviewers.

## Record rules

Every record includes:

- a stable city and record identifier;
- a release boundary;
- a verification state;
- source provenance when an external source is available;
- a dynamic-review flag when current confirmation is required.

`field_verified` must remain false until a dated evidence record has been approved. A source URL proves only that a source exists; it does not prove current availability, access, pricing, safety, or an experience booking.

## Commands

```bash
npm run audit:portfolio-rag
npm run export:portfolio-rag
npm run worklist:portfolio-rag
```

## Website import boundary

This is a source package, not a production import by itself. Before inserting it into the website's Supabase RAG table, the site needs to:

1. add the six currently missing city slugs to its destination model;
2. preserve `source_url`, `source_confidence`, `provenance`, and `verification` rather than discarding them during import;
3. keep dynamic and field-review records out of a client-facing factual answer unless a current review has been completed;
4. run retrieval evaluation against real traveller questions.
