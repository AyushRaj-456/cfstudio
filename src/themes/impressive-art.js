/**
 * CF Studio - Impressive Theme Artwork
 * High-quality, self-contained vector atmospheric artwork for the 10 Light Impressive Themes.
 * 100% offline, zero network requests, resolution-independent SVG data URIs.
 * All themes strictly adhere to the Light Appearance direction.
 */

function toSvgDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

// 1. Anime Studio: Light illustrated anime metropolis at golden twilight / afternoon dawn
const animeStudioSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="as-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0e7ff"/>
      <stop offset="35%" stop-color="#ede9fe"/>
      <stop offset="70%" stop-color="#fae8ff"/>
      <stop offset="90%" stop-color="#fee2e2"/>
      <stop offset="100%" stop-color="#ffedd5"/>
    </linearGradient>
    <radialGradient id="as-sun" cx="72%" cy="42%" r="40%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.6"/>
      <stop offset="30%" stop-color="#fed7aa" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#fbcfe8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#e0e7ff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="as-win-grid" width="20" height="28" patternUnits="userSpaceOnUse">
      <rect x="3" y="4" width="6" height="8" fill="#38bdf8" opacity="0.45"/>
      <rect x="11" y="4" width="6" height="8" fill="#fbbf24" opacity="0.45"/>
      <rect x="3" y="16" width="6" height="8" fill="#f472b6" opacity="0.4"/>
      <rect x="11" y="16" width="6" height="8" fill="#ffffff" opacity="0.55"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#as-sky)"/>
  <rect width="1920" height="1080" fill="url(#as-sun)"/>

  <!-- Distant Anime Cloud Formations -->
  <path d="M 0,540 Q 220,490 440,520 T 880,500 Q 1120,460 1360,510 T 1920,490 L 1920,1080 L 0,1080 Z" fill="#f5d0fe" opacity="0.4"/>
  <path d="M 0,610 Q 300,560 600,590 T 1200,570 Q 1560,530 1920,580 L 1920,1080 L 0,1080 Z" fill="#e0e7ff" opacity="0.5"/>

  <!-- Distant Anime Spire & Towers Silhouette in Soft Pastel Periwinkle -->
  <path d="M 0,1080 L 0,660 L 90,660 L 90,600 L 140,600 L 140,660 L 240,660 L 250,540 L 260,450 L 270,540 L 360,670 L 490,670 L 550,580 L 620,580 L 680,680 L 860,680 L 930,520 L 940,410 L 950,520 L 1040,680 L 1200,680 L 1280,560 L 1350,560 L 1420,680 L 1600,680 L 1670,490 L 1680,380 L 1690,490 L 1780,680 L 1920,680 L 1920,1080 Z" fill="#c7d2fe" opacity="0.55"/>

  <!-- Midground Light Illustrated Modern Buildings -->
  <rect x="80" y="650" width="160" height="430" rx="3" fill="#e0e7ff" opacity="0.8"/>
  <rect x="95" y="670" width="130" height="300" fill="url(#as-win-grid)" opacity="0.7"/>

  <rect x="320" y="580" width="220" height="500" rx="4" fill="#ede9fe" opacity="0.85"/>
  <rect x="340" y="610" width="180" height="360" fill="url(#as-win-grid)" opacity="0.65"/>

  <rect x="620" y="670" width="200" height="410" rx="3" fill="#fae8ff" opacity="0.8"/>
  <rect x="640" y="700" width="160" height="280" fill="url(#as-win-grid)" opacity="0.75"/>

  <!-- Vibrant Neon Billboards (Clean & Bright) -->
  <rect x="360" y="595" width="100" height="22" rx="3" fill="#38bdf8" opacity="0.85"/>
  <rect x="660" y="685" width="110" height="24" rx="3" fill="#f43f5e" opacity="0.85"/>
  <rect x="1300" y="625" width="120" height="26" rx="3" fill="#a855f7" opacity="0.85"/>

  <rect x="1080" y="630" width="230" height="450" rx="4" fill="#e0e7ff" opacity="0.8"/>
  <rect x="1100" y="660" width="190" height="330" fill="url(#as-win-grid)" opacity="0.65"/>

  <rect x="1380" y="600" width="210" height="480" rx="4" fill="#ede9fe" opacity="0.85"/>
  <rect x="1400" y="630" width="170" height="350" fill="url(#as-win-grid)" opacity="0.7"/>

  <rect x="1660" y="560" width="220" height="520" rx="4" fill="#e0e7ff" opacity="0.75"/>
  <rect x="1680" y="590" width="180" height="380" fill="url(#as-win-grid)" opacity="0.6"/>

  <!-- Foreground Elevated Metro Bridge with Evening Amber/Cyan Light Trails -->
  <path d="M 0,880 Q 480,830 960,860 T 1920,850 L 1920,930 Q 1440,940 960,950 T 0,960 Z" fill="#c7d2fe" opacity="0.7"/>
  <path d="M 0,890 Q 480,840 960,870 T 1920,860" stroke="#0284c7" stroke-width="4" fill="none" opacity="0.8"/>
  <path d="M 0,898 Q 480,848 960,878 T 1920,868" stroke="#f43f5e" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 0,905 Q 480,855 960,885 T 1920,875" stroke="#f59e0b" stroke-width="3" fill="none" opacity="0.75"/>
</svg>
`;

// 2. Sakura Dreams: Morning cherry blossom dawn with blooming branches and gentle pink hues
const sakuraDreamsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sd-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff5f7"/>
      <stop offset="35%" stop-color="#fce7f3"/>
      <stop offset="70%" stop-color="#f5d0fe"/>
      <stop offset="100%" stop-color="#fae8ff"/>
    </linearGradient>
    <radialGradient id="sd-sun" cx="80%" cy="30%" r="45%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.45"/>
      <stop offset="40%" stop-color="#fbcfe8" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#fff5f7" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sd-sky)"/>
  <rect width="1920" height="1080" fill="url(#sd-sun)"/>

  <!-- Distant Watercolor Mountains in Soft Mauve -->
  <path d="M 0,720 Q 350,560 700,640 T 1400,590 Q 1660,540 1920,620 L 1920,1080 L 0,1080 Z" fill="#f0abfc" opacity="0.25"/>
  <path d="M 0,790 Q 420,680 840,730 T 1680,710 L 1920,740 L 1920,1080 L 0,1080 Z" fill="#e879f9" opacity="0.2"/>

  <!-- Serene Lake Reflection Surface -->
  <rect x="0" y="800" width="1920" height="280" fill="#fce7f3" opacity="0.5"/>
  <line x1="120" y1="840" x2="380" y2="840" stroke="#f472b6" stroke-width="1.5" opacity="0.35"/>
  <line x1="600" y1="860" x2="940" y2="860" stroke="#f472b6" stroke-width="1.5" opacity="0.3"/>
  <line x1="1200" y1="850" x2="1600" y2="850" stroke="#f472b6" stroke-width="1.5" opacity="0.35"/>

  <!-- Left Graceful Sakura Bough -->
  <path d="M -50,140 Q 180,80 340,160 T 640,120 Q 780,180 880,150" stroke="#9d174d" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.4"/>
  <path d="M 280,145 Q 380,240 460,280" stroke="#9d174d" stroke-width="5" fill="none" opacity="0.35"/>
  <path d="M 520,135 Q 580,210 650,230" stroke="#9d174d" stroke-width="4" fill="none" opacity="0.35"/>

  <!-- Right Sakura Bough -->
  <path d="M 1970,100 Q 1720,60 1560,140 T 1280,110 Q 1120,160 1020,130" stroke="#9d174d" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.38"/>
  <path d="M 1600,125 Q 1500,220 1420,250" stroke="#9d174d" stroke-width="4.5" fill="none" opacity="0.32"/>

  <!-- Soft Petal Clusters -->
  <g fill="#ec4899" opacity="0.55">
    <circle cx="280" cy="130" r="14"/>
    <circle cx="360" cy="180" r="16"/>
    <circle cx="480" cy="150" r="15"/>
    <circle cx="560" cy="120" r="18"/>
    <circle cx="680" cy="150" r="14"/>
    <circle cx="760" cy="170" r="16"/>
    <circle cx="850" cy="140" r="12"/>
    <circle cx="1520" cy="120" r="16"/>
    <circle cx="1400" cy="140" r="18"/>
    <circle cx="1310" cy="110" r="15"/>
    <circle cx="1180" cy="140" r="16"/>
    <circle cx="1060" cy="120" r="13"/>
  </g>
  <g fill="#fbcfe8" opacity="0.8">
    <circle cx="270" cy="120" r="10"/>
    <circle cx="350" cy="170" r="12"/>
    <circle cx="470" cy="140" r="11"/>
    <circle cx="550" cy="110" r="13"/>
    <circle cx="670" cy="140" r="10"/>
    <circle cx="1510" cy="110" r="12"/>
    <circle cx="1390" cy="130" r="13"/>
    <circle cx="1300" cy="100" r="11"/>
    <circle cx="1170" cy="130" r="12"/>
  </g>
</svg>
`;

// 3. Vintage Paper: Warm antique parchment, delicate nautical compass, and fine-line cartography
const vintagePaperSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="vp-glow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="45%" stop-color="#fef3c7"/>
      <stop offset="80%" stop-color="#fde68a" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fcd34d" stop-opacity="0.6"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#vp-glow)"/>

  <!-- Antique Cartographic Latitude/Longitude Graticule -->
  <g stroke="#92400e" stroke-width="0.8" opacity="0.18" fill="none">
    <circle cx="960" cy="540" r="180"/>
    <circle cx="960" cy="540" r="320"/>
    <circle cx="960" cy="540" r="460"/>
    <circle cx="960" cy="540" r="620"/>
    <line x1="960" y1="0" x2="960" y2="1080"/>
    <line x1="0" y1="540" x2="1920" y2="540"/>
    <line x1="0" y1="0" x2="1920" y2="1080"/>
    <line x1="1920" y1="0" x2="0" y2="1080"/>
  </g>

  <!-- Large Antique Compass Rose (Center Right Background) -->
  <g transform="translate(1420, 500)" stroke="#78350f" opacity="0.22">
    <!-- Star Points -->
    <polygon points="0,-160 16,-30 0,0 -16,-30" fill="#92400e"/>
    <polygon points="0,-160 0,0 -16,-30" fill="#78350f"/>
    <polygon points="0,160 16,30 0,0 -16,30" fill="#92400e"/>
    <polygon points="0,160 0,0 16,30" fill="#78350f"/>
    <polygon points="160,0 30,16 0,0 30,-16" fill="#92400e"/>
    <polygon points="160,0 0,0 30,16" fill="#78350f"/>
    <polygon points="-160,0 -30,16 0,0 -30,-16" fill="#92400e"/>
    <polygon points="-160,0 0,0 -30,-16" fill="#78350f"/>
    <!-- Diagonal Points -->
    <polygon points="110,-110 32,-12 0,0 12,-32" fill="#b45309"/>
    <polygon points="-110,-110 -12,-32 0,0 -32,-12" fill="#b45309"/>
    <polygon points="110,110 12,32 0,0 32,12" fill="#b45309"/>
    <polygon points="-110,110 -32,12 0,0 -12,32" fill="#b45309"/>
    <circle cx="0" cy="0" r="160" fill="none" stroke-width="1.8"/>
    <circle cx="0" cy="0" r="148" fill="none" stroke-width="1"/>
    <circle cx="0" cy="0" r="10" fill="#78350f"/>
  </g>

  <!-- Antique Coastline Contours (Left Background) -->
  <path d="M 60,180 Q 140,240 110,340 T 180,480 Q 220,540 160,640 T 210,800 Q 180,920 260,1020" stroke="#78350f" stroke-width="1.5" stroke-dasharray="4,3" fill="none" opacity="0.25"/>
  <path d="M 80,160 Q 170,220 130,320 T 210,460 Q 250,520 190,620 T 240,780 Q 210,900 290,1000" stroke="#b45309" stroke-width="1" fill="none" opacity="0.18"/>
</svg>
`;

// 4. Orchid: Pale floral purple and lavender atmosphere with cascading blossoms
const orchidSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="oc-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#faf5ff"/>
      <stop offset="35%" stop-color="#f3e8ff"/>
      <stop offset="70%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#f5d0fe"/>
    </linearGradient>
    <radialGradient id="oc-glow" cx="60%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#fdf4ff" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#f3e8ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#faf5ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#oc-sky)"/>
  <rect width="1920" height="1080" fill="url(#oc-glow)"/>

  <!-- Distant Rolling Hills in Soft Amethyst -->
  <path d="M 0,700 Q 380,580 760,650 T 1520,600 Q 1740,560 1920,620 L 1920,1080 L 0,1080 Z" fill="#d8b4fe" opacity="0.25"/>
  <path d="M 0,780 Q 460,680 920,730 T 1840,710 L 1920,730 L 1920,1080 L 0,1080 Z" fill="#c084fc" opacity="0.2"/>

  <!-- Graceful Arching Wisteria/Orchid Branch from Top Left -->
  <path d="M -20,60 Q 220,40 380,120 T 720,100 Q 940,160 1100,120" stroke="#6b21a8" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.4"/>
  <path d="M 320,110 Q 380,220 440,260" stroke="#6b21a8" stroke-width="4" fill="none" opacity="0.35"/>
  <path d="M 640,105 Q 700,200 760,230" stroke="#6b21a8" stroke-width="3.5" fill="none" opacity="0.35"/>

  <!-- Cascading Orchid Blossom Clusters -->
  <g fill="#9333ea" opacity="0.5">
    <ellipse cx="320" cy="110" rx="16" ry="12"/>
    <ellipse cx="380" cy="170" rx="18" ry="14"/>
    <ellipse cx="440" cy="240" rx="15" ry="12"/>
    <ellipse cx="490" cy="300" rx="12" ry="10"/>
    <ellipse cx="640" cy="110" rx="17" ry="13"/>
    <ellipse cx="700" cy="160" rx="18" ry="14"/>
    <ellipse cx="760" cy="220" rx="15" ry="12"/>
    <ellipse cx="880" cy="130" rx="16" ry="12"/>
    <ellipse cx="1020" cy="120" rx="14" ry="10"/>
  </g>
  <g fill="#e9d5ff" opacity="0.8">
    <circle cx="380" cy="170" r="7"/>
    <circle cx="440" cy="240" r="6"/>
    <circle cx="700" cy="160" r="7"/>
    <circle cx="760" cy="220" r="6"/>
  </g>
</svg>
`;

// 5. Forest Escape: Light sun-dappled komorebi forest, misty pine silhouettes, and morning sunbeams
const forestEscapeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="fe-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="40%" stop-color="#ecfdf5"/>
      <stop offset="75%" stop-color="#d1fae5"/>
      <stop offset="100%" stop-color="#fef9c3"/>
    </linearGradient>
    <radialGradient id="fe-sun" cx="35%" cy="25%" r="45%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.55"/>
      <stop offset="35%" stop-color="#d1fae5" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#f0fdf4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#fe-sky)"/>
  <rect width="1920" height="1080" fill="url(#fe-sun)"/>

  <!-- Sunbeams / Komorebi Rays (Semi-transparent light shafts) -->
  <polygon points="600,0 800,0 1100,1080 800,1080" fill="#fef08a" opacity="0.12"/>
  <polygon points="670,0 830,0 1350,1080 1120,1080" fill="#ffffff" opacity="0.15"/>
  <polygon points="520,0 650,0 900,1080 720,1080" fill="#fef08a" opacity="0.1"/>

  <!-- Distant Mountain Ridge in Soft Sage -->
  <path d="M 0,640 Q 320,520 640,580 T 1280,540 Q 1600,500 1920,560 L 1920,1080 L 0,1080 Z" fill="#a7f3d0" opacity="0.3"/>
  <path d="M 0,720 Q 400,620 800,670 T 1600,650 L 1920,680 L 1920,1080 L 0,1080 Z" fill="#6ee7b7" opacity="0.25"/>

  <!-- Pine Tree Silhouettes in Light Emerald -->
  <g fill="#059669" opacity="0.4">
    <!-- Tree 1 -->
    <polygon points="240,620 200,720 280,720"/>
    <polygon points="240,680 180,790 300,790"/>
    <polygon points="240,750 160,880 320,880"/>
    <rect x="230" y="880" width="20" height="100" fill="#047857"/>
    <!-- Tree 2 -->
    <polygon points="420,660 390,740 450,740"/>
    <polygon points="420,710 370,810 470,810"/>
    <polygon points="420,770 350,900 490,900"/>
    <!-- Tree 3 (Right) -->
    <polygon points="1600,590 1560,690 1640,690"/>
    <polygon points="1600,650 1540,760 1660,760"/>
    <polygon points="1600,720 1520,860 1680,860"/>
    <rect x="1590" y="860" width="20" height="120" fill="#047857"/>
    <!-- Tree 4 -->
    <polygon points="1750,640 1720,730 1780,730"/>
    <polygon points="1750,700 1700,800 1800,800"/>
  </g>
</svg>
`;

// 6. Ocean Adventure: Bright sunlit tropical coastal waters, turquoise shallows, and coral silhouettes
const oceanAdventureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="oa-water" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="35%" stop-color="#e0f2fe"/>
      <stop offset="70%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#7dd3fc"/>
    </linearGradient>
    <radialGradient id="oa-sun" cx="50%" cy="10%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
      <stop offset="30%" stop-color="#e0f2fe" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f0f9ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#oa-water)"/>
  <rect width="1920" height="1080" fill="url(#oa-sun)"/>

  <!-- Piercing Ocean Sunbeams -->
  <polygon points="850,0 1070,0 1350,1080 1100,1080" fill="#ffffff" opacity="0.18"/>
  <polygon points="720,0 900,0 1020,1080 800,1080" fill="#ffffff" opacity="0.15"/>
  <polygon points="1020,0 1180,0 1550,1080 1320,1080" fill="#ffffff" opacity="0.12"/>

  <!-- Distant Graceful Manta Ray Silhouettes -->
  <path d="M 460,340 Q 520,320 580,340 Q 550,370 520,400 Q 490,370 460,340 Z" fill="#0284c7" opacity="0.35"/>
  <path d="M 520,390 Q 525,440 530,470" stroke="#0284c7" stroke-width="2" fill="none" opacity="0.35"/>

  <!-- Bottom Coral Reef Silhouettes in Gentle Ocean Blue -->
  <path d="M 0,940 Q 120,890 200,920 T 380,880 Q 450,910 520,890 T 700,920 L 700,1080 L 0,1080 Z" fill="#0284c7" opacity="0.25"/>
  <path d="M 1250,920 Q 1400,880 1520,910 T 1740,870 Q 1830,900 1920,880 L 1920,1080 L 1250,1080 Z" fill="#0284c7" opacity="0.25"/>

  <!-- Delicate Coral Branch Fans -->
  <path d="M 160,940 Q 170,860 140,800 Q 190,830 210,870 Q 230,820 270,780 Q 260,850 250,920" fill="#38bdf8" opacity="0.35"/>
  <path d="M 1720,930 Q 1710,840 1740,780 Q 1690,810 1670,860 Q 1640,800 1600,760 Q 1620,840 1640,910" fill="#38bdf8" opacity="0.35"/>
</svg>
`;

// 7. Rainy Day: Peaceful overcast grey-blue misty sky with delicate rainfall streaks
const rainyDaySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="rd-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="35%" stop-color="#f1f5f9"/>
      <stop offset="70%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="rd-cloud" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#rd-sky)"/>

  <!-- Soft Misty Rain Clouds -->
  <path d="M 0,320 Q 300,240 600,280 T 1200,250 Q 1560,210 1920,270 L 1920,0 L 0,0 Z" fill="url(#rd-cloud)"/>
  <path d="M 0,440 Q 380,360 760,400 T 1520,380 Q 1740,340 1920,390 L 1920,0 L 0,0 Z" fill="#94a3b8" opacity="0.15"/>

  <!-- Distant Foggy Horizon / City Outline -->
  <path d="M 0,780 Q 360,720 720,750 T 1440,730 Q 1680,700 1920,740 L 1920,1080 L 0,1080 Z" fill="#94a3b8" opacity="0.25"/>
  <path d="M 0,860 Q 420,810 840,840 T 1680,830 L 1920,850 L 1920,1080 L 0,1080 Z" fill="#64748b" opacity="0.2"/>

  <!-- Delicate Rain Streaks (Soft Diagonal Lines) -->
  <g stroke="#94a3b8" stroke-width="1.2" opacity="0.32" stroke-linecap="round">
    <line x1="160" y1="80" x2="130" y2="240"/>
    <line x1="380" y1="180" x2="350" y2="340"/>
    <line x1="620" y1="60" x2="590" y2="220"/>
    <line x1="840" y1="200" x2="810" y2="360"/>
    <line x1="1100" y1="100" x2="1070" y2="260"/>
    <line x1="1340" y1="220" x2="1310" y2="380"/>
    <line x1="1580" y1="90" x2="1550" y2="250"/>
    <line x1="1820" y1="190" x2="1790" y2="350"/>
  </g>
</svg>
`;

// 8. Aurora Sky: Bright pastel northern lights with soft undulating iridescent ribbons
const auroraSkySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="au-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0fdfa"/>
      <stop offset="35%" stop-color="#ecfeff"/>
      <stop offset="70%" stop-color="#f5f3ff"/>
      <stop offset="100%" stop-color="#e0e7ff"/>
    </linearGradient>
    <linearGradient id="au-ribbon1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5eead4" stop-opacity="0"/>
      <stop offset="30%" stop-color="#5eead4" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#67e8f9" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#5eead4" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="au-ribbon2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0"/>
      <stop offset="40%" stop-color="#c084fc" stop-opacity="0.4"/>
      <stop offset="75%" stop-color="#a855f7" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#c084fc" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#au-sky)"/>

  <!-- Ethereal Undulating Aurora Wave 1 (Mint/Cyan) -->
  <path d="M 0,260 Q 420,140 860,240 T 1720,200 Q 1820,220 1920,240 L 1920,440 Q 1520,380 1120,460 T 0,420 Z" fill="url(#au-ribbon1)"/>

  <!-- Ethereal Aurora Wave 2 (Soft Lavender/Violet) -->
  <path d="M 0,360 Q 480,240 980,340 T 1920,300 L 1920,540 Q 1440,460 960,560 T 0,500 Z" fill="url(#au-ribbon2)"/>

  <!-- Distant Snowy Ridge Silhouettes in Soft Periwinkle -->
  <path d="M 0,720 Q 320,620 640,680 T 1280,640 Q 1620,580 1920,650 L 1920,1080 L 0,1080 Z" fill="#c7d2fe" opacity="0.3"/>
  <path d="M 0,810 Q 400,740 820,780 T 1640,760 L 1920,790 L 1920,1080 L 0,1080 Z" fill="#a5b4fc" opacity="0.25"/>
</svg>
`;

// 9. Autumn Breeze: Warm golden seasonal scenery with autumn trees and drifting leaves
const autumnBreezeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="ab-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="35%" stop-color="#ffedd5"/>
      <stop offset="70%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#ffedd5"/>
    </linearGradient>
    <radialGradient id="ab-sun" cx="75%" cy="30%" r="45%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.55"/>
      <stop offset="35%" stop-color="#fed7aa" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#fff7ed" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#ab-sky)"/>
  <rect width="1920" height="1080" fill="url(#ab-sun)"/>

  <!-- Distant Warm Golden Hills -->
  <path d="M 0,680 Q 360,560 720,630 T 1440,590 Q 1680,540 1920,610 L 1920,1080 L 0,1080 Z" fill="#fdba74" opacity="0.35"/>
  <path d="M 0,760 Q 420,660 840,710 T 1680,690 L 1920,720 L 1920,1080 L 0,1080 Z" fill="#fb923c" opacity="0.25"/>

  <!-- Left Autumn Tree Branches with Crimson & Golden Leaves -->
  <path d="M -40,120 Q 200,80 360,160 T 680,130" stroke="#9a3412" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.45"/>
  <path d="M 300,140 Q 380,240 450,280" stroke="#9a3412" stroke-width="4.5" fill="none" opacity="0.4"/>
  <g fill="#ea580c" opacity="0.6">
    <ellipse cx="280" cy="130" rx="18" ry="12"/>
    <ellipse cx="360" cy="180" rx="20" ry="14"/>
    <ellipse cx="460" cy="240" rx="18" ry="13"/>
    <ellipse cx="560" cy="140" rx="22" ry="15"/>
    <ellipse cx="640" cy="160" rx="16" ry="12"/>
  </g>
  <g fill="#f59e0b" opacity="0.75">
    <ellipse cx="260" cy="115" rx="14" ry="10"/>
    <ellipse cx="340" cy="165" rx="15" ry="11"/>
    <ellipse cx="440" cy="225" rx="14" ry="10"/>
    <ellipse cx="540" cy="125" rx="16" ry="12"/>
  </g>
</svg>
`;

// 10. Snowfall: Clean peaceful winter landscape with snowy hills and crystalline snowflakes
const snowfallSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="sf-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="35%" stop-color="#f1f5f9"/>
      <stop offset="70%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <radialGradient id="sf-glow" cx="50%" cy="25%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#f1f5f9" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f8fafc" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sf-sky)"/>
  <rect width="1920" height="1080" fill="url(#sf-glow)"/>

  <!-- Soft Rolling Snow-Covered Mountains -->
  <path d="M 0,660 Q 360,540 720,620 T 1440,580 Q 1680,520 1920,590 L 1920,1080 L 0,1080 Z" fill="#cbd5e1" opacity="0.35"/>
  <path d="M 0,760 Q 420,670 840,720 T 1680,700 L 1920,730 L 1920,1080 L 0,1080 Z" fill="#e2e8f0" opacity="0.45"/>

  <!-- Snow-Dusted Pine Tree Silhouettes -->
  <g fill="#94a3b8" opacity="0.4">
    <polygon points="300,640 260,740 340,740"/>
    <polygon points="300,700 240,810 360,810"/>
    <polygon points="300,770 220,900 380,900"/>

    <polygon points="1550,620 1510,720 1590,720"/>
    <polygon points="1550,680 1490,790 1610,790"/>
    <polygon points="1550,750 1470,880 1630,880"/>
  </g>

  <!-- Clean Snow Surface Ground -->
  <path d="M 0,890 Q 480,840 960,870 T 1920,860 L 1920,1080 L 0,1080 Z" fill="#ffffff" opacity="0.5"/>
</svg>
`;

export const IMPRESSIVE_ARTWORK = Object.freeze({
  'anime-studio': toSvgDataUri(animeStudioSvg),
  'sakura-dreams': toSvgDataUri(sakuraDreamsSvg),
  'vintage-paper': toSvgDataUri(vintagePaperSvg),
  'orchid': toSvgDataUri(orchidSvg),
  'forest-escape': toSvgDataUri(forestEscapeSvg),
  'ocean-adventure': toSvgDataUri(oceanAdventureSvg),
  'rainy-day': toSvgDataUri(rainyDaySvg),
  'aurora-sky': toSvgDataUri(auroraSkySvg),
  'autumn-breeze': toSvgDataUri(autumnBreezeSvg),
  'snowfall': toSvgDataUri(snowfallSvg),
});
