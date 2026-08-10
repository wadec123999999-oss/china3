#!/usr/bin/env node
import { runRegression } from '../src/regression.mjs';
const report = runRegression();
console.log(`${report.passed}/${report.total} cases passed`);
if (report.failed.length) { console.error(JSON.stringify(report.failed,null,2)); process.exit(1); }
