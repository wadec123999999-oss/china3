const cases = {
  beijing:{days:2,firstVisit:true,interests:['architecture'],mobility:'standard'},
  chengdu:{days:3,firstVisit:true,interests:['food_driven'],mobility:'standard'},
  chongqing:{requestId:'COMM-CQ-001',stage:'路线规划',locale:'en',trip:{days:2,outputLength:'标准',profile:'首次经典',fitness:'中',weather:'正常',arrivalDepartureKnown:true,hotelAreaKnown:true},intents:{},constraints:{},liveChecks:{},purchase:{experienceId:null,asksPrice:false,asksBooking:false,asksPayment:false,asksCancellation:false}},
  guangzhou:{days:2,firstVisit:true,interests:['architecture'],mobility:'standard'},
  'guilin-yangshuo':{days:3,interests:['li_river'],mobility:'standard'},
  hangzhou:{days:2,firstVisit:true,interests:['west_lake'],mobility:'standard'},
  suzhou:{days:2,firstVisit:true,interests:['gardens'],mobility:'standard'},
  shenzhen:{days:2,interests:['hardware'],mobility:'standard'},
  jingdezhen:{days:2,interests:['ceramics'],mobility:'standard'},
  'quanzhou-dehua':{days:2,interests:['maritime_history'],mobility:'standard'},
  wudang:{nights:3,interests:['heritage_architecture'],mobility:'standard'},
  jingmai:{nights:3,interests:['tea_culture'],mobility:'standard'},
  shanghai:{days:2,firstVisit:true,interests:['architecture'],mobility:'standard'}
};
const errors=[];
for (const [name,input] of Object.entries(cases)) {
  const core = await import(`./${name}-agent-runtime-v0.1/src/core.mjs`);
  const cqDatabase = name === 'chongqing' ? JSON.parse(fs.readFileSync(path.join('outputs','chongqing-agent-database-20260729','重庆主城智能体数据库_V1.0.json'), 'utf8')) : null;
  const decision = name === 'chongqing' ? core.decide(cqDatabase, input) : core.decide(input);
  const commercial = decision.commercial;
  if (!commercial?.digitalRoadbook) errors.push(`${name}: missing commercial.digitalRoadbook`);
  if (commercial?.productCatalog?.products?.length !== 3) errors.push(`${name}: product catalog must expose 3 tiers`);
  if (commercial?.productCatalog?.products?.find(product => product.id === 'human_checked_roadbook')?.price?.launch !== 99) errors.push(`${name}: human-checked launch price catalog mismatch`);
  if (name === 'chongqing' || name === 'shanghai') {
    if (commercial?.mayQuote !== false || commercial?.mayTakePayment !== false) errors.push(`${name}: experience quote/payment must remain closed by default`);
  } else {
    if (commercial?.thirdPartyExperience?.mayQuote !== false || commercial?.thirdPartyExperience?.mayTakePayment !== false) errors.push(`${name}: third-party experience gate is open`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`VALID COMMERCIAL CONTRACT: ${Object.keys(cases).length} runtimes; digital roadbook contract present; third-party experience payment closed by default`);
import fs from 'node:fs';
import path from 'node:path';
