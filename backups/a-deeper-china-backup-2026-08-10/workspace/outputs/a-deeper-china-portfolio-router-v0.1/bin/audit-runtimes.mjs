import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root=resolve(process.cwd(),'../..');
const runtimes=['beijing','chengdu','chongqing','guangzhou','guilin-yangshuo','hangzhou','jingdezhen','jingmai','quanzhou-dehua','shanghai','shenzhen','suzhou','wudang'];
let failures=0;
for(const name of runtimes){
  const cwd=resolve(root,`outputs/${name}-agent-runtime-v0.1`);
  const pkg=JSON.parse(await readFile(resolve(cwd,'package.json'),'utf8'));
  const validation=pkg.scripts.validate?'validate':pkg.scripts['validate:v1']?'validate:v1':null;
  const commands=[validation,'regression','test'].filter(Boolean).filter(x=>pkg.scripts[x]);
  try{
    for(const script of commands)execFileSync('npm',['run',script],{cwd,stdio:'pipe'});
    console.log(`PASS ${name}: ${commands.join(', ')}`);
  }catch(error){
    failures+=1;
    console.error(`FAIL ${name}: ${error.stdout?.toString()||error.message}`);
  }
}
if(failures)process.exitCode=1;else console.log(`AUDIT PASS: ${runtimes.length}/${runtimes.length} city runtimes`);
