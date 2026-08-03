(() => {
  const ATTR = "data-cs2-premier";
  const DEBOUNCE_MS = 50;

  /**
   * Mode rating titles keep English mode names across GeoGuessr locales
   * (e.g. "Overall Bewertung", "No Move Bewertung").
   */
  const MODE_RATING_TITLE_RE = /^(overall|moving|no\s*move|nmpz)\b/i;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;

  /**
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
   * @param {string} text
   * @returns {number}
   */
  function parseRating(text) {
    const digits = (text || "").replace(/[^\d]/g, "");
    if (!digits) return NaN;
    return Number.parseInt(digits, 10);
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
   * @param {Element} host
   * @param {number} rating
   * @param {"replace" | "fill"} mode
   * @param {Element | null} replaceTarget
   */
  function applyBadge(host, rating, mode, replaceTarget) {
    const existing = host.querySelector(`.cs2-premier[${ATTR}]`);

    if (existing && existing.getAttribute(ATTR) === String(rating)) {
      existing.setAttribute("data-tier", String(getPremierTier(rating)));
      const valueEl = existing.querySelector(".cs2-premier__value");
      if (valueEl) valueEl.textContent = formatRating(rating);
      return;
    }

    const badge = createPremierBadge(rating);

    if (mode === "replace" && replaceTarget) {
      replaceTarget.replaceWith(badge);
      return;
    }

    if (existing) {
      existing.replaceWith(badge);
      return;
    }

    if (mode === "fill") {
      host.textContent = "";
      host.appendChild(badge);
      return;
    }

    host.appendChild(badge);
  }

  /**
   * Division widget: [class*=divisionValue] with span label + strong number.
   * Ignores label language entirely.
   * @param {Element} row
   */
  function restyleDivisionRatingRow(row) {
    const existing = row.querySelector(`.cs2-premier[${ATTR}]`);
    /** @type {HTMLElement | null} */
    let strong = null;
    /** @type {HTMLElement | null} */
    let label = null;

    for (const child of row.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.classList.contains("cs2-premier")) continue;
      if (child.tagName === "STRONG") strong = child;
      if (child.tagName === "SPAN") label = child;
    }

    if (!existing && (!label || !strong)) return;

    let rating = NaN;
    if (strong) {
      rating = parseRating(strong.textContent || "");
    } else if (existing) {
      rating = Number.parseInt(existing.getAttribute(ATTR) || "", 10);
    }

    if (!Number.isFinite(rating)) return;
    applyBadge(row, rating, "replace", strong);
  }

  /**
   * Game history cells with [class*=ratingLabel] + number text node.
   * @param {Element} row
   */
  function restyleHistoryRatingRow(row) {
    const label = row.querySelector('[class*="ratingLabel"]');
    if (!label) return;

    const existing = row.querySelector(`.cs2-premier[${ATTR}]`);
    let rating = existing
      ? Number.parseInt(existing.getAttribute(ATTR) || "", 10)
      : NaN;

    for (const node of [...row.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const match = (node.textContent || "").match(/(\d+)/);
      if (!match) continue;
      rating = Number.parseInt(match[1], 10);
      node.textContent = (node.textContent || "")
        .replace(/\d+/g, "")
        .replace(/\s+/g, " ");
      if (!(node.textContent || "").trim()) node.textContent = " ";
    }

    if (!Number.isFinite(rating)) {
      const numEl = row.querySelector("strong, [class*='ratingValue']");
      if (numEl && !numEl.classList.contains("cs2-premier")) {
        const parsed = parseRating(numEl.textContent || "");
        if (Number.isFinite(parsed)) {
          applyBadge(row, parsed, "replace", numEl);
          return;
        }
      }
    }

    if (!Number.isFinite(rating)) return;
    applyBadge(row, rating, "replace", null);
  }

  /**
   * Mode ratings on player/team stats cards (Overall / Moving / No Move / NMPZ).
   * Language-agnostic: English mode prefixes stay in all locales.
   * @param {Element} container
   */
  function restyleModeRatingStat(container) {
    const titleEl = container.querySelector(
      '[class*="title"], [class*="teamStatLabel"], [class*="StatLabel"]'
    );
    const valueEl = container.querySelector(
      '[class*="value"], [class*="teamStatValue"], [class*="StatValue"]'
    );
    if (!titleEl || !valueEl) return;
    // Avoid treating the premier badge itself as the value host's title
    if (titleEl.classList.contains("cs2-premier") || valueEl.classList.contains("cs2-premier")) {
      return;
    }

    const title = (titleEl.textContent || "").trim();
    if (!MODE_RATING_TITLE_RE.test(title)) return;

    const existing = valueEl.querySelector(`.cs2-premier[${ATTR}]`);
    const raw = (valueEl.textContent || "").trim();
    if (!existing && raw.includes("%")) return;
    if (!existing && !/^\d+$/.test(raw)) return;

    const rating = existing
      ? Number.parseInt(existing.getAttribute(ATTR) || "", 10)
      : parseRating(raw);

    if (!Number.isFinite(rating)) return;
    applyBadge(valueEl, rating, "fill", null);
  }

  /**
   * @param {Element} el
   * @returns {boolean}
   */
  function isPremierTarget(el) {
    return (
      el.matches?.('[class*="divisionValue"]') ||
      el.matches?.('[class*="game-history-player-column_rating"]') ||
      el.matches?.('[class*="player-column_rating"]') ||
      el.matches?.('[class*="player-stats-card"]') ||
      el.matches?.('[class*="team-stats-card"]') ||
      el.matches?.('[class*="statContainer"]') ||
      el.matches?.('[class*="teamStatItem"]')
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
      if (row.matches('[class*="divisionValue"]')) continue;
      restyleHistoryRatingRow(row);
    }

    // Player + team mode ratings
    for (const container of root.querySelectorAll(
      '[class*="statContainer"], [class*="teamStatItem"]'
    )) {
      restyleModeRatingStat(container);
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
            isPremierTarget(node) ||
            node.querySelector?.(
              '[class*="divisionValue"], [class*="ratingLabel"], [class*="player-column_rating"], [class*="player-stats-card"], [class*="team-stats-card"], [class*="statContainer"], [class*="teamStatItem"]'
            )
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
