const base={official:80,on_site:90,xiaohongshu:38,mafengwo:42,qyer:45,ctrip:32,dianping:30,wechat:35,douyin:25,bilibili:35,youtube:40,tiktok:25,reddit:42,google_maps:35,other:20};
const dynamic=new Set(['opening_or_access','transport','route_condition','weather_or_season','provider_or_experience','food_or_accommodation']);

export function scoreSource(record={}){
  let score=base[record.platform]??20;
  const reasons=[];
  if(record.independence==='official_primary'){score+=15;reasons.push('primary authority');}
  if(record.independence==='firsthand_identified'){score+=12;reasons.push('identified firsthand account');}
  if(record.independence==='firsthand_unclear'){score-=3;reasons.push('firsthand claim unclear');}
  if(record.independence==='repost_or_compilation'){score-=15;reasons.push('repost/compilation');}
  if(record.independence==='anonymous_or_unverifiable'){score-=22;reasons.push('unverifiable author');}
  if(record.commercial_signal==='affiliate_or_commission'||record.commercial_signal==='sponsored_or_gifted'){score-=22;reasons.push('commercial incentive');}
  if(record.commercial_signal==='seller_or_provider'){score-=30;reasons.push('seller/provider claim');}
  if(record.commercial_signal==='unclear'){score-=8;reasons.push('commercial relationship unclear');}
  const corroboration=(record.corroboration_ids||[]).length;
  if(corroboration>=2){score+=15;reasons.push('two or more independent corroborations');}
  else if(corroboration===1){score+=7;reasons.push('one corroboration');}
  if(record.evidence_status==='field_verified'){score=100;reasons.push('field verified');}
  if(record.evidence_status==='contradicted'||record.evidence_status==='expired'){score=0;reasons.push(record.evidence_status);}
  score=Math.max(0,Math.min(100,score));
  let use='lead_only';
  if(record.evidence_status==='field_verified')use='eligible_for_human_checked';
  else if(record.evidence_status==='contradicted'||record.evidence_status==='expired')use='exclude';
  // A seller, sponsored post, repost farm, or unverifiable author can reveal a
  // research lead, but never supplies the operational evidence used to release
  // an answer.  A dynamic claim does not make a conflicted source trustworthy.
  else if(['affiliate_or_commission','sponsored_or_gifted','seller_or_provider'].includes(record.commercial_signal)
    || ['repost_or_compilation','anonymous_or_unverifiable'].includes(record.independence)){
    use='lead_only';
    reasons.push('risk-locked to research lead');
  }
  else if(dynamic.has(record.claim_type))use='requires_current_check';
  else if(score>=70)use='context_with_citation';
  else if(score>=45)use='corroborate_before_database';
  return{score,use,reasons};
}
