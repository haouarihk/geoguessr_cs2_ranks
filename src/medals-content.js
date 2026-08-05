(() => {
  const ATTR = "data-cs2-medal";
  const DEBOUNCE_MS = 50;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;

  /**
   * @param {HTMLImageElement} img
   */
  function replaceMedal(img) {
    const type = detectCollectedMedalType(img);
    if (!type) return;

    const filename = COLLECTED_MEDAL_MAP[type];
    if (!filename) return;

    if (img.getAttribute(ATTR) === type && isResolvedIconSrc(img.src)) {
      return;
    }

    img.setAttribute(ATTR, type);
    img.removeAttribute("data-cs2-rank");
    img.removeAttribute("srcset");
    img.removeAttribute("data-srcset");
    img.removeAttribute("data-src");

    img.src = resolveIconUrl(filename);
  }

  /**
   * @param {ParentNode | Document} [root]
   */
  function scan(root = document) {
    const imgs = root.querySelectorAll ? root.querySelectorAll("img") : [];
    for (const node of imgs) {
      const img = /** @type {HTMLImageElement} */ (node);
      if (!isCollectedMedalImage(img) && !img.getAttribute(ATTR)) continue;
      replaceMedal(img);
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
        if (
          isCollectedMedalImage(mutation.target) ||
          mutation.target.getAttribute(ATTR)
        ) {
          replaceMedal(mutation.target);
        }
        continue;
      }
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) {
            if (isCollectedMedalImage(node)) replaceMedal(node);
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
    attributeFilter: ["src", "srcset", "data-src", "data-srcset", "alt"],
  });
})();
