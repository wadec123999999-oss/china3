import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const runtime = path.resolve(here, '..');

test('field-progress works when invoked from outside the runtime directory', () => {
  const result = spawnSync(process.execPath, [path.join(runtime, 'bin/field-progress.mjs')], {
    cwd: path.resolve(runtime, '../..'),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.totalRuns, 0);
  assert.equal(report.taiChiSellable, false);
  assert.equal(report.launchChecks.every(item => item.ready === false), true);
});
