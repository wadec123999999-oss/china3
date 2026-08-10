import{runRegression}from'../src/regression.mjs';const r=runRegression(),f=r.filter(x=>!x.pass);console.log((r.length-f.length)+'/'+r.length+' cases passed');if(f.length)process.exit(1);
