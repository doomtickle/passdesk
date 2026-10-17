#!/usr/bin/env node
// Regenerates public/og.png from public/og.svg.
//
// resvg (the renderer behind @resvg/resvg-wasm) parses TTF/OTF sfnt data; it
// does not read WOFF or WOFF2. The site's fonts ship only as @fontsource
// WOFF/WOFF2 files, so this script decodes the WOFF1 files (plain zlib,
// RFC 1950) to in-memory TTF/OTF buffers and hands those to resvg as custom
// font buffers. It never touches WOFF2 (brotli), which @fontsource ships
// only for the variable Schibsted Grotesk family; the static
// @fontsource/schibsted-grotesk package (devDependency, generation-only)
// supplies WOFF1 for the two weights the image needs.
import { readFile, writeFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function woffToSfnt(woff) {
  const signature = woff.toString('ascii', 0, 4);
  if (signature !== 'wOFF') throw new Error(`not a WOFF1 file (signature ${signature})`);
  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);

  const entries = [];
  let dirOffset = 44;
  for (let i = 0; i < numTables; i++) {
    const tag = woff.toString('ascii', dirOffset, dirOffset + 4);
    const tableOffset = woff.readUInt32BE(dirOffset + 4);
    const compLength = woff.readUInt32BE(dirOffset + 8);
    const origLength = woff.readUInt32BE(dirOffset + 12);
    const origChecksum = woff.readUInt32BE(dirOffset + 16);
    const compressed = woff.subarray(tableOffset, tableOffset + compLength);
    const data = compLength === origLength ? compressed : inflateSync(compressed);
    if (data.length !== origLength) throw new Error(`table ${tag}: expected ${origLength} bytes, got ${data.length}`);
    entries.push({ tag, data, checksum: origChecksum });
    dirOffset += 20;
  }
  entries.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));

  let searchRange = 1;
  let entrySelector = 0;
  while (searchRange * 2 <= numTables) {
    searchRange *= 2;
    entrySelector++;
  }
  searchRange *= 16;
  const rangeShift = numTables * 16 - searchRange;

  const headerSize = 12 + numTables * 16;
  let bodySize = 0;
  for (const entry of entries) bodySize += (entry.data.length + 3) & ~3;
  const sfnt = Buffer.alloc(headerSize + bodySize);

  sfnt.writeUInt32BE(flavor, 0);
  sfnt.writeUInt16BE(numTables, 4);
  sfnt.writeUInt16BE(searchRange, 6);
  sfnt.writeUInt16BE(entrySelector, 8);
  sfnt.writeUInt16BE(rangeShift, 10);

  let tableOffset = headerSize;
  let dirPos = 12;
  for (const entry of entries) {
    sfnt.write(entry.tag, dirPos, 'ascii');
    sfnt.writeUInt32BE(entry.checksum, dirPos + 4);
    sfnt.writeUInt32BE(tableOffset, dirPos + 8);
    sfnt.writeUInt32BE(entry.data.length, dirPos + 12);
    entry.data.copy(sfnt, tableOffset);
    tableOffset += (entry.data.length + 3) & ~3;
    dirPos += 16;
  }
  return sfnt;
}

async function loadFontBuffer(pkg, file) {
  const woffPath = path.join(root, 'node_modules', pkg, 'files', file);
  const woff = await readFile(woffPath);
  return woffToSfnt(woff);
}

async function main() {
  const wasmPath = path.join(root, 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
  await initWasm(await readFile(wasmPath));

  const fontBuffers = await Promise.all([
    loadFontBuffer('@fontsource/schibsted-grotesk', 'schibsted-grotesk-latin-700-normal.woff'),
    loadFontBuffer('@fontsource/schibsted-grotesk', 'schibsted-grotesk-latin-800-normal.woff'),
    loadFontBuffer('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
  ]);

  const svgPath = path.join(root, 'public', 'og.svg');
  const pngPath = path.join(root, 'public', 'og.png');
  const svg = await readFile(svgPath);

  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
      fontBuffers,
      defaultFontFamily: 'Schibsted Grotesk',
      sansSerifFamily: 'Schibsted Grotesk',
      monospaceFamily: 'JetBrains Mono',
    },
  });
  const rendered = resvg.render();
  if (rendered.width !== 1200 || rendered.height !== 630) {
    throw new Error(`expected a 1200x630 image, got ${rendered.width}x${rendered.height}`);
  }
  await writeFile(pngPath, rendered.asPng());
  console.log(`wrote ${path.relative(root, pngPath)} (${rendered.width}x${rendered.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
