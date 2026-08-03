(() => {
  const ATTR = "data-cs2-premier";
  const DEBOUNCE_MS = 50;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;

  /**
   * Map a GeoGuessr rating onto CS2 Premier color tiers.
   * GeoGuessr ratings are ~0–2000; scale ×20 so colors progress through the ladder.
   * @param {number} rating
   * @returns {number}
   */
  function getPremierTier(rating) {
    const scaled = rating * 20;
    if (scaled >= 30000) return 6;
    if (scaled >= 25000) return 5;
    if (scaled >= 20000) return 4;
    if (scaled >= 15000) return 3;
    if (scaled >= 10000) return 2;
    if (scaled >= 5000) return 1;
    return 0;
  }

  /**
   * @param {number} rating
   * @returns {string}
   */
  function formatRating(rating) {
    return rating.toLocaleString("en-US");
  }

  /**
   * @param {number} rating
   * @returns {HTMLElement}
   */
  function createPremierBadge(rating) {
    const tier = getPremierTier(rating);
    const root = document.createElement("span");
    root.className = "cs2-premier";
    root.setAttribute("data-tier", String(tier));
    root.setAttribute(ATTR, String(rating));

    const chevrons = document.createElement("span");
    chevrons.className = "cs2-premier__chevrons";
    chevrons.setAttribute("aria-hidden", "true");

    const box = document.createElement("span");
    box.className = "cs2-premier__box";

    const value = document.createElement("span");
    value.className = "cs2-premier__value";
    value.textContent = formatRating(rating);

    box.appendChild(value);
    root.appendChild(chevrons);
    root.appendChild(box);
    return root;
  }

  /**
   * @param {Element} row
   * @returns {boolean}
   */
  function isRatingRow(row) {
    const label = row.querySelector("span");
    if (!label) return false;
    const text = (label.textContent || "").trim().toLowerCase();
    return text.startsWith("current rating") || text.startsWith("best rating");
  }

  /**
   * @param {Element} row
   */
  function restyleRatingRow(row) {
    if (!isRatingRow(row)) return;

    const strong = row.querySelector("strong");
    const existing = row.querySelector(`.cs2-premier[${ATTR}]`);

    let ratingText = "";
    if (strong) {
      ratingText = (strong.textContent || "").replace(/[^\d]/g, "");
    } else if (existing) {
      ratingText = existing.getAttribute(ATTR) || "";
    }

    const rating = Number.parseInt(ratingText, 10);
    if (!Number.isFinite(rating)) return;

    if (existing && existing.getAttribute(ATTR) === String(rating)) {
      existing.setAttribute("data-tier", String(getPremierTier(rating)));
      const valueEl = existing.querySelector(".cs2-premier__value");
      if (valueEl) valueEl.textContent = formatRating(rating);
      return;
    }

    const badge = createPremierBadge(rating);
    if (strong) {
      strong.replaceWith(badge);
    } else if (existing) {
      existing.replaceWith(badge);
    } else {
      row.appendChild(badge);
    }
  }

  /**
   * @param {ParentNode | Document} [root]
   */
  function scan(root = document) {
    const rows = root.querySelectorAll
      ? root.querySelectorAll('[class*="divisionValue"]')
      : [];
    for (const row of rows) {
      restyleRatingRow(row);
    }
  }

  function scheduleScan() {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      scan();
    }, DEBOUNCE_MS);
  }

  scan();

  const observer = new MutationObserver((mutations) => {
    let needsFullScan = false;
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        needsFullScan = true;
        break;
      }
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (
            node.matches?.('[class*="divisionValue"]') ||
            node.querySelector?.('[class*="divisionValue"]')
          ) {
            needsFullScan = true;
            break;
          }
        }
      }
      if (needsFullScan) break;
    }
    if (needsFullScan) scheduleScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
