import { readFile } from 'node:fs/promises';
import { routePortfolio } from '../src/portfolio.mjs';
const raw = process.argv[2] ? await readFile(process.argv[2], 'utf8') : '{"interests":["history","architecture"],"nights":3}';
console.log(JSON.stringify(routePortfolio(JSON.parse(raw)), null, 2));
