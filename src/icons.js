/** Local CS2 status icons shipped in assets/ (skill groups + service medals). */

/**
 * @param {string} filename
 * @returns {string}
 */
function resolveIconUrl(filename) {
  return chrome.runtime.getURL(`assets/${filename}`);
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isResolvedIconSrc(url) {
  if (!url) return false;
  try {
    return url.startsWith(chrome.runtime.getURL("assets/"));
  } catch {
    return false;
  }
}
