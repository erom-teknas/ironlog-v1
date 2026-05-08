#!/usr/bin/env node
// Automatically increments the SW cache version before each production build.
// Reads src/sw.js, bumps "ironlog-vN" → "ironlog-v(N+1)", writes back.
// This guarantees a byte-level change that triggers the browser update flow.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = resolve(__dirname, '../src/sw.js');

const src = readFileSync(swPath, 'utf8');
const match = src.match(/var CACHE = 'ironlog-v(\d+)'/);

if (!match) {
  console.error('[bump-sw] Could not find CACHE version string in sw.js');
  process.exit(1);
}

const oldN = parseInt(match[1], 10);
const newN = oldN + 1;
const updated = src.replace(
  /var CACHE = 'ironlog-v\d+'/,
  `var CACHE = 'ironlog-v${newN}'`
);

writeFileSync(swPath, updated, 'utf8');
console.log(`[bump-sw] Cache version: ironlog-v${oldN} → ironlog-v${newN}`);
