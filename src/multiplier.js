(() => {
  const ATTR = "data-cs2-multiplier";
  const IMG_CLASS = "cs2-multiplier-img";
  const DEBOUNCE_MS = 50;

  /**
   * Available weapon assets (filenames without .webp), ascending.
   * Gaps fall back to the last asset ≤ the multiplier (e.g. 4.5→4.0, 6.5→6.0).
   */
  const MULTIPLIER_ASSETS = [
    "1.5",
    "2.0",
    "2.5",
    "3.0",
    "3.5",
    "4.0",
    "6.0",
    "7.0",
  ];

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;

  /**
   * Pick the asset for a multiplier: exact match if present, else the
   * highest available image that is still ≤ the value (clamp to ends).
   * @param {number} value
   * @returns {string}
   */
  function resolveAssetKey(value) {
    let chosen = MULTIPLIER_ASSETS[0];
    for (const key of MULTIPLIER_ASSETS) {
      if (Number.parseFloat(key) <= value) chosen = key;
      else break;
    }
    return chosen;
  }

  /**
   * @param {string} text
   * @returns {string | null} asset key like "1.5"
   */
  function parseMultiplierKey(text) {
    const match = (text || "").replace(/\s+/g, "").match(/x?(\d+(?:\.\d+)?)/i);
    if (!match) return null;

    const value = Number.parseFloat(match[1]);
    if (!Number.isFinite(value) || value <= 0) return null;

    return resolveAssetKey(value);
  }

  /**
   * @param {Element} root
   * @returns {string}
   */
  function readMultiplierText(root) {
    const textEl = root.querySelector('[class*="multiplier-indicator_text"]');
    if (textEl) {
      // Prefer the visible layer, not the outline duplicate
      const visible = textEl.querySelector(
        '[class*="outlined-text_wrapper"] > span:not([class*="outline"])'
      );
      if (visible) return visible.textContent || "";
      return textEl.textContent || "";
    }
    return root.textContent || "";
  }

  /**
   * Left HUD side should face the opponent (mirror the weapon).
   * @param {HTMLElement} container
   * @returns {boolean}
   */
  function isLeftSideMultiplier(container) {
    if (
      container.closest(
        '[class*="variantLeft"], [class*="leftMulti"], [class*="LeftMulti"], [class*="multiplierLeft"]'
      )
    ) {
      return true;
    }

    const bars = container.closest('[class*="hud_healthBars"], [class*="healthBars"]');
    if (!bars) return false;

    const healthbars = [...bars.children].filter((el) =>
      el.className?.toString?.().includes("healthbar")
    );
    if (healthbars.length < 2) return false;

    // First healthbar column = left player
    return healthbars[0].contains(container);
  }

  /**
   * @param {HTMLElement} container
   */
  function restyleMultiplier(container) {
    const key = parseMultiplierKey(readMultiplierText(container));
    if (!key) return;

    const onLeft = isLeftSideMultiplier(container);
    container.setAttribute(ATTR, key);
    container.classList.add("cs2-multiplier");
    container.classList.toggle("cs2-multiplier--left", onLeft);
    container.classList.toggle("cs2-multiplier--right", !onLeft);

    let img = /** @type {HTMLImageElement | null} */ (
      container.querySelector(`.${IMG_CLASS}`)
    );
    if (!img) {
      img = document.createElement("img");
      img.className = IMG_CLASS;
      img.alt = "";
      img.draggable = false;
      img.setAttribute("aria-hidden", "true");
      container.insertBefore(img, container.firstChild);
    }

    const url = chrome.runtime.getURL(`assets/${key}.webp`);
    if (img.getAttribute("src") !== url) {
      img.src = url;
    }
  }

  /**
   * @param {ParentNode | Document} [root]
   */
  function scan(root = document) {
    if (!root.querySelectorAll) return;

    for (const el of root.querySelectorAll(
      '[class*="multiplier-indicator_container"], [class*="hud_multiplier"]'
    )) {
      const container =
        el.matches('[class*="multiplier-indicator_container"]')
          ? el
          : el.querySelector('[class*="multiplier-indicator_container"]') || el;
      if (container instanceof HTMLElement) {
        restyleMultiplier(container);
      }
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
    let needsScan = false;
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        needsScan = true;
        break;
      }
      if (mutation.type === "childList" || mutation.type === "attributes") {
        const t = mutation.target;
        if (
          t instanceof Element &&
          (t.matches?.(
            '[class*="multiplier"], [class*="hud_rightMulti"], [class*="hud_health"]'
          ) ||
            t.querySelector?.(
              '[class*="multiplier-indicator_container"], [class*="hud_multiplier"]'
            ))
        ) {
          needsScan = true;
          break;
        }
        for (const node of mutation.addedNodes || []) {
          if (!(node instanceof Element)) continue;
          if (
            node.matches?.(
              '[class*="multiplier"], [class*="hud_multiplier"], [class*="hud_health"]'
            ) ||
            node.querySelector?.('[class*="multiplier"]')
          ) {
            needsScan = true;
            break;
          }
        }
        if (needsScan) break;
      }
    }
    if (needsScan) scheduleScan();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });
})();
