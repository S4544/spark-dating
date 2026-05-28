// Run this once to generate icons: node generate-icons.mjs
// It creates all needed PWA icon sizes from SVG

import fs from "fs";
import path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory
const iconsDir = "./public/icons";
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// Generate SVG icon for each size
function generateSVG(size) {
  const scale = size / 512;
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${size * 0.2}" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="512" y2="512">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="100%" stop-color="#ee5a24"/>
    </linearGradient>
  </defs>
  <!-- Flame -->
  <path d="M256 60 C256 60 340 160 340 240 C340 295 305 335 256 335 C207 335 172 295 172 240 C172 160 256 60 256 60Z" fill="white" fill-opacity="0.95"/>
  <path d="M256 150 C256 150 295 210 295 248 C295 272 277 290 256 290 C235 290 217 272 217 248 C217 210 256 150 256 150Z" fill="#f43f5e" fill-opacity="0.4"/>
  <!-- Two dots -->
  <circle cx="190" cy="420" r="38" fill="white" fill-opacity="0.95"/>
  <circle cx="322" cy="420" r="38" fill="white" fill-opacity="0.95"/>
  <!-- Connection line -->
  <line x1="228" y1="420" x2="284" y2="420" stroke="white" stroke-width="20" stroke-opacity="0.95"/>
  <line x1="222" y1="335" x2="195" y2="382" stroke="white" stroke-width="18" stroke-linecap="round" stroke-opacity="0.9"/>
  <line x1="290" y1="335" x2="317" y2="382" stroke="white" stroke-width="18" stroke-linecap="round" stroke-opacity="0.9"/>
</svg>`;
}

// Save SVG icons (browsers can use SVG too)
sizes.forEach(size => {
  const svg = generateSVG(size);
  // Save as SVG first
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`✅ Created icon-${size}.svg`);
});

// Also create a simple PNG placeholder using base64
// This is a minimal 1x1 red PNG that we'll replace with real icons
const minimalPNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==",
  "base64"
);

sizes.forEach(size => {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), minimalPNG);
});

console.log("\n✅ All icons generated in public/icons/");
console.log("Note: For production, replace SVG files with proper PNG icons");
console.log("You can use https://realfavicongenerator.net to generate proper icons");
