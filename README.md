# GeoGuessr CS2 Ranks

Chrome extension that replaces GeoGuessr division badges with classic Counter-Strike 2 competitive skill group icons, and styles Current/Best rating as CS2 Premier badges. Runs only on `https://www.geoguessr.com/`.

**Open source.** See [PRIVACY.md](PRIVACY.md) for the privacy policy.

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

### Collected medals → CS2 Premier medals

| GeoGuessr | CS2 Premier medal |
| --- | --- |
| Bronze | Grey |
| Silver | Light blue |
| Gold | Blue |
| Platinum | Pink |

Icons are bundled from [SteamTracking/GameTracking-CS2](https://github.com/SteamTracking/GameTracking-CS2) status icons. Premier medals are cropped from `cs2medals.png`.

## Files

- `manifest.json` — MV3 extension config
- `ranks.js` — rank key → icon map
- `content.js` — DOM scanner + MutationObserver for division images
- `medals.js` / `medals-content.js` — collected medals → Premier medals
- `premier.js` / `premier.css` — Current/Best rating → Premier-style badge
- `icons/` — bundled skill group + Premier medal PNGs
