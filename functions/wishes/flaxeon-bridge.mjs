/**
 * Dreamsite -> F.L.A.X.E.O.N memory bridge.
 *
 * Every wish the Dreamsite saves is mirrored into F.L.A.X.E.O.N's canonical
 * memory store (its Neon table `memory_facts`, category `wishes`). That is the
 * table F.L.A.X.E.O.N's memory_manager reads on every load, so a new wish shows
 * up in its memory and on SPARK SOL's map without anything else running.
 *
 * Wishes are grouped by owner, with the labels the site already uses:
 *   draven   -> wishes/dravens_wish_<title>    "Draven's Wish: ..."
 *   clairine -> wishes/clairines_wish_<title>  "Clairine's Wish: ..."
 *   ours     -> wishes/our_dream_<title>       "Our Dreams (Draven & Clairine): ..."
 *
 * SPARK SOL links two stars when one star's text contains another fact's value
 * word for word. So every wish names its group hub ("Draven's Wish" /
 * "Clairine's Wish" / "Our Dreams") and its people ("Draven" is identity/name,
 * "Clairine" is relationships/clairine). Those anchor facts are inserted only
 * when missing, never overwritten.
 *
 * A deleted wish is marked "removed from the Dreamsite", not deleted:
 * F.L.A.X.E.O.N pushes facts that exist only in its local cache back up to
 * Neon, so a hard DELETE would come back. A newer cloud value always wins.
 *
 * Config: FLAXEON_NEON_URL = F.L.A.X.E.O.N's Neon connection string (an env
 * var / secret, never committed). Unset -> the bridge does nothing.
 * FLAXEON_SYNC=off disables it. Uses Neon's HTTPS SQL endpoint via fetch, so
 * no extra driver. Failures are logged and never fail a Dreamsite request.
 */

const CATEGORY = "wishes";
const TIMEOUT_MS = 6000;

const OWNERS = {
  draven: { label: "Draven's Wish", keyPrefix: "dravens_wish_", hubKey: "dravens_wish", people: "Draven" },
  clairine: { label: "Clairine's Wish", keyPrefix: "clairines_wish_", hubKey: "clairines_wish", people: "Clairine" },
  ours: { label: "Our Dreams", keyPrefix: "our_dream_", hubKey: "our_dreams", people: "Draven & Clairine" },
};

const ANCHORS = [
  ["wishes", OWNERS.draven.hubKey, OWNERS.draven.label],
  ["wishes", OWNERS.clairine.hubKey, OWNERS.clairine.label],
  ["wishes", OWNERS.ours.hubKey, OWNERS.ours.label],
  ["relationships", "clairine", "Clairine"],
];

const UPSERT =
  "INSERT INTO memory_facts (category, key, value, updated_at) VALUES ($1, $2, $3, now()) " +
  "ON CONFLICT (category, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now() " +
  "WHERE memory_facts.value IS DISTINCT FROM EXCLUDED.value";
const INSERT_IF_MISSING =
  "INSERT INTO memory_facts (category, key, value, updated_at) VALUES ($1, $2, $3, now()) " +
  "ON CONFLICT (category, key) DO NOTHING";

let anchorsDone = false;

function log(msg) {
  console.log(`[flaxeon-bridge] ${msg}`);
}

function dsn() {
  if (String(process.env.FLAXEON_SYNC || "").toLowerCase() === "off") return null;
  const url = (process.env.FLAXEON_NEON_URL || "").trim();
  return url || null;
}

async function runSql(url, query, params) {
  const host = new URL(url).hostname.replace(/^[^.]+\./, "api.");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://${host}/sql`, {
      method: "POST",
      headers: { "Neon-Connection-String": url, "Content-Type": "application/json" },
      body: JSON.stringify({ query, params }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Neon HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function ownerOf(wish) {
  return OWNERS[String(wish?.owner || "draven").toLowerCase()] || OWNERS.draven;
}

export function slug(title) {
  const s = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return s || "untitled";
}

export function memoryKey(wish) {
  return ownerOf(wish).keyPrefix + slug(wish.title);
}

export function describe(wish, status) {
  const o = ownerOf(wish);
  const head = o === OWNERS.ours ? `${o.label} (${o.people})` : o.label;
  const parts = [`${head}: ${wish.title}`];
  if (wish.description) parts.push(`Details: ${wish.description}`);
  parts.push(`Wished for by: ${o.people}`);
  parts.push(`Category: ${wish.category || "products"}`);
  parts.push(`Priority: ${wish.priority || "medium"}`);
  parts.push("Listed on the Dreamsite");
  parts.push(`Status: ${status || (wish.isCompleted ? "completed (wish came true)" : "still wished for")}`);
  if (wish.imageUrl) parts.push(`Image: ${wish.imageUrl}`);
  return parts.join(". ").replace(/\.\./g, ".");
}

async function write(writes) {
  const url = dsn();
  if (!url) return false;
  try {
    if (!anchorsDone) {
      for (const [cat, key, value] of ANCHORS) await runSql(url, INSERT_IF_MISSING, [cat, key, value]);
      anchorsDone = true;
    }
    for (const [key, value] of writes) {
      await runSql(url, UPSERT, [CATEGORY, key, value]);
      log(`saved ${CATEGORY}/${key}`);
    }
    return true;
  } catch (e) {
    log(`sync failed: ${e.message}`);
    return false;
  }
}

/**
 * A wish was created or changed. Pass `previous` on updates: when the title or
 * owner changed, the old star is kept and says where the wish went.
 */
export function syncWish(wish, previous) {
  if (!wish) return Promise.resolve(false);
  const writes = [];
  if (previous && memoryKey(previous) !== memoryKey(wish)) {
    writes.push([memoryKey(previous),
      `${describe(previous, `moved on the Dreamsite to ${ownerOf(wish).label}: ${wish.title}`)}`]);
  }
  writes.push([memoryKey(wish), describe(wish)]);
  return write(writes);
}

/** Wishes were deleted from the Dreamsite. */
export function removeWishes(list) {
  const day = new Date().toISOString().slice(0, 10);
  const writes = (list || []).filter(Boolean)
    .map((w) => [memoryKey(w), describe(w, `removed from the Dreamsite on ${day}`)]);
  return writes.length ? write(writes) : Promise.resolve(false);
}

/** Every wish already listed (e.g. a one-off backfill). */
export function syncAll(list) {
  return write((list || []).filter(Boolean).map((w) => [memoryKey(w), describe(w)]));
}
