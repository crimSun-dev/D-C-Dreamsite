/**
 * Dreamsite -> F.L.A.X.E.O.N memory bridge.
 *
 * F.L.A.X.E.O.N's memory mirrors the Dreamsite exactly, at the moment of each
 * request: the write to F.L.A.X.E.O.N's Neon `memory_facts` table (category
 * `wishes`) finishes before the Dreamsite answers.
 *
 *   wish added      -> memory created
 *   wish edited     -> memory rewritten (details, priority, completed ...)
 *   renamed / moved -> old memory deleted, new one created
 *   wish removed    -> memory deleted
 *
 * Wishes are grouped by owner, with the labels the site already uses:
 *   draven   -> wishes/dravens_wish_<title>    "Draven's Wish: ..."
 *   clairine -> wishes/clairines_wish_<title>  "Clairine's Wish: ..."
 *   ours     -> wishes/our_dream_<title>       "Our Dreams (Draven & Clairine): ..."
 *
 * SPARK SOL links two stars when one star's text contains another fact's value
 * word for word. So every wish names its group hub ("Draven's Wish" /
 * "Clairine's Wish" / "Our Dreams") and its people ("Draven" is identity/name,
 * "Clairine" is relationships/clairine). Those anchors are inserted only when
 * missing, never overwritten.
 *
 * Deletes also write a tombstone into the `forgotten_facts` document. F.L.A.X.E.O.N
 * pushes facts that only its local cache still holds back up to Neon; its
 * memory_manager reads this document and drops those facts instead. Re-adding
 * a wish clears its tombstone. Each change is one SQL statement, so the fact
 * and its tombstone can never disagree.
 *
 * Config: FLAXEON_NEON_URL = F.L.A.X.E.O.N's Neon connection string (an env
 * var / secret, never committed). Unset -> the bridge does nothing.
 * FLAXEON_SYNC=off disables it. Uses Neon's HTTPS SQL endpoint via fetch, so
 * no extra driver. Failures are logged and never fail a Dreamsite request.
 */

const CATEGORY = "wishes";
const TOMBSTONES = "forgotten_facts";
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

const INSERT_IF_MISSING =
  "INSERT INTO memory_facts (category, key, value, updated_at) VALUES ($1, $2, $3, now()) " +
  "ON CONFLICT (category, key) DO NOTHING";

// Save a wish and clear any tombstone for it ($1 category, $2 key, $3 value).
const SAVE =
  `WITH revive AS (
     UPDATE memory_documents SET payload = payload - ($1 || '/' || $2), updated_at = now()
     WHERE name = '${TOMBSTONES}' AND payload ? ($1 || '/' || $2))
   INSERT INTO memory_facts (category, key, value, updated_at) VALUES ($1, $2, $3, now())
   ON CONFLICT (category, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
   WHERE memory_facts.value IS DISTINCT FROM EXCLUDED.value`;

// Delete a wish's memory and record the delete ($1 category, $2 key).
const DELETE =
  `WITH tomb AS (
     INSERT INTO memory_documents (name, payload, updated_at)
     VALUES ('${TOMBSTONES}', jsonb_build_object($1 || '/' || $2, now()), now())
     ON CONFLICT (name) DO UPDATE
       SET payload = memory_documents.payload || EXCLUDED.payload, updated_at = now())
   DELETE FROM memory_facts WHERE category = $1 AND key = $2`;

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

export function describe(wish) {
  const o = ownerOf(wish);
  const head = o === OWNERS.ours ? `${o.label} (${o.people})` : o.label;
  const parts = [`${head}: ${wish.title}`];
  if (wish.description) parts.push(`Details: ${wish.description}`);
  parts.push(`Wished for by: ${o.people}`);
  parts.push(`Category: ${wish.category || "products"}`);
  parts.push(`Priority: ${wish.priority || "medium"}`);
  parts.push("Listed on the Dreamsite");
  parts.push(`Status: ${wish.isCompleted ? "completed (wish came true)" : "still wished for"}`);
  if (wish.imageUrl) parts.push(`Image: ${wish.imageUrl}`);
  return parts.join(". ").replace(/\.\./g, ".");
}

/** ops: [["save", key, value] | ["delete", key]] in order. */
async function apply(ops) {
  const url = dsn();
  if (!url || !ops.length) return false;
  try {
    if (!anchorsDone) {
      for (const [cat, key, value] of ANCHORS) await runSql(url, INSERT_IF_MISSING, [cat, key, value]);
      anchorsDone = true;
    }
    for (const [op, key, value] of ops) {
      if (op === "save") await runSql(url, SAVE, [CATEGORY, key, value]);
      else await runSql(url, DELETE, [CATEGORY, key]);
      log(`${op === "save" ? "saved" : "deleted"} ${CATEGORY}/${key}`);
    }
    return true;
  } catch (e) {
    log(`sync failed: ${e.message}`);
    return false;
  }
}

/**
 * A wish was created or changed. Pass `previous` on updates: when the title or
 * owner changed, the old memory is deleted and the new one created.
 */
export function syncWish(wish, previous) {
  if (!wish) return Promise.resolve(false);
  const ops = [];
  if (previous && memoryKey(previous) !== memoryKey(wish)) ops.push(["delete", memoryKey(previous)]);
  ops.push(["save", memoryKey(wish), describe(wish)]);
  return apply(ops);
}

/** Wishes were deleted from the Dreamsite: their memories go too. */
export function removeWishes(list) {
  return apply((list || []).filter(Boolean).map((w) => ["delete", memoryKey(w)]));
}

/** Every wish currently listed (a one-off backfill). */
export function syncAll(list) {
  return apply((list || []).filter(Boolean).map((w) => ["save", memoryKey(w), describe(w)]));
}
