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
   * @param {number} rating
   * @param {Element | null} replaceTarget
   */
  function applyBadge(row, rating, replaceTarget) {
    const existing = row.querySelector(`.cs2-premier[${ATTR}]`);

    if (existing && existing.getAttribute(ATTR) === String(rating)) {
      existing.setAttribute("data-tier", String(getPremierTier(rating)));
      const valueEl = existing.querySelector(".cs2-premier__value");
      if (valueEl) valueEl.textContent = formatRating(rating);
      return;
    }

    const badge = createPremierBadge(rating);
    if (replaceTarget) {
      replaceTarget.replaceWith(badge);
    } else if (existing) {
      existing.replaceWith(badge);
    } else {
      row.appendChild(badge);
    }
  }

  /**
   * Current rating / Best rating rows.
   * @param {Element} row
   */
  function restyleDivisionRatingRow(row) {
    const label = row.querySelector("span");
    if (!label) return;
    const text = (label.textContent || "").trim().toLowerCase();
    if (!text.startsWith("current rating") && !text.startsWith("best rating")) {
      return;
    }

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

    applyBadge(row, rating, strong);
  }

  /**
   * Game history "Rating 514" cells.
   * @param {Element} row
   */
  function restyleHistoryRatingRow(row) {
    const label = row.querySelector('[class*="ratingLabel"]');
    if (!label) return;
    if ((label.textContent || "").trim().toLowerCase() !== "rating") return;

    const existing = row.querySelector(`.cs2-premier[${ATTR}]`);
    let rating = existing
      ? Number.parseInt(existing.getAttribute(ATTR) || "", 10)
      : NaN;

    // Number sits as a text node after the label (e.g. " 514")
    for (const node of [...row.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const match = (node.textContent || "").match(/(\d+)/);
      if (!match) continue;
      rating = Number.parseInt(match[1], 10);
      node.textContent = (node.textContent || "").replace(/\d+/, "").replace(/\s+/g, " ");
      if (!(node.textContent || "").trim()) {
        node.textContent = " ";
      }
    }

    // Also handle wrapping strong/span if GeoGuessr changes markup later
    if (!Number.isFinite(rating)) {
      const numEl = row.querySelector("strong, [class*='ratingValue']");
      if (numEl && !numEl.classList.contains("cs2-premier")) {
        const parsed = Number.parseInt(
          (numEl.textContent || "").replace(/[^\d]/g, ""),
          10
        );
        if (Number.isFinite(parsed)) {
          rating = parsed;
          applyBadge(row, rating, numEl);
          return;
        }
      }
    }

    if (!Number.isFinite(rating)) return;
    applyBadge(row, rating, null);
  }

  /**
   * @param {Element} el
   * @returns {boolean}
   */
  function isPremierTarget(el) {
    return (
      el.matches?.('[class*="divisionValue"]') ||
      el.matches?.('[class*="game-history-player-column_rating"]') ||
      el.matches?.('[class*="player-column_rating"]')
    );
  }

  /**
   * @param {ParentNode | Document} [root]
   */
  function scan(root = document) {
    if (!root.querySelectorAll) return;

    for (const row of root.querySelectorAll('[class*="divisionValue"]')) {
      restyleDivisionRatingRow(row);
    }

    for (const row of root.querySelectorAll(
      '[class*="game-history-player-column_rating"], [class*="player-column_rating"]'
    )) {
      // Avoid double-matching divisionValue if class names ever overlap
      if (row.matches('[class*="divisionValue"]')) continue;
      restyleHistoryRatingRow(row);
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
          if (isPremierTarget(node) || node.querySelector?.('[class*="divisionValue"], [class*="rating"]')) {
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
