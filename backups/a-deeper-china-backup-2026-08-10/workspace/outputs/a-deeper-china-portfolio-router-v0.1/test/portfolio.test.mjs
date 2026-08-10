import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPortfolioRequest, inferLatentNeeds, routePortfolio } from '../src/portfolio.mjs';
import { startConversation } from '../src/conversation.mjs';

test('ceramics ranks Jingdezhen for a two-night scope', () => {
  const r = routePortfolio({nights:2, interests:['porcelain','design']});
  assert.equal(r.recommendation[0].city_unit, 'jingdezhen');
});
test('two nights does not recommend Jingmai as a deep product', () => {
  const r = routePortfolio({nights:2, interests:['tea','landscape']});
  assert.equal(r.recommendation.some(x => x.city_unit === 'jingmai'), false);
  assert.equal(r.not_now.some(x => x.city_unit === 'jingmai'), true);
});
test('private access forces human-review state and boundary question', () => {
  const r = routePortfolio({nights:3, interests:['tea'], constraints:['private_access']});
  assert.equal(r.status, 'research_draft_human_review_required');
  assert.match(r.follow_up_questions.join(' '), /Private homes/);
});
test('Chongqing and Chengdu pair wins food, urbanism and night interest with four nights', () => {
  const r = routePortfolio({nights:4, interests:['food','city','night']});
  assert.equal(r.recommendation[0].city_unit, 'chengdu_chongqing');
});
test('natural-language tea/private-access request becomes a guarded router request', () => {
  const request = extractPortfolioRequest('I have 3 nights in Jingmai, love tea and want to meet a tea farmer at home.');
  assert.equal(request.nights, 3);
  assert.deepEqual(request.cities, ['Jingmai Mountain']);
  assert.equal(request.interests.includes('tea'), true);
  assert.equal(request.interests.includes('night'), false);
  assert.equal(request.constraints.includes('private_access'), true);
  assert.equal(routePortfolio(request).status, 'research_draft_human_review_required');
});
test('natural-language “with two nights” is parsed and keeps an explicitly named short city visible', () => {
  const request = extractPortfolioRequest('First visit to Chongqing with two nights and cyberpunk photos.');
  assert.equal(request.nights, 2);
  const response = startConversation('First visit to Chongqing with two nights and cyberpunk photos.');
  assert.equal(response.best_fit_city_direction[0].city, 'Chengdu–Chongqing');
  assert.match(response.trade_off.join(' '), /at least|protect|primary/i);
});
test('theme extraction does not mistake Great Wall for food', () => {
  const request = extractPortfolioRequest('First visit to Beijing for history and the Great Wall, three nights.');
  assert.equal(request.interests.includes('food'), false);
  assert.equal(request.interests.includes('history'), true);
});
test('conversation layer returns a readable route direction with a next question', () => {
  const response = startConversation('I have two days and love porcelain and design.');
  assert.equal(response.mode, 'route_direction');
  assert.equal(response.best_fit_city_direction[0].city, 'Jingdezhen');
  assert.equal(response.what_i_still_need_to_know.length > 0, true);
});
test('latent needs are hypotheses with confirmation questions, not hidden route facts', () => {
  const needs = inferLatentNeeds('It is our first time in Chongqing; only two nights and I want cyberpunk photos with my parents.');
  assert.equal(needs.some(item => item.id === 'orientation_over_checklist'), true);
  assert.equal(needs.some(item => item.id === 'pace_protection'), true);
  assert.equal(needs.every(item => item.confirmation_question), true);
});
test('a named endpoint resolves to its combined city unit', () => {
  const response = startConversation('It is my first visit to Chongqing, with two nights and an interest in cyberpunk city photographs.');
  assert.equal(response.best_fit_city_direction[0].city, 'Chengdu–Chongqing');
});
