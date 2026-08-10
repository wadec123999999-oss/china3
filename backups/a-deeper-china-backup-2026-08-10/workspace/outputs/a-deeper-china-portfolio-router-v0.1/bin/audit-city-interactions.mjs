#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CITY_INTERACTIONS, cityInteractionAudit, sourceQuestionsForCity } from '../src/city-interactions.mjs';

const root = resolve(process.cwd());
const failures = [];
if (CITY_INTERACTIONS.scope.city_database_count !== 13) failures.push(`expected 13 city databases, got ${CITY_INTERACTIONS.scope.city_database_count}`);
if (CITY_INTERACTIONS.scope.product_unit_count !== 10) failures.push(`expected 10 product units, got ${CITY_INTERACTIONS.scope.product_unit_count}`);
if (CITY_INTERACTIONS.release_policy.field_verified_count !== 0) failures.push('field_verified_count must remain 0 until human evidence exists');

for (const item of CITY_INTERACTIONS.source_databases) {
  if (!existsSync(resolve(root, item.path))) failures.push(`${item.id}: missing source database ${item.path}`);
}

for (const item of cityInteractionAudit()) {
  if (!item.all_database_ids_registered) failures.push(`${item.id}: database id not registered`);
  if (item.question_count < 5) failures.push(`${item.id}: fewer than 5 prioritized questions`);
  if (item.latent_need_count < 3) failures.push(`${item.id}: fewer than 3 latent-need rules`);
  if (item.rule_count < 5) failures.push(`${item.id}: fewer than 5 selection rules`);
  if (sourceQuestionsForCity(item.id).length < 4) failures.push(`${item.id}: source DB follow-up questions unavailable`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS city interaction overlay: ${CITY_INTERACTIONS.scope.city_database_count} city databases / ${CITY_INTERACTIONS.scope.product_unit_count} product units`);
  for (const item of cityInteractionAudit()) console.log(`  ${item.label}: ${item.question_count} prioritized questions; ${item.latent_need_count} latent rules; status=${item.status}`);
}

