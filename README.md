# CF Studio

CF Studio is a Manifest V3 Chrome extension that modifies only the visual appearance of Codeforces. It never alters layout, text, forms, navigation, verdicts, ratings, or network calls. All settings remain stored locally on your device.

## Project Structure

```text
CF-Studio-project/
├── manifest.json              # Extension Manifest V3 configuration
├── package.json               # Dependencies and scripts (esbuild devDependency)
├── README.md                  # Project documentation & install instructions
├── assets/
│   └── icons/                 # Original extension icons (16, 32, 48, 128)
├── dist/                      # Bundled extension ready to load unpacked
├── scripts/
│   ├── build.js               # Bundles source code with esbuild into dist/
│   ├── package.js             # Creates cf-studio.zip distribution package
│   └── generate-icons.js      # Procedural icon generator
├── src/
│   ├── background/
│   │   └── service-worker.js  # MV3 background service worker
│   ├── content/
│   │   └── content.js         # Content script for codeforces.com
│   ├── popup/
│   │   ├── popup.html         # Toolbar popup interface (400x600 px)
│   │   ├── popup.css          # Chrome settings aesthetic & dark mode
│   │   └── popup.js           # Popup controller & state sync
│   └── shared/
│       ├── browser-api.js     # chrome.* API promise wrapper
│       ├── defaults.js        # Default settings schema v1
│       ├── messaging.js       # Typed messaging & payload validation
│       ├── migrations.js      # Versioned settings migrations
│       ├── schema.js          # Settings schema validators
│       ├── storage.js         # Local storage wrapper
│       └── validators.js      # Type and input sanitization helpers
└── tests/
    ├── fixtures/              # Codeforces test page fixtures
    ├── manual-test-checklist.md
    └── unit/                  # Node.js native test suite
```

## Prerequisites

- **Node.js** (v18 or higher recommended; v24 tested)
- **Google Chrome** (or Chromium-based browser)

## Development

Install dependencies:
```bash
npm install
```

Run unit tests:
```bash
npm test
```

Build the extension into `dist/`:
```bash
npm run build
```

Create distribution ZIP archive (`cf-studio.zip`):
```bash
npm run package
```

## How to Install in Google Chrome

1. Build the extension if not already built:
   ```bash
   npm run build
   ```
2. Open Google Chrome.
3. In the Chrome address bar, navigate to:
   ```text
   chrome://extensions
   ```
4. In the top-right corner, toggle **Developer mode** to **ON**.
5. In the top-left corner, click **Load unpacked**.
6. In the file dialog, select the `dist` folder located inside `CF-Studio-project`:
   ```text
   CF-Studio-project/dist
   ```
7. Click **Select Folder**.
8. **CF Studio** will appear in your installed extensions list with no manifest or console errors.
9. Click the puzzle icon in Chrome's toolbar and pin **CF Studio**.
10. Navigate to `https://codeforces.com` and click the CF Studio icon to open the popup.

## Troubleshooting

### Extension status is "Off" or page is not styled
- Open the CF Studio toolbar popup and check the master switch at the top. Toggle it to **On**.
- Verify you are on `https://codeforces.com` or `https://*.codeforces.com`. CF Studio operates exclusively on Codeforces pages.
- Refresh the page to re-initialize styling.

### Safe mode triggered ("Something went wrong. CF Studio turned itself off on this page.")
- If repeated DOM or runtime errors occur (3 errors in 30 seconds), CF Studio activates safe mode and automatically disables styling on that page to prevent interference.
- Open the popup and click **Try again** to reset safe mode and retry applying styles.

### First-run intro card does not appear or was closed
- The first-run onboarding card is designed to show once on initial visit.
- To reopen the card at any time, open the popup, select the **More** tab, and click **Show intro**.

### Background image does not show or status shows "Partly on"
- If Codeforces Content Security Policy (CSP) restricts `blob:` or `data:` URLs on a specific page, the background image cannot be loaded.
- The status indicator in the popup will display **Partly on** with the message: *"Background blocked on this page."*
- All other theme colors, fonts, and panel styles continue to work normally.

### Font is not changing
- CF Studio displays the hint: *"The font must be installed on your computer."*
- For user privacy, zero remote fonts or web font downloads (such as Google Fonts) are permitted. You must have the font locally installed on your operating system.
- Check that the font family name is spelled accurately.

### Contest mode is not active
- Contest mode strictly applies to contest URLs starting with `/contest/...` or `/contests`.
- If a Per-page setting has been configured for the Contest page category, the Per-page setting takes priority over contest mode.

### Auto dark is not switching
- In **System** mode, CF Studio follows your operating system's light/dark appearance preference.
- In **Time** mode, verify that the **From** and **To** times are correctly set. Overnight ranges (e.g., 19:00 to 07:00) are fully supported.
- Styling evaluates when the tab becomes active or when system appearance changes, without battery-draining polling.

### Resetting to defaults
- Open the popup, click the **Reset** button in the footer, and confirm *"Reset all settings?"*.
- All settings, custom themes, and cached state will revert to initial defaults, and the page DOM is restored to its native appearance.

## Privacy & Permissions

CF Studio is designed with strict privacy and security principles:
- **`storage` permission**: Used solely to persist your visual settings and custom themes locally on your device via Chrome storage.
- **Host access (`https://codeforces.com/*`, `https://*.codeforces.com/*`)**: Scoped strictly to Codeforces domains to inject CSS styles and background presentation.
- **Zero remote network calls**: The extension makes NO external network requests, uses no external CDNs, contains no analytics or telemetry, and never reads or transmits your code submissions, account data, or browsing history.
- **Local storage**: All user-uploaded background images remain strictly inside local browser IndexedDB in the extension's origin.

## Manual Testing

Before releasing, complete the manual test checklist located at:
- `tests/manual-test-checklist.md`

Mark each item in real Google Chrome on actual Codeforces pages.

