#!/usr/bin/env node
// Stamps the service worker cache name with a unique timestamp before each
// production build. Replaces whatever `var CACHE = 'ironlog-...'` line is
// in src/sw.js with a fresh `ironlog-<epochMs>` value.
//
// Why a timestamp instead of a counter:
//   The previous version incremented a counter (v145 → v146). That works
//   ONLY if the change gets committed back to the repo. Vercel runs this
//   script inside its build sandbox where commits are throwaway, so every
//   Vercel build was bumping the same v145 → v146 transition, producing
//   identical cache names across pushes. A timestamp guarantees uniqueness
//   regardless of where the build runs or whether the result is committed.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = resolve(__dirname, '../src/sw.js');

const src = readFileSync(swPath, 'utf8');
const reCache = /var CACHE = 'ironlog-[^']*'/;
if (!reCache.test(src)) {
  console.error('[bump-sw] Could not find CACHE string in sw.js');
  process.exit(1);
}

const stamp = Date.now();
const newCacheLine = `var CACHE = 'ironlog-${stamp}'`;
const updated = src.replace(reCache, newCacheLine);
writeFileSync(swPath, updated, 'utf8');
console.log(`[bump-sw] Cache: ironlog-${stamp}`);
