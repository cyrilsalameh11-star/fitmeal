const sharp = require('sharp');
const path  = require('path');

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#161616"/>
    </linearGradient>
    <linearGradient id="redglow" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#9B1C1C"/>
      <stop offset="100%" stop-color="#7F1D1D"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle noise texture via pattern -->
  <rect width="1200" height="630" fill="#ffffff" opacity="0.012"/>

  <!-- Top edge red line -->
  <rect x="0" y="0" width="1200" height="3" fill="#9B1C1C"/>

  <!-- Vertical left accent -->
  <rect x="0" y="0" width="4" height="630" fill="#9B1C1C" opacity="0.7"/>

  <!-- Large decorative background F letter — ghost -->
  <text x="820" y="520"
    font-family="Georgia, serif"
    font-size="520"
    font-weight="900"
    fill="#9B1C1C"
    opacity="0.04">F</text>

  <!-- FitNas — main title -->
  <text x="120" y="310"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="128"
    font-weight="700"
    fill="#9B1C1C"
    letter-spacing="-3">FitNas</text>

  <!-- Thin separator line -->
  <rect x="120" y="340" width="500" height="1.5" fill="#333333"/>

  <!-- Tagline -->
  <text x="120" y="386"
    font-family="Arial, Helvetica, sans-serif"
    font-size="20"
    font-weight="400"
    fill="#888888"
    letter-spacing="5">YOUR AI FITNESS HUB</text>

  <!-- Feature row -->
  <!-- Meal Plans -->
  <rect x="120" y="440" width="148" height="34" rx="17" fill="#1c1c1c" stroke="#2a2a2a" stroke-width="1"/>
  <text x="194" y="462"
    font-family="Arial, sans-serif" font-size="13" fill="#777777" text-anchor="middle">Meal Plans</text>

  <!-- Food Scanner -->
  <rect x="280" y="440" width="152" height="34" rx="17" fill="#1c1c1c" stroke="#2a2a2a" stroke-width="1"/>
  <text x="356" y="462"
    font-family="Arial, sans-serif" font-size="13" fill="#777777" text-anchor="middle">Food Scanner</text>

  <!-- Calorie Tracking -->
  <rect x="444" y="440" width="172" height="34" rx="17" fill="#1c1c1c" stroke="#2a2a2a" stroke-width="1"/>
  <text x="530" y="462"
    font-family="Arial, sans-serif" font-size="13" fill="#777777" text-anchor="middle">Calorie Tracking</text>

  <!-- Restaurant Guide -->
  <rect x="628" y="440" width="176" height="34" rx="17" fill="#1c1c1c" stroke="#2a2a2a" stroke-width="1"/>
  <text x="716" y="462"
    font-family="Arial, sans-serif" font-size="13" fill="#777777" text-anchor="middle">Restaurant Guide</text>

  <!-- URL bottom right -->
  <text x="1080" y="590"
    font-family="Arial, Helvetica, sans-serif"
    font-size="16"
    fill="#3a3a3a"
    text-anchor="middle"
    letter-spacing="2">JISMEH.FIT</text>

  <!-- Small red dot before URL -->
  <circle cx="982" cy="585" r="3" fill="#9B1C1C"/>
</svg>`;

sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toFile(path.join(__dirname, 'src/public/og-image-v2.png'))
  .then(() => console.log('og-image.png generated (1200x630)'))
  .catch(e => { console.error(e); process.exit(1); });
