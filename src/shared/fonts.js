/**
 * CF Studio - Fonts Module
 * Handles font presets, fallback stacks, input sanitization, and CSS rule generation.
 * Conforms to:
 * - docs/02_FEATURES.md (Font)
 * - docs/03_ARCHITECTURE.md (Font input cleaning)
 * - docs/05_THEMES_AND_VISUALS.md (Fonts)
 * - AGENTS.md rule 9 (No remote fonts)
 */

export const FONT_PRESETS = Object.freeze({
  DEFAULT: 'default',
  READING: 'reading',
  CODING: 'coding',
});

export const FALLBACK_STACKS = Object.freeze({
  page: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  statement: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  statement_serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  code: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
});

/**
 * Sanitizes and validates a font family input string per docs/03_ARCHITECTURE.md:
 * - Allowed: letters, digits, spaces, hyphens, commas, quotes around names.
 * - Reject: ; { } ( ) \ @ < > url( @import.
 * - Max length: 100 characters.
 * @param {string} input
 * @returns {{ valid: boolean, error?: string, cleaned?: string }}
 */
export function sanitizeFontInput(input) {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Font name must be a string' };
  }

  const trimmed = input.trim();
  if (trimmed === '') {
    return { valid: true, cleaned: '' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Font name must be 100 characters or less' };
  }

  // Check forbidden tokens/characters
  const forbiddenRegex = /[;{}()\\@<>]|url\s*\(|@import/i;
  if (forbiddenRegex.test(trimmed)) {
    return { valid: false, error: 'Contains forbidden characters' };
  }

  // Only allowed characters: letters, digits, spaces, hyphens, commas, single or double quotes
  const allowedRegex = /^[a-zA-Z0-9\s,'"-]+$/;
  if (!allowedRegex.test(trimmed)) {
    return { valid: false, error: 'Contains invalid characters' };
  }

  // Split comma-separated family names, clean and quote each
  const parts = trimmed.split(',');
  const quotedNames = [];

  for (const part of parts) {
    const rawName = part.trim();
    if (!rawName) continue;

    // Strip outer quotes if already present
    const stripped = rawName.replace(/^['"]+|['"]+$/g, '').trim();
    if (!stripped) continue;

    // Verify unquoted name only contains valid family name characters
    if (!/^[a-zA-Z0-9\s-]+$/.test(stripped)) {
      return { valid: false, error: 'Contains invalid characters in font name' };
    }

    quotedNames.push(`"${stripped}"`);
  }

  if (quotedNames.length === 0) {
    return { valid: true, cleaned: '' };
  }

  return { valid: true, cleaned: quotedNames.join(', ') };
}

/**
 * Builds a safe font family stack appending the target fallback stack.
 * @param {'page'|'headings'|'statement'|'code'} target
 * @param {string} [customFont]
 * @param {string} [preset]
 * @returns {string} CSS font-family stack
 */
export function buildFontStack(target, customFont = '', preset = 'default') {
  const result = sanitizeFontInput(customFont);
  let fallback;

  if (target === 'statement') {
    fallback = preset === 'reading'
      ? FALLBACK_STACKS.statement_serif
      : FALLBACK_STACKS.statement;
  } else if (target === 'code') {
    fallback = FALLBACK_STACKS.code;
  } else if (target === 'headings') {
    fallback = FALLBACK_STACKS.headings;
  } else {
    fallback = FALLBACK_STACKS.page;
  }

  if (!result.valid || !result.cleaned) {
    return fallback;
  }

  return `${result.cleaned}, ${fallback}`;
}

/**
 * Generates scoped CSS rules for fonts based on settings.
 * ZERO layout properties (width, height, margin, padding, position, etc.).
 * Does not touch icon fonts, SVG text, or syntax token colors.
 * @param {object} [fontSettings]
 * @returns {string} CSS string
 */
export function generateFontStyles(fontSettings = {}) {
  const preset = fontSettings.preset || 'default';
  const customFamily = fontSettings.family || fontSettings.page || '';
  const pageStack = buildFontStack('page', customFamily, preset);
  const headingsStack = buildFontStack('headings', fontSettings.headings || customFamily, preset);
  const statementStack = buildFontStack('statement', fontSettings.statement || customFamily, preset);
  const codeStack = buildFontStack('code', fontSettings.code, preset);

  const size = fontSettings.size !== null && fontSettings.size !== undefined ? Number(fontSettings.size) : null;
  const weight = fontSettings.weight !== null && fontSettings.weight !== undefined ? Number(fontSettings.weight) : null;
  const lineHeight = fontSettings.lineHeight !== null && fontSettings.lineHeight !== undefined ? Number(fontSettings.lineHeight) : null;
  const letterSpacing = fontSettings.letterSpacing !== null && fontSettings.letterSpacing !== undefined ? Number(fontSettings.letterSpacing) : null;

  // Reading preset defaults line-height: 1.65 for statement if lineHeight is null
  const statementLineHeight = lineHeight !== null ? lineHeight : (preset === 'reading' ? 1.65 : null);

  const pageAdjustments = [];
  if (size !== null) pageAdjustments.push(`font-size: ${size}px;`);
  if (weight !== null) pageAdjustments.push(`font-weight: ${weight};`);
  if (lineHeight !== null) pageAdjustments.push(`line-height: ${lineHeight};`);
  if (letterSpacing !== null) pageAdjustments.push(`letter-spacing: ${letterSpacing}px;`);

  return `
/* Central Font Variables */
:root[data-cfs-on="true"] {
  --cf-studio-font-family: ${pageStack};
  --cfs-font-family: var(--cf-studio-font-family);
  --cf-studio-font-headings: ${headingsStack};
  --cf-studio-font-statement: ${statementStack};
  --cf-studio-font-code: ${codeStack};
}

/* Base Body and Text Inheritors */
:root[data-cfs-on="true"],
:root[data-cfs-on="true"] body {
  font-family: var(--cf-studio-font-family) !important;
  ${pageAdjustments.join('\n  ')}
}

/* 1. Blog Posts, Comments, Community Discussions & Typography Blocks */
:root[data-cfs-on="true"] div.ttypography,
:root[data-cfs-on="true"] div.ttypography p,
:root[data-cfs-on="true"] div.ttypography li,
:root[data-cfs-on="true"] div.ttypography div,
:root[data-cfs-on="true"] .topic,
:root[data-cfs-on="true"] .topic .title,
:root[data-cfs-on="true"] .topic .content,
:root[data-cfs-on="true"] .topic .content p,
:root[data-cfs-on="true"] .comment,
:root[data-cfs-on="true"] .comment-table,
:root[data-cfs-on="true"] .comment .text,
:root[data-cfs-on="true"] .comment .text p,
:root[data-cfs-on="true"] .community,
:root[data-cfs-on="true"] .for-user-box {
  font-family: var(--cf-studio-font-family) !important;
}

/* 2. Announcements, Banners, and Broadcasts */
:root[data-cfs-on="true"] .notice,
:root[data-cfs-on="true"] .info,
:root[data-cfs-on="true"] .alert,
:root[data-cfs-on="true"] .roundbox.highlighted,
:root[data-cfs-on="true"] .broadcast {
  font-family: var(--cf-studio-font-family) !important;
}

/* 3. Primary & Secondary Navigation, Header, Lang Chooser, and Personal Sidebar */
:root[data-cfs-on="true"] #header,
:root[data-cfs-on="true"] .header,
:root[data-cfs-on="true"] .main-menu-list,
:root[data-cfs-on="true"] .main-menu-list li a,
:root[data-cfs-on="true"] .second-level-menu,
:root[data-cfs-on="true"] .second-level-menu-list,
:root[data-cfs-on="true"] .second-level-menu-list li a,
:root[data-cfs-on="true"] .lang-chooser,
:root[data-cfs-on="true"] .lang-chooser a,
:root[data-cfs-on="true"] .personal-sidebar,
:root[data-cfs-on="true"] .personal-sidebar a {
  font-family: var(--cf-studio-font-family) !important;
}

/* 4. Sidebar Titles, Box Headers, and Box Content */
:root[data-cfs-on="true"] [data-cfs-role="sidebox"],
:root[data-cfs-on="true"] .sidebox,
:root[data-cfs-on="true"] .sidebox .caption,
:root[data-cfs-on="true"] .sidebox .caption .title,
:root[data-cfs-on="true"] .sidebox .content,
:root[data-cfs-on="true"] .roundbox.sidebox,
:root[data-cfs-on="true"] .roundbox.sidebox .caption,
:root[data-cfs-on="true"] .roundbox.sidebox .content,
:root[data-cfs-on="true"] .titled,
:root[data-cfs-on="true"] .titled .title,
:root[data-cfs-on="true"] .titled .content {
  font-family: var(--cf-studio-font-family) !important;
}

/* 5. Buttons, Inputs, Dropdowns, and Form Labels (browsers do not inherit font-family by default) */
:root[data-cfs-on="true"] button,
:root[data-cfs-on="true"] input,
:root[data-cfs-on="true"] select,
:root[data-cfs-on="true"] textarea,
:root[data-cfs-on="true"] label,
:root[data-cfs-on="true"] .drop-down-menu,
:root[data-cfs-on="true"] .menu-box,
:root[data-cfs-on="true"] .search input {
  font-family: var(--cf-studio-font-family) !important;
}

/* 6. Contest Tables, Standing Tables, and Participant Handles (strictly preserving user rating colors) */
:root[data-cfs-on="true"] table.datatable,
:root[data-cfs-on="true"] table.datatable th,
:root[data-cfs-on="true"] table.datatable td,
:root[data-cfs-on="true"] table.problems,
:root[data-cfs-on="true"] table.problems th,
:root[data-cfs-on="true"] table.problems td,
:root[data-cfs-on="true"] table.standings,
:root[data-cfs-on="true"] table.standings th,
:root[data-cfs-on="true"] table.standings td,
:root[data-cfs-on="true"] table.contests,
:root[data-cfs-on="true"] table.rtable,
:root[data-cfs-on="true"] [data-cfs-role="table"],
:root[data-cfs-on="true"] .contest-info,
:root[data-cfs-on="true"] .contestList,
:root[data-cfs-on="true"] a[class*="user-"],
:root[data-cfs-on="true"] .rated-user {
  font-family: var(--cf-studio-font-family) !important;
}

/* Headings Font */
:root[data-cfs-on="true"] h1,
:root[data-cfs-on="true"] h2,
:root[data-cfs-on="true"] h3,
:root[data-cfs-on="true"] h4,
:root[data-cfs-on="true"] h5,
:root[data-cfs-on="true"] h6,
:root[data-cfs-on="true"] .caption,
:root[data-cfs-on="true"] .title:not([class*="user-"]) {
  font-family: var(--cf-studio-font-headings) !important;
}

/* Problem Statement Font */
:root[data-cfs-on="true"] .problem-statement,
:root[data-cfs-on="true"] .problem-statement p,
:root[data-cfs-on="true"] [data-cfs-role="statement"] {
  font-family: var(--cf-studio-font-statement) !important;
  ${statementLineHeight !== null ? `line-height: ${statementLineHeight};` : ''}
}

/* 7. Code & Monospace Preservation (Strictly protected from general font override) */
:root[data-cfs-on="true"] pre,
:root[data-cfs-on="true"] code,
:root[data-cfs-on="true"] .source-code,
:root[data-cfs-on="true"] .sample-test pre,
:root[data-cfs-on="true"] .sample-test code,
:root[data-cfs-on="true"] .sample-test .input pre,
:root[data-cfs-on="true"] .sample-test .output pre,
:root[data-cfs-on="true"] [data-cfs-role="code"],
:root[data-cfs-on="true"] kbd,
:root[data-cfs-on="true"] samp,
:root[data-cfs-on="true"] tt,
:root[data-cfs-on="true"] .diff pre,
:root[data-cfs-on="true"] .prettyprint,
:root[data-cfs-on="true"] .linenums {
  font-family: var(--cf-studio-font-code) !important;
}

/* 8. Math Preservation (MathJax & KaTeX must strictly keep their native math glyph fonts) */
:root[data-cfs-on="true"] .MathJax,
:root[data-cfs-on="true"] .MathJax_Display,
:root[data-cfs-on="true"] .katex,
:root[data-cfs-on="true"] math {
  font-family: inherit !important;
}

/* 9. Icon fonts and SVG elements preserve their native font stack */
:root[data-cfs-on="true"] i[class*="icon"],
:root[data-cfs-on="true"] [class*="icon-"],
:root[data-cfs-on="true"] [class*="fa-"],
:root[data-cfs-on="true"] .fa,
:root[data-cfs-on="true"] .glyphicon,
:root[data-cfs-on="true"] svg,
:root[data-cfs-on="true"] svg * {
  font-family: inherit;
}
`.trim();
}
