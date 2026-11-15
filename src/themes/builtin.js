/**
 * CF Studio - Curated Theme Registry
 * Exactly 12 Curated Themes across 3 Categories:
 * - 5 Light Themes (Pure Light, Paper, Nord Light, Rose, Botanical)
 * - 1 Dark Theme (Obsidian)
 * - 6 Impressive Themes (Anime Studio, Sakura Dreams, Vintage Paper, Orchid, Forest Escape, Ocean Adventure)
 *
 * All themes define full 37 design tokens generated via the three-colour palette system (Primary, Secondary, Tertiary).
 */

import { generateThemeFromPalette } from './palette-generator.js';
import { IMPRESSIVE_ARTWORK } from './impressive-art.js';

export const BUILTIN_THEMES = Object.freeze([
  // ========================================================
  // 1. LIGHT THEMES (5 Curated Presets)
  // ========================================================
  generateThemeFromPalette({
    id: 'pure-light',
    name: 'Pure Light',
    category: 'standard',
    kind: 'light',
    primary: '#1a73e8',
    secondary: '#dbe4ee',
    tertiary: '#0d65d9',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'paper',
    name: 'Paper',
    category: 'standard',
    kind: 'light',
    primary: '#8c5828',
    secondary: '#d8c8b0',
    tertiary: '#a36224',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'nord-light',
    name: 'Nord Light',
    category: 'standard',
    kind: 'light',
    primary: '#3d6089',
    secondary: '#c6d2de',
    tertiary: '#2e5b88',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'rose',
    name: 'Rose',
    category: 'standard',
    kind: 'light',
    primary: '#b84869',
    secondary: '#f0cfd8',
    tertiary: '#9e3553',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'botanical',
    name: 'Botanical',
    category: 'standard',
    kind: 'light',
    primary: '#0b7a55',
    secondary: '#bce2d1',
    tertiary: '#08704c',
    builtin: true,
  }),

  // ========================================================
  // 2. DARK THEMES (1 Premium Preset: Obsidian)
  // ========================================================
  generateThemeFromPalette({
    id: 'obsidian',
    name: 'Obsidian',
    category: 'dark',
    kind: 'dark',
    primary: '#11151D',
    secondary: '#202630',
    tertiary: '#35C6B0',
    builtin: true,
  }),

  // ========================================================
  // 3. IMPRESSIVE THEMES (10 Atmospheric & Animated Light Presets)
  // All Impressive themes strictly follow the Light Appearance direction.
  // ========================================================
  generateThemeFromPalette({
    id: 'anime-studio',
    name: 'Anime Studio',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#4338ca',
    secondary: '#e0e7ff',
    tertiary: '#0284c7',
    artwork: IMPRESSIVE_ARTWORK['anime-studio'],
    animationEffect: 'anime-rain',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'sakura-dreams',
    name: 'Sakura Dreams',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#be185d',
    secondary: '#fce7f3',
    tertiary: '#db2777',
    artwork: IMPRESSIVE_ARTWORK['sakura-dreams'],
    animationEffect: 'petals',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'vintage-paper',
    name: 'Vintage Paper',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#78350f',
    secondary: '#fef3c7',
    tertiary: '#b45309',
    artwork: IMPRESSIVE_ARTWORK['vintage-paper'],
    animationEffect: 'ambient',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'orchid',
    name: 'Orchid',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#6b21a8',
    secondary: '#f3e8ff',
    tertiary: '#9333ea',
    artwork: IMPRESSIVE_ARTWORK['orchid'],
    animationEffect: 'spores',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'forest-escape',
    name: 'Forest Escape',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#065f46',
    secondary: '#d1fae5',
    tertiary: '#059669',
    artwork: IMPRESSIVE_ARTWORK['forest-escape'],
    animationEffect: 'fireflies',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'ocean-adventure',
    name: 'Ocean Adventure',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#0369a1',
    secondary: '#e0f2fe',
    tertiary: '#0284c7',
    artwork: IMPRESSIVE_ARTWORK['ocean-adventure'],
    animationEffect: 'bubbles',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'rainy-day',
    name: 'Rainy Day',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#334155',
    secondary: '#e2e8f0',
    tertiary: '#0284c7',
    artwork: IMPRESSIVE_ARTWORK['rainy-day'],
    animationEffect: 'rain',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'aurora-sky',
    name: 'Aurora Sky',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#0f766e',
    secondary: '#ccfbf1',
    tertiary: '#7c3aed',
    artwork: IMPRESSIVE_ARTWORK['aurora-sky'],
    animationEffect: 'aurora',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'autumn-breeze',
    name: 'Autumn Breeze',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#9a3412',
    secondary: '#ffedd5',
    tertiary: '#ea580c',
    artwork: IMPRESSIVE_ARTWORK['autumn-breeze'],
    animationEffect: 'leaves',
    builtin: true,
  }),
  generateThemeFromPalette({
    id: 'snowfall',
    name: 'Snowfall',
    category: 'impressive',
    kind: 'light',
    animated: true,
    primary: '#1e3a8a',
    secondary: '#e0f2fe',
    tertiary: '#0284c7',
    artwork: IMPRESSIVE_ARTWORK['snowfall'],
    animationEffect: 'snow',
    builtin: true,
  }),
]);

export function getBuiltinTheme(themeId) {
  return BUILTIN_THEMES.find((t) => t.id === themeId) || BUILTIN_THEMES[0];
}

export function isBuiltinTheme(themeId) {
  return BUILTIN_THEMES.some((t) => t.id === themeId);
}
