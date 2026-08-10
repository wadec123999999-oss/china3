# Field-records directory

This directory is for real, post-visit records only.

1. Generate a draft from the database field plan, for example: `node ../bin/new-field-record.mjs RUN001`.
2. Fill `RUN001.draft.json` with real field evidence, then rename it to `RUN001.json` only when ready for validation.
3. Never mark a record `pass` before replacing every blank/example value with real evidence.
4. Keep the original photos, tracks, screenshots and written replies in a durable folder; put their stable reference in `evidence[].reference`.
5. Run `node ../bin/validate-field-record.mjs RUN001.json` from this directory, or pass the absolute path from anywhere.

`*.example.json` and `*.draft.json` files are deliberately ignored by the progress command. They never count as evidence or a passed run.
