/** Remote CS2 status icons (SteamTracking GameTracking-CS2 dump). */
const CS2_ICON_BASE =
  "https://raw.githubusercontent.com/SteamTracking/GameTracking-CS2/0e457516ba13817a45b6c2a1d262fe7d0599bcbc/csgo/pak01_dir/resource/flash/econ/status_icons/";

/** @type {Map<string, string>} */
const iconBlobCache = new Map();

/** @type {Map<string, Promise<string>>} */
const iconInflight = new Map();

/**
 * @param {string} filename
 * @returns {string}
 */
function getRemoteIconUrl(filename) {
  return CS2_ICON_BASE + filename;
}

/**
 * Fetch a remote icon and return a blob: URL (avoids page CSP blocking hotlinked images).
 * Falls back to the raw HTTPS URL if fetch fails.
 * @param {string} filename
 * @returns {Promise<string>}
 */
function resolveIconUrl(filename) {
  const cached = iconBlobCache.get(filename);
  if (cached) return Promise.resolve(cached);

  const inflight = iconInflight.get(filename);
  if (inflight) return inflight;

  const remote = getRemoteIconUrl(filename);
  const promise = fetch(remote)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      iconBlobCache.set(filename, url);
      iconInflight.delete(filename);
      return url;
    })
    .catch(() => {
      iconInflight.delete(filename);
      return remote;
    });

  iconInflight.set(filename, promise);
  return promise;
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isResolvedIconSrc(url) {
  return (
    url.startsWith("blob:") ||
    url.includes("raw.githubusercontent.com/SteamTracking/GameTracking-CS2/")
  );
}
