#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRuntimeInput } from '../src/runtime-input.mjs';
import { createRoadbookBrief } from '../src/roadbook-brief.mjs';
import { dispatchRuntime, renderRuntimeRoadbook } from '../src/runtime-dispatch.mjs';
import { createPublicRoadbook } from '../src/roadbook-enhancer.mjs';
import { assessRoadbookRelease } from '../../a-deeper-china-quality-system-v0.1/roadbook-release-gate.mjs';
import { auditAllManifestPacks } from '../../a-deeper-china-quality-system-v0.1/source-pack-audit.mjs';
import { createCurrentSourceTasks } from '../src/current-source-tasks.mjs';
import { currentSourceWorklistToEvidence } from '../src/current-source-worklist-evidence.mjs';

export async function createHumanReviewPacket(input = {}) {
  const handoff = buildRuntimeInput(input);
  if (!handoff.valid) return { valid: false, stage: 'runtime_input', errors: handoff.errors };
  const dispatch = await dispatchRuntime(handoff);
  if (!dispatch.valid) return { valid: false, stage: 'dispatch', errors: dispatch.errors };
  const moduleIds = Array.isArray(input.module_ids) && input.module_ids.length ? input.module_ids : dispatch.selected_module_ids;
  const worklistConversion = input.current_source_worklist
    ? currentSourceWorklistToEvidence(input.current_source_worklist, { travelStart: input.travel?.start_date })
    : { valid: true, evidence: [], errors: [], pending_count: 0 };
  const mergedEvidenceRecords = [
    ...(Array.isArray(input.evidence_records) ? input.evidence_records : []),
    ...worklistConversion.evidence
  ];
  const brief = createRoadbookBrief({ ...input, module_ids: moduleIds, evidence_records: mergedEvidenceRecords });
  const release = assessRoadbookRelease({
    city: dispatch.city,
    module_ids: moduleIds,
    current_source_ids: worklistConversion.evidence.map(item => item.id)
  });
  const sourceAudit = auditAllManifestPacks({ asOf: '2026-08-03T23:59:59+08:00' });
  const citySourceAudit = sourceAudit.results.find(item => item.city === dispatch.city) || {
    city: dispatch.city,
    valid: false,
    as_of: '2026-08-03T23:59:59+08:00',
    count: 0,
    errors: [`No source-pack audit result for ${dispatch.city}`],
    warnings: []
  };
  const markdown = await renderRuntimeRoadbook(handoff);
  const currentSourceTasks = createCurrentSourceTasks({
    city: dispatch.city,
    module_ids: moduleIds,
    travel_start: input.travel?.start_date,
    travel_end: input.travel?.end_date
  });
  const publicRoadbook = createPublicRoadbook({
    runtime: handoff.runtime,
    decision: dispatch,
    tripContext: handoff.trip_context,
    markdown
  });
  const blockedModules = release.modules.filter(item => item.status === 'blocked');
  const requiredCheckIds = [...new Set(blockedModules.flatMap(item => item.required_checks || []))];
  const acceptableSourceIds = [...new Set(blockedModules.flatMap(item => item.acceptable_current_sources || []))];
  return {
    valid: true,
    status: release.status,
    city_unit: input.city_unit,
    city: dispatch.city,
    runtime: handoff.runtime,
    travel: input.travel || {},
    selected_module_ids: moduleIds,
    research_roadbook_markdown: markdown,
    public_roadbook: publicRoadbook,
    human_readable_checks: publicRoadbook.checks_before_delivery,
    release_assessment: release,
    source_pack_audit: {
      valid: citySourceAudit.valid,
      as_of: citySourceAudit.as_of,
      record_count: citySourceAudit.count,
      errors: citySourceAudit.errors,
      warnings: citySourceAudit.warnings,
      interpretation: 'Structure and boundary audit only; this does not prove field verification or current access.'
    },
    current_source_tasks: currentSourceTasks,
    current_source_worklist_conversion: worklistConversion,
    evidence_records_used: mergedEvidenceRecords,
    required_check_ids: requiredCheckIds,
    acceptable_current_source_ids: acceptableSourceIds,
    review_record_template: {
      schema_version: '0.1',
      review_id: 'RBR-TO-BE-SET',
      city_unit: input.city_unit,
      city: dispatch.city,
      module_ids: moduleIds,
      travel_start: input.travel?.start_date || null,
      travel_end: input.travel?.end_date || null,
      reviewed_at: null,
      reviewer: null,
      completed_check_ids: [],
      completed_field_module_ids: [],
      current_source_ids: worklistConversion.evidence.map(item => item.id),
      evidence_links: [],
      decision: 'draft_only',
      notes: ''
    },
    customer_brief_status: brief.status
  };
}

function renderPacketMarkdown(packet) {
  const lines = [
    packet.research_roadbook_markdown.trim(),
    '',
    '---',
    '',
    '# Human review packet',
    '',
    `**Status:** ${packet.status}`,
    `**City:** ${packet.city}`,
    `**Travel:** ${packet.travel.start_date || 'to confirm'} → ${packet.travel.end_date || 'to confirm'}`,
    '',
    '## Required dynamic checks',
    ...(packet.required_check_ids.length ? packet.required_check_ids.map(id => `- ${id}`) : ['- No blocking check IDs were derived.']),
    '',
    '## Acceptable current-source records',
    ...(packet.acceptable_current_source_ids.length ? packet.acceptable_current_source_ids.map(id => `- ${id}`) : ['- No current-source IDs were listed.']),
    '',
    '## Human-readable checks before delivery',
    ...(packet.human_readable_checks.length ? packet.human_readable_checks.map(item => `- ${item}`) : ['- No additional checks were derived.']),
    '',
    '## Source-pack audit',
    `- Structure audit: ${packet.source_pack_audit.valid ? 'pass' : 'fail'}`,
    `- Records in the city-scoped pack: ${packet.source_pack_audit.record_count}`,
    `- Audited as of: ${packet.source_pack_audit.as_of}`,
    `- Interpretation: ${packet.source_pack_audit.interpretation}`,
    ...(packet.source_pack_audit.errors.length ? packet.source_pack_audit.errors.map(item => `- Error: ${item}`) : []),
    ...(packet.source_pack_audit.warnings.length ? packet.source_pack_audit.warnings.map(item => `- Warning: ${item}`) : []),
    '',
    '## Current-source tasks for these travel dates',
    `- Task status: ${packet.current_source_tasks.status}`,
    `- Empty tasks generated: ${packet.current_source_tasks.tasks.length}`,
    '- A reviewer must fill checked_by, checked_at, evidence_url and finding for each task before using it as evidence.',
    ...(packet.current_source_tasks.tasks.length ? packet.current_source_tasks.tasks.map(task => `- ${task.task_id}: ${task.claim_to_check}`) : ['- No dynamic source task was selected for the requested module scope.']),
    '',
    '## Reviewer must complete',
    '- Record who checked the details and when.',
    '- Attach official pages, screenshots, call records or field evidence.',
    '- Confirm the evidence applies to the client’s exact travel dates.',
    '- Keep the decision as `draft_only` until the release gate returns `human_checked_ready`.',
    '',
    '## Boundary',
    '- Passing this review gate labels the digital roadbook human-checked; it does not create a booking, guide, supplier guarantee or access promise.'
  ];
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args.find(arg => !arg.startsWith('--'));
  const markdownOnly = args.includes('--markdown');
  if (!inputPath) {
    process.stderr.write('Usage: npm run review-packet -- path/to/client-brief.json [--markdown]\n');
    process.exitCode = 2;
    return;
  }
  const inputText = inputPath === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.resolve(inputPath), 'utf8');
  const input = JSON.parse(inputText);
  const packet = await createHumanReviewPacket(input);
  if (markdownOnly && packet.valid) process.stdout.write(`${renderPacketMarkdown(packet).trim()}\n`);
  else process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
  if (!packet.valid) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

export { renderPacketMarkdown };
