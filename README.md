# GeoGuessr CS2 Ranks

Browser extension (Chrome + Firefox) that replaces GeoGuessr division badges with classic Counter-Strike 2 competitive skill group icons, and styles ratings as CS2 Premier badges. Runs only on `https://www.geoguessr.com/`.

**Open source.** See [PRIVACY.md](PRIVACY.md) for the privacy policy.

Icons are **not** shipped in the package — they are downloaded on demand from [SteamTracking/GameTracking-CS2](https://github.com/SteamTracking/GameTracking-CS2) status icons.

## Screenshots

![Champion division with Global Elite icon and Premier-style ratings](screenshots/global-ss.png)


![Duel lobby player cards with Premier-style overall and mode ratings](screenshots/duos.png)


![Gold division with CS2 skill group icon and Premier-style ratings](screenshots/gold-ss.png)

## Install

### Chrome / Chromium / Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the [`src`](src) folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select [`src/manifest.json`](src/manifest.json) (or a packaged `.zip` from CI)
4. Note: temporary add-ons are removed when Firefox restarts — for permanent install, submit to [addons.mozilla.org](https://addons.mozilla.org/) or sideload a signed build

5. Open [geoguessr.com](https://www.geoguessr.com/) and check a ranked division badge

### Packaged zip (CI)

GitHub Actions builds `geoguessr-cs2-ranks.zip` on every push/PR (artifact) and attaches it to releases when you push a `v*` tag:

```bash
git tag v1.4.0
git push origin v1.4.0
```

## Rank mapping

| GeoGuessr | CS2 skill group |
| --- | --- |
| Bronze (any) | Silver I (`skillgroup1`) |
| *(no rank / empty)* | Unranked (`skillgroup_none`) — any `*DivisionImageEmpty` (solo/duel/team/…) |
| Silver IV | Silver IV (`skillgroup4`) |
| Silver III | Silver III (`skillgroup3`) |
| Silver II | Silver II (`skillgroup2`) |
| Silver I | Silver I (`skillgroup1`) |
| Gold IV | Gold Nova Master (`skillgroup10`) |
| Gold III | Gold Nova III (`skillgroup9`) |
| Gold II | Gold Nova II (`skillgroup8`) |
| Gold I | Gold Nova I (`skillgroup7`) |
| Master IV | Distinguished Master Guardian (`skillgroup14`) |
| Master III | Master Guardian Elite (`skillgroup13`) |
| Master II | Master Guardian II (`skillgroup12`) |
| Master I | Master Guardian I (`skillgroup11`) |
| Champion | The Global Elite (`skillgroup18`) |

Rank keys are matched mode-agnostically (solo, duel, team, ranked prefixes are stripped), so the same icons apply everywhere on geoguessr.com.

### Collected medals → CS service medals

| GeoGuessr | Remote asset |
| --- | --- |
| Bronze | `service_medal_2018_lvl1_large` (grey) |
| Silver | `service_medal_2018_lvl2_large` (light blue) |
| Gold | `service_medal_2018_lvl3_large` (blue) |
| Platinum | `service_medal_2018_lvl5_large` (pink) |

## Project layout

```
src/                 # extension package root (load this folder / zip these files)
  manifest.json
  …
screenshots/         # README images
.github/workflows/   # CI packaging
PRIVACY.md
README.md
```
