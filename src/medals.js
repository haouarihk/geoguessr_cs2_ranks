/**
 * GeoGuessr collected medals → CS service medals (colored Premier-style stars).
 * Icons ship locally under assets/.
 */
const COLLECTED_MEDAL_MAP = {
  bronze: "service_medal_2018_lvl1_large.webp",
  silver: "service_medal_2018_lvl2_large.webp",
  gold: "service_medal_2018_lvl3_large.webp",
  platinum: "service_medal_2018_lvl5_large.webp",
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
    if (detectCollectedMedalType(img)) return true;
  }
  return /medal[-_]?(bronze|silver|gold|platinum)/i.test(
    `${img.getAttribute("src") || ""} ${img.getAttribute("srcset") || ""}`
  );
}
