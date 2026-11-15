import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isContestUrl,
  parseTimeToMinutes,
  isTimeInRange,
  resolveSettings,
} from '../../src/shared/resolve-settings.js';
import { getDefaultSettings } from '../../src/shared/defaults.js';

test('isContestUrl: identifies contest URLs accurately', () => {
  assert.equal(isContestUrl('https://codeforces.com/contest/1234'), true);
  assert.equal(isContestUrl('https://codeforces.com/contest/1234/problem/A'), true);
  assert.equal(isContestUrl('https://codeforces.com/contest/1234/standings'), true);
  assert.equal(isContestUrl('https://codeforces.com/contests'), true);
  assert.equal(isContestUrl('/contest/1234'), true);

  assert.equal(isContestUrl('https://codeforces.com/'), false);
  assert.equal(isContestUrl('https://codeforces.com/problemset'), false);
  assert.equal(isContestUrl('https://codeforces.com/problemset/problem/123/A'), false);
  assert.equal(isContestUrl('https://codeforces.com/profile/tourist'), false);
});

test('time parser and range: accurately handles normal and overnight ranges', () => {
  assert.equal(parseTimeToMinutes('00:00'), 0);
  assert.equal(parseTimeToMinutes('07:00'), 420);
  assert.equal(parseTimeToMinutes('19:00'), 1140);
  assert.equal(parseTimeToMinutes('23:59'), 1439);

  // Overnight range: 19:00 to 07:00
  assert.equal(isTimeInRange('18:59', '19:00', '07:00'), false);
  assert.equal(isTimeInRange('19:00', '19:00', '07:00'), true);
  assert.equal(isTimeInRange('22:00', '19:00', '07:00'), true);
  assert.equal(isTimeInRange('00:00', '19:00', '07:00'), true);
  assert.equal(isTimeInRange('06:59', '19:00', '07:00'), true);
  assert.equal(isTimeInRange('07:00', '19:00', '07:00'), false);
  assert.equal(isTimeInRange('12:00', '19:00', '07:00'), false);

  // Daytime range: 08:00 to 18:00
  assert.equal(isTimeInRange('07:59', '08:00', '18:00'), false);
  assert.equal(isTimeInRange('08:00', '08:00', '18:00'), true);
  assert.equal(isTimeInRange('14:00', '08:00', '18:00'), true);
  assert.equal(isTimeInRange('17:59', '08:00', '18:00'), true);
  assert.equal(isTimeInRange('18:00', '08:00', '18:00'), false);
});

test('priority: per-page theme overrides contest mode, auto dark, and global', () => {
  const settings = getDefaultSettings();
  settings.global.themeId = 'slate';
  settings.contestMode = {
    enabled: true,
    themeId: 'contrast',
    hideBackground: true,
  };
  settings.autoDark = {
    mode: 'system',
    lightThemeId: 'light',
    darkThemeId: 'midnight',
    from: '19:00',
    to: '07:00',
  };
  settings.perPage.problem = {
    themeId: 'purple',
  };

  // On a contest problem URL:
  // Contest mode is On, Auto dark is system (dark), Global is slate.
  // Per-page setting 'purple' must win over all of them.
  const resolved = resolveSettings(settings, 'https://codeforces.com/contest/123/problem/A', {
    systemPrefersDark: true,
  });

  assert.equal(resolved.themeId, 'purple');
  assert.equal(resolved.themeSource, 'per-page');
});

test('priority: contest mode overrides auto dark and global on contest pages', () => {
  const settings = getDefaultSettings();
  settings.global.themeId = 'slate';
  settings.contestMode = {
    enabled: true,
    themeId: 'contrast',
    hideBackground: true,
  };
  settings.autoDark = {
    mode: 'system',
    lightThemeId: 'light',
    darkThemeId: 'midnight',
    from: '19:00',
    to: '07:00',
  };

  // Contest page without per-page override
  const resolved = resolveSettings(settings, 'https://codeforces.com/contest/123/problem/A', {
    systemPrefersDark: true,
  });

  assert.equal(resolved.themeId, 'contrast');
  assert.equal(resolved.themeSource, 'contest-mode');
});

test('priority: auto dark overrides global on non-contest pages', () => {
  const settings = getDefaultSettings();
  settings.global.themeId = 'slate';
  settings.contestMode = {
    enabled: true,
    themeId: 'contrast',
    hideBackground: true,
  };
  settings.autoDark = {
    mode: 'system',
    lightThemeId: 'light',
    darkThemeId: 'midnight',
    from: '19:00',
    to: '07:00',
  };

  // On non-contest page (home):
  // Contest mode does NOT apply. Auto dark (system: true) must pick darkThemeId ('midnight').
  const resolvedDark = resolveSettings(settings, 'https://codeforces.com/', {
    systemPrefersDark: true,
  });
  assert.equal(resolvedDark.themeId, 'midnight');
  assert.equal(resolvedDark.themeSource, 'auto-dark-system');

  // When system prefers light:
  const resolvedLight = resolveSettings(settings, 'https://codeforces.com/', {
    systemPrefersDark: false,
  });
  assert.equal(resolvedLight.themeId, 'light');
  assert.equal(resolvedLight.themeSource, 'auto-dark-system');
});

test('priority: global theme applies when no per-page, contest mode, or auto dark', () => {
  const settings = getDefaultSettings();
  settings.global.themeId = 'slate';
  settings.contestMode.enabled = false;
  settings.autoDark.mode = 'off';

  const resolved = resolveSettings(settings, 'https://codeforces.com/problemset');
  assert.equal(resolved.themeId, 'slate');
  assert.equal(resolved.themeSource, 'global');
});

test('priority: background hide in contest mode and per-page override', () => {
  const settings = getDefaultSettings();
  settings.global.background.mode = 'builtin';
  settings.global.background.builtinId = 'aurora';
  settings.contestMode = {
    enabled: true,
    themeId: 'contrast',
    hideBackground: true,
  };

  // 1. Contest page hides background when contestMode.hideBackground is true
  const resContest = resolveSettings(settings, 'https://codeforces.com/contest/123');
  assert.equal(resContest.background.mode, 'none');

  // 2. Per-page explicitly enables background on contest page
  settings.perPage.contest = {
    backgroundEnabled: true,
  };
  const resOverridden = resolveSettings(settings, 'https://codeforces.com/contest/123');
  assert.equal(resOverridden.background.mode, 'builtin');
  assert.equal(resOverridden.background.builtinId, 'aurora');

  // 3. Per-page explicitly disables background on normal page
  settings.perPage.home = {
    backgroundEnabled: false,
  };
  const resHome = resolveSettings(settings, 'https://codeforces.com/');
  assert.equal(resHome.background.mode, 'none');
});

test('priority: font and transparency per-page overrides', () => {
  const settings = getDefaultSettings();
  settings.global.font.preset = 'default';
  settings.global.transparency = { all: 10, page: 5, panels: 10, tables: 0, inputs: 0 };

  settings.perPage.problem = {
    fontPreset: 'reading',
    transparency: { all: 30, panels: 40 },
  };

  const resProblem = resolveSettings(settings, 'https://codeforces.com/problemset/problem/123/A');
  assert.equal(resProblem.font.preset, 'reading');
  assert.equal(resProblem.transparency.all, 30);
  assert.equal(resProblem.transparency.panels, 40);
  assert.equal(resProblem.transparency.page, 5); // Kept from global

  const resHome = resolveSettings(settings, 'https://codeforces.com/');
  assert.equal(resHome.font.preset, 'default');
  assert.equal(resHome.transparency.all, 10);
});

test('isolation: settings changes on one page category do not leak into another', () => {
  const settings = getDefaultSettings();
  settings.global.themeId = 'midnight';
  settings.perPage.problem = {
    themeId: 'purple',
    fontPreset: 'reading',
    backgroundEnabled: false,
  };

  // Check 'problem' category has overrides
  const resProblem = resolveSettings(settings, 'https://codeforces.com/problemset/problem/100/B');
  assert.equal(resProblem.themeId, 'purple');
  assert.equal(resProblem.font.preset, 'reading');
  assert.equal(resProblem.background.mode, 'none');

  // Check all other categories remain unaffected
  const testUrls = [
    { url: 'https://codeforces.com/', expectedCat: 'home' },
    { url: 'https://codeforces.com/problemset', expectedCat: 'problems' },
    { url: 'https://codeforces.com/standings', expectedCat: 'standings' },
    { url: 'https://codeforces.com/submissions/tourist', expectedCat: 'submissions' },
    { url: 'https://codeforces.com/profile/tourist', expectedCat: 'profile' },
    { url: 'https://codeforces.com/blog/entry/123', expectedCat: 'blog' },
    { url: 'https://codeforces.com/enter', expectedCat: 'login' },
  ];

  for (const { url, expectedCat } of testUrls) {
    const res = resolveSettings(settings, url);
    assert.equal(res.pageCategory, expectedCat);
    assert.equal(res.themeId, 'midnight', `Page ${expectedCat} leaked theme from problem`);
    assert.equal(res.font.preset, 'default', `Page ${expectedCat} leaked font from problem`);
    assert.equal(res.background.mode, 'none', `Page ${expectedCat} leaked background from problem`);
  }
});

test('auto dark: accurately evaluates fake clock time', () => {
  const settings = getDefaultSettings();
  settings.autoDark = {
    mode: 'time',
    lightThemeId: 'paper',
    darkThemeId: 'midnight',
    from: '20:00',
    to: '06:00',
  };

  // 19:59 -> light hours ('paper')
  const resLight = resolveSettings(settings, 'https://codeforces.com/', {
    currentTime: '19:59',
  });
  assert.equal(resLight.themeId, 'paper');

  // 20:00 -> dark hours ('midnight')
  const resDark = resolveSettings(settings, 'https://codeforces.com/', {
    currentTime: '20:00',
  });
  assert.equal(resDark.themeId, 'midnight');

  // 03:30 -> dark hours ('midnight')
  const resMid = resolveSettings(settings, 'https://codeforces.com/', {
    currentTime: '03:30',
  });
  assert.equal(resMid.themeId, 'midnight');

  // 06:00 -> morning light hours ('paper')
  const resMorning = resolveSettings(settings, 'https://codeforces.com/', {
    currentTime: '06:00',
  });
  assert.equal(resMorning.themeId, 'paper');
});
