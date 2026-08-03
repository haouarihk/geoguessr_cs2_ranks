/** GeoGuessr rank key → CS2 skillgroup filename (without path). */
const RANK_MAP = {
  bronze: "skillgroup1.png",
  silver4: "skillgroup4.png",
  silver3: "skillgroup3.png",
  silver2: "skillgroup2.png",
  silver1: "skillgroup1.png",
  gold4: "skillgroup10.png",
  gold3: "skillgroup9.png",
  gold2: "skillgroup8.png",
  gold1: "skillgroup7.png",
  master4: "skillgroup14.png",
  master3: "skillgroup13.png",
  master2: "skillgroup12.png",
  master1: "skillgroup11.png",
  champion: "skillgroup18.png",
};

/** Matches a media filename stem inside Next.js image URLs / srcsets. */
const MEDIA_STEM_PATTERN =
  /(?:media\/|media%2F|\/)((?:[a-zA-Z]+DivisionImageEmpty)|(?:(?:solo|duel|team|ranked)?(?:bronze|silver[1-4]|gold[1-4]|master[1-4]|champion)))(?=[.\-%_]|$)/gi;

/** Quick test used by the content script scanner. */
const RANK_KEY_PATTERN =
  /(?:DivisionImageEmpty|bronze|silver[1-4]|gold[1-4]|master[1-4]|champion)/i;

/**
 * @param {string} value
 * @returns {string}
 */
function decodeSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Normalize a GeoGuessr asset stem to a RANK_MAP key (mode-agnostic).
 * @param {string} stem
 * @returns {string | null}
 */
function normalizeRankKey(stem) {
  const lower = stem.toLowerCase();

  if (lower.endsWith("divisionimageempty")) {
    return "divisionimageempty";
  }

  if (RANK_MAP[lower]) {
    return lower;
  }

  // soloGold1 / duelSilver4 / teamChampion → gold1 / silver4 / champion
  const stripped = lower.replace(/^(solo|duel|team|ranked)+/, "");
  if (RANK_MAP[stripped]) {
    return stripped;
  }

  const embedded = lower.match(/(bronze|silver[1-4]|gold[1-4]|master[1-4]|champion)$/);
  if (embedded && RANK_MAP[embedded[1]]) {
    return embedded[1];
  }

  return null;
}

/**
 * Extract a mode-agnostic rank key from an image URL or srcset string.
 * @param {string} value
 * @returns {string | null}
 */
function extractRankKey(value) {
  if (!value) return null;

  const decoded = decodeSafe(value);
  MEDIA_STEM_PATTERN.lastIndex = 0;

  let match;
  while ((match = MEDIA_STEM_PATTERN.exec(decoded)) !== null) {
    const key = normalizeRankKey(match[1]);
    if (key) return key;
  }

  // Fallback: bare rank token anywhere in the string
  const bare = decoded.match(
    /(bronze|silver[1-4]|gold[1-4]|master[1-4]|champion|[a-z0-9]*divisionimageempty)/i
  );
  return bare ? normalizeRankKey(bare[1]) : null;
}

/**
 * Resolve the CS2 icon path for a GeoGuessr rank key.
 * @param {string} rankKey
 * @returns {string | null}
 */
function getCs2IconPath(rankKey) {
  if (rankKey === "divisionimageempty") {
    return "icons/skillgroup_none.png";
  }
  const file = RANK_MAP[rankKey];
  return file ? `icons/${file}` : null;
}
