# STATUS.md — Progress tracker

Update this after every phase. A new chat should be able to continue from this file alone.

## Fixtures (you add these, see fixtures/README.md)
| Page | Saved? |
|---|---|
| Home | [ ] |
| Problemset | [ ] |
| Problem | [ ] |
| Contest page | [ ] |
| Contest problem | [ ] |
| Standings | [ ] |
| Submissions | [ ] |
| Profile | [ ] |
| Blog | [ ] |
| Login | [ ] |

## Phases
| # | Phase | Built | Tested by AI | Tested by me in Chrome |
|---|---|---|---|---|
| 1 | Foundation | [x] | [x] | [ ] |
| 2 | Safe styling | [x] | [x] | [ ] |
| 3 | Themes + first-run card | [x] | [x] | [ ] |
| 4 | Background + Transparency + Colors from image | [x] | [x] | [ ] |
| 5 | Fonts | [x] | [x] | [ ] |
| 6 | Contest mode, Auto dark, Per page | [x] | [x] | [ ] |
| 7 | Custom themes + Share theme + Backup | [x] | [x] | [ ] |
| 8 | QA + ZIP | [x] | [x] | [ ] |
| 9 | Complete Product Rebuild (Appearance Studio) | [x] | [x] | [ ] |
| 10 | Three-Colour Palette Theme System & Surface Engine | [x] | [x] | [ ] |
| 11 | Translucent Surface System & Frosted Glass Effects | [x] | [x] | [ ] |
| 12 | UI Refinement, Block Transparency & Simple Font Loader | [x] | [x] | [ ] |
| 13 | Theme-Aware Surfaces, Global Block Transparency & 3 Treatments | [x] | [x] | [ ] |
| 14 | Collapsible Background Adjustments, 3-Column Themes & Compact Cards | [x] | [x] | [ ] |
| 15 | Global Font Consistency & Navigation Contrast Improvement | [x] | [x] | [ ] |
| 16 | Custom Theme 3-Colour Palette Engine & Live Application | [x] | [x] | [ ] |
| 17 | Obsidian Dark Theme & Repositioned Custom Palette | [x] | [x] | [ ] |
| 18 | Theme System Redesign & Impressive Theme Collection | [x] | [x] | [ ] |
| 19 | Improved Impressive Themes (10 Light Animated Themes) | [x] | [x] | [ ] |
| 20 | Header & Visual Identity Minimalist Overhaul | [x] | [x] | [ ] |
| 21 | High-Resolution Logo Asset & Release Packaging | [x] | [x] | [ ] |

## Known issues
(none)

## High-Resolution Logo Asset & Release Packaging (Phase 21)
1. **Master Logo Integration**:
   - Integrated `Vibrant Data Paintbrush Logo.png` as master asset in `assets/logo.png`.
   - Processed with high-quality bicubic downsampling, precise content framing, and smooth edge anti-aliasing with transparent background.
   - Generated complete Chrome MV3 icon suite in `assets/icons/`:
     - `16.png` (16x16) — browser tab & context menu
     - `32.png` (32x32) — Windows high-DPI display
     - `48.png` (48x48) — `chrome://extensions` management page
     - `128.png` (128x128) — Chrome Web Store & extension details
     - `icon-256.png` (256x256) & `icon-512.png` (512x512) — high-resolution store promo assets
2. **Automated Generation Script**:
   - Updated `scripts/generate-icons.js` (`npm run generate-icons`) to reproducibly generate the icon suite from `assets/logo.png`.
3. **Build & Release Packages**:
   - Ran `npm run build` and `npm run package`.
   - Generated `cf-studio.zip` (full source + distribution release) and `cf-studio-dist.zip` (clean standalone `dist/` archive for Chrome Web Store upload).
   - Available at both project root and `./CF-Studio-project/`.
4. **Testing**:
   - 148 unit tests passing with 0 failures (`npm test`).

## Header & Visual Identity Minimalist Overhaul (Phase 20)
1. **Removed Unnecessary Branding**:
   - Completely removed `.cfs-logo-badge` and SVG icon from the header.
   - Completely removed `.cfs-badge-studio` ("APPEARANCE STUDIO").
   - Removed decorative branding graphics, illustrations, and badges without replacement.
2. **Simplified Header**:
   - Clean, minimal developer-tool layout:
     `CF Studio                                      [Toggle]`
     `● Active`
   - Plain text title `CF Studio` (`font-size: 13px`, `font-weight: 600`, restrained typography).
   - Crisp status line directly below title: `● Active` (or `Initialising`, `Disabled`, `Unsupported page`), with status dot and retry link.
   - Master switch toggle positioned on the right.
3. **Removed AI-Generated / SaaS Dashboard Visual Styling**:
   - Replaced heavy border radii (such as 12px pills) with crisp 3px/4px subtle corners.
   - Removed decorative tab icons from navigation tabs; tabs are now clean, text-only developer tools tabs (`Themes`, `Backgrounds`, `Fonts`).
   - Removed gradient backgrounds and glowing box-shadows from `.cfs-custom-palette-btn`.
   - Removed 3D hover `transform: translateY(-1px)` and box-shadow glows from theme cards and Impressive cards.
   - Removed glowing box-shadow from active status dot.
4. **Refined Overall Interface (Developer Tools Aesthetic)**:
   - Neutral light background (`#ffffff` root and cards, `#f6f8fa` panels and headers).
   - Compact typography (`11px` - `12px` base text, monospace for hex/numbers).
   - Thin separators (`1px solid #e1e4e8` and `#d0d7de`).
   - Restrained blue accents for active/selected states (`#0969da`).
   - Consistent alignment and space utilization.
5. **Preserved All Existing Capabilities**:
   - Master enable/disable toggle.
   - Status indicators (`status-dot`, `status-text`, `retry-btn`, `error-banner`).
   - Three navigation tabs (`tab-themes`, `tab-backgrounds`, `tab-fonts`).
   - Predefined theme gallery (16 themes: 5 Light, 1 Obsidian Dark, 10 Light Impressive).
   - Custom Palette editor and button (`btn-toggle-custom-palette`).
   - Atmospheric animation toggle (`toggle-impressive-animations`).
   - Backgrounds & Surface Treatments (Solid, Translucent, Frosted + Sliders).
   - Font customisation (Google Fonts / local font family loader).
   - Export, Import, and Reset options.
6. **Test Verification**:
   - 148 unit tests passing with 0 failures (`tests/unit/header-and-minimal-ui.test.js` added).
   - Verified clean build (`npm run build`) and release packages (`npm run package`).

## Improved Impressive Themes (Phase 19)
1. **All Impressive Themes Follow Strict Light Appearance**:
   - Converted all Impressive themes to `kind: 'light'`.
   - Every theme generates light page backgrounds ($\ge 0.85$ luminance), light content panels, light sidebars, light navigation surfaces, light tables, and deeply dark readable text ($\le 0.02$ luminance, contrast ratio $\ge 12:1$).
   - Completely resolved readability issues with Codeforces dark elements and unstyled text.
2. **Retained & Refined Existing 6 Impressive Themes**:
   - `anime-studio`: Light illustrated city atmosphere at golden afternoon/twilight dawn with pastel sky and periwinkle buildings.
   - `sakura-dreams`: Soft pink cherry blossom atmosphere, delicate rose petals, light cream/pink surfaces.
   - `vintage-paper`: Warm aged parchment and antique paper, ivory surfaces, antique cartography compass.
   - `orchid`: Pale floral purple and lavender atmosphere, light lilac surfaces, cascading blossom branches.
   - `forest-escape`: Light botanical greens, sun-dappled komorebi mist, pine silhouettes.
   - `ocean-adventure`: Bright ocean blues and coastal waters, crystal clear aqua shallows, sunlight beams, coral silhouettes.
3. **Introduced 4 New Animated Impressive Themes**:
   - `rainy-day`: Peaceful overcast grey-blue misty sky, cool silver surface tint, gentle falling rain streaks.
   - `aurora-sky`: Bright pastel northern lights with undulating ribbons in pastel cyan, mint, and lavender.
   - `autumn-breeze`: Warm seasonal autumn atmosphere, golden amber and cream surfaces, falling/drifting autumn leaves.
   - `snowfall`: Peaceful winter landscape, soft icy-blue and clean white surfaces, gently falling snowflakes.
4. **Dedicated Atmospheric Particle Animator**:
   - Implemented `src/content/atmospheric-animator.js` running on detached `#cfs-bg-canvas` behind Codeforces content at `z-index: -999999` with `pointer-events: none`.
   - Moving visual elements: rain visibly falls, aurora slowly moves, autumn leaves sway and fall, snowflakes gently drift down, cherry petals flutter, bubbles rise, fireflies pulse.
   - Automatic pause on inactive tabs, zero CPU waste, GPU-composited, respects `prefers-reduced-motion`.
5. **Global Atmospheric Animations Toggle**:
   - Added `#toggle-impressive-animations` switch in `src/popup/popup.html` and `src/popup/popup.js`.
   - Allows users to disable environmental animations at will while retaining static vector backgrounds.
6. **Test Suite Verification**:
   - 144 passing unit tests across 27 test files (`npm test`), 0 failures.
   - Validated WCAG AA/AAA contrast ($\ge 4.5:1$ on all pairs, $\ge 12:1$ on text surfaces).
   - Clean build and packaged release zip archives (`cf-studio.zip` and `cf-studio-dist.zip`).

## Theme System Redesign & Impressive Theme Collection (Phase 18)
1. **Live Preview Removed**:
   - Deleted `#top-preview-box` and `#mini-cf-window` miniature Codeforces box above theme gallery in `popup.html`.
   - Removed all `updateTopPreview` logic and listeners from `popup.js`.
   - Themes tab now opens directly with the toolbar, followed immediately by theme cards.
2. **Curated Predefined Light Collection (5 Themes)**:
   - Preserved exactly 5 light themes: `pure-light`, `paper`, `nord-light`, `rose`, `botanical`.
   - Removed 7 redundant light presets (`solarized-light`, `lavender`, `coastal`, `editorial`, `minimal-light`, `cloudscape-light`, `sakura-light`).
3. **Streamlined Filter Toolbar (No "All" Filter)**:
   - Exactly 4 controls: `[ Light ] [ Dark ] [ Impressive ] [ Custom Palette ]`.
   - `Light`: Displays the 5 curated light themes.
   - `Dark`: Displays `obsidian`.
   - `Impressive`: Displays the 6 new Impressive themes.
   - `Custom Palette`: Action pill with default highlighted/emphasized gradient styling.
4. **Custom Palette Highlighted by Default (Closed)**:
   - Button visually emphasized with subtle glowing border and accent background.
   - Editor starts hidden (`hidden`) and does NOT auto-open on startup or reload.
   - Toggles open/closed explicitly on user click.
5. **Fixed Unexpected "Choose a theme" Popup on Codeforces**:
   - Completely deleted `src/content/first-run-card.js`.
   - Removed `showIntroCard` and `triggerIntroCard` calls from `content.js`.
   - Codeforces page load is clean, zero unwanted overlays.
6. **Impressive Theme Collection (6 Themes with Artwork & Subtle Ambient Animations)**:
   - Self-contained resolution-independent vector artwork (`src/themes/impressive-art.js`):
     1. **Anime Studio** (`anime-studio`): Twilight cityscape with illuminated skyline and glowing billboard reflections.
     2. **Sakura Dreams** (`sakura-dreams`): Dusk cherry blossom branches, glowing moon, soft petal atmosphere.
     3. **Vintage Paper** (`vintage-paper`): Warm parchment textures, antique cartography compass rose, fine-line engravings.
     4. **Orchid** (`orchid`): Deep purple twilight flora, glowing night orchid petals, bioluminescent spores.
     5. **Forest Escape** (`forest-escape`): Misty mountain pine forest, komorebi sunbeam haze, ambient fireflies.
     6. **Ocean Adventure** (`ocean-adventure`): Abyssal ocean depths, radiant sunbeams, bioluminescent jellyfish, rising bubbles.
   - Built on 3-colour palette engine with full 22 design tokens.
   - Cards display artwork preview banner (`.cfs-card-art-preview`).
   - Background engine automatically renders artwork behind Codeforces surfaces in `#cfs-bg-layer`.
   - Uploaded user images seamlessly override default theme artwork when active without resetting preferences.
   - 100% compliant with zero layout property rules and zero stylesheet opacity rules.
   - Hardware-accelerated ambient motion via Web Animations API on detached background layer.
7. **Test Suite Verification**:
   - 143 passing unit tests across 27 test files (`npm test`), 0 failures.
   - Clean build and packaged release zip archives (`cf-studio.zip` and `cf-studio-dist.zip`).

## Obsidian Dark Theme & Repositioned Custom Palette (Phase 17)
1. **Obsidian Dark Theme**:
   - Added exactly one premium dark theme named **Obsidian** to predefined themes.
   - Built from foundational 3-colour palette:
     - Primary: `#11151D` (deep charcoal)
     - Secondary: `#202630` (dark graphite)
     - Tertiary: `#35C6B0` (muted teal/cyan accent)
   - Automatically derives all 37 design tokens (deep charcoal page-bg, dark graphite surfaces, elevated dark header, muted teal accents, subtle graphite borders, off-white readable text with WCAG AAA contrast $\ge 12:1$, high-contrast navigation states).
   - Preserves all semantic Codeforces colours: verdicts (Accepted, WA, TLE, MLE), rating colours, tags, and code syntax highlighting.
   - Dark theme card in gallery with miniature dark Codeforces mockup and three distinct swatches (`#11151D`, `#202630`, `#35C6B0`).

2. **Repositioned Custom Palette in Filter Toolbar**:
   - Removed Custom Theme card from the theme gallery grid (not counted among the 13 predefined themes).
   - Added a compact pill button labelled **Custom Palette** immediately to the right of the theme filters:
     `[ All 13 ] [ Light 12 ] [ Dark 1 ] [ Custom Palette ]`
   - Filter pills show exact counts:
     - **All 13**: displays all 13 predefined themes (12 light + 1 dark).
     - **Light 12**: displays the 12 standard light themes.
     - **Dark 1**: displays only Obsidian.
   - Clicking Custom Palette toggles the compact 3-colour customization panel with active state styling.

3. **Freedom for Light and Dark Custom Palettes**:
   - Theme engine dynamically detects and generates properly balanced light or dark themes based on user-selected palette luminance without forcing light-theme policy on custom palettes.
   - Real-time updates across the miniature preview, top live preview, and active Codeforces tab.
   - Persisted in local extension storage (`settings.customThemes`) and restored on restart/refresh.
   - 138 automated unit tests passing (`npm test`), distribution and release archives generated (`npm run build`, `npm run package`).

## Custom Theme 3-Colour Palette Engine & Live Application (Phase 16)
1. **Custom Theme Card**:
   - Added a compact card labelled **Custom Theme** alongside the existing 12 theme cards in the 3-column gallery grid.
   - Preserved exactly three tabs in navigation: Themes, Backgrounds, Fonts (no extra tabs).
   - Displays miniature Codeforces mockup and three color dots representing the custom primary, secondary, and tertiary palette.
   - Shows active checkmark tag when selected (`themeId === 'custom'`).

2. **Compact Customization Panel with Three Colour Inputs**:
   - Smoothly expands above the grid upon clicking Custom Theme (or when Custom Theme is already active).
   - Exactly three color controls:
     1. **Primary Colour**: Identity, buttons, active nav, focus accents.
     2. **Secondary Colour**: Ambient page background, header, content panels, table rows, sidebars, borders.
     3. **Tertiary Colour**: Links, link hover, secondary highlights.
   - Each control provides:
     - Clickable native color picker (`<input type="color">`).
     - Hex input box (`<input type="text" maxlength="7">`).
     - Real-time swatch preview showing the selected color.

3. **Automatic Theme Generation & Live Application**:
   - The three colors act as the source palette for the entire theme via `generateThemeFromPalette`.
   - Generates all 37 design tokens (page-bg, header-bg, nav-bg, subnav-bg, content-bg, table-header-bg, table-row-bg, text, link, buttons, borders, hover/active states).
   - Real-time live preview:
     - Updates top Codeforces preview window (`#preview-cf-window`) immediately.
     - Updates the miniature mockup and swatches on the Custom Theme card immediately.
     - Sends live preview messages to the active Codeforces tab without requiring a page reload.

4. **Persistence & Controls**:
   - **Apply Custom Theme**: Commits the custom theme and activates it globally.
   - **Save Custom Theme**: Persists the palette and generated tokens in `settings.customThemes`.
   - **Reset**: Restores default light custom palette (`#1a73e8`, `#dbe4ee`, `#0d65d9`) and reapplies.
   - Automatically restored and reapplied across page refreshes and browser restarts via `resolveThemeObject('custom', settings.customThemes)`.
   - 135 automated unit tests passing (`npm test`), distribution rebuilt (`npm run build`, `npm run package`).

## Global Font Consistency & Navigation Contrast Improvement (Phase 15)
1. **Central Font-Family Variable & Global Propagation**:
   - Centralized font variables in `:root[data-cfs-on="true"]`:
     - `--cf-studio-font-family: ${pageStack};`
     - `--cfs-font-family: var(--cf-studio-font-family);`
     - `--cf-studio-font-headings: ${headingsStack};`
     - `--cf-studio-font-statement: ${statementStack};`
     - `--cf-studio-font-code: ${codeStack};`
   - Added scoped CSS overrides overriding Codeforces explicit font declarations across:
     - Blog posts, comments, community discussions (`div.ttypography`, `.topic`, `.comment`, `.community`)
     - Announcements and banners (`.notice`, `.info`, `.alert`, `.roundbox.highlighted`)
     - Navigation links and headers (`.main-menu-list`, `#header`, `.second-level-menu`, `.lang-chooser`, `.personal-sidebar`)
     - Sidebar titles, box headers, and box content (`.sidebox`, `.titled`)
     - Buttons, inputs, dropdowns, and form labels (`button`, `input`, `select`, `textarea`, `label`, `.drop-down-menu`)
     - Contest tables, standings tables, and participant handles (`table.datatable`, `table.problems`, `table.standings`, `a[class*="user-"]` while preserving rating colors).

2. **Monospace Code & Math Preservation**:
   - Code blocks, inline code, submission views, and samples strictly retain monospace styling: `pre, code, .source-code, .sample-test pre, kbd, samp, tt, .diff pre, .prettyprint, .linenums` with `font-family: var(--cf-studio-font-code) !important;`.
   - MathJax and KaTeX formulas strictly retain native math glyph fonts with `font-family: inherit !important;`.
   - Icon fonts and SVG elements retain native icons.

3. **Font Validation & Safe Fallback**:
   - Single Google Fonts family input format retained with clean sanitized family parsing.
   - Clear feedback error message in Fonts panel if invalid characters or format are entered.
   - Clean system font fallback stack (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`) ensures typography never breaks if font fails to load.

4. **Dynamic Theme-Aware Navigation Colors & Contrast Enforcement**:
   - Introduced dedicated navigation tokens in `palette-generator.js`:
     - `nav-bg`, `nav-text`, `nav-hover-bg`, `nav-hover-text`, `nav-active-bg`, `nav-active-text`, `nav-active-hover-bg`, `nav-border`
     - `subnav-bg`, `subnav-text`, `subnav-hover-bg`, `subnav-hover-text`, `subnav-active-bg`, `subnav-active-text`, `subnav-active-hover-bg`
   - Enforced WCAG contrast ratio $\ge 4.5:1$ across all navigation states across all 12 built-in themes.
   - Completely resolved Paper theme brown-on-brown contrast problem:
     - Normal nav text: 15.6:1 contrast against navbar background.
     - Hover nav text: 10.5:1 contrast against hover background.
     - Active tab: vibrant theme primary with crisp white text (5.93:1 contrast).
   - Navigation links are strictly decoupled from generic body `a:not(...)` link styles, eliminating accidental link-hover color leaks.

5. **Verification**:
   - 131 automated unit tests passing (`npm test`).
   - Rebuilt `dist/` and packaged release ZIP archives (`cf-studio.zip`, `cf-studio-dist.zip`).

## Collapsible Backgrounds, 3-Column Themes & Compact Cards (Phase 14)
1. **Collapsible Background Adjustment Sections**:
   - Organized settings into two compact expandable/collapsible dropdown sections:
     - **Section A: Surface Treatment**: Expands to show Solid/Translucent/Frosted pills, Block Transparency slider, and Frosted Blur slider.
     - **Section B: Image Adjustments**: Expands to show Position, Size, Opacity/Strength, Blur, Brightness, Contrast, and Saturation.
   - Interactive accordion: clicking a header expands/collapses it with a smooth chevron transition; opening one section collapses the other to minimize vertical height.
   - Default state: both sections collapsed while keeping the background thumbnail preview prominent.
   - All values and settings are strictly preserved when collapsing/expanding.

2. **3-Column Theme Gallery Grid & Compact Cards**:
   - Switched theme gallery to a responsive 3-column grid (`grid-template-columns: repeat(3, minmax(0, 1fr))`).
   - Cards are compact rectangular tiles (~70px height) fitting cleanly within the popup without horizontal overflow.
   - Completely removed all descriptive text lines from cards.
   - Minimal padding, 26px miniature Codeforces mockup, and three color-focused swatches aligned in a row without written labels.

3. **Exactly 12 Standard Light Themes (4 Rows of 3)**:
   - Filter bar simplified to strictly `All (12)` and `Light (12)`.
   - Impressive collection, animations, and extra filters completely removed.
   - Standard light theme library:
     1. Pure Light
     2. Paper
     3. Nord Light
     4. Rose
     5. Solarized Light
     6. Lavender
     7. Coastal
     8. Botanical
     9. Editorial
     10. Minimal Light
     11. Cloudscape Light
     12. Sakura Light
   - All 12 themes pass WCAG AAA/AA text-surface contrast tests.

4. **Testing and Verification**:
   - 127/127 unit tests pass 100%.
   - Full bundle built into `dist/` and packaged into `cf-studio.zip` and `cf-studio-dist.zip`.

## Theme-Aware Surfaces, Global Block Transparency & 3 Treatments (Phase 13)
1. **Completely Removed Individual Block Transparency**:
   - Deleted `src/content/block-selector.js` and all related selection overlays, boundary highlights, click-to-select inspectors, and per-block slider arrays.
   - Removed `START_BLOCK_SELECTION`, `STOP_BLOCK_SELECTION`, and `GET_BLOCK_SELECTION_STATUS` from messaging and content script.
   - Removed `mode: 'individual'` and `blocks: { ... }` from defaults and schema validation.

2. **Single Global Block Transparency Control**:
   - Retained one unified slider: **Block Transparency** (0% to 100%).
   - Controls translucency across all supported Codeforces surfaces together with instant live update.
   - Kept background-image adjustments (position, size, strength, blur, brightness, contrast, saturation) separate.

3. **Three Distinct Surface Treatments**:
   - **Solid**: Surfaces render 100% solid, fully opaque theme-matched colors with zero backdrop blur.
   - **Translucent**: Surfaces render theme-matched colors with adjustable translucency via the Block Transparency slider (no blur).
   - **Frosted**: Surfaces render theme-matched colors with adjustable translucency plus `backdrop-filter: blur(...)` and `-webkit-backdrop-filter: blur(...)` with customizable blur radius.

4. **Theme-Aware Surfaces from 3-Colour Palette (No Hardcoded White)**:
   - Updated `src/themes/palette-generator.js` to derive all surface tokens dynamically from the Secondary hue and saturation:
     - `content-bg`: Theme-tinted primary content surface (L: 97.6%) — pale sage for Botanical, pale blush for Rose, pale lavender for Lavender, pale ocean for Coastal.
     - `surface-1`: Distinct tinted panel surface (L: 93.0%) for sidebars, captions, and dialogs.
     - `surface-2`: Nested panels and chips (L: 88.5%).
     - `table-header-bg`: Tinted headers for datatables, problemset, and standings (L: 91.5%).
     - `table-row-bg`: Base table row surface (L: 98.0%).
     - `table-row-alt-bg`: Tinted alternate table rows (L: 95.2%).
     - `header-bg`: Top navigation bar (L: 97.0%).
     - `input-bg`: Forms, textareas, and inputs (L: 98.4%).
     - `code-bg`: Dedicated calm code block surface (L: 93.8%).
   - Overwhelming WCAG AAA ($\ge 7:1$) and AA ($\ge 4.5:1$) contrast verified across all pairs on all 20 built-in themes.

5. **Exhaustive Codeforces CSS Coverage**:
   - Mapped theme tokens to real Codeforces elements across all major page types:
     - Main content: `.roundbox`, `.topic`, `.content-box`, `.problemindexbox`, `.problem-statement`, `div.ttypography`, `.comment-table`, `.comment`.
     - Tables & nested cells: `table.datatable`, `table.tablesorter`, `table.rtable`, `table.problems`, `table.standings`, `.contestList table`, `.status-frame-datatable`, `th`, `tr`, `td` (including nested `td` rules to eliminate Codeforces's default white cell backgrounds).
     - Alternate rows & cells: `tr:nth-child(even) td`, `tr.dark td`, `td.back-light`.
     - Sidebars: `.sidebox`, `.sidebox .content`, `.roundbox.sidebox`, `.titled`, `.personal-sidebar`.
     - Contest info panels: `.contest-info`, `.roundbox.highlighted`.
     - Navigation: `#header`, `.main-menu-list`, `.second-level-menu`, `.lang-chooser`.
     - Forms & inputs: `input[type="text"]`, `input[type="password"]`, `input[type="search"]`, `input[type="email"]`, `input[type="number"]`, `textarea`, `select`, `table.table-form td`.
   - Zero element `opacity` (pure surface `color-mix` / alpha). Fully preserved text, links, ratings, verdicts, and code.

6. **Quality & Packaging**:
   - 127/127 unit tests pass 100%.
   - Full extension bundle built into `dist/` and packaged into `cf-studio.zip` and `cf-studio-dist.zip`.

## UI Refinement, Block Transparency & Simple Fonts (Phase 12)
1. **Themes Section Simplification & Compaction**:
   - Removed New Theme button, Share button, Favorite stars, and Favorites filter.
   - Filter bar simplified to strictly 3 pills: `All`, `Light`, and `Impressive`.
   - Theme cards compacted: reduced height, tighter internal padding, 38px mini-mockup preview, and single-line description.
   - Simplified 3-color palette display on cards: replaced text-labeled swatches with 3 clean, visually aligned dots without text.
   - Significantly reduced top Live Preview container dimensions and internal spacing.
   - 3-color palette generation engine, persistence, and instant preview preserved intact.

2. **Backgrounds Section Simplification**:
   - Removed built-in patterns gallery. Background gallery simplified to strictly: `None` and `Upload Image`.
   - File upload (PNG/JPG/WebP <= 5MB), clipboard paste, image adjustments, and persistence preserved.

3. **Block Transparency Control System**:
   - Separated into its own dedicated card in the Backgrounds tab:
     - **Mode 1 (Apply to All Blocks)**: Global transparency slider (0-100%) and frosted glass blur slider (0-25px) applying harmoniously across all surface containers.
     - **Mode 2 (Select Individual Blocks)**: Provides granular control with both in-popup block sliders and an interactive on-page visual selector:
       - On-page selector: Highlights visual block boundaries on hover (dashed border), locks selection on click (solid accent border with focus ring), and displays a floating on-page inspector (`#cfs-block-inspector`) with a slider and "Done" button.
       - Independent sliders for: `mainContent`, `sidebar`, `tables`, `navigation`, `contest`, and `code`.
     - Surface-only transparency via `color-mix` and alpha channels; element `opacity` is strictly zero on containers, preserving 100% solid, crisp text, contest ratings, verdicts, and code.

4. **Streamlined Font Customisation**:
   - Replaced complex multi-font inputs, presets, and weight sliders with a single Google Fonts family input:
     - Text input supporting Google Fonts family names (e.g. `Inter`, `Roboto`, `Poppins`, `Fira Code`).
     - Injects `<link id="cfs-google-font" rel="stylesheet" ...>` dynamically into page `head`.
     - Applies custom font to page body, headings, and problem statements while strictly preserving monospace code boxes and icon fonts.
     - `Apply` and `Reset` action buttons with input sanitization and instant feedback.

5. **Overall Popup Compaction & Polish**:
   - Reduced popup dimensions to 420px width and max 580px height.
   - Preserved exactly 3 main tabs: `[ Themes ] [ Backgrounds ] [ Fonts ]`.
   - 125/125 automated unit tests passing. Built and packaged into `dist/`, `cf-studio.zip`, and `cf-studio-dist.zip`.

## Translucent Surface System Notes (Phase 11)
1. **Surface Hierarchy & Controlled Translucency**:
   - Replaced flat, solid content blocks with a fine-tuned surface hierarchy that allows background artwork to shine through gracefully:
     - **Main content panels** (`.roundbox`, `.topic`, `.content-box`): 75–85% opacity (default 80%).
     - **Sidebar panels** (`.sidebox`, `.sidebox .content`, `.titled`): 65–75% opacity (default 70%).
     - **Navigation & Header** (`#header`, `.main-menu-list`): 75–85% opacity (default 80%).
     - **Sub-navigation** (`.second-level-menu`): 70–80% opacity (default 75%).
     - **Table headers** (`th`): 85–92% opacity (default 88%) for strong column legibility.
     - **Table rows** (`tr:nth-child(even)` alternate rows): 65–80% opacity (default 70%).
     - **Table rows** (`tr:nth-child(odd)` standard rows): 75–80% opacity (default 78%).
     - **Secondary surfaces & dialogs** (`.popup`, `.dialog`, `.menu-box`): 65–80% opacity (default 75%).
     - **Code blocks** (`pre`, `code`, `.sample-test`): 90–94% opacity (default 92%) preserving syntax token readability.
     - **Inputs & form fields**: 85–90% opacity (default 88%).

2. **Frosted Glass Backdrop Effects**:
   - Injected standard `backdrop-filter: blur(var(--blur-radius))` and `-webkit-backdrop-filter: blur(var(--blur-radius))` on content panels, sidebars, navigation, table headers, and dialogs.
   - Smoothly blurs background artwork behind surfaces, creating a refined frosted glass effect without visual noise.

3. **Subtle Borders & Restrained Shadows**:
   - Replaced solid borders with subtle translucent palette-derived borders using `color-mix(in srgb, var(--cfs-border) 60%, transparent)`.
   - Added restrained depth shadows: `box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)`.

4. **Critical Text Readability & Safety**:
   - Zero `opacity` on containers containing text (`opacity` never set on site elements).
   - Solid, high-contrast text colours preserved (`var(--cfs-text)`, `var(--cfs-link)`, `var(--cfs-text-muted)`).
   - Codeforces semantic ratings, rank colours, problem tags, and verdicts remain 100% intact.

5. **Integrated Customisation Sliders**:
   - Integrated dual-mode controls in both the **Themes** tab (Custom Palette Creator) and the **Backgrounds** tab:
     - **Surface Translucency Slider**: 0% to 40% with safe minimum/maximum bounds.
     - **Frosted Blur Intensity Slider**: 0px to 25px (default 10px).
   - Dragging either slider triggers instant real-time live preview on the active Codeforces page and syncs storage.
   - 121/121 automated tests passing.

## Three-Colour Palette System Notes (Phase 10)
1. **Three-Colour Foundational Architecture**:
   - Every theme is defined by exactly three foundational colors:
     1. **Primary**: Identity, main buttons, active nav, accents, focus indicator.
     2. **Secondary**: Ambient page background, header background, surfaces, table headers, alternating rows, code blocks, borders.
     3. **Tertiary**: Links, link hover, secondary accents, highlights.
   - Built reusable mathematical derivation engine in `src/themes/palette-generator.js`.
   - Derives full 22 design tokens while maintaining strict visual hierarchy (`page-bg` < `surfaces` < `borders` < `text` < `accents`).

2. **Visibly Meaningful Background & Surface Changes on Codeforces**:
   - Resolved the issue where Codeforces `#pageContent` had an opaque white rule that hid theme backgrounds.
   - `#pageContent`, `#content`, and `.content-with-sidebar` are now transparent, allowing the theme's soft, atmospheric `page-bg` wash to flood the entire viewport.
   - `.roundbox`, `.topic`, `.content-box` sit on top as crisp clean white surfaces (`content-bg: #ffffff`) with themed borders (`border-color: var(--cfs-border)`).
   - `.sidebox`, `.sidebox .content`, `.roundbox .caption`, `.titled` adopt distinct tinted `surface-1`.
   - Table headers (`th`) adopt `table-header-bg`; alternating rows adopt `table-row-alt-bg`.
   - Code blocks (`.sample-test .input`, `pre`, `code`, `.source-code`) adopt `code-bg`.
   - Navigation (`.main-menu-list li.current a`, `.second-level-menu`) adopts `accent` and `surface-1`.
   - Typography uses harmoniously tinted deep charcoal/navy/espresso `text` guaranteeing $\ge 7:1$ AAA contrast.

3. **Theme Cards with Three Distinct Swatches**:
   - Each theme card in the gallery displays three distinct, labeled swatches: `[ ● Pri ] [ ● Sec ] [ ● Ter ]`.
   - Users can immediately understand the theme's color identity at a glance.
   - Top preview box also displays the 3 foundational swatches with hover tooltips showing their exact hex values.

4. **Interactive Custom Palette Creator**:
   - Streamlined into a 3-colour palette builder: Primary, Secondary, Tertiary.
   - Color pickers and hex text inputs for all three foundational colors.
   - Real-time token generation: modifying any of the 3 colors immediately recalculates all 22 tokens, updates the derived swatch strip, updates the miniature Codeforces preview, and pushes live preview to the active Codeforces tab.
   - Save Palette and Save As Copy functionality saves the custom theme with its `palette` and `tokens`.

5. **Built-in Theme Registry Rework**:
   - All 20 light themes (10 Standard + 10 Immersive) regenerated via `generateThemeFromPalette`.
   - 100% WCAG AA $\ge 4.5:1$ contrast pass rate across all text/surface pairs on all 20 themes.
   - 119/119 automated tests passing. Clean build and release package generated.

## Product Rebuild Notes (CF Studio Appearance Studio)
1. **Core Product Structure**:
   - Exactly THREE main sections/tabs: **`[ Themes ] [ Backgrounds ] [ Fonts ]`**.
   - Removed all extra tabs (Components, Layout, More) from top navigation.
   - Clean DevTools-inspired light layout: `#ffffff`, `#f8f9fa`, `#d0d7de`, `#1a73e8`.

2. **Absolute Light-Theme Policy**:
   - Zero dark themes anywhere in CF Studio.
   - Removed legacy dark themes (`midnight`, `slate`, `purple`, `contrast`, `dracula`).
   - Built-in library of exactly **20 Light Themes**:
     - **10 Standard Light Themes**: `pure-light`, `paper`, `nord-light`, `rose`, `solarized-light`, `lavender`, `coastal`, `botanical`, `editorial`, `minimal-light`.
     - **10 Immersive Light Themes**: `anime-studio`, `sakura-day`, `vintage-paper`, `botanical-garden`, `coastal-escape`, `aurora-light`, `cloudscape`, `art-gallery`, `cyber-garden`, `watercolor-dreams`.
   - Strict WCAG AA $\ge 4.5:1$ text contrast verified across all pairs on all 20 themes.
   - Default theme: `pure-light` (100% light canvas).
   - Custom theme creator, share code importer, and settings migration enforce light themes only (rejecting/migrating dark themes).

3. **Theme Gallery & Filters**:
   - Filter bar with 5 strict pills: `All`, `Standard`, `Immersive`, `Favorites`, `Custom`.
   - 2-column gallery of rich theme cards with live miniature Codeforces mockup, category tag, favorite star, 5-color swatch strip, description, and selected indicator.
   - Instant click-to-apply and hover preview on Codeforces tabs.
   - Expandable Custom Palette Creator accordion with token color pickers, live preview strip, Save Palette, Save As Copy, Share code, and Import code.

4. **Background Pipeline Fix**:
   - Fixed the critical bug where background artwork was obscured by opaque surfaces or blocked by Codeforces CSP.
   - When background mode is active, root/body elements receive `background-color: transparent !important;` and surfaces receive translucent tinting with `#ffffff` light contrast wash overlay.
   - Fixed CSP blocking by using base64 `dataUrl` directly (eliminating `blob:` URI violations).
   - 6 curated original light patterns: `soft-grid`, `sakura-pattern`, `subtle-topo`, `sunlight-gradient`, `watercolor-wash`, `minimal-dots`.
   - Upload file (PNG/JPG/WebP $\le 5$ MB) and **Paste from Clipboard** functionality.
   - Background adjustments: Position, Size, Opacity/Strength, Blur, Brightness, Contrast, Saturation, Light Overlay, and Reset Background.
   - "Colors from Image" button generates a matching light theme.

5. **Dedicated Fonts Tab**:
   - First-class tab with Presets (`Default`, `Reading`, `Coding`).
   - Interface Font (UI, menus, headers), Reading Font (problem statements, blogs), Code Font (monospace sample boxes, submissions).
   - Global Base Size selector and Font Weight selector.
   - Live typography preview box showcasing heading, statement, and code in real time.
   - "Reset Fonts" button restoring clean system defaults.
   - Zero remote fonts, 100% locally installed fonts with strict input sanitation.

6. **Footer & Operational Truth**:
   - Compact status indicator: `Disabled`, `Initialising`, `Active`, `Partially applied`, `Unsupported page`, `Error`.
   - Data management: Export JSON backup, Import JSON backup, Reset All Settings.
   - Automated test suite: 113 unit tests pass 100% (0 errors).
   - Production distribution built in `dist/` and packaged in `cf-studio.zip` and `cf-studio-dist.zip`.
