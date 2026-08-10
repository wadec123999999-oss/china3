import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load the original task packet plus supplemental packets without changing
 * the V0.1 contract used by existing fixtures.
 */
export function loadFieldTaskPacket() {
  const basePath = path.join(here, 'field-review-task-packs_V0.1.json');
  const packet = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  const supplementalPath = path.join(here, 'field-review-task-packs_V0.2.json');
  if (!fs.existsSync(supplementalPath)) return packet;
  const supplemental = JSON.parse(fs.readFileSync(supplementalPath, 'utf8'));
  const merged = {
    ...packet,
    schema_version: supplemental.schema_version || packet.schema_version,
    as_of: supplemental.as_of || packet.as_of,
    boundary: `${packet.boundary} ${supplemental.boundary}`,
    packs: [...packet.packs, ...(supplemental.packs || [])]
  };
  return merged;
}

export function findFieldTask(city, taskId) {
  const packet = loadFieldTaskPacket();
  const pack = packet.packs.find(item => item.city === city);
  const task = pack?.tasks.find(item => item.task_id === taskId);
  return { packet, pack, task };
}
