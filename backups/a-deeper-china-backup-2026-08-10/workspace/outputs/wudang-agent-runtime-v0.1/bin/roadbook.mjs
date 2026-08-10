import fs from'node:fs';
import{renderRoadbook}from'../src/roadbook.mjs';
const demo={nights:3,interests:['heritage_architecture','weather_sensitive']};
const input=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):demo;
console.log(renderRoadbook(input));
