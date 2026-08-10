import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(here,'city-source-coverage.manifest.json'),'utf8'));

test('every active portfolio city has a source-pack reference or a retained legacy source layer',()=>{
  assert.equal(manifest.length,13);
  for(const item of manifest){
    const databasePath=path.resolve(here,item.database);
    assert.equal(fs.existsSync(databasePath),true,`${item.city}: database missing`);
    const db=JSON.parse(fs.readFileSync(databasePath,'utf8'));
    if(item.mode==='source_pack_ref'){
      assert.equal(typeof db.metadata?.source_pack_ref,'string',`${item.city}: source_pack_ref missing`);
      const sourcePackPath=path.resolve(path.dirname(databasePath),db.metadata.source_pack_ref);
      assert.equal(fs.existsSync(sourcePackPath),true,`${item.city}: source pack missing`);
      const records=JSON.parse(fs.readFileSync(sourcePackPath,'utf8'));
      assert.ok(records.length>0,`${item.city}: empty source pack`);
      assert.equal(records.some(record=>record.evidence_status==='field_verified'),false,`${item.city}: false field verification`);
    }else if(item.mode==='legacy_sources'){
      assert.ok(Array.isArray(db.sources)&&db.sources.length>0,`${item.city}: legacy source list missing`);
    }else if(item.mode==='legacy_embedded_sources'){
      assert.ok(JSON.stringify(db).includes('"source"'),`${item.city}: embedded sources missing`);
    }else assert.fail(`${item.city}: unknown coverage mode`);
  }
});
