import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { enhanceRoadbookMarkdown } from './roadbook-enhancer.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const outputs=path.resolve(here,'../..');
const runtimes=new Set(['beijing','chengdu','chongqing','guangzhou','guilin-yangshuo','hangzhou','jingdezhen','jingmai','quanzhou-dehua','shanghai','shenzhen','suzhou','wudang']);

const moduleId=module=>module?.moduleId||module?.id||module?.module_id||module?.['模块ID']||null;
const moduleName=module=>module?.name||module?.['模块名称']||module?.sourceName||null;

function normalizeModule(module={}) {
  return {
    id:moduleId(module),
    name:moduleName(module),
    question:module.question||module.explanation||module['只讲一个核心解释']||null,
    output_rule:module.output_rule||module.practicalNote||module['对客现实提醒']||module['禁止/降级条件']||null,
    duration_minutes:module.durationMinutes||module['时长(分钟)']||null,
    required_confirmations:module.requiredConfirmations||module.confirmations||[]
  };
}

function normalizeCommercial(commercial = null) {
  if (!commercial) return null;
  const digital = commercial.digitalRoadbook ?? {};
  const experience = commercial.thirdPartyExperience ?? {};
  const catalog = commercial.productCatalog ?? null;
  return {
    digital_roadbook: {
      may_offer: digital.mayOffer === true,
      may_take_payment: digital.mayTakePayment === true,
      requires_human_review: digital.requiresHumanReview !== false,
      product: digital.product ?? 'tailored research roadbook',
      field_verification_required_for_payment: digital.fieldVerificationRequiredForPayment === true,
      human_scope_review_required_for_delivery: digital.humanScopeReviewRequiredForDelivery !== false,
      field_verification_required_for_human_checked_label: digital.fieldVerificationRequiredForHumanCheckedLabel !== false,
      boundary: digital.boundary ?? null
    },
    third_party_experience: {
      requested: experience.requested === true || commercial.requestedExperienceId != null,
      may_quote: experience.mayQuote === true || commercial.mayQuote === true,
      may_take_payment: experience.mayTakePayment === true || commercial.mayTakePayment === true,
      may_promise_availability: experience.mayPromiseAvailability === true || commercial.mayPromiseAvailability === true,
      state: experience.state ?? (commercial.state === 'research_candidate' ? 'research_candidate_release_required' : 'not_requested'),
      reason: experience.reason ?? commercial.customerMessage ?? 'Third-party inventory requires separate dated human and provider release.'
    },
    recommended_product: commercial.recommendedProduct ?? 'human_checked_roadbook',
    quote_state: commercial.quoteState ?? (digital.mayTakePayment === true ? 'eligible_for_human_scope_quote' : 'intake_required_before_quote'),
    product_catalog: catalog ? {
      version: catalog.version,
      status: catalog.status,
      currency: catalog.currency,
      products: (catalog.products ?? []).map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        payment_allowed: product.paymentAllowed === true,
        field_verification_required_for_payment: product.fieldVerificationRequiredForPayment === true,
        human_checked_label_allowed: product.humanCheckedLabelAllowed === true,
        includes: product.includes,
        excludes: product.excludes
      }))
    } : null
  };
}

function normalizeDecision(runtime,decision) {
  const dayRows=Array.isArray(decision.days)?decision.days:Array.isArray(decision.dayPlan)?decision.dayPlan:null;
  const daySequence=Array.isArray(dayRows);
  const selected=daySequence
    ? dayRows.flatMap(day=>Array.isArray(day.modules)?day.modules:[])
    : Array.isArray(decision.selectedModules)?decision.selectedModules:[];
  const unique=[];
  for(const module of selected)if(moduleId(module)&&!unique.some(item=>moduleId(item)===moduleId(module)))unique.push(module);
  const days=daySequence?dayRows.map((day,index)=>({day:day.day||index+1,theme:day.theme||null,module_ids:(day.modules||[]).map(moduleId).filter(Boolean)})):[];
  return {
    runtime,
    city:decision.city||runtime,
    status:decision.status||'runtime_draft',
    output_capability:daySequence?'day_sequence_draft':'module_selection_draft',
    day_sequence_available:daySequence,
    days,
    selected_module_ids:unique.map(moduleId),
    selected_modules:unique.map(normalizeModule),
    selected_point_ids:(decision.selectedPoints||[]).map(point=>point.id||point['点位ID']).filter(Boolean),
    required_follow_ups:decision.requiredFollowUps||decision.followUps||[],
    warnings:decision.warnings||[],
    delivery_rule:decision.deliveryRule||null,
    commercial:normalizeCommercial(decision.commercial)
  };
}

export async function dispatchRuntime(handoff={}) {
  if(!handoff.valid)return {valid:false,errors:handoff.errors||['runtime handoff is not valid.']};
  if(!runtimes.has(handoff.runtime))return {valid:false,errors:[`unsupported runtime: ${handoff.runtime||'missing'}`]};
  const runtimeDir=path.join(outputs,`${handoff.runtime}-agent-runtime-v0.1`);
  const core=await import(pathToFileURL(path.join(runtimeDir,'src/core.mjs')).href);
  let decision;
  if(handoff.runtime==='chongqing'){
    const databasePath=path.join(outputs,'chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json');
    const database=JSON.parse(fs.readFileSync(databasePath,'utf8'));
    decision=core.decide(database,handoff.runtime_input);
  }else decision=core.decide(handoff.runtime_input);
  return {valid:true,...normalizeDecision(handoff.runtime,decision)};
}

/**
 * Render the selected runtime's customer-facing research draft without
 * exposing raw database records or internal point IDs.
 */
export async function renderRuntimeRoadbook(handoff={}) {
  if (!handoff.valid || !runtimes.has(handoff.runtime)) return null;
  const runtimeDir=path.join(outputs,`${handoff.runtime}-agent-runtime-v0.1`);
  const rendererInput = {
    ...(handoff.runtime_input || {}),
    tripContext: handoff.trip_context || null
  };
  let base;
  let rawDecision;
  if (handoff.runtime==='chongqing') {
    const databasePath=path.join(outputs,'chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json');
    const database=JSON.parse(fs.readFileSync(databasePath,'utf8'));
    const core=await import(pathToFileURL(path.join(runtimeDir,'src/core.mjs')).href);
    const renderer=await import(pathToFileURL(path.join(runtimeDir,'src/roadbook.mjs')).href);
    rawDecision=core.decide(database,handoff.runtime_input);
    base=renderer.renderRoadbookMarkdown(rawDecision,rendererInput);
  } else {
    const core=await import(pathToFileURL(path.join(runtimeDir,'src/core.mjs')).href);
    rawDecision=core.decide(rendererInput);
    const renderer=await import(pathToFileURL(path.join(runtimeDir,'src/roadbook.mjs')).href);
    base=renderer.renderRoadbook(rendererInput);
  }
  return enhanceRoadbookMarkdown({
    runtime: handoff.runtime,
    base,
    decision: normalizeDecision(handoff.runtime, rawDecision),
    tripContext: handoff.trip_context || null
  });
}

export { normalizeDecision, normalizeCommercial };
