import { deriveModuleSourceMap } from './module-source-map.mjs';

export function assessRoadbookRelease({city,module_ids=[],completed_check_ids=[],current_source_ids=[],completed_field_module_ids=[]}={}){
  const cityMap=deriveModuleSourceMap().find(item=>item.city===city);
  if(!cityMap)return {status:'blocked',reasons:[`unknown city: ${city}`],modules:[]};
  const doneChecks=new Set(completed_check_ids);
  const currentSources=new Set(current_source_ids);
  const completedFieldModules=new Set(completed_field_module_ids);
  const modules=[];
  for(const id of module_ids){
    const module=cityMap.modules.find(item=>item.module_id===id);
    if(!module){modules.push({module_id:id,status:'blocked',reason:'unknown module'});continue;}
    if(module.binding_status==='research_only'||module.binding_status==='needs_source_enrichment'){
      modules.push({module_id:id,status:'blocked',reason:module.binding_status});continue;
    }
    if(module.binding_status==='requires_current_check'){
      const taskDone=module.dynamic_check_ids.some(id=>doneChecks.has(id));
      const sourceDone=module.dynamic_source_ids.some(id=>currentSources.has(id));
      const fieldRunDone=completedFieldModules.has(id);
      if(!taskDone&&!sourceDone&&!fieldRunDone){modules.push({module_id:id,status:'blocked',reason:'dynamic evidence missing',required_checks:module.dynamic_check_ids,acceptable_current_sources:module.dynamic_source_ids,acceptable_field_run_module:id});continue;}
      if(fieldRunDone) modules.push({module_id:id,status:'ready',evidence_basis:'field_run'});
      else modules.push({module_id:id,status:'ready'});
      continue;
    }
    modules.push({module_id:id,status:'ready'});
  }
  const blocked=modules.filter(item=>item.status==='blocked');
  return {status:blocked.length?'draft_only':'human_checked_ready',reasons:blocked.map(item=>`${item.module_id}: ${item.reason}`),modules};
}
