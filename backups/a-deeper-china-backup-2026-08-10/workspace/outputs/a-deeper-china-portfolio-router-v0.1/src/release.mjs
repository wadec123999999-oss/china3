import { assessRoadbookRelease } from '../../a-deeper-china-quality-system-v0.1/roadbook-release-gate.mjs';

export const CITY_DATABASE_NAMES={
  shanghai:'Shanghai',beijing:'Beijing',chengdu:'Chengdu',chongqing:'Chongqing',guangzhou:'Guangzhou',shenzhen:'Shenzhen',
  guilin_yangshuo:'Guilin–Yangshuo',hangzhou:'Hangzhou',suzhou:'Suzhou',quanzhou_dehua:'Quanzhou–Dehua',jingdezhen:'Jingdezhen',wudang:'Wudang Mountains',jingmai:'Jingmai Mountain'
};

export function assessPortfolioRoadbookRelease({city_unit,module_ids,completed_check_ids,current_source_ids,completed_field_module_ids}={}){
  const city=CITY_DATABASE_NAMES[city_unit]||city_unit;
  const result=assessRoadbookRelease({city,module_ids,completed_check_ids,current_source_ids,completed_field_module_ids});
  return {
    ...result,
    city,
    customer_facing_label:result.status==='human_checked_ready'?'Human-checked digital roadbook':'Research roadbook draft — current checks still required',
    commercial_boundary:'This release state does not authorize booking, payments, guiding, transport, accommodation sales or third-party experience sales.'
  };
}
