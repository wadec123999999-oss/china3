import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPortfolioRoadbookRelease } from '../src/release.mjs';

test('portfolio release bridge preserves Wudang live-review gate',()=>{
  const draft=assessPortfolioRoadbookRelease({city_unit:'wudang',module_ids:['WDM04']});
  assert.equal(draft.status,'draft_only');
  assert.match(draft.customer_facing_label,/Research/);
  const ready=assessPortfolioRoadbookRelease({city_unit:'wudang',module_ids:['WDM04'],completed_check_ids:['DC-WD-ROUTE']});
  assert.equal(ready.status,'human_checked_ready');
});
