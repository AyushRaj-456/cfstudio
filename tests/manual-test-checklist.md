# Manual Test Checklist (real Chrome, real Codeforces)

Mark each item after you test it. Write the Chrome version and date at the top.

Chrome version: ______  Date: ______

## Install
- [ ] Load unpacked works, no errors on `chrome://extensions`
- [ ] Popup opens at top right, about 400 px wide, doesn't cover the screen
- [ ] First-run card appears top-right on Codeforces, once
- [ ] Hover previews a theme, click keeps it, Escape / X closes the card
- [ ] Clicking outside the card still works on the page

## Pages (check look + no broken layout, narrow and wide window)
- [ ] Home  - [ ] Problemset  - [ ] Problem  - [ ] Contest  - [ ] Contest problem
- [ ] Standings  - [ ] Submissions  - [ ] Profile  - [ ] Blog and comments  - [ ] Login

## Features
- [ ] Each of the 6 themes
- [ ] Verdict, rank, tag, syntax, chart colors unchanged
- [ ] Background: upload, position, size, strength, blur, brightness, contrast, saturation, dark cover, remove
- [ ] Colors from image makes a readable theme
- [ ] Transparency sliders: text stays solid, contrast warning shows when needed
- [ ] Font: each of the 4 boxes, missing font falls back, presets, reset
- [ ] Contest mode on contest pages only
- [ ] Auto dark: System and Time
- [ ] Per page: change one page, others unchanged
- [ ] Share: copy a code, paste it, bad code rejected
- [ ] Export and Import, bad file rejected
- [ ] Settings stay after closing and reopening Chrome

## Safety
- [ ] Off: page looks exactly like original (compare with screenshot)
- [ ] Reset: all defaults
- [ ] Links, filters, search, login form, dropdowns, dialogs work
- [ ] Keyboard Tab shows focus everywhere
- [ ] No console errors on any page
- [ ] No text on the page changed
- [ ] Page not slower; no flash of original colors on load

## Notes / bugs found
