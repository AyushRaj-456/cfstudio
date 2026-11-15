/**
 * CF Studio - Style Engine
 * Generates and manages the single <style id="cfs-style"> and #cfs-bg-layer.
 * Strict conformance to AGENTS.md:
 * - NO layout properties on site elements
 * - NO opacity on site elements (transparency = background alpha only)
 * - NO universal selector with !important (* { ... })
 * - Reversible: cleanup restores original DOM state (removes style tag and bg layer)
 */

import { getBuiltinTheme } from '../themes/builtin.js';
import { getBuiltinBackground } from '../shared/builtin-backgrounds.js';
import { generateFontStyles } from '../shared/fonts.js';
import { startAtmosphericAnimation, stopAtmosphericAnimation } from './atmospheric-animator.js';
import { removeMarkers } from './classifier.js';

export const STYLE_TAG_ID = 'cfs-style';
export const BG_LAYER_ID = 'cfs-bg-layer';

/**
 * Builds CSS variable definitions from a theme object.
 * @param {object} theme
 * @returns {string}
 */
export function buildThemeVariables(theme) {
  const tokens = theme.tokens || {};
  const lines = [];

  for (const [key, value] of Object.entries(tokens)) {
    lines.push(`  --cfs-${key}: ${value};`);
  }

  // Safe fallbacks for navigation tokens if not explicitly in theme
  if (!tokens['nav-bg']) lines.push('  --cfs-nav-bg: var(--cfs-header-bg);');
  if (!tokens['nav-text']) lines.push('  --cfs-nav-text: var(--cfs-text);');
  if (!tokens['nav-hover-bg']) lines.push('  --cfs-nav-hover-bg: var(--cfs-surface-2);');
  if (!tokens['nav-hover-text']) lines.push('  --cfs-nav-hover-text: var(--cfs-link);');
  if (!tokens['nav-active-bg']) lines.push('  --cfs-nav-active-bg: var(--cfs-accent);');
  if (!tokens['nav-active-text']) lines.push('  --cfs-nav-active-text: var(--cfs-button-text);');
  if (!tokens['nav-active-hover-bg']) lines.push('  --cfs-nav-active-hover-bg: var(--cfs-nav-active-bg);');
  if (!tokens['nav-border']) lines.push('  --cfs-nav-border: var(--cfs-border);');
  if (!tokens['subnav-bg']) lines.push('  --cfs-subnav-bg: var(--cfs-surface-1);');
  if (!tokens['subnav-text']) lines.push('  --cfs-subnav-text: var(--cfs-text);');
  if (!tokens['subnav-hover-bg']) lines.push('  --cfs-subnav-hover-bg: var(--cfs-surface-2);');
  if (!tokens['subnav-hover-text']) lines.push('  --cfs-subnav-hover-text: var(--cfs-link);');
  if (!tokens['subnav-active-bg']) lines.push('  --cfs-subnav-active-bg: var(--cfs-accent);');
  if (!tokens['subnav-active-text']) lines.push('  --cfs-subnav-active-text: var(--cfs-button-text);');
  if (!tokens['subnav-active-hover-bg']) lines.push('  --cfs-subnav-active-hover-bg: var(--cfs-subnav-active-bg);');

  return `:root[data-cfs-on="true"] {\n${lines.join('\n')}\n}`;
}

/**
 * Computes opacity percent remaining (100% = solid, 0% = transparent).
 * @param {number} groupVal 0-100
 * @param {number} allVal 0-100
 * @returns {number} 0-100
 */
function getSolidPercent(groupVal = 0, allVal = 0) {
  const groupRatio = Math.max(0, Math.min(100, Number(groupVal) || 0)) / 100;
  const allRatio = Math.max(0, Math.min(100, Number(allVal) || 0)) / 100;
  // If either is set, transparency reduces solidness
  const effectiveTransparency = Math.max(groupRatio, allRatio);
  return Math.max(0, Math.min(100, Math.round((1 - effectiveTransparency) * 100)));
}

/**
 * Generates scoped CSS rules with theme variables and optional transparency.
 * ZERO layout properties: only background-color, color, border-color, outline-color, fonts.
 * Transparency uses color-mix / alpha, NEVER opacity on page elements.
 * @param {object} theme
 * @param {object} [transparency]
 * @param {object} [font]
 * @returns {string}
 */
export function generateStylesheet(theme, transparency = {}, font = {}, bgSettings = {}, animationsEnabled = true) {
  const vars = buildThemeVariables(theme || getBuiltinTheme('pure-light'));
  const fontCss = generateFontStyles(font);

  const hasThemeArtwork = Boolean(theme?.category === 'impressive' && theme?.artwork);
  const hasBg = Boolean(bgSettings && bgSettings.mode && bgSettings.mode !== 'none') || hasThemeArtwork;
  const allT = Math.max(0, Math.min(100, Number(transparency.all !== undefined ? transparency.all : (transparency.panels || 0))));
  const pageT = Math.max(0, Math.min(100, Number(transparency.page) || 0));

  // Surface treatment: 'solid' | 'translucent' | 'frosted'
  // Default to frosted if blur is enabled or when background is present, unless solid/translucent is explicitly chosen
  let treatment = transparency.treatment;
  if (!treatment) {
    if (transparency.blurBehindPanels === false) {
      treatment = allT > 0 ? 'translucent' : 'solid';
    } else {
      treatment = (hasBg || allT > 0 || transparency.blurBehindPanels) ? 'frosted' : 'solid';
    }
  }

  const isSolid = treatment === 'solid';
  const isFrosted = treatment === 'frosted';
  const isTranslucent = treatment === 'translucent';

  // Base transparency factor (0-100)
  const effectiveT = isSolid ? 0 : (allT > 0 ? allT : (hasBg ? 20 : 0));
  const isTranslucentActive = !isSolid && (effectiveT > 0 || isFrosted);

  // Surface Hierarchy Solid Percentages:
  // 1. Page Background
  const pageSolid = hasBg
    ? 0
    : (pageT > 0 || effectiveT > 0 ? Math.max(0, Math.min(100, 100 - Math.max(pageT, effectiveT))) : 100);

  // 2. Main Content Panels (.roundbox, .topic, .content-box) - Suggested: 75-85% at 20% T
  const panelSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(10, Math.min(98, Math.round(100 - effectiveT)));

  // 3. Sidebar Panels (.sidebox, .titled) - Suggested: 65-75% at 20% T
  const sidebarSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(10, Math.min(95, Math.round(100 - effectiveT - 10)));

  // 4. Navigation & Header (#header, .main-menu-list) - Suggested: 75-85% at 20% T
  const headerSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(15, Math.min(98, Math.round(100 - effectiveT)));

  // 5. Sub-Navigation (.second-level-menu) - Suggested: 70-80% at 20% T
  const subnavSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(15, Math.min(95, Math.round(100 - effectiveT - 5)));

  // 6. Table Headers (th) - Suggested: 85-92% (high opacity for contrast)
  const tableHeaderSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(25, Math.min(98, Math.round(100 - effectiveT * 0.6)));

  // 7. Table Rows (tr, td) - Suggested: 65-80% at 20% T
  const tableRowSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(15, Math.min(96, Math.round(100 - effectiveT)));

  const tableRowAltSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(10, Math.min(94, Math.round(100 - effectiveT - 10)));

  // 8. Secondary Surfaces / Dialogs / Popups - Suggested: 65-80% at 20% T
  const dialogSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(20, Math.min(96, Math.round(100 - effectiveT - 5)));

  // 9. Code Blocks (pre, code, .sample-test) - Maintained sufficiently opaque (88-94%) for syntax highlighting
  const codeSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(30, Math.min(98, Math.round(100 - effectiveT * 0.4)));

  // 10. Inputs & Form Controls - 85-90% for crystal clear input text
  const inputSolid = isSolid || effectiveT === 0
    ? 100
    : Math.max(30, Math.min(98, Math.round(100 - effectiveT * 0.6)));

  const pageBgRule = hasBg
    ? 'background-color: transparent !important;'
    : (pageSolid < 100
        ? `background-color: color-mix(in srgb, var(--cfs-page-bg) ${pageSolid}%, transparent);`
        : 'background-color: var(--cfs-page-bg);');

  const contentBgRule = panelSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-content-bg) ${panelSolid}%, transparent);`
    : 'background-color: var(--cfs-content-bg);';

  const surface1BgRule = sidebarSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-surface-1) ${sidebarSolid}%, transparent);`
    : 'background-color: var(--cfs-surface-1);';

  const surface2BgRule = sidebarSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-surface-2) ${sidebarSolid}%, transparent);`
    : 'background-color: var(--cfs-surface-2);';

  const headerBgRule = headerSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-nav-bg) ${headerSolid}%, transparent);`
    : 'background-color: var(--cfs-nav-bg);';

  const subnavBgRule = subnavSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-subnav-bg) ${subnavSolid}%, transparent);`
    : 'background-color: var(--cfs-subnav-bg);';

  const tableBgRule = tableRowSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-content-bg) ${tableRowSolid}%, transparent);`
    : 'background-color: var(--cfs-content-bg);';

  const tableHeaderBgRule = tableHeaderSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-table-header-bg) ${tableHeaderSolid}%, transparent);`
    : 'background-color: var(--cfs-table-header-bg);';

  const tableRowBgRule = tableRowSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-table-row-bg) ${tableRowSolid}%, transparent);`
    : 'background-color: var(--cfs-table-row-bg);';

  const tableRowAltBgRule = tableRowAltSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-table-row-alt-bg) ${tableRowAltSolid}%, transparent);`
    : 'background-color: var(--cfs-table-row-alt-bg);';

  const codeBgRule = codeSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-code-bg) ${codeSolid}%, transparent);`
    : 'background-color: var(--cfs-code-bg);';

  const contestBgRule = sidebarSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-surface-1) ${sidebarSolid}%, transparent);`
    : 'background-color: var(--cfs-surface-1);';

  const inputBgRule = inputSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-input-bg) ${inputSolid}%, transparent);`
    : 'background-color: var(--cfs-input-bg);';

  const dialogBgRule = dialogSolid < 100
    ? `background-color: color-mix(in srgb, var(--cfs-surface-1) ${dialogSolid}%, transparent);`
    : 'background-color: var(--cfs-surface-1);';

  const blurRadius = transparency.blurRadius !== undefined && transparency.blurRadius !== null
    ? transparency.blurRadius
    : (transparency.blurBehindPanels ? 8 : (hasBg ? 10 : 8));

  const blurRule = isFrosted
    ? `backdrop-filter: blur(${blurRadius}px); -webkit-backdrop-filter: blur(${blurRadius}px);`
    : '';

  const panelBorderRule = isTranslucentActive
    ? 'border-color: color-mix(in srgb, var(--cfs-border) 60%, transparent);'
    : 'border-color: var(--cfs-border);';

  const sidebarBorderRule = isTranslucentActive
    ? 'border-color: color-mix(in srgb, var(--cfs-border) 50%, transparent);'
    : 'border-color: var(--cfs-border);';

  const navBorderRule = isTranslucentActive
    ? 'border-color: color-mix(in srgb, var(--cfs-border) 55%, transparent);'
    : 'border-color: var(--cfs-border);';

  const tableBorderRule = isTranslucentActive
    ? 'border-color: color-mix(in srgb, var(--cfs-border) 50%, transparent);'
    : 'border-color: var(--cfs-border);';

  const panelShadowRule = isTranslucentActive
    ? 'box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);'
    : 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);';

  const sidebarShadowRule = isTranslucentActive
    ? 'box-shadow: 0 2px 10px -1px rgba(0, 0, 0, 0.03);'
    : 'box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);';

  const navShadowRule = isTranslucentActive
    ? 'box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.03);'
    : 'box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);';

  const dialogShadowRule = isTranslucentActive
    ? 'box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.04);'
    : 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);';

  return `
/* CF Studio - Managed Stylesheet */
${vars}

/* 1. Page Background and Base Text */
:root[data-cfs-on="true"],
:root[data-cfs-on="true"] body,
:root[data-cfs-on="true"] #body,
:root[data-cfs-on="true"] .body {
  ${pageBgRule}
  color: var(--cfs-text);
}

/* 2. Global Text & Headings */
:root[data-cfs-on="true"] h1,
:root[data-cfs-on="true"] h2,
:root[data-cfs-on="true"] h3,
:root[data-cfs-on="true"] h4,
:root[data-cfs-on="true"] h5,
:root[data-cfs-on="true"] h6,
:root[data-cfs-on="true"] p,
:root[data-cfs-on="true"] span:not([class*="user-"]):not([class*="verdict"]):not([class*="tag"]):not(.rated-user) {
  color: inherit;
}

:root[data-cfs-on="true"] .notice,
:root[data-cfs-on="true"] .info,
:root[data-cfs-on="true"] .caption .title,
:root[data-cfs-on="true"] .caption-subtext {
  color: var(--cfs-text-muted);
}

/* 3. Links (strictly preserving ratings, verdicts, problem tags, and navigation) */
:root[data-cfs-on="true"] a:not([class*="user-"]):not([class*="verdict"]):not([class*="tag"]):not(.rated-user):not(.main-menu-list a):not(.second-level-menu-list a) {
  color: var(--cfs-link);
}

:root[data-cfs-on="true"] a:not([class*="user-"]):not([class*="verdict"]):not([class*="tag"]):not(.rated-user):not(.main-menu-list a):not(.second-level-menu-list a):hover {
  color: var(--cfs-link-hover);
}

/* 4. Header, Navigation Bars, and Menus (Strict accessible WCAG AA/AAA contrast >= 4.5:1) */
:root[data-cfs-on="true"] [data-cfs-role="header"],
:root[data-cfs-on="true"] #header,
:root[data-cfs-on="true"] .header,
:root[data-cfs-on="true"] .main-menu-list {
  ${headerBgRule}
  ${blurRule}
  ${navBorderRule}
  ${navShadowRule}
  color: var(--cfs-nav-text);
}

:root[data-cfs-on="true"] .main-menu-list li {
  background: transparent;
}

:root[data-cfs-on="true"] .main-menu-list li a,
:root[data-cfs-on="true"] .main-menu-list li a:visited {
  color: var(--cfs-nav-text) !important;
  background-color: transparent !important;
  border-color: transparent !important;
  text-decoration: none;
}

:root[data-cfs-on="true"] .main-menu-list li a:hover,
:root[data-cfs-on="true"] .main-menu-list li:hover > a {
  background-color: var(--cfs-nav-hover-bg) !important;
  color: var(--cfs-nav-hover-text) !important;
}

:root[data-cfs-on="true"] .main-menu-list li.current,
:root[data-cfs-on="true"] .main-menu-list li.current a,
:root[data-cfs-on="true"] .main-menu-list li.current a:visited {
  background-color: var(--cfs-nav-active-bg) !important;
  color: var(--cfs-nav-active-text) !important;
  border-color: var(--cfs-nav-active-bg) !important;
}

:root[data-cfs-on="true"] .main-menu-list li.current a:hover,
:root[data-cfs-on="true"] .main-menu-list li.current:hover > a {
  background-color: var(--cfs-nav-active-hover-bg) !important;
  color: var(--cfs-nav-active-text) !important;
}

:root[data-cfs-on="true"] .main-menu-list li a:focus-visible {
  outline: 2px solid var(--cfs-focus) !important;
  outline-offset: 1px !important;
}

:root[data-cfs-on="true"] .second-level-menu,
:root[data-cfs-on="true"] .second-level-menu-list {
  ${subnavBgRule}
  ${blurRule}
  ${navBorderRule}
  color: var(--cfs-subnav-text);
}

:root[data-cfs-on="true"] .second-level-menu-list li {
  background: transparent;
}

:root[data-cfs-on="true"] .second-level-menu-list li a,
:root[data-cfs-on="true"] .second-level-menu-list li a:visited {
  color: var(--cfs-subnav-text) !important;
  background-color: transparent !important;
  text-decoration: none;
}

:root[data-cfs-on="true"] .second-level-menu-list li a:hover,
:root[data-cfs-on="true"] .second-level-menu-list li:hover > a {
  background-color: var(--cfs-subnav-hover-bg) !important;
  color: var(--cfs-subnav-hover-text) !important;
}

:root[data-cfs-on="true"] .second-level-menu-list li.current,
:root[data-cfs-on="true"] .second-level-menu-list li.current a,
:root[data-cfs-on="true"] .second-level-menu-list li.current a:visited {
  background-color: var(--cfs-subnav-active-bg) !important;
  color: var(--cfs-subnav-active-text) !important;
  border-color: var(--cfs-subnav-active-bg) !important;
}

:root[data-cfs-on="true"] .second-level-menu-list li.current a:hover,
:root[data-cfs-on="true"] .second-level-menu-list li.current:hover > a {
  background-color: var(--cfs-subnav-active-hover-bg) !important;
  color: var(--cfs-subnav-active-text) !important;
}

:root[data-cfs-on="true"] .second-level-menu-list li a:focus-visible {
  outline: 2px solid var(--cfs-focus) !important;
  outline-offset: 1px !important;
}

/* Dropdown Menus and Menu Boxes */
:root[data-cfs-on="true"] .drop-down-menu,
:root[data-cfs-on="true"] .menu-box {
  background-color: var(--cfs-surface-1) !important;
  border-color: var(--cfs-border) !important;
  color: var(--cfs-nav-text) !important;
  ${panelShadowRule}
}

:root[data-cfs-on="true"] .drop-down-menu li a,
:root[data-cfs-on="true"] .menu-box li a {
  color: var(--cfs-nav-text) !important;
  background-color: transparent !important;
}

:root[data-cfs-on="true"] .drop-down-menu li a:hover,
:root[data-cfs-on="true"] .menu-box li a:hover {
  background-color: var(--cfs-nav-hover-bg) !important;
  color: var(--cfs-nav-hover-text) !important;
}

/* Header search bar and user profile controls */
:root[data-cfs-on="true"] #header .search input,
:root[data-cfs-on="true"] .search input {
  background-color: var(--cfs-input-bg) !important;
  color: var(--cfs-input-text) !important;
  border-color: var(--cfs-input-border) !important;
}

:root[data-cfs-on="true"] #header .search input:focus,
:root[data-cfs-on="true"] .search input:focus {
  border-color: var(--cfs-focus) !important;
  outline-color: var(--cfs-focus) !important;
}

:root[data-cfs-on="true"] .lang-chooser,
:root[data-cfs-on="true"] .lang-chooser a,
:root[data-cfs-on="true"] .personal-sidebar,
:root[data-cfs-on="true"] .personal-sidebar a {
  color: var(--cfs-nav-text) !important;
}

:root[data-cfs-on="true"] .lang-chooser a:hover,
:root[data-cfs-on="true"] .personal-sidebar a:hover {
  color: var(--cfs-nav-hover-text) !important;
}

/* 5. Content Containers, Roundboxes, and Side Panels */
:root[data-cfs-on="true"] #pageContent,
:root[data-cfs-on="true"] #content,
:root[data-cfs-on="true"] .content,
:root[data-cfs-on="true"] .content-with-sidebar {
  background-color: transparent !important;
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] [data-cfs-role="content"],
:root[data-cfs-on="true"] .roundbox,
:root[data-cfs-on="true"] .topic,
:root[data-cfs-on="true"] .content-box,
:root[data-cfs-on="true"] .problemindexbox,
:root[data-cfs-on="true"] div.ttypography,
:root[data-cfs-on="true"] .comment-table,
:root[data-cfs-on="true"] .comment {
  ${contentBgRule}
  ${blurRule}
  ${panelBorderRule}
  ${panelShadowRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] .roundbox .rt,
:root[data-cfs-on="true"] .roundbox .lt,
:root[data-cfs-on="true"] .roundbox .rb,
:root[data-cfs-on="true"] .roundbox .lb,
:root[data-cfs-on="true"] .roundbox .bottom-links,
:root[data-cfs-on="true"] .titled .rt,
:root[data-cfs-on="true"] .titled .lt {
  background-color: transparent !important;
  background-image: none !important;
}

:root[data-cfs-on="true"] [data-cfs-role="sidebox"],
:root[data-cfs-on="true"] .sidebox,
:root[data-cfs-on="true"] .sidebox .content,
:root[data-cfs-on="true"] .sidebox .bottom-links,
:root[data-cfs-on="true"] .roundbox.sidebox,
:root[data-cfs-on="true"] .roundbox.sidebox .content,
:root[data-cfs-on="true"] .roundbox .caption,
:root[data-cfs-on="true"] .titled,
:root[data-cfs-on="true"] .titled .title,
:root[data-cfs-on="true"] .titled .content,
:root[data-cfs-on="true"] .personal-sidebar,
:root[data-cfs-on="true"] .personal-sidebar .roundbox,
:root[data-cfs-on="true"] .personal-sidebar .content {
  ${surface1BgRule}
  ${blurRule}
  ${sidebarBorderRule}
  ${sidebarShadowRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] .contest-info,
:root[data-cfs-on="true"] .contest-info .roundbox,
:root[data-cfs-on="true"] .contest-info .content,
:root[data-cfs-on="true"] .roundbox.highlighted,
:root[data-cfs-on="true"] .roundbox.highlighted .content,
:root[data-cfs-on="true"] .contestList .roundbox,
:root[data-cfs-on="true"] .contestList .roundbox .content {
  ${contestBgRule}
  ${blurRule}
  ${panelBorderRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] .caption .title {
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] #footer,
:root[data-cfs-on="true"] .footer {
  ${headerBgRule}
  ${blurRule}
  ${navBorderRule}
  color: var(--cfs-text-muted);
}

/* 6. Tables, Problems Lists, and Standings */
:root[data-cfs-on="true"] [data-cfs-role="table"],
:root[data-cfs-on="true"] table.datatable,
:root[data-cfs-on="true"] table.tablesorter,
:root[data-cfs-on="true"] table.rtable,
:root[data-cfs-on="true"] table.problems,
:root[data-cfs-on="true"] table.standings,
:root[data-cfs-on="true"] .standings,
:root[data-cfs-on="true"] .contestList table,
:root[data-cfs-on="true"] .status-frame-datatable,
:root[data-cfs-on="true"] .closed {
  ${tableBgRule}
  ${blurRule}
  ${tableBorderRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] table.datatable th,
:root[data-cfs-on="true"] table.tablesorter th,
:root[data-cfs-on="true"] table.rtable th,
:root[data-cfs-on="true"] table.problems th,
:root[data-cfs-on="true"] table.standings th,
:root[data-cfs-on="true"] .standings th,
:root[data-cfs-on="true"] .contestList table th,
:root[data-cfs-on="true"] .status-frame-datatable th,
:root[data-cfs-on="true"] [data-cfs-role="table"] th,
:root[data-cfs-on="true"] th.top,
:root[data-cfs-on="true"] th.bottom,
:root[data-cfs-on="true"] table th {
  ${tableHeaderBgRule}
  ${blurRule}
  ${tableBorderRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] table.datatable td,
:root[data-cfs-on="true"] table.tablesorter td,
:root[data-cfs-on="true"] table.rtable td,
:root[data-cfs-on="true"] table.problems td,
:root[data-cfs-on="true"] table.standings td,
:root[data-cfs-on="true"] .standings td,
:root[data-cfs-on="true"] .contestList table td,
:root[data-cfs-on="true"] .status-frame-datatable td,
:root[data-cfs-on="true"] [data-cfs-role="table"] td,
:root[data-cfs-on="true"] table.datatable tr,
:root[data-cfs-on="true"] table.tablesorter tr,
:root[data-cfs-on="true"] table.rtable tr,
:root[data-cfs-on="true"] table.problems tr,
:root[data-cfs-on="true"] table.standings tr,
:root[data-cfs-on="true"] .standings tr,
:root[data-cfs-on="true"] [data-cfs-role="table"] tr {
  ${tableRowBgRule}
  ${tableBorderRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] table.datatable tr:nth-child(even) td,
:root[data-cfs-on="true"] table.tablesorter tr:nth-child(even) td,
:root[data-cfs-on="true"] table.problems tr:nth-child(even) td,
:root[data-cfs-on="true"] table.standings tr:nth-child(even) td,
:root[data-cfs-on="true"] .standings tr:nth-child(even) td,
:root[data-cfs-on="true"] .contestList table tr:nth-child(even) td,
:root[data-cfs-on="true"] [data-cfs-role="table"] tr:nth-child(even) td,
:root[data-cfs-on="true"] table.datatable tr:nth-child(even),
:root[data-cfs-on="true"] table.tablesorter tr:nth-child(even),
:root[data-cfs-on="true"] table.problems tr:nth-child(even),
:root[data-cfs-on="true"] [data-cfs-role="table"] tr:nth-child(even),
:root[data-cfs-on="true"] tr.dark,
:root[data-cfs-on="true"] tr.dark td,
:root[data-cfs-on="true"] td.back-light {
  ${tableRowAltBgRule}
}

:root[data-cfs-on="true"] tr.highlighted-row,
:root[data-cfs-on="true"] tr.highlighted-row td,
:root[data-cfs-on="true"] td.standings-cell {
  background-color: color-mix(in srgb, var(--cfs-accent) 15%, var(--cfs-content-bg));
}

/* 7. Problem Statements and Code Boxes */
:root[data-cfs-on="true"] .problem-statement {
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] .problem-statement .header .title {
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] .problem-statement .property-title {
  color: var(--cfs-text-muted);
}

:root[data-cfs-on="true"] .sample-test .input,
:root[data-cfs-on="true"] .sample-test .output {
  ${codeBgRule}
  ${blurRule}
  ${tableBorderRule}
  color: var(--cfs-text);
}

:root[data-cfs-on="true"] .sample-test .title {
  ${surface1BgRule}
  color: var(--cfs-text-muted);
  ${tableBorderRule}
}

:root[data-cfs-on="true"] pre,
:root[data-cfs-on="true"] code,
:root[data-cfs-on="true"] .source-code,
:root[data-cfs-on="true"] .sample-test pre,
:root[data-cfs-on="true"] .test-example-line,
:root[data-cfs-on="true"] tt,
:root[data-cfs-on="true"] [data-cfs-role="code"] {
  ${codeBgRule}
  color: var(--cfs-text);
  ${tableBorderRule}
}

/* 8. Inputs, Textareas, and Selects */
:root[data-cfs-on="true"] input[type="text"],
:root[data-cfs-on="true"] input[type="password"],
:root[data-cfs-on="true"] input[type="search"],
:root[data-cfs-on="true"] input[type="email"],
:root[data-cfs-on="true"] input[type="number"],
:root[data-cfs-on="true"] textarea,
:root[data-cfs-on="true"] select,
:root[data-cfs-on="true"] option,
:root[data-cfs-on="true"] [data-cfs-role="input"] {
  ${inputBgRule}
  color: var(--cfs-input-text);
  border-color: var(--cfs-input-border);
}

:root[data-cfs-on="true"] input[type="text"]:focus,
:root[data-cfs-on="true"] input[type="password"]:focus,
:root[data-cfs-on="true"] input[type="search"]:focus,
:root[data-cfs-on="true"] input[type="email"]:focus,
:root[data-cfs-on="true"] input[type="number"]:focus,
:root[data-cfs-on="true"] textarea:focus,
:root[data-cfs-on="true"] select:focus,
:root[data-cfs-on="true"] [data-cfs-role="input"]:focus {
  outline-color: var(--cfs-focus);
  border-color: var(--cfs-focus);
}

/* 9. Buttons */
:root[data-cfs-on="true"] button,
:root[data-cfs-on="true"] input[type="submit"],
:root[data-cfs-on="true"] input[type="button"],
:root[data-cfs-on="true"] .button,
:root[data-cfs-on="true"] a.button,
:root[data-cfs-on="true"] [data-cfs-role="button"] {
  background-color: var(--cfs-button-bg);
  color: var(--cfs-button-text);
  border-color: var(--cfs-button-bg);
}

:root[data-cfs-on="true"] button:hover,
:root[data-cfs-on="true"] input[type="submit"]:hover,
:root[data-cfs-on="true"] input[type="button"]:hover,
:root[data-cfs-on="true"] .button:hover,
:root[data-cfs-on="true"] a.button:hover,
:root[data-cfs-on="true"] [data-cfs-role="button"]:hover {
  background-color: var(--cfs-button-hover-bg);
  border-color: var(--cfs-button-hover-bg);
}

/* 10. Dialogs, Popups, and Dropdown Menus */
:root[data-cfs-on="true"] .dialog,
:root[data-cfs-on="true"] .popup,
:root[data-cfs-on="true"] .userbox,
:root[data-cfs-on="true"] .menu-box,
:root[data-cfs-on="true"] .facebox,
:root[data-cfs-on="true"] .autocomplete-suggestions,
:root[data-cfs-on="true"] .drop-down-menu {
  ${dialogBgRule}
  ${blurRule}
  ${panelBorderRule}
  ${dialogShadowRule}
  color: var(--cfs-text);
}

/* 11. Pagination & Footer */
:root[data-cfs-on="true"] .pagination ul li a {
  background-color: var(--cfs-surface-1);
  color: var(--cfs-text);
  border-color: var(--cfs-border);
}

:root[data-cfs-on="true"] .pagination ul li.active a {
  background-color: var(--cfs-button-bg);
  color: var(--cfs-button-text);
  border-color: var(--cfs-button-bg);
}

:root[data-cfs-on="true"] #footer,
:root[data-cfs-on="true"] .footer {
  border-color: var(--cfs-border);
  color: var(--cfs-text-muted);
}

/* 12. Custom Typography */
${fontCss}
`.trim();
}

/**
 * Applies or updates the background layer element.
 * Positioned fixed at z-index -999999 behind all content, pointer-events: none.
 * @param {Document} doc
 * @param {object} bgSettings
 * @param {string|null} [imageUrl]
 * @param {object} [options]
 */
export function applyBackgroundLayer(doc = document, bgSettings = {}, imageUrl = null, options = {}) {
  if (!doc) return null;

  const mode = bgSettings.mode || 'none';
  const theme = options.theme;
  const isNone = (mode === 'none' || !mode);
  const hasUserImage = Boolean(mode === 'my-image' && imageUrl);
  const hasThemeArtwork = Boolean(theme?.category === 'impressive' && theme?.artwork);
  const showBg = (!isNone) || hasThemeArtwork;
  let layer = doc.getElementById(BG_LAYER_ID);

  if (!showBg) {
    stopAtmosphericAnimation();
    if (layer && layer.parentNode) {
      layer.parentNode.removeChild(layer);
    }
    return null;
  }

  if (!layer) {
    layer = doc.createElement('div');
    layer.id = BG_LAYER_ID;
    layer.setAttribute('data-cfs-host', 'true');
    layer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -999999;
      pointer-events: none;
      overflow: hidden;
    `;

    const imgDiv = doc.createElement('div');
    imgDiv.id = 'cfs-bg-image';
    imgDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    const coverDiv = doc.createElement('div');
    coverDiv.id = 'cfs-bg-cover';
    coverDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    const canvas = doc.createElement('canvas');
    canvas.id = 'cfs-bg-canvas';
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    layer.appendChild(imgDiv);
    layer.appendChild(coverDiv);
    layer.appendChild(canvas);

    const targetParent = doc.body || doc.documentElement;
    if (targetParent && targetParent.appendChild) {
      targetParent.appendChild(layer);
    }
  }

  // Update image and cover styles
  const imgDiv = doc.getElementById('cfs-bg-image');
  const coverDiv = doc.getElementById('cfs-bg-cover');

  if (imgDiv) {
    let bgImageCss = 'none';
    let bgSizeCss = bgSettings.size || 'cover';
    let bgRepeatCss = bgSizeCss === 'repeat' ? 'repeat' : 'no-repeat';
    let bgPositionCss = bgSettings.position || 'center';

    if (hasUserImage) {
      bgImageCss = `url("${imageUrl}")`;
    } else if (mode === 'builtin' || mode === 'built-in') {
      const builtin = getBuiltinBackground(bgSettings.builtinId);
      if (builtin && builtin.style) {
        bgImageCss = builtin.style.backgroundImage || 'none';
        bgSizeCss = builtin.style.backgroundSize || bgSizeCss;
        bgRepeatCss = builtin.style.backgroundRepeat || bgRepeatCss;
      }
    } else if (hasThemeArtwork) {
      bgImageCss = `url("${theme.artwork}")`;
      bgSizeCss = 'cover';
      bgRepeatCss = 'no-repeat';
      bgPositionCss = 'center top';
    }

    const blur = bgSettings.blur || 0;
    const brightness = bgSettings.brightness ?? 100;
    const contrast = bgSettings.contrast ?? 100;
    const saturation = bgSettings.saturation ?? 100;
    const strength = (bgSettings.strength ?? 100) / 100;

    imgDiv.style.backgroundImage = bgImageCss;
    imgDiv.style.backgroundSize = bgSizeCss;
    imgDiv.style.backgroundRepeat = bgRepeatCss;
    imgDiv.style.backgroundPosition = bgPositionCss;
    imgDiv.style.filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    imgDiv.style.opacity = String(strength);

    // Subtle hardware-accelerated ambient animation for animated themes
    if (options.animated && typeof imgDiv.animate === 'function' && typeof window !== 'undefined') {
      const prefersReduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced && options.animationsEnabled !== false) {
        if (!imgDiv._cfsAnim) {
          imgDiv._cfsAnim = imgDiv.animate([
            { transform: 'scale(1) translate3d(0, 0, 0)' },
            { transform: 'scale(1.03) translate3d(-10px, 8px, 0)' },
            { transform: 'scale(1) translate3d(0, 0, 0)' },
          ], {
            duration: 30000,
            iterations: Infinity,
            easing: 'ease-in-out',
            direction: 'alternate',
          });
        }
      } else if (imgDiv._cfsAnim) {
        imgDiv._cfsAnim.cancel();
        imgDiv._cfsAnim = null;
      }
    }
  }

  if (coverDiv) {
    const coverColor = bgSettings.coverColor || '#ffffff';
    const coverStrength = (bgSettings.coverStrength || 0) / 100;
    coverDiv.style.backgroundColor = coverColor;
    coverDiv.style.opacity = String(coverStrength);
  }

  // Handle atmospheric moving particles on background canvas
  const canvas = doc.getElementById('cfs-bg-canvas');
  if (canvas) {
    if (options.animated && theme?.animationEffect && options.animationsEnabled !== false) {
      canvas.style.display = 'block';
      startAtmosphericAnimation(canvas, theme.animationEffect);
    } else {
      stopAtmosphericAnimation();
      canvas.style.display = 'none';
    }
  }

  return layer;
}

/**
 * Injects or updates the single <style id="cfs-style"> tag and background layer.
 * Idempotent.
 * @param {Document} doc
 * @param {object} [theme]
 * @param {object} [options]
 * @returns {HTMLStyleElement}
 */
export function applyTheme(doc = document, theme = getBuiltinTheme('pure-light'), options = {}) {
  if (!doc) return null;

  const root = doc.documentElement;
  if (root && root.setAttribute) {
    root.setAttribute('data-cfs-on', 'true');
    if (theme?.id) {
      root.setAttribute('data-cfs-theme', theme.id);
    }
    if (options.animationsEnabled !== false && (theme?.animated || options.theme?.animated)) {
      root.setAttribute('data-cfs-anim', 'true');
    } else {
      root.removeAttribute('data-cfs-anim');
    }
  }

  let styleEl = doc.getElementById(STYLE_TAG_ID);
  const css = generateStylesheet(theme, options.transparency, options.font, options.background, options.animationsEnabled);

  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = STYLE_TAG_ID;
    styleEl.textContent = css;

    const targetParent = doc.head || root;
    if (targetParent && targetParent.appendChild) {
      targetParent.appendChild(styleEl);
    }
  } else {
    if (styleEl.textContent !== css) {
      styleEl.textContent = css;
    }
  }

  // Handle background layer
  const bgSettings = options.background || { mode: 'none' };
  applyBackgroundLayer(doc, bgSettings, options.imageUrl, {
    theme,
    animated: theme?.animated,
    animationsEnabled: options.animationsEnabled,
  });

  // Handle Google Fonts loading
  const fontFam = options.font?.family ? options.font.family.trim() : '';
  const fontLinkId = 'cfs-google-font';
  if (fontFam && doc.createElement) {
    const primaryName = fontFam.split(',')[0].replace(/['"]/g, '').trim();
    if (primaryName) {
      const encoded = encodeURIComponent(primaryName).replace(/%20/g, '+');
      const fontHref = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`;
      let fontLink = doc.getElementById(fontLinkId);
      if (!fontLink) {
        fontLink = doc.createElement('link');
        fontLink.id = fontLinkId;
        if (fontLink.setAttribute) {
          fontLink.setAttribute('id', fontLinkId);
          fontLink.setAttribute('rel', 'stylesheet');
          fontLink.setAttribute('href', fontHref);
        }
        fontLink.rel = 'stylesheet';
        fontLink.href = fontHref;
        const targetParent = doc.head || root;
        if (targetParent && targetParent.appendChild) {
          targetParent.appendChild(fontLink);
        }
      } else if (fontLink.getAttribute && fontLink.getAttribute('href') !== fontHref) {
        fontLink.setAttribute('href', fontHref);
        fontLink.href = fontHref;
      }
    }
  } else if (doc.getElementById) {
    const fontLink = doc.getElementById(fontLinkId);
    if (fontLink && fontLink.parentNode) {
      fontLink.parentNode.removeChild(fontLink);
    }
  }

  return styleEl;
}

/**
 * Removes the style tag, background layer, and all data-cfs-* markers.
 * Restores original DOM.
 * @param {Document} doc
 */
export function removeTheme(doc = document) {
  if (!doc) return;

  // 1. Remove style tag
  const styleEl = doc.getElementById(STYLE_TAG_ID);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }

  // 1b. Remove google font link if present
  const fontLink = doc.getElementById('cfs-google-font');
  if (fontLink && fontLink.parentNode) {
    fontLink.parentNode.removeChild(fontLink);
  }

  // 2. Remove background layer (no leftover layers)
  stopAtmosphericAnimation();
  const bgLayer = doc.getElementById(BG_LAYER_ID);
  if (bgLayer && bgLayer.parentNode) {
    bgLayer.parentNode.removeChild(bgLayer);
  }

  // 3. Remove intro card host if active
  const introHost = doc.getElementById('cfs-intro-host');
  if (introHost && introHost.parentNode) {
    introHost.parentNode.removeChild(introHost);
  }

  // 4. Remove root markers
  const root = doc.documentElement;
  if (root && root.removeAttribute) {
    root.removeAttribute('data-cfs-on');
    root.removeAttribute('data-cfs-theme');
    root.removeAttribute('data-cfs-anim');
  }

  // 5. Remove all data-cfs-* attributes from elements
  if (doc.querySelectorAll) {
    const markedElements = doc.querySelectorAll('[data-cfs-role], [data-cfs-confidence]');
    for (const el of markedElements) {
      removeMarkers(el);
    }
  }
}
