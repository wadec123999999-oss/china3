import fs from 'node:fs';
import {renderRoadbook} from '../src/roadbook.mjs';
const demo={days:2,interests:['tech_general','hardware','design'],mobility:'standard'};
const input=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):demo;
console.log(renderRoadbook(input));
