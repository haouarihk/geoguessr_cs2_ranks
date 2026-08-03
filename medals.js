/** GeoGuessr collected medal → CS2 Premier medal icon. */
const COLLECTED_MEDAL_MAP = {
  bronze: "icons/premier_grey.png",
  silver: "icons/premier_lightblue.png",
  gold: "icons/premier_blue.png",
  platinum: "icons/premier_pink.png",
};

/**
 * @param {HTMLImageElement} img
 * @returns {string | null}
 */
function detectCollectedMedalType(img) {
  const src = [
    img.getAttribute("src") || "",
    img.getAttribute("srcset") || "",
    img.getAttribute("data-src") || "",
  ].join(" ");

  const decoded = (() => {
    try {
      return decodeURIComponent(src);
    } catch {
      return src;
    }
  })();

  const fromSrc = decoded.match(/medal[-_]?(bronze|silver|gold|platinum)/i);
  if (fromSrc) return fromSrc[1].toLowerCase();

  const label = img.parentElement?.querySelector('[class*="medalLabel"]');
  if (label) {
    const text = (label.textContent || "").toLowerCase();
    for (const key of Object.keys(COLLECTED_MEDAL_MAP)) {
      if (new RegExp(`\\b${key}\\b`).test(text)) return key;
    }
  }

  const alt = (img.getAttribute("alt") || "").toLowerCase().trim();
  if (COLLECTED_MEDAL_MAP[alt]) return alt;

  return null;
}

/**
 * @param {HTMLImageElement} img
 * @returns {boolean}
 */
function isCollectedMedalImage(img) {
  if (img.closest('[class*="medal-count"], [class*="medalCount"], fieldset')) {
    const type = detectCollectedMedalType(img);
    if (type) return true;
  }
  return /medal[-_]?(bronze|silver|gold|platinum)/i.test(
    `${img.getAttribute("src") || ""} ${img.getAttribute("srcset") || ""}`
  );
}
