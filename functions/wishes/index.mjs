import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

pool.on("error", (error) => {
  console.error("idle pg client error", error);
});

const allowedOrigins = new Set([
  "https://crimsun-dev.github.io",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
]);

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "";
  const allow = allowedOrigins.has(origin) ? origin : "https://crimsun-dev.github.io";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "Content-Type",
    vary: "Origin",
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(request),
    },
  });
}

function mapWish(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    priority: row.priority,
    owner: row.owner,
    isCompleted: row.is_completed,
  };
}

function wishFields(data) {
  return {
    title: data.title,
    description: data.description ?? null,
    imageUrl: data.imageUrl ?? null,
    category: data.category || "products",
    priority: data.priority || "medium",
    owner: data.owner || "draven",
    isCompleted: Boolean(data.isCompleted),
  };
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (!process.env.DATABASE_URL) {
    return json(request, { error: "DATABASE_URL is not configured" }, 500);
  }

  const url = new URL(request.url);
  let path = url.pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  const marker = "/api/wishes";
  const at = path.indexOf(marker);
  if (at === -1) {
    if (path === "" || path === "/") {
      return json(request, { ok: true });
    }
    return json(request, { error: "Not found" }, 404);
  }

  const rest = path.slice(at + marker.length);
  const method = request.method.toUpperCase();

  try {
    if (method === "GET" && rest === "") {
      const { rows } = await pool.query(
        "SELECT id, title, description, image_url, category, priority, owner, is_completed FROM wishes ORDER BY title",
      );
      return json(request, rows.map(mapWish));
    }

    if (method === "POST" && rest === "") {
      const body = await request.json().catch(() => ({}));
      if (!body.title || typeof body.title !== "string") {
        return json(request, { error: "Invalid wish data" }, 400);
      }
      const wish = wishFields(body);
      const id = crypto.randomUUID();
      const { rows } = await pool.query(
        `INSERT INTO wishes (id, title, description, image_url, category, priority, owner, is_completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, title, description, image_url, category, priority, owner, is_completed`,
        [id, wish.title, wish.description, wish.imageUrl, wish.category, wish.priority, wish.owner, wish.isCompleted],
      );
      return json(request, mapWish(rows[0]), 201);
    }

    if (method === "DELETE" && rest === "/completed/all") {
      const { rowCount } = await pool.query("DELETE FROM wishes WHERE is_completed = true");
      return json(request, { deleted: rowCount ?? 0 });
    }

    const id = rest.startsWith("/") ? decodeURIComponent(rest.slice(1)) : "";
    if (!id || id.includes("/")) {
      return json(request, { error: "Not found" }, 404);
    }

    if (method === "GET") {
      const { rows } = await pool.query(
        "SELECT id, title, description, image_url, category, priority, owner, is_completed FROM wishes WHERE id = $1",
        [id],
      );
      if (!rows[0]) return json(request, { error: "Wish not found" }, 404);
      return json(request, mapWish(rows[0]));
    }

    if (method === "PATCH") {
      const body = await request.json().catch(() => ({}));
      const current = await pool.query(
        "SELECT id, title, description, image_url, category, priority, owner, is_completed FROM wishes WHERE id = $1",
        [id],
      );
      if (!current.rows[0]) return json(request, { error: "Wish not found" }, 404);
      const existing = mapWish(current.rows[0]);
      const next = { ...existing, ...body, id: existing.id };
      const { rows } = await pool.query(
        `UPDATE wishes
         SET title = $2, description = $3, image_url = $4, category = $5, priority = $6, owner = $7, is_completed = $8
         WHERE id = $1
         RETURNING id, title, description, image_url, category, priority, owner, is_completed`,
        [id, next.title, next.description ?? null, next.imageUrl ?? null, next.category, next.priority, next.owner, Boolean(next.isCompleted)],
      );
      return json(request, mapWish(rows[0]));
    }

    if (method === "DELETE") {
      const { rowCount } = await pool.query("DELETE FROM wishes WHERE id = $1", [id]);
      if (!rowCount) return json(request, { error: "Wish not found" }, 404);
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    return json(request, { error: "Method not allowed" }, 405);
  } catch (error) {
    console.error(error);
    return json(request, { error: "Failed to fetch wishes" }, 500);
  }
}
