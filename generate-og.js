const sharp = require('sharp');
const path  = require('path');

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">

  <!-- Background: near-black -->
  <rect width="1200" height="630" fill="#0c0c0c"/>

  <!-- Subtle centre glow -->
  <radialGradient id="glow" cx="50%" cy="50%" r="60%">
    <stop offset="0%"   stop-color="#7f1d1d" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="#0c0c0c" stop-opacity="0"/>
  </radialGradient>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Top red bar -->
  <rect x="0" y="0" width="1200" height="2" fill="#991b1b"/>

  <!-- Bottom grey bar -->
  <rect x="0" y="628" width="1200" height="2" fill="#222222"/>

  <!-- Centred "FitNas" — huge serif -->
  <text
    x="600" y="310"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="168"
    font-weight="700"
    fill="#991b1b"
    text-anchor="middle"
    letter-spacing="-4">FitNas</text>

  <!-- Thin horizontal rule below title -->
  <rect x="380" y="338" width="440" height="1" fill="#2a2a2a"/>

  <!-- Tagline — centred, spaced caps -->
  <text
    x="600" y="390"
    font-family="Arial, Helvetica, sans-serif"
    font-size="17"
    font-weight="400"
    fill="#555555"
    text-anchor="middle"
    letter-spacing="7">YOUR AI FITNESS HUB</text>

  <!-- Three feature pills — centred row -->
  <!-- Pill 1: AI Scanner -->
  <rect x="290" y="434" width="170" height="36" rx="18" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
  <circle cx="314" cy="452" r="5" fill="#991b1b" opacity="0.8"/>
  <text x="374" y="457" font-family="Arial, sans-serif" font-size="13" fill="#666666" text-anchor="middle">AI Scanner</text>

  <!-- Pill 2: Meal Plans -->
  <rect x="480" y="434" width="170" height="36" rx="18" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
  <circle cx="504" cy="452" r="5" fill="#991b1b" opacity="0.8"/>
  <text x="564" y="457" font-family="Arial, sans-serif" font-size="13" fill="#666666" text-anchor="middle">Meal Plans</text>

  <!-- Pill 3: Calorie Tracker -->
  <rect x="670" y="434" width="178" height="36" rx="18" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
  <circle cx="694" cy="452" r="5" fill="#991b1b" opacity="0.8"/>
  <text x="758" y="457" font-family="Arial, sans-serif" font-size="13" fill="#666666" text-anchor="middle">Calorie Tracker</text>

  <!-- URL — bottom centre, very subtle -->
  <text
    x="600" y="588"
    font-family="Arial, Helvetica, sans-serif"
    font-size="14"
    fill="#333333"
    text-anchor="middle"
    letter-spacing="3">JISMEH.FIT</text>

</svg>`;

sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toFile(path.join(__dirname, 'src/public/og-image-v2.png'))
  .then(() => console.log('og-image.png generated (1200x630)'))
  .catch(e => { console.error(e); process.exit(1); });
