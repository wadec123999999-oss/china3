export const launchChecks = [
  { id: 'SHLFV001', object: 'People’s Square museum and civic-core route', runs: ['SHRUN001'] },
  { id: 'SHLFV002', object: 'Bund-to-Pudong transition', runs: ['SHRUN002'] },
  { id: 'SHLFV003', object: 'Hengfu / Wukang ethical walking loop', runs: ['SHRUN003'] },
  { id: 'SHLFV004', object: 'Yangpu or West Bund public-space route', runs: ['SHRUN004'] },
  { id: 'SHLFV005', object: 'Foreign-visitor roadbook usability test', runs: ['SHRUN005'] },
  { id: 'SHLFV006', object: 'English Tai Chi product release', runs: ['SHRUN006'] }
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function validateRecord(record) {
  const errors = [];
  for (const field of ['run_id', 'field_date', 'tester', 'object', 'result', 'evidence']) if (record[field] === undefined || record[field] === null || record[field] === '') errors.push(`Missing ${field}`);
  if (!/^SHRUN\d{3}$/.test(record.run_id ?? '')) errors.push('run_id must match SHRUN001');
  if (record.field_date !== undefined && record.field_date !== null && record.field_date !== '') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.field_date) || Number.isNaN(Date.parse(`${record.field_date}T00:00:00Z`))) errors.push('field_date must be an ISO date');
    else if (record.field_date > todayIso()) errors.push('field_date cannot be in the future');
  }
  if (!['pass', 'conditional_pass', 'fail', 'incomplete'].includes(record.result)) errors.push('Invalid result');
  if (!Array.isArray(record.evidence) || record.evidence.length < 2) errors.push('At least two evidence items are required');
  if (record.result === 'pass' && record.safety_blocking) errors.push('A safety-blocking record cannot pass');
  if (record.result === 'pass' && JSON.stringify(record).match(/example only|replace[- ]with|placeholder/i)) errors.push('A pass record cannot contain example or placeholder evidence');
  if (record.run_id === 'SHRUN006') {
    const gates = record.supplier_gate_results ?? {};
    for (const gate of ['english_trial', 'credentials', 'venue', 'delivery', 'filming', 'transaction', 'safety']) if (gates[gate] !== 'pass') errors.push(`Tai Chi gate not passed: ${gate}`);
  }
  return errors;
}

export function progress(records) {
  const byId = new Map(records.map(record => [record.run_id, record]));
  return launchChecks.map(check => {
    const recordsForCheck = check.runs.map(id => byId.get(id)).filter(Boolean);
    return { ...check, received: recordsForCheck.length, passed: recordsForCheck.filter(r => r.result === 'pass' && !r.safety_blocking).length, ready: recordsForCheck.length === check.runs.length && recordsForCheck.every(r => r.result === 'pass' && !r.safety_blocking) };
  });
}
