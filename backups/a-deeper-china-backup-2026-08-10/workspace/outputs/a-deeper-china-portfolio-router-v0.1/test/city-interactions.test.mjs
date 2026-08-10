import test from 'node:test';
import assert from 'node:assert/strict';
import { CITY_INTERACTIONS, cityInteractionAudit, getCityInteraction, selectCityFollowUps, sourceQuestionsForCity } from '../src/city-interactions.mjs';

test('all selected city databases have a prioritized interaction overlay', () => {
  assert.equal(CITY_INTERACTIONS.scope.city_database_count, 13);
  assert.equal(CITY_INTERACTIONS.scope.product_unit_count, 10);
  for (const item of cityInteractionAudit()) {
    assert.equal(item.all_database_ids_registered, true, item.id);
    assert.ok(item.question_count >= 5, item.id);
    assert.ok(item.latent_need_count >= 3, item.id);
    assert.ok(sourceQuestionsForCity(item.id).length >= 4, item.id);
  }
});

test('city aliases resolve to the correct product unit', () => {
  assert.equal(getCityInteraction('重庆').id, 'chengdu_chongqing');
  assert.equal(getCityInteraction('Jingmai Mountain').id, 'jingmai');
  assert.equal(getCityInteraction('hangzhou_suzhou').id, 'hangzhou_suzhou');
});

test('Chengdu and Chongqing questions surface the hidden split decision', () => {
  const questions = selectCityFollowUps('chengdu_chongqing', {
    text: 'We have four nights and want Chengdu food plus Chongqing cyberpunk photos.',
    request: { nights: 4, cities: ['Chengdu–Chongqing'], interests: ['food', 'urbanism'] },
    limit: 2
  });
  assert.equal(questions.length, 2);
  assert.match(questions.map(item => item.ask).join(' '), /nights|rhythm|intensity/i);
});

test('research-led mountain products ask access and feasibility questions', () => {
  const questions = selectCityFollowUps('jingmai', {
    text: 'I want to meet a tea farmer at home and photograph sunrise.',
    request: { nights: 3, interests: ['tea'], constraints: ['private_access'] },
    limit: 2
  });
  assert.match(questions.map(item => item.ask).join(' '), /private|approved|weather|road/i);
});

