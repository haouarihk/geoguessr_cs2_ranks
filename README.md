# GeoGuessr CS2 Ranks

Chrome extension that replaces GeoGuessr division badges with classic Counter-Strike 2 competitive skill group icons, and styles Current/Best rating as CS2 Premier badges. Runs only on `https://www.geoguessr.com/`.

**Open source.** See [PRIVACY.md](PRIVACY.md) for the privacy policy.

Icons are **not** shipped in the package — they are downloaded on demand from [SteamTracking/GameTracking-CS2](https://github.com/SteamTracking/GameTracking-CS2) status icons.

## Install (unpacked)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this project folder (`geoguessr_cs2_ranks`)
5. Open [geoguessr.com](https://www.geoguessr.com/) and check a ranked division badge

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

## Files

- `manifest.json` — MV3 extension config
- `icons-remote.js` — fetch + blob cache for remote icons
- `ranks.js` — rank key → skillgroup filename
- `content.js` — division image replacements
- `medals.js` / `medals-content.js` — collected medals
- `premier.js` / `premier.css` — Premier-style rating badges
- `PRIVACY.md` — privacy policy
