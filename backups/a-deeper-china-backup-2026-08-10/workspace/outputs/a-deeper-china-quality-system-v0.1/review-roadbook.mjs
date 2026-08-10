import { assessRoadbookRelease } from './roadbook-release-gate.mjs';
import { isFutureDateTime } from './date-boundary.mjs';

export function reviewRoadbook(record={}){
  const required=['review_id','city','module_ids','travel_start','travel_end','reviewed_at','reviewer','decision'];
  const missing=required.filter(field=>record[field]===undefined||record[field]===null||record[field]==='');
  if(missing.length)return {valid:false,status:'draft_only',errors:missing.map(field=>`missing ${field}`)};
  if (isFutureDateTime(record.reviewed_at)) return {valid:false,status:'draft_only',errors:['reviewed_at cannot be in the future relative to the audit date']};
  const result=assessRoadbookRelease({
    ...record,
    completed_field_module_ids: record.completed_field_module_ids || []
  });
  const decisionMatches=result.status===record.decision;
  return {valid:decisionMatches,status:result.status,errors:decisionMatches?[]:[`declared decision ${record.decision} does not match calculated ${result.status}`],release:result};
}
