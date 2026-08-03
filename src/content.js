(() => {
  const ATTR = "data-cs2-rank";
  const DEBOUNCE_MS = 50;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;

  /**
   * @param {HTMLImageElement} img
   * @returns {string | null}
   */
  function rankKeyFromImg(img) {
    const attrs = [
      img.getAttribute("src"),
      img.getAttribute("srcset"),
      img.getAttribute("data-src"),
      img.getAttribute("data-srcset"),
    ];
    for (const value of attrs) {
      const key = extractRankKey(value || "");
      if (key) return key;
    }
    return null;
  }

  /**
   * @param {HTMLImageElement} img
   */
  function replaceImg(img) {
    if (
      typeof isCollectedMedalImage === "function" &&
      isCollectedMedalImage(img)
    ) {
      return;
    }
    if (img.getAttribute("data-cs2-medal")) return;

    const rankKey = rankKeyFromImg(img);
    if (!rankKey) return;

    const filename = getCs2IconFilename(rankKey);
    if (!filename) return;

    const existing = img.getAttribute(ATTR);
    if (existing === rankKey && isResolvedIconSrc(img.src)) {
      return;
    }

    img.setAttribute(ATTR, rankKey);
    img.removeAttribute("srcset");
    img.removeAttribute("data-srcset");
    img.removeAttribute("data-src");

    resolveIconUrl(filename).then((url) => {
      if (img.getAttribute(ATTR) !== rankKey) return;
      img.src = url;
    });
  }

  /**
   * @param {Element | null} root
   */
  function scan(root = document) {
    const imgs = root.querySelectorAll ? root.querySelectorAll("img") : [];

    for (const node of imgs) {
      const img = /** @type {HTMLImageElement} */ (node);
      const alt = (img.getAttribute("alt") || "").toLowerCase();
      const looksLikeDivision =
        alt.includes("division") ||
        RANK_KEY_PATTERN.test(img.getAttribute("src") || "") ||
        RANK_KEY_PATTERN.test(img.getAttribute("srcset") || "") ||
        RANK_KEY_PATTERN.test(decodeSafe(img.getAttribute("src") || "")) ||
        RANK_KEY_PATTERN.test(decodeSafe(img.getAttribute("srcset") || ""));

      if (!looksLikeDivision && !img.getAttribute(ATTR)) continue;
      replaceImg(img);
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
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLImageElement
      ) {
        replaceImg(mutation.target);
        continue;
      }
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) {
            replaceImg(node);
          } else {
            scan(node);
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "srcset", "data-src", "data-srcset"],
  });
})();
