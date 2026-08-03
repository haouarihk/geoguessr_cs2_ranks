# Privacy Policy — GeoGuessr CS2 Ranks

**Last updated:** August 3, 2026

This privacy policy applies to the **GeoGuessr CS2 Ranks** Chrome extension (the “Extension”).

The Extension is **open source**. You can inspect the full source code in this repository to verify how it works.

## Summary

- The Extension does **not** collect personal information.
- The Extension does **not** sell or share user data.
- The Extension does **not** send browsing data to our servers (there are no backend servers).
- Processing happens **locally in your browser** on GeoGuessr pages only.

## What the Extension does

The Extension runs only on `https://www.geoguessr.com/*` and visually replaces:

- ranked division badges with Counter-Strike 2 skill group icons
- rating numbers with CS2 Premier-style badges
- collected medals with CS2 Premier medal icons

All icons and scripts are **bundled inside the Extension package**. Nothing is downloaded from remote servers at runtime for those assets.

## Data we collect

**We collect no user data.**

The Extension does not gather, store, or transmit:

- names, emails, or other personally identifiable information
- account credentials or authentication data
- payment or financial information
- location data
- browsing history outside the active GeoGuessr tab where it runs
- keystrokes, clicks, or analytics about your activity

## Website content accessed locally

To change what you see, the Extension must read limited page content on GeoGuessr in your browser, such as:

- division badge image URLs
- rating text (for example “Current rating” or game-history ratings)
- collected medal images and labels

That content is used **only locally** to update the page display. It is not uploaded, logged, or shared with anyone.

## Permissions

### Host permission (`https://www.geoguessr.com/*`)

Required so the Extension can inject scripts and styles into GeoGuessr and update rank-related UI elements. The Extension does not request access to other websites.

### No remote code

The Extension does not fetch or execute remote JavaScript. All code ships with the Extension.

## Third parties

The Extension does not use analytics, advertising, crash-reporting, or other third-party tracking services.

GeoGuessr itself may collect data under its own policies when you use the website. This Extension does not control that.

## Children

The Extension is not directed at children and does not knowingly collect any information from anyone, including children.

## Changes to this policy

If this policy changes, we will update this file in the repository and revise the “Last updated” date above.

## Open source & transparency

Because the project is open source, anyone can review the code to confirm:

- no network calls for tracking or data exfiltration
- local-only DOM updates on GeoGuessr
- bundled assets only

## Contact

For privacy questions about this Extension, open an issue in this repository or contact the publisher email listed on the Chrome Web Store listing.

## Not affiliated

This project is not affiliated with, endorsed by, or sponsored by GeoGuessr, Valve, or Counter-Strike.
