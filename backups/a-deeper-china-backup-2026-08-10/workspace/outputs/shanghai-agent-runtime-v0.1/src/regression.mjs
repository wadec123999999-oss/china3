import { database, decide } from './core.mjs';

const inputFor = {
  first_visit:{days:3,firstVisit:true,interests:['architecture']}, architecture:{days:3,interests:['architecture']},
  family:{days:2,withFamily:true,interests:['family']}, rain:{days:2,weatherConstraint:true,interests:['rain_heat']},
  tai_chi:{days:2,interests:['tai_chi','slow']}, art_design:{days:3,interests:['art_design']},
  history:{days:2,interests:['history']}, arrival:{days:1,interests:['arrival']},
  slow:{days:3,interests:['slow','ethical_photo']}, jiangnan:{days:4,interests:['suzhou_extension']}
};

export function runRegression() {
  const results = database.regression_tests.map(test => {
    const decision = decide(inputFor[test.scenario]);
    const pass = decision.status === test.expected && decision.selectedModules.length >= 1 && !decision.selectedPoints.some(p => p.id === 'SH020');
    return { id:test.id, pass, modules:decision.selectedModules.map(m=>m.id), warnings:decision.warnings };
  });
  return { total:results.length, passed:results.filter(r=>r.pass).length, failed:results.filter(r=>!r.pass), results };
}
