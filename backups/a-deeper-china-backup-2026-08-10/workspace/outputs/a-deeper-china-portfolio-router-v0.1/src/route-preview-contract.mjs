const FORBIDDEN_KEYS = new Set([
  'days', 'markdown', 'module_id', 'selected_module_ids', 'point_id', 'source', 'source_ids',
  'supplier', 'supplier_id', 'confidence', 'score'
]);
const INTERNAL_ID = /\b(?:SHM|RM|BJM|CDM|GZM|SZM|GYM|HZM|SZUM|QZM|JDZM|WDM|JMM)\d{2,3}\b/i;

function walk(value, path = '$', errors = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, errors));
    return errors;
  }
  if (!value || typeof value !== 'object') return errors;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) errors.push(`${path}.${key} is not public in a preview`);
    walk(child, `${path}.${key}`, errors);
  }
  return errors;
}

export function validateRoutePreview(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid: false, errors: ['preview must be an object'] };
  for (const key of ['valid', 'schema_version', 'status', 'product_id', 'city', 'route_thesis', 'candidate_modules', 'commercial', 'delivery_boundary']) {
    if (!(key in value)) errors.push(`missing ${key}`);
  }
  if (value.valid !== true) errors.push('valid must be true for a released preview response');
  if (value.schema_version !== '1.0') errors.push('schema_version must be 1.0');
  if (value.status !== 'preview_only') errors.push('status must be preview_only');
  if (value.product_id !== 'route_preview') errors.push('product_id must be route_preview');
  if (typeof value.city !== 'string' || !value.city.trim()) errors.push('city must be non-empty');
  if (typeof value.route_thesis !== 'string' || !value.route_thesis.trim()) errors.push('route_thesis must be non-empty');
  if (!Array.isArray(value.candidate_modules) || value.candidate_modules.length < 1 || value.candidate_modules.length > 2) errors.push('candidate_modules must contain one or two items');
  if (!value.commercial || value.commercial.payment_allowed !== false) errors.push('preview payment must be false');
  if (value.commercial && value.commercial.quote_allowed !== false) errors.push('preview quote must be false');
  if (value.commercial && value.commercial.upgrade_product_id !== 'deep_roadbook') errors.push('preview must point to deep_roadbook as its upgrade');
  errors.push(...walk(value));
  const serialized = JSON.stringify(value);
  if (INTERNAL_ID.test(serialized)) errors.push('preview contains an internal module ID');
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
