import { buildPortfolioRagRecords, CITY_DATABASES, summarizePortfolioRag } from '../src/portfolio-rag-export.mjs';

const records = buildPortfolioRagRecords();
const summary = summarizePortfolioRag(records);
const errors = [];
const warnings = [];
const cityIds = new Set(CITY_DATABASES.map((city) => city.id));
const seen = new Set();

for (const record of records) {
  if (seen.has(record.id)) errors.push(`Duplicate id: ${record.id}`);
  seen.add(record.id);
  if (!cityIds.has(record.destination_slug)) errors.push(`Unsupported city: ${record.destination_slug}`);
  if (!record.title || !record.text) errors.push(`Empty retrieval content: ${record.id}`);
  if (!record.metadata?.release_boundary) errors.push(`Missing release boundary: ${record.id}`);
  if (record.verification?.field_status === 'field_verified') errors.push(`Unexpected field_verified record: ${record.id}`);
  if (record.source_url && !/^https:\/\//.test(record.source_url)) errors.push(`Malformed external source URL: ${record.id}`);
  if (record.metadata?.dynamic_check_required && record.verification?.client_safe_as_static_fact) warnings.push(`Dynamic record must be reviewed before client delivery: ${record.id}`);
}

for (const city of CITY_DATABASES) {
  const count = summary.by_city[city.id] || 0;
  if (count < 40) errors.push(`Insufficient city coverage: ${city.id} has ${count} records`);
}

const result = { valid: errors.length === 0, summary, errors, warnings };
console.log(JSON.stringify(result, null, 2));
if (!result.valid) process.exitCode = 1;
