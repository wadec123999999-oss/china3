#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const quality = path.resolve(root, '../a-deeper-china-quality-system-v0.1');
const checks = [
  { name: 'source-pack audit', cwd: quality, command: 'node', args: ['source-pack-audit.mjs', '--as-of', '2026-08-03T23:59:59+08:00'] },
  { name: 'quality-system tests', cwd: quality, command: 'node', args: ['--test', '*.test.mjs'], shell: true },
  { name: 'public sample contract audit', cwd: root, command: 'node', args: ['bin/audit-public-samples.mjs'] },
  { name: 'city database audit', cwd: root, command: 'node', args: ['bin/audit-city-databases.mjs'] },
  { name: 'city interaction overlay audit', cwd: root, command: 'node', args: ['bin/audit-city-interactions.mjs'] },
  { name: 'retrieval audit', cwd: root, command: 'node', args: ['bin/audit-retrieval.mjs'] },
  { name: 'runtime audit', cwd: root, command: 'node', args: ['bin/audit-runtimes.mjs'] },
  { name: 'portfolio tests', cwd: root, command: 'npm', args: ['test'] }
];

const results = [];
for (const check of checks) {
  process.stdout.write(`\n== ${check.name} ==\n`);
  try {
    const output = execFileSync(check.command, check.args, {
      cwd: check.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: check.shell === true
    });
    process.stdout.write(output);
    results.push({ name: check.name, passed: true });
  } catch (error) {
    process.stdout.write(error.stdout?.toString() || '');
    process.stderr.write(error.stderr?.toString() || '');
    results.push({ name: check.name, passed: false, exit_code: error.status ?? 1 });
    break;
  }
}

const passed = results.every(item => item.passed) && results.length === checks.length;
process.stdout.write(`\nAUDIT ALL ${passed ? 'PASS' : 'FAIL'}: ${results.filter(item => item.passed).length}/${checks.length}\n`);
if (!passed) process.exitCode = 1;
