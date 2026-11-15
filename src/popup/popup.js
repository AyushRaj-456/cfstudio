/**
 * CF Studio - Appearance Studio Popup Controller
 * DevTools-inspired compact light interface.
 * Exactly 3 Main Sections: [ Themes ] [ Backgrounds ] [ Fonts ]
 * Exactly 3 Theme Filters: All, Light, Impressive
 * Simplified 3-color swatches (no text labels).
 * Block Transparency Management (All Blocks / Individual Blocks + On-page Selector).
 * Simple Custom Font Name loader (Google Fonts / local).
 */

import { getSettings, updateSettings, resetSettings } from '../shared/storage.js';
import { browserApi } from '../shared/browser-api.js';
import { MESSAGE_TYPES, sendRuntimeMessage, sendTabMessage } from '../shared/messaging.js';
import { BUILTIN_THEMES, getBuiltinTheme } from '../themes/builtin.js';
import { generateThemeFromPixels } from '../shared/colors-from-image.js';
import { sanitizeFontInput } from '../shared/fonts.js';
import { exportSettings, validateAndImportSettings } from '../shared/backup.js';
import {
  generateThemeFromPalette,
  getCustomTheme,
  normalizeHex,
  DEFAULT_CUSTOM_PALETTE,
} from '../themes/palette-generator.js';

// State
let currentSettings = null;
let activeTabId = null;
let currentFilter = 'light';
let isHoveringTheme = false;
let updateDebounceTimer = null;

// Helper: Query active Codeforces tab
async function getActiveTab() {
  try {
    const tabs = await browserApi.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      activeTabId = tabs[0].id;
      return tabs[0];
    }
  } catch (err) {
    console.warn('CF Studio: Failed to get active tab:', err);
  }
  return null;
}

// Helper: Send message to active tab
async function messageActiveTab(type, payload = {}) {
  if (!activeTabId) {
    await getActiveTab();
  }
  if (!activeTabId) return null;
  try {
    return await sendTabMessage(activeTabId, { type, payload });
  } catch {
    return null;
  }
}

// Helper: Get active or default custom theme
function getActiveCustomTheme() {
  return getCustomTheme(currentSettings?.customThemes || []);
}

// Helper: Find theme by ID (builtin or custom)
function findTheme(themeId) {
  if (!themeId) return BUILTIN_THEMES[0];
  if (themeId === 'custom') {
    return getActiveCustomTheme();
  }
  const builtin = BUILTIN_THEMES.find((t) => t.id === themeId);
  if (builtin) return builtin;
  const custom = currentSettings?.customThemes?.find((t) => t.id === themeId);
  if (custom) return custom;
  return BUILTIN_THEMES[0];
}

// Helper: Debounced settings update to avoid storage thrashing
function debouncedUpdateSettings(patch) {
  if (updateDebounceTimer) clearTimeout(updateDebounceTimer);
  updateDebounceTimer = setTimeout(async () => {
    try {
      currentSettings = await updateSettings((curr) => {
        const merged = { ...curr };
        if (patch.global) {
          merged.global = { ...curr.global, ...patch.global };
          if (patch.global.transparency) {
            merged.global.transparency = { ...curr.global.transparency, ...patch.global.transparency };
          }
          if (patch.global.background) {
            merged.global.background = { ...curr.global.background, ...patch.global.background };
          }
        }
        return merged;
      });
      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
    } catch (err) {
      console.error('CF Studio: Failed to update settings:', err);
    }
  }, 120);
}

// ============================================================================
// 1. THEME GALLERY GRID & FILTERING
// ============================================================================
function renderThemeGallery() {
  const container = document.getElementById('theme-grid');
  if (!container || !currentSettings) return;

  const activeThemeId = currentSettings.global?.themeId || 'pure-light';

  // Update Custom Palette button active indicator
  const customPaletteBtn = document.getElementById('btn-toggle-custom-palette');
  if (customPaletteBtn) {
    customPaletteBtn.classList.toggle('is-theme-active', activeThemeId === 'custom');
  }

  // Filter themes: Light (5), Dark (1), Impressive (6)
  let filteredThemes = [];
  if (currentFilter === 'dark') {
    filteredThemes = BUILTIN_THEMES.filter((t) => t.id === 'obsidian');
  } else if (currentFilter === 'impressive') {
    filteredThemes = BUILTIN_THEMES.filter((t) => t.category === 'impressive');
  } else {
    // Default: 'light' (5 standard light themes)
    filteredThemes = BUILTIN_THEMES.filter((t) => t.category === 'standard' && t.kind === 'light');
  }

  container.innerHTML = '';

  // Render theme cards
  for (const theme of filteredThemes) {
    const isActive = theme.id === activeThemeId;
    const isDark = theme.kind === 'dark';
    const isImpressive = theme.category === 'impressive';
    const tokens = theme.tokens || {};

    const card = document.createElement('div');
    card.className = `cfs-theme-card${isDark ? ' cfs-theme-card-dark' : ''}${isImpressive ? ' cfs-theme-card-impressive' : ''}${isActive ? ' is-selected' : ''}`;
    card.setAttribute('data-theme-id', theme.id);

    // 1. Header (Clean Theme Title, no description, no clutter)
    const cardHeader = document.createElement('div');
    cardHeader.className = 'cfs-card-header';

    const nameWrap = document.createElement('div');
    nameWrap.className = 'cfs-card-name-wrap';

    const titleEl = document.createElement('span');
    titleEl.className = 'cfs-card-title';
    titleEl.textContent = theme.name;

    nameWrap.appendChild(titleEl);
    cardHeader.appendChild(nameWrap);

    // 2. Visual Preview (Mockup for standard themes, Artwork Banner for Impressive themes)
    let visualEl;
    if (isImpressive && theme.artwork) {
      visualEl = document.createElement('div');
      visualEl.className = 'cfs-card-art-preview';
      visualEl.style.backgroundImage = `url("${theme.artwork}")`;
    } else {
      visualEl = document.createElement('div');
      visualEl.className = 'cfs-card-mini-mock';
      visualEl.style.backgroundColor = tokens['page-bg'] || '#ffffff';
      visualEl.style.borderColor = tokens['border'] || '#d0d7de';

      const mockHeader = document.createElement('div');
      mockHeader.className = 'cfs-mock-header';
      mockHeader.style.backgroundColor = tokens['header-bg'] || '#f6f8fa';

      const mockBarActive = document.createElement('div');
      mockBarActive.className = 'cfs-mock-bar-active';
      mockBarActive.style.backgroundColor = tokens['accent'] || '#1a73e8';
      mockHeader.appendChild(mockBarActive);

      const mockContent = document.createElement('div');
      mockContent.className = 'cfs-mock-content';
      mockContent.style.backgroundColor = tokens['content-bg'] || '#ffffff';
      mockContent.style.borderColor = tokens['border'] || '#d0d7de';

      const line1 = document.createElement('div');
      line1.className = 'cfs-mock-line';
      line1.style.width = '65%';
      line1.style.backgroundColor = tokens['accent'] || '#1a73e8';

      const line2 = document.createElement('div');
      line2.className = 'cfs-mock-line';
      line2.style.width = '90%';
      line2.style.backgroundColor = tokens['text-muted'] || '#d0d7de';

      const btnRow = document.createElement('div');
      btnRow.className = 'cfs-mock-btn-row';
      const mockBtn = document.createElement('div');
      mockBtn.className = 'cfs-mock-btn';
      mockBtn.style.backgroundColor = tokens['button-bg'] || '#1a73e8';
      btnRow.appendChild(mockBtn);

      mockContent.appendChild(line1);
      mockContent.appendChild(line2);
      mockContent.appendChild(btnRow);

      visualEl.appendChild(mockHeader);
      visualEl.appendChild(mockContent);
    }

    // 3. Three-Colour Palette Swatches (Three small color swatches with NO text labels)
    const p = theme.palette?.primary || tokens.accent || '#1a73e8';
    const s = theme.palette?.secondary || tokens['surface-1'] || '#dbe4ee';
    const t = theme.palette?.tertiary || tokens.link || '#0d65d9';

    const paletteBar = document.createElement('div');
    paletteBar.className = 'cfs-card-palette-3';

    const swatchDefs = [
      { color: p, title: `Primary: ${p}` },
      { color: s, title: `Secondary: ${s}` },
      { color: t, title: `Tertiary: ${t}` },
    ];

    for (const def of swatchDefs) {
      const dot = document.createElement('div');
      dot.className = 'cfs-card-swatch-dot';
      dot.style.backgroundColor = def.color;
      dot.title = def.title;
      paletteBar.appendChild(dot);
    }

    // 4. Selected Indicator Checkmark
    const selectedTag = document.createElement('div');
    selectedTag.className = 'cfs-card-selected-tag';
    selectedTag.innerHTML = '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

    // Assemble Card (Clean & Colour-focused, NO DESCRIPTIVE TEXT)
    card.appendChild(cardHeader);
    card.appendChild(visualEl);
    card.appendChild(paletteBar);
    card.appendChild(selectedTag);

    // Click to select & apply
    card.addEventListener('click', async () => {
      await applyThemeSelection(theme);
    });

    // Live Hover Preview
    card.addEventListener('mouseenter', () => {
      isHoveringTheme = true;
      messageActiveTab(MESSAGE_TYPES.PREVIEW_THEME, { theme });
    });

    card.addEventListener('mouseleave', () => {
      isHoveringTheme = false;
      messageActiveTab(MESSAGE_TYPES.END_PREVIEW);
    });

    container.appendChild(card);
  }
}

function toggleCustomThemeEditor() {
  const editor = document.getElementById('custom-theme-editor');
  const toggleBtn = document.getElementById('btn-toggle-custom-palette');
  if (!editor) return;
  const isHidden = editor.hidden;
  if (isHidden) {
    editor.hidden = false;
    toggleBtn?.classList.add('is-active');
    syncCustomThemeInputs();
  } else {
    editor.hidden = true;
    toggleBtn?.classList.remove('is-active');
  }
}

function openCustomThemeEditor() {
  const editor = document.getElementById('custom-theme-editor');
  const toggleBtn = document.getElementById('btn-toggle-custom-palette');
  if (editor) {
    editor.hidden = false;
    toggleBtn?.classList.add('is-active');
    syncCustomThemeInputs();
  }
}

function closeCustomThemeEditor() {
  const editor = document.getElementById('custom-theme-editor');
  const toggleBtn = document.getElementById('btn-toggle-custom-palette');
  if (editor) {
    editor.hidden = true;
    toggleBtn?.classList.remove('is-active');
  }
}

function syncCustomThemeInputs() {
  const customTheme = getActiveCustomTheme();
  const p = customTheme.palette?.primary || DEFAULT_CUSTOM_PALETTE.primary;
  const s = customTheme.palette?.secondary || DEFAULT_CUSTOM_PALETTE.secondary;
  const t = customTheme.palette?.tertiary || DEFAULT_CUSTOM_PALETTE.tertiary;

  const pPicker = document.getElementById('custom-color-primary');
  const pHex = document.getElementById('custom-hex-primary');
  const pSwatch = document.getElementById('custom-swatch-primary');

  const sPicker = document.getElementById('custom-color-secondary');
  const sHex = document.getElementById('custom-hex-secondary');
  const sSwatch = document.getElementById('custom-swatch-secondary');

  const tPicker = document.getElementById('custom-color-tertiary');
  const tHex = document.getElementById('custom-hex-tertiary');
  const tSwatch = document.getElementById('custom-swatch-tertiary');

  if (pPicker) pPicker.value = p;
  if (pHex) pHex.value = p;
  if (pSwatch) pSwatch.style.backgroundColor = p;

  if (sPicker) sPicker.value = s;
  if (sHex) sHex.value = s;
  if (sSwatch) sSwatch.style.backgroundColor = s;

  if (tPicker) tPicker.value = t;
  if (tHex) tHex.value = t;
  if (tSwatch) tSwatch.style.backgroundColor = t;
}

function onCustomPaletteChange() {
  const pPicker = document.getElementById('custom-color-primary');
  const sPicker = document.getElementById('custom-color-secondary');
  const tPicker = document.getElementById('custom-color-tertiary');

  const p = normalizeHex(pPicker?.value || DEFAULT_CUSTOM_PALETTE.primary);
  const s = normalizeHex(sPicker?.value || DEFAULT_CUSTOM_PALETTE.secondary);
  const t = normalizeHex(tPicker?.value || DEFAULT_CUSTOM_PALETTE.tertiary);

  const customTheme = generateThemeFromPalette({
    id: 'custom',
    name: 'Custom Theme',
    category: 'standard',
    primary: p,
    secondary: s,
    tertiary: t,
    builtin: false,
  });

  // 1. Apply changes to actual Codeforces website live
  messageActiveTab(MESSAGE_TYPES.PREVIEW_THEME, { theme: customTheme });

  // 4. Debounced auto-save so changes persist
  if (updateDebounceTimer) clearTimeout(updateDebounceTimer);
  updateDebounceTimer = setTimeout(async () => {
    try {
      currentSettings = await updateSettings((curr) => {
        const remainingCustom = (curr.customThemes || []).filter((theme) => theme.id !== 'custom');
        return {
          ...curr,
          enabled: true,
          global: {
            ...curr.global,
            themeId: 'custom',
          },
          customThemes: [...remainingCustom, customTheme],
        };
      });
      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
    } catch (err) {
      console.warn('CF Studio: Failed to auto-save custom theme:', err);
    }
  }, 300);
}

function initCustomThemeEditor() {
  const editor = document.getElementById('custom-theme-editor');
  const closeBtn = document.getElementById('btn-close-custom-editor');
  const applyBtn = document.getElementById('btn-apply-custom-theme');
  const saveBtn = document.getElementById('btn-save-custom-theme');
  const resetBtn = document.getElementById('btn-reset-custom-theme');
  const statusMsg = document.getElementById('custom-theme-status-msg');

  const pPicker = document.getElementById('custom-color-primary');
  const pHex = document.getElementById('custom-hex-primary');
  const pSwatch = document.getElementById('custom-swatch-primary');

  const sPicker = document.getElementById('custom-color-secondary');
  const sHex = document.getElementById('custom-hex-secondary');
  const sSwatch = document.getElementById('custom-swatch-secondary');

  const tPicker = document.getElementById('custom-color-tertiary');
  const tHex = document.getElementById('custom-hex-tertiary');
  const tSwatch = document.getElementById('custom-swatch-tertiary');

  function showStatus(text, isError = false) {
    if (!statusMsg) return;
    statusMsg.hidden = false;
    statusMsg.className = `cfs-feedback ${isError ? 'is-error' : 'is-success'}`;
    statusMsg.textContent = text;
    setTimeout(() => {
      if (statusMsg) statusMsg.hidden = true;
    }, 3500);
  }

  function bindColorPair(picker, hexInput, swatch) {
    if (!picker || !hexInput || !swatch) return;

    // When native picker changes
    picker.addEventListener('input', () => {
      const val = picker.value;
      hexInput.value = val;
      swatch.style.backgroundColor = val;
      onCustomPaletteChange();
    });

    // When hex text is edited
    hexInput.addEventListener('input', () => {
      let raw = hexInput.value.trim();
      if (!raw.startsWith('#')) raw = `#${raw}`;
      if (/^#[0-9a-fA-F]{6}$/i.test(raw)) {
        picker.value = raw;
        swatch.style.backgroundColor = raw;
        onCustomPaletteChange();
      }
    });

    hexInput.addEventListener('change', () => {
      let raw = hexInput.value.trim();
      if (!raw.startsWith('#')) raw = `#${raw}`;
      if (!/^#[0-9a-fA-F]{6}$/i.test(raw) && !/^#[0-9a-fA-F]{3}$/i.test(raw)) {
        hexInput.value = picker.value;
        swatch.style.backgroundColor = picker.value;
      } else {
        const norm = normalizeHex(raw);
        hexInput.value = norm;
        picker.value = norm;
        swatch.style.backgroundColor = norm;
        onCustomPaletteChange();
      }
    });
  }

  bindColorPair(pPicker, pHex, pSwatch);
  bindColorPair(sPicker, sHex, sSwatch);
  bindColorPair(tPicker, tHex, tSwatch);

  const toggleCustomBtn = document.getElementById('btn-toggle-custom-palette');
  toggleCustomBtn?.addEventListener('click', () => {
    toggleCustomThemeEditor();
  });

  closeBtn?.addEventListener('click', () => {
    closeCustomThemeEditor();
  });

  async function persistCustomTheme(statusText) {
    const p = normalizeHex(pPicker?.value || DEFAULT_CUSTOM_PALETTE.primary);
    const s = normalizeHex(sPicker?.value || DEFAULT_CUSTOM_PALETTE.secondary);
    const t = normalizeHex(tPicker?.value || DEFAULT_CUSTOM_PALETTE.tertiary);

    const customTheme = generateThemeFromPalette({
      id: 'custom',
      name: 'Custom Theme',
      category: 'standard',
      primary: p,
      secondary: s,
      tertiary: t,
      builtin: false,
    });

    try {
      currentSettings = await updateSettings((curr) => {
        const remainingCustom = (curr.customThemes || []).filter((theme) => theme.id !== 'custom');
        return {
          ...curr,
          enabled: true,
          global: {
            ...curr.global,
            themeId: 'custom',
          },
          customThemes: [...remainingCustom, customTheme],
        };
      });

      const masterSwitch = document.getElementById('master-switch');
      if (masterSwitch) masterSwitch.checked = true;

      renderThemeGallery();
      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
      showStatus(statusText);
    } catch {
      showStatus('Failed to save custom theme.', true);
    }
  }

  applyBtn?.addEventListener('click', () => {
    persistCustomTheme('Custom theme applied!');
  });

  saveBtn?.addEventListener('click', () => {
    persistCustomTheme('Custom theme saved!');
  });

  resetBtn?.addEventListener('click', async () => {
    const defP = DEFAULT_CUSTOM_PALETTE.primary;
    const defS = DEFAULT_CUSTOM_PALETTE.secondary;
    const defT = DEFAULT_CUSTOM_PALETTE.tertiary;

    if (pPicker) pPicker.value = defP;
    if (pHex) pHex.value = defP;
    if (pSwatch) pSwatch.style.backgroundColor = defP;

    if (sPicker) sPicker.value = defS;
    if (sHex) sHex.value = defS;
    if (sSwatch) sSwatch.style.backgroundColor = defS;

    if (tPicker) tPicker.value = defT;
    if (tHex) tHex.value = defT;
    if (tSwatch) tSwatch.style.backgroundColor = defT;

    await persistCustomTheme('Custom theme reset to default colours.');
  });
}

async function applyThemeSelection(theme) {
  if (!theme || !theme.id) return;
  if (theme.id !== 'custom') {
    closeCustomThemeEditor();
  }
  try {
    currentSettings = await updateSettings((curr) => {
      const merged = {
        ...curr,
        enabled: true,
        global: {
          ...curr.global,
          themeId: theme.id,
        },
      };
      if (theme.id === 'custom') {
        const remaining = (curr.customThemes || []).filter((t) => t.id !== 'custom');
        merged.customThemes = [...remaining, theme];
      }
      return merged;
    });

    const masterSwitch = document.getElementById('master-switch');
    if (masterSwitch) masterSwitch.checked = true;

    renderThemeGallery();
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  } catch (err) {
    console.error('CF Studio: Failed to apply theme:', err);
  }
}

// ============================================================================
// 3. BACKGROUNDS PANEL (ONLY None and Upload Image)
// ============================================================================
function initBackgroundsPanel() {
  const fileInput = document.getElementById('bg-file-input');
  const uploadCard = document.getElementById('bg-card-upload');
  const noneCard = document.getElementById('bg-card-none');
  const pasteBtn = document.getElementById('btn-paste-bg');
  const colorsFromImgBtn = document.getElementById('btn-colors-from-img');
  const removeBtn = document.getElementById('btn-remove-bg');

  // Mode: None
  noneCard?.addEventListener('click', async () => {
    currentSettings = await updateSettings((curr) => ({
      ...curr,
      global: {
        ...curr.global,
        background: {
          ...curr.global.background,
          mode: 'none',
        },
      },
    }));
    syncBackgroundUI();
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  });

  // Mode: Upload Image
  uploadCard?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedImage(file);
  });

  pasteBtn?.addEventListener('click', async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) {
          const blob = await item.getType(type);
          await processUploadedImage(blob);
          return;
        }
      }
      alert('No image found in clipboard.');
    } catch {
      alert('Could not access clipboard image.');
    }
  });

  async function processUploadedImage(file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      try {
        await sendRuntimeMessage(MESSAGE_TYPES.SAVE_IMAGE, { dataUrl });

        currentSettings = await updateSettings((curr) => ({
          ...curr,
          global: {
            ...curr.global,
            background: {
              ...curr.global.background,
              mode: 'my-image',
              hasImage: true,
            },
          },
        }));

        syncBackgroundUI();
        await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
      } catch (err) {
        console.error('CF Studio: Failed to save image:', err);
      }
    };
    reader.readAsDataURL(file);
  }

  // Remove/Reset Background
  removeBtn?.addEventListener('click', async () => {
    try {
      await sendRuntimeMessage(MESSAGE_TYPES.DELETE_IMAGE);
    } catch {}

    currentSettings = await updateSettings((curr) => ({
      ...curr,
      global: {
        ...curr.global,
        background: {
          mode: 'none',
          position: 'center',
          size: 'cover',
          strength: 100,
          blur: 0,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          coverColor: '#ffffff',
          coverStrength: 0,
          builtinId: null,
          hasImage: false,
        },
      },
    }));
    syncBackgroundUI();
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  });

  // Colors from Image (extracts light palette)
  colorsFromImgBtn?.addEventListener('click', async () => {
    try {
      const res = await sendRuntimeMessage(MESSAGE_TYPES.GET_IMAGE);
      if (!res?.image?.dataUrl) {
        alert('Upload a background image first.');
        return;
      }

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 64, 64);
        const imgData = ctx.getImageData(0, 0, 64, 64);

        const generated = generateThemeFromPixels(imgData.data, 64, 64, 'light');
        if (generated.error) {
          alert(generated.error);
          return;
        }

        const newTheme = {
          id: `theme_custom_${Date.now()}`,
          name: 'Light from Artwork',
          builtin: false,
          kind: 'light',
          category: 'impressive',
          description: 'Balanced light theme extracted from background image.',
          tokens: generated.theme.tokens,
        };

        currentSettings = await updateSettings((curr) => ({
          ...curr,
          customThemes: [...(curr.customThemes || []), newTheme],
          global: {
            ...curr.global,
            themeId: newTheme.id,
          },
        }));

        renderThemeGallery();
        await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
      };
      img.src = res.image.dataUrl;
    } catch {
      alert('Could not extract colors from image.');
    }
  });

  // Sliders & Selects
  bindSlider('slider-bg-strength', 'val-bg-strength', '%', 'strength');
  bindSlider('slider-bg-blur', 'val-bg-blur', 'px', 'blur');
  bindSlider('slider-bg-brightness', 'val-bg-brightness', '%', 'brightness');
  bindSlider('slider-bg-contrast', 'val-bg-contrast', '%', 'contrast');
  bindSlider('slider-bg-saturation', 'val-bg-saturation', '%', 'saturation');

  const posSelect = document.getElementById('bg-position-select');
  posSelect?.addEventListener('change', async (e) => {
    currentSettings = await updateSettings((curr) => ({
      ...curr,
      global: {
        ...curr.global,
        background: { ...curr.global.background, position: e.target.value },
      },
    }));
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  });

  const sizeSelect = document.getElementById('bg-size-select');
  sizeSelect?.addEventListener('change', async (e) => {
    currentSettings = await updateSettings((curr) => ({
      ...curr,
      global: {
        ...curr.global,
        background: { ...curr.global.background, size: e.target.value },
      },
    }));
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  });

  initBackgroundAccordions();
}

function initBackgroundAccordions() {
  const headerSurface = document.getElementById('header-surface-treatment');
  const contentSurface = document.getElementById('content-surface-treatment');
  const headerImage = document.getElementById('header-image-adjustments');
  const contentImage = document.getElementById('content-image-adjustments');

  function toggleSection(header, content, otherHeader, otherContent) {
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      header.setAttribute('aria-expanded', 'false');
      content.hidden = true;
    } else {
      header.setAttribute('aria-expanded', 'true');
      content.hidden = false;
      if (otherHeader && otherContent) {
        otherHeader.setAttribute('aria-expanded', 'false');
        otherContent.hidden = true;
      }
    }
  }

  headerSurface?.addEventListener('click', () => {
    toggleSection(headerSurface, contentSurface, headerImage, contentImage);
  });

  headerImage?.addEventListener('click', () => {
    toggleSection(headerImage, contentImage, headerSurface, contentSurface);
  });
}

function bindSlider(sliderId, valueId, unit, prop) {
  const slider = document.getElementById(sliderId);
  const valEl = document.getElementById(valueId);
  if (!slider) return;

  slider.addEventListener('input', (e) => {
    if (valEl) valEl.textContent = `${e.target.value}${unit}`;
  });

  slider.addEventListener('change', async (e) => {
    const num = Number(e.target.value);
    currentSettings = await updateSettings((curr) => ({
      ...curr,
      global: {
        ...curr.global,
        background: { ...curr.global.background, [prop]: num },
      },
    }));
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  });
}

function syncBackgroundUI() {
  if (!currentSettings) return;
  const bg = currentSettings.global?.background || {};

  const noneCard = document.getElementById('bg-card-none');
  const uploadCard = document.getElementById('bg-card-upload');

  if (noneCard) noneCard.classList.toggle('is-selected', bg.mode === 'none');
  if (uploadCard) uploadCard.classList.toggle('is-selected', bg.mode === 'my-image');

  setSliderVal('slider-bg-strength', 'val-bg-strength', '%', bg.strength ?? 100);
  setSliderVal('slider-bg-blur', 'val-bg-blur', 'px', bg.blur ?? 0);
  setSliderVal('slider-bg-brightness', 'val-bg-brightness', '%', bg.brightness ?? 100);
  setSliderVal('slider-bg-contrast', 'val-bg-contrast', '%', bg.contrast ?? 100);
  setSliderVal('slider-bg-saturation', 'val-bg-saturation', '%', bg.saturation ?? 100);

  const posSelect = document.getElementById('bg-position-select');
  if (posSelect && bg.position) posSelect.value = bg.position;

  const sizeSelect = document.getElementById('bg-size-select');
  if (sizeSelect && bg.size) sizeSelect.value = bg.size;
}

function setSliderVal(sliderId, valueId, unit, val) {
  const slider = document.getElementById(sliderId);
  const valEl = document.getElementById(valueId);
  if (slider) slider.value = val;
  if (valEl) valEl.textContent = `${val}${unit}`;
}

// ============================================================================
// 4. SURFACE TREATMENT & BLOCK TRANSPARENCY CONTROLS
// ============================================================================
function initBlockTransparencyControls() {
  const treatmentPills = document.querySelectorAll('.cfs-treatment-pill');
  const sliderTransparency = document.getElementById('slider-block-transparency');
  const valTransparency = document.getElementById('val-block-transparency');
  const sliderBlur = document.getElementById('slider-frosted-blur');
  const valBlur = document.getElementById('val-frosted-blur');
  const rowBlur = document.getElementById('row-frosted-blur');

  function updateTreatmentUI(treatment) {
    treatmentPills.forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-treatment') === treatment);
    });
    if (rowBlur) {
      rowBlur.style.display = treatment === 'frosted' ? 'block' : 'none';
    }
  }

  treatmentPills.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const treatment = btn.getAttribute('data-treatment');
      updateTreatmentUI(treatment);
      currentSettings = await updateSettings((curr) => ({
        ...curr,
        global: {
          ...curr.global,
          transparency: {
            ...curr.global.transparency,
            treatment,
            blurBehindPanels: treatment === 'frosted',
          },
        },
      }));
      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
    });
  });

  // Global Block Transparency Slider
  sliderTransparency?.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    if (valTransparency) valTransparency.textContent = `${val}%`;
    debouncedUpdateSettings({
      global: {
        transparency: {
          all: val,
        },
      },
    });
  });

  // Frosted Blur Slider
  sliderBlur?.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    if (valBlur) valBlur.textContent = `${val}px`;
    debouncedUpdateSettings({
      global: {
        transparency: {
          blurRadius: val,
        },
      },
    });
  });
}

function syncBlockTransparencyUI() {
  if (!currentSettings) return;
  const t = currentSettings.global?.transparency || {};

  const treatment = t.treatment || (t.blurBehindPanels !== false ? 'frosted' : 'translucent');
  const treatmentPills = document.querySelectorAll('.cfs-treatment-pill');
  treatmentPills.forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-treatment') === treatment);
  });

  const rowBlur = document.getElementById('row-frosted-blur');
  if (rowBlur) {
    rowBlur.style.display = treatment === 'frosted' ? 'block' : 'none';
  }

  // Global slider
  setSliderVal('slider-block-transparency', 'val-block-transparency', '%', t.all ?? 20);
  setSliderVal('slider-frosted-blur', 'val-frosted-blur', 'px', t.blurRadius ?? 10);
}

// ============================================================================
// 5. FONTS PANEL (EXTREMELY SIMPLE: One font input, Apply, Reset)
// ============================================================================
function initFontsPanel() {
  const fontInput = document.getElementById('font-family-input');
  const applyBtn = document.getElementById('btn-apply-font');
  const resetBtn = document.getElementById('btn-reset-font');
  const statusMsg = document.getElementById('font-status-msg');

  function showStatus(text, isError = false) {
    if (!statusMsg) return;
    statusMsg.hidden = false;
    statusMsg.className = `cfs-feedback ${isError ? 'is-error' : 'is-success'}`;
    statusMsg.textContent = text;
    setTimeout(() => {
      if (statusMsg) statusMsg.hidden = true;
    }, 4000);
  }

  // Pre-fill existing font
  const currentFont = currentSettings?.global?.font?.family || '';
  if (fontInput) fontInput.value = currentFont;

  applyBtn?.addEventListener('click', async () => {
    const rawVal = fontInput ? fontInput.value.trim() : '';
    if (!rawVal) {
      showStatus('Please enter a font family name, e.g. Inter, Roboto, Poppins.', true);
      return;
    }

    const sanitized = sanitizeFontInput(rawVal);
    if (!sanitized.valid) {
      showStatus(sanitized.error || 'Invalid font name. Only letters, numbers, spaces, and hyphens are allowed.', true);
      return;
    }

    const cleanFontName = rawVal.replace(/^['"]+|['"]+$/g, '').trim();

    try {
      currentSettings = await updateSettings((curr) => ({
        ...curr,
        global: {
          ...curr.global,
          font: {
            ...curr.global.font,
            family: cleanFontName,
            page: cleanFontName,
            headings: cleanFontName,
            statement: cleanFontName,
          },
        },
      }));

      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
      showStatus(`Font "${cleanFontName}" applied globally!`);
    } catch {
      showStatus('Failed to save font settings.', true);
    }
  });

  resetBtn?.addEventListener('click', async () => {
    if (fontInput) fontInput.value = '';
    try {
      currentSettings = await updateSettings((curr) => ({
        ...curr,
        global: {
          ...curr.global,
          font: {
            ...curr.global.font,
            family: '',
            page: '',
            headings: '',
            statement: '',
          },
        },
      }));

      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
      showStatus('Fonts reset to default.');
    } catch {
      showStatus('Failed to reset font settings.', true);
    }
  });
}

function syncFontsUI() {
  if (!currentSettings) return;
  const fontInput = document.getElementById('font-family-input');
  if (fontInput) {
    fontInput.value = currentSettings.global?.font?.family || '';
  }
}

// ============================================================================
// 6. FOOTER, BACKUP, RESET
// ============================================================================
function initFooterAndUtilities() {
  const exportBtn = document.getElementById('export-btn');
  exportBtn?.addEventListener('click', () => {
    const jsonStr = exportSettings(currentSettings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cf-studio-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  const importBtn = document.getElementById('import-btn');
  const importFileInput = document.getElementById('import-file-input');
  importBtn?.addEventListener('click', () => importFileInput?.click());

  importFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = validateAndImportSettings(reader.result);
      if (!result.valid) {
        alert(`Import failed: ${result.error}`);
        return;
      }

      currentSettings = await updateSettings(() => result.settings);
      syncAllUI();
      await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
      alert('Settings imported successfully!');
    };
    reader.readAsText(file);
  });

  const resetBtn = document.getElementById('global-reset-btn');
  const confirmResetDialog = document.getElementById('confirm-reset-dialog');
  const cancelResetBtn = document.getElementById('confirm-reset-cancel');
  const confirmResetBtn = document.getElementById('confirm-reset-confirm');

  resetBtn?.addEventListener('click', () => {
    if (confirmResetDialog) confirmResetDialog.hidden = false;
  });

  cancelResetBtn?.addEventListener('click', () => {
    if (confirmResetDialog) confirmResetDialog.hidden = true;
  });

  confirmResetBtn?.addEventListener('click', async () => {
    if (confirmResetDialog) confirmResetDialog.hidden = true;
    currentSettings = await resetSettings();
    syncAllUI();
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
    alert('All settings have been reset to defaults.');
  });
}

// ============================================================================
// 7. APP BOOT & NAVIGATION
// ============================================================================
function initNavigationTabs() {
  const tabs = Array.from(document.querySelectorAll('.cfs-nav-tab'));
  const panels = Array.from(document.querySelectorAll('.cfs-panel'));

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const targetPanelId = `panel-${tab.getAttribute('data-tab')}`;

      for (const t of tabs) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      }
      for (const p of panels) {
        p.classList.remove('is-active');
      }

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const target = document.getElementById(targetPanelId);
      if (target) target.classList.add('is-active');
    });
  }
}

function initThemeFilterPills() {
  const filterBtns = Array.from(document.querySelectorAll('.cfs-filter-btn'));
  for (const btn of filterBtns) {
    btn.addEventListener('click', () => {
      for (const b of filterBtns) b.classList.remove('is-active');
      btn.classList.add('is-active');
      currentFilter = btn.getAttribute('data-filter') || 'light';
      renderThemeGallery();
    });
  }
}

function initImpressiveOptions() {
  const animCheckbox = document.getElementById('toggle-impressive-animations');
  animCheckbox?.addEventListener('change', async (e) => {
    const enabled = Boolean(e.target.checked);
    currentSettings = await updateSettings({ animationsEnabled: enabled });
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
  });
}

function syncAllUI() {
  if (!currentSettings) return;

  const masterSwitch = document.getElementById('master-switch');
  if (masterSwitch) masterSwitch.checked = Boolean(currentSettings.enabled);

  const animCheckbox = document.getElementById('toggle-impressive-animations');
  if (animCheckbox) animCheckbox.checked = currentSettings.animationsEnabled !== false;

  renderThemeGallery();
  syncCustomThemeInputs();
  syncBackgroundUI();
  syncBlockTransparencyUI();
  syncFontsUI();
}

async function syncActiveTabStatus() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const retryBtn = document.getElementById('retry-btn');
  const errorBanner = document.getElementById('error-banner');

  const tab = await getActiveTab();
  if (!tab || !tab.url || (!tab.url.includes('codeforces.com') && !tab.url.includes('.codeforces.com'))) {
    if (statusDot) statusDot.className = 'cfs-status-dot is-off';
    if (statusText) statusText.textContent = 'Unsupported page';
    if (retryBtn) retryBtn.hidden = true;
    if (errorBanner) errorBanner.hidden = true;
    return;
  }

  const res = await messageActiveTab(MESSAGE_TYPES.GET_STATUS);
  if (!res) {
    if (statusDot) statusDot.className = 'cfs-status-dot';
    if (statusText) statusText.textContent = currentSettings?.enabled ? 'Active' : 'Disabled';
    return;
  }

  if (statusText) statusText.textContent = res.label || res.status || 'Active';
  if (statusDot) {
    statusDot.className = 'cfs-status-dot';
    if (res.status === 'disabled' || res.status === 'off') statusDot.classList.add('is-off');
    else if (res.status === 'error') statusDot.classList.add('is-error');
    else if (res.status === 'initialising' || res.status === 'checking') statusDot.classList.add('is-checking');
    else statusDot.classList.add('is-active');
  }

  if (retryBtn) {
    retryBtn.hidden = res.status !== 'error';
    retryBtn.onclick = async () => {
      await messageActiveTab(MESSAGE_TYPES.RETRY);
      await syncActiveTabStatus();
    };
  }

  if (errorBanner) {
    errorBanner.hidden = res.status !== 'error';
  }
}

function initMasterSwitch() {
  const masterSwitch = document.getElementById('master-switch');
  masterSwitch?.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    currentSettings = await updateSettings({ enabled });
    await messageActiveTab(MESSAGE_TYPES.SETTINGS_CHANGED);
    await syncActiveTabStatus();
  });
}

async function initApp() {
  currentSettings = await getSettings();
  await getActiveTab();

  initNavigationTabs();
  initThemeFilterPills();
  initImpressiveOptions();
  initCustomThemeEditor();
  initMasterSwitch();
  initBackgroundsPanel();
  initBlockTransparencyControls();
  initFontsPanel();
  initFooterAndUtilities();

  syncAllUI();
  await syncActiveTabStatus();
}

document.addEventListener('DOMContentLoaded', () => {
  initApp().catch((err) => console.error('CF Studio: Init error:', err));
});
