#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRuntimeInput } from '../src/runtime-input.mjs';
import { createRoadbookBrief } from '../src/roadbook-brief.mjs';
import { dispatchRuntime, renderRuntimeRoadbook } from '../src/runtime-dispatch.mjs';
import { createRoutePreview } from '../src/roadbook-preview.mjs';
import { validateRoutePreview } from '../src/route-preview-contract.mjs';

export async function generateClientRoadbook(input = {}) {
  const handoff = buildRuntimeInput(input);
  if (!handoff.valid) {
    return { valid: false, stage: 'runtime_input', errors: handoff.errors, runtime_choices: handoff.runtime_choices };
  }

  const dispatch = await dispatchRuntime(handoff);
  if (!dispatch.valid) return { valid: false, stage: 'dispatch', errors: dispatch.errors };

  const moduleIds = Array.isArray(input.module_ids) && input.module_ids.length
    ? input.module_ids
    : dispatch.selected_module_ids;
  const brief = createRoadbookBrief({ ...input, module_ids: moduleIds });
  const markdown = await renderRuntimeRoadbook(handoff);
  return {
    valid: true,
    status: brief.status,
    city_unit: input.city_unit,
    runtime: handoff.runtime,
    selected_module_ids: dispatch.selected_module_ids,
    commercial: dispatch.commercial,
    release_assessment: brief.release_assessment,
    required_before_human_review_signature: brief.required_before_human_review_signature,
    hypotheses_to_confirm: brief.hypotheses_to_confirm,
    markdown
  };
}

export async function generateRoutePreview(input = {}) {
  const full = await generateClientRoadbook(input);
  const preview = createRoutePreview({ full, input });
  if (!preview.valid) return preview;
  const contract = validateRoutePreview(preview);
  return contract.valid ? preview : { valid: false, stage: 'route_preview_contract', errors: contract.errors };
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args.find(arg => !arg.startsWith('--'));
  const markdownOnly = args.includes('--markdown');
  if (!inputPath) {
    process.stderr.write('Usage: npm run client-roadbook -- path/to/client-brief.json [--markdown]\n');
    process.exitCode = 2;
    return;
  }
  const inputText = inputPath === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.resolve(inputPath), 'utf8');
  const input = JSON.parse(inputText);
  const previewOnly = args.includes('--preview');
  const result = previewOnly ? await generateRoutePreview(input) : await generateClientRoadbook(input);
  if (markdownOnly && result.valid) process.stdout.write(`${result.markdown.trim()}\n`);
  else process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
