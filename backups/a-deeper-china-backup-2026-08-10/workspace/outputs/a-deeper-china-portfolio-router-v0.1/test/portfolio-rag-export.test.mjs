import test from 'node:test';
import assert from 'node:assert/strict';
import { CITY_DATABASES, buildPortfolioRagRecords, summarizePortfolioRag } from '../src/portfolio-rag-export.mjs';

test('portfolio RAG export covers all city databases with stable client-safe boundaries', () => {
  const records = buildPortfolioRagRecords();
  const summary = summarizePortfolioRag(records);
  assert.equal(summary.city_count, CITY_DATABASES.length);
  assert.ok(summary.total_records >= 600);
  assert.equal(summary.field_verified, 0);
  for (const city of CITY_DATABASES) {
    assert.ok(summary.by_city[city.id] >= 40, `${city.id} needs a substantive RAG export`);
  }
  for (const record of records) {
    assert.ok(record.id && record.title && record.text);
    assert.equal(record.language, 'en');
    assert.ok(record.metadata.release_boundary);
    assert.equal(record.verification.field_status === 'field_verified', false);
  }
});

test('portfolio RAG export retains external source provenance without promoting a dynamic source to field evidence', () => {
  const records = buildPortfolioRagRecords();
  const withExternalSource = records.filter((item) => item.source_url);
  assert.ok(withExternalSource.length >= 100);
  assert.ok(withExternalSource.some((item) => item.metadata.dynamic_check_required));
  assert.ok(withExternalSource.every((item) => item.verification.field_status !== 'field_verified'));
});
