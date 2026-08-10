import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRoadbookRelease } from './roadbook-release-gate.mjs';

test('Wudang route cannot be labelled human checked before its live review task is complete',()=>{
  const draft=assessRoadbookRelease({city:'Wudang Mountains',module_ids:['WDM04']});
  assert.equal(draft.status,'draft_only');
  const ready=assessRoadbookRelease({city:'Wudang Mountains',module_ids:['WDM04'],completed_check_ids:['DC-WD-ROUTE']});
  assert.equal(ready.status,'human_checked_ready');
});

test('a current source record can satisfy a normal dynamic module gate',()=>{
  const draft=assessRoadbookRelease({city:'Beijing',module_ids:['BJM01']});
  assert.equal(draft.status,'draft_only');
  const ready=assessRoadbookRelease({city:'Beijing',module_ids:['BJM01'],current_source_ids:['SRC-BEIJING-20260802-004']});
  assert.equal(ready.status,'human_checked_ready');
});

test('dated source-refresh IDs are connected to the release gate',()=>{
  const shanghai=assessRoadbookRelease({city:'Shanghai',module_ids:['SHM04'],current_source_ids:['SRC-SHANGHAI-20260803-REFRESH01']});
  assert.equal(shanghai.status,'human_checked_ready');
  const chongqing=assessRoadbookRelease({city:'Chongqing',module_ids:['RM04'],current_source_ids:['SRC-CHONGQING-20260803-REFRESH02']});
  assert.equal(chongqing.status,'human_checked_ready');
  const quanzhou=assessRoadbookRelease({city:'Quanzhou–Dehua',module_ids:['QZM01'],current_source_ids:['SRC-QUANZHOU-20260803-REFRESH01']});
  assert.equal(quanzhou.status,'human_checked_ready');
});
