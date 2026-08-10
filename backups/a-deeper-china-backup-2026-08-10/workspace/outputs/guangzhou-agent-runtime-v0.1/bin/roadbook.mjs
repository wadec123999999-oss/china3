import fs from 'node:fs';
import {renderRoadbook} from '../src/roadbook.mjs';
const demo={days:2,firstVisit:true,interests:['food_driven','architecture'],mobility:'standard'};
const input=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):demo;
console.log(renderRoadbook(input));
