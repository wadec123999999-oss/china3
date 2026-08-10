import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('source-record contract explicitly permits bounded community leads',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const schema=JSON.parse(fs.readFileSync(path.join(here,'source-record.schema.json'),'utf8'));
  assert.ok(schema.properties.platform.enum.includes('xiaohongshu'));
  assert.ok(schema.properties.platform.enum.includes('mafengwo'));
  assert.ok(schema.properties.platform.enum.includes('qyer'));
  assert.ok(schema.properties.review_status.enum.includes('community_signal_only'));
  assert.equal(schema.properties.module_ids.maxItems,8);
});
