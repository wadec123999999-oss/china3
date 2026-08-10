import{runRegression}from'../src/regression.mjs';const r=runRegression();for(const x of r)console.log((x.pass?'PASS':'FAIL')+' '+x.name);if(r.some(x=>!x.pass))process.exitCode=1;
