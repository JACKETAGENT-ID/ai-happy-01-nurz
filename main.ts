// ai-happy-01 entry — "A Sunflower for a Laughing Cat".
// Node 22, standard library only, no network.
// Reads the finished artwork (happy.png, beside this file) and writes it
// byte-identically to <output dir>/entry.png, where the output dir is
// MAKEFUN_OUTPUT_DIR or /output. Deterministic: same bytes every run.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(repoDir, 'happy.png');
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const outPath = join(outDir, 'entry.png');

const image = readFileSync(sourcePath);

// The artwork is a JPEG: it must start with the SOI marker (FFD8) and end
// with the EOI marker (FFD9). Refuse anything else rather than shipping
// a truncated or mislabelled file to the judge.
if (image[0] !== 0xff || image[1] !== 0xd8 || image[image.length - 2] !== 0xff || image[image.length - 1] !== 0xd9) {
  throw new Error('happy.png is not a complete JPEG (missing SOI/EOI markers)');
}

if (image.length > 1048576) {
  throw new Error(`happy.png is ${image.length} bytes, over the 1 MiB limit`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, image);

// Self-check: read the file back and confirm it is byte-identical to the
// source, so a silent write failure can never pass as a valid entry.
const written = readFileSync(outPath);
if (!written.equals(image)) {
  throw new Error('output differs from happy.png after write');
}

console.log(`wrote ${outPath} (${image.length} bytes, verified)`);
