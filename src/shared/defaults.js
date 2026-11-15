/**
 * Default settings and constants for CF Studio.
 * Absolute Light-Theme Policy: all defaults are light.
 */

export const CURRENT_SCHEMA_VERSION = 1;

export const PAGE_TYPES = [
  'home',
  'problems',
  'problem',
  'contest',
  'standings',
  'submissions',
  'profile',
  'blog',
  'groups',
  'login',
];

export const DEFAULT_SETTINGS = Object.freeze({
  schemaVersion: 1,
  enabled: true,
  animationsEnabled: true,
  global: Object.freeze({
    themeId: 'pure-light',
    background: Object.freeze({
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
    }),
    font: Object.freeze({
      family: '',
      preset: 'default',
      interface: '',
      reading: '',
      code: '',
      page: '',
      headings: '',
      statement: '',
      size: null,
      weight: null,
      lineHeight: null,
      letterSpacing: null,
    }),
    transparency: Object.freeze({
      treatment: 'frosted',
      all: 20,
      blurRadius: 10,
      blurBehindPanels: true,
      page: 0,
      panels: 0,
      tables: 0,
      inputs: 0,
    }),
  }),
  perPage: Object.freeze({
    home: Object.freeze({}),
    problems: Object.freeze({}),
    problem: Object.freeze({}),
    contest: Object.freeze({}),
    standings: Object.freeze({}),
    submissions: Object.freeze({}),
    profile: Object.freeze({}),
    blog: Object.freeze({}),
    groups: Object.freeze({}),
    login: Object.freeze({}),
  }),
  contestMode: Object.freeze({
    enabled: false,
    themeId: 'editorial',
    hideBackground: true,
  }),
  autoDark: Object.freeze({
    mode: 'off',
    lightThemeId: 'pure-light',
    darkThemeId: 'paper',
    from: '19:00',
    to: '07:00',
  }),
  customThemes: Object.freeze([]),
  favorites: Object.freeze([]),
  introShown: false,
});

/**
 * Returns a fresh, deep copy of the default settings.
 * @returns {typeof DEFAULT_SETTINGS}
 */
export function getDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}
