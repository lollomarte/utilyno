import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function svg(size, ballScale) {
  const c = size / 2;
  const r = size * ballScale;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0a0a0b"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#22c55e" stroke-width="${size * 0.045}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.42}" fill="#22c55e"/>
  <path d="M ${c} ${c - r} L ${c} ${c - r * 0.4} M ${c} ${c + r} L ${c} ${c + r * 0.4} M ${c - r} ${c} L ${c - r * 0.4} ${c} M ${c + r} ${c} L ${c + r * 0.4} ${c}"
    stroke="#22c55e" stroke-width="${size * 0.03}" stroke-linecap="round"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, ballScale: 0.34 },
  { name: "icon-512.png", size: 512, ballScale: 0.34 },
  { name: "icon-maskable-512.png", size: 512, ballScale: 0.24 },
];

for (const t of targets) {
  const buffer = Buffer.from(svg(t.size, t.ballScale));
  await sharp(buffer).png().toFile(path.join(outDir, t.name));
  console.log("Generato", t.name);
}
