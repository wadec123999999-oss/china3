import { extractPortfolioRequest, inferLatentNeeds, routePortfolio } from './portfolio.mjs';
import { selectCityFollowUps } from './city-interactions.mjs';

function choiceSentence(results) {
  if (!results.length) return 'You are still choosing the kind of China you want to understand, rather than a specific route.';
  if (results.length === 1) return `You are mainly choosing whether ${results[0].city} fits the time and question you have.`;
  return `You are choosing between ${results.map(x => x.city).join(' and ')}, which answer different versions of the trip.`;
}

export function startConversation(message) {
  const request = extractPortfolioRequest(message);
  const latentNeeds = inferLatentNeeds(message);
  const routed = routePortfolio(request);
  const questions = [];
  const selectedUnits = routed.recommendation.map(item => item.city_unit).slice(0, 2);
  for (const cityUnit of selectedUnits) {
    for (const item of selectCityFollowUps(cityUnit, { text: message, request, limit: 2 })) {
      if (!questions.some(existing => existing.ask === item.ask)) questions.push(item);
      if (questions.length >= 2) break;
    }
    if (questions.length >= 2) break;
  }
  if (!questions.length) questions.push(...routed.follow_up_questions.slice(0, 2).map(ask => ({ ask, source: 'portfolio-router' })));
  if (!questions.length && routed.recommendation.length) {
    questions.push({ ask: 'What are your real arrival and departure times, and what would you most like to avoid on this trip?', source: 'portfolio-router' });
  }
  return {
    mode: routed.status === 'research_draft_human_review_required' ? 'research_only_escalation' : 'route_direction',
    extracted_request: request,
    what_you_are_really_choosing: choiceSentence(routed.recommendation),
    best_fit_city_direction: routed.recommendation.map(x => ({city:x.city, for:x.why, matched_themes:x.matched_themes, cautions:x.cautions})),
    trade_off: routed.not_now.length ? routed.not_now.map(x => x.reason) : ['Protect one primary city question before adding extra destinations or activities.'],
    what_i_still_need_to_know: questions.map(item => typeof item === 'string' ? item : item.ask),
    question_sources: questions.map(item => typeof item === 'string' ? 'portfolio-router' : item.source),
    likely_unstated_needs_to_confirm: latentNeeds,
    boundary: routed.guardrails,
    internal_status: routed.status
  };
}
