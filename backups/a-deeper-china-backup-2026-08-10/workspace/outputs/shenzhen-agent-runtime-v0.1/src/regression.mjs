import {decide} from './core.mjs';
const cases=[
 ['SZR001',{days:2,interests:['tech_general','hardware']},'SZM02',null],
 ['SZR002',{days:2,interests:['factory_visit']},'SZM08','factory, R&D campus'],
 ['SZR003',{days:2,interests:['sourcing']},'SZM08','factory, R&D campus'],
 ['SZR004',{days:2,interests:['design','urbanism']},'SZM04',null],
 ['SZR005',{days:2,interests:['hong_kong_extension']},'SZM07','border/visa'],
 ['SZR006',{days:1,departing:true,interests:['departing','tech_general']},'SZM08',null],
 ['SZR007',{days:2,interests:['booking_help_requested']},'SZM01','do not book']
];
export function runRegression(){return cases.map(([id,input,module,warning])=>{const d=decide(input);return {id,pass:d.selectedModules.some(m=>m.id===module)&&(!warning||d.warnings.some(w=>w.includes(warning))),modules:d.selectedModules.map(m=>m.id),warnings:d.warnings};});}
