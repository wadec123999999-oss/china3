const PUBLIC_STATUSES = new Set(['research_draft', 'draft_for_human_review', 'human_checked_ready']);
const FORBIDDEN_KEYS = new Set(['id', 'module_id', 'selected_module_ids', 'confidence', 'score', 'source', 'source_ids', 'supplier', 'supplier_id']);

function walkKeys(value, path = '$', errors = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkKeys(item, `${path}[${index}]`, errors));
    return errors;
  }
  if (!value || typeof value !== 'object') return errors;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) errors.push(`${path}.${key} is not public`);
    walkKeys(child, `${path}.${key}`, errors);
  }
  return errors;
}

export function validatePublicRoadbook(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid: false, errors: ['public roadbook must be an object'] };
  for (const key of ['schema_version', 'status', 'city', 'route_thesis', 'route_controls', 'delivery_status', 'days', 'checks_before_delivery', 'delivery_boundary', 'markdown']) {
    if (!(key in value)) errors.push(`missing ${key}`);
  }
  if (value.schema_version !== '1.1') errors.push('schema_version must be 1.1');
  if (!PUBLIC_STATUSES.has(value.status)) errors.push(`unsupported public status: ${value.status}`);
  if (typeof value.city !== 'string' || !value.city.trim()) errors.push('city must be a non-empty string');
  if (!value.route_controls || typeof value.route_controls !== 'object' || Array.isArray(value.route_controls)) errors.push('route_controls must be an object');
  if (!Array.isArray(value.days)) errors.push('days must be an array');
  if (!Array.isArray(value.checks_before_delivery)) errors.push('checks_before_delivery must be an array');
  errors.push(...walkKeys(value));
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
