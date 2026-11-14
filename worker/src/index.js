/* EasyCodey — kleine, gratis teller op Cloudflare Workers + D1.
   Telt alleen anonieme getallen. Er komen geen namen, e-mails, IP-adressen
   of profielen in de database. Een toestel stuurt een willekeurig nummer mee;
   de server bewaart daar alleen een onleesbare hash van, zodat één toestel
   niet dubbel telt. */

const ALLOWED_KEYS = new Set([
  "bezoeken-v1",
  "unieke-bezoekers-v1",
  "installaties-v1",
  "apk-downloads-v1"
]);

const UNIQUE_KEYS = new Set(["unieke-bezoekers-v1", "installaties-v1"]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...CORS
    }
  });
}

function validKey(key) {
  return typeof key === "string" && /^[a-z0-9-]{1,64}$/.test(key);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function increment(env, key) {
  const row = await env.DB.prepare(
    `INSERT INTO counters (key, value, updated_at)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = value + 1, updated_at = datetime('now')
     RETURNING value`
  )
    .bind(key)
    .first();
  return Number(row?.value ?? 0);
}

async function readCounts(env, keys) {
  const counts = {};
  for (const key of keys) counts[key] = 0;
  if (!keys.length) return counts;

  const placeholders = keys.map(() => "?").join(",");
  const result = await env.DB.prepare(
    `SELECT key, value FROM counters WHERE key IN (${placeholders})`
  )
    .bind(...keys)
    .all();

  for (const row of result.results || []) {
    counts[row.key] = Number(row.value) || 0;
  }
  return counts;
}

async function registerDevice(env, key, device) {
  const hash = await sha256(`${key}:${device}`);
  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO devices (counter_key, device_hash, first_seen)
     VALUES (?, ?, datetime('now'))`
  )
    .bind(key, hash)
    .run();
  return (result.meta?.changes || 0) > 0;
}

async function handleHit(request, env) {
  const body = await request.json().catch(() => null);
  const key = String(body?.key || "");
  if (!validKey(key) || !ALLOWED_KEYS.has(key)) {
    return json({ error: "Onbekende teller." }, 400);
  }

  const device = String(body?.device || "").slice(0, 128);
  if (UNIQUE_KEYS.has(key) && device) {
    const isNew = await registerDevice(env, key, device);
    if (!isNew) {
      const counts = await readCounts(env, [key]);
      return json({ value: counts[key], counted: false });
    }
  }

  const value = await increment(env, key);
  return json({ value, counted: true });
}

async function handleCounts(request, env) {
  const url = new URL(request.url);
  const keys = (url.searchParams.get("keys") || "")
    .split(",")
    .map((key) => key.trim())
    .filter((key) => validKey(key) && ALLOWED_KEYS.has(key));
  const counts = await readCounts(env, [...new Set(keys)]);
  return json({ counts });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health") {
        return json({ ok: true, service: "easycodey-counter" });
      }

      if (url.pathname === "/hit") {
        if (request.method !== "POST") return json({ error: "Gebruik POST." }, 405);
        return await handleHit(request, env);
      }

      if (url.pathname === "/counts") {
        if (request.method !== "GET") return json({ error: "Gebruik GET." }, 405);
        return await handleCounts(request, env);
      }

      return json({ error: "Niet gevonden." }, 404);
    } catch (error) {
      return json({ error: "De teller is even niet beschikbaar." }, 500);
    }
  }
};
