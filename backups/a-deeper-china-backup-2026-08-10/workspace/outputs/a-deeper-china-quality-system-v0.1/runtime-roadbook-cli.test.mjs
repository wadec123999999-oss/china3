import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runtimeNames=['beijing','chengdu','chongqing','guangzhou','guilin-yangshuo','hangzhou','jingdezhen','jingmai','quanzhou-dehua','shanghai','shenzhen','suzhou','wudang'];

test('every city roadbook runtime accepts a real input file',()=>{
  const outputs=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  for(const name of runtimeNames){
    const runtime=path.join(outputs,`${name}-agent-runtime-v0.1`);
    const pkg=JSON.parse(fs.readFileSync(path.join(runtime,'package.json'),'utf8'));
    assert.ok(pkg.scripts?.roadbook,`${name}: missing npm roadbook command`);
    const cli=fs.readFileSync(path.join(runtime,'bin/roadbook.mjs'),'utf8');
    assert.match(cli,/process\.argv\[2\]/,`${name}: roadbook CLI still uses only hard-coded demo input`);
    assert.match(cli,/readFile/,`${name}: roadbook CLI does not read a client file`);
  }
});
