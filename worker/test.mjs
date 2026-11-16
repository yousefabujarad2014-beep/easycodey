/* Test de Cloudflare Worker lokaal, zonder Cloudflare-account.
   We gebruiken een echte SQLite-database in het geheugen en een klein
   laagje dat dezelfde functies heeft als Cloudflare D1. Zo testen we
   dezelfde code die later live gaat. Draai met: node worker/test.mjs */

import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "./src/index.js";

const database = new DatabaseSync(":memory:");
database.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));

function statement(sql, values = []) {
  return {
    bind(...next) {
      return statement(sql, next);
    },
    async first() {
      return database.prepare(sql).get(...values) ?? null;
    },
    async all() {
      return { results: database.prepare(sql).all(...values) };
    },
    async run() {
      const info = database.prepare(sql).run(...values);
      return { success: true, meta: { changes: Number(info.changes) } };
    }
  };
}

const env = { DB: { prepare: (sql) => statement(sql) } };
const BASE = "https://counter.test";

const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok });
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
}

async function call(path, options = {}) {
  const response = await worker.fetch(new Request(`${BASE}${path}`, options), env);
  let data = null;
  try {
    data = await response.clone().json();
  } catch {
    data = null;
  }
  return { status: response.status, data, headers: response.headers };
}

function hit(key, device = "device-a") {
  return call("/hit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, device })
  });
}

// 1. De dienst antwoordt.
let r = await call("/health");
check("Health geeft ok", r.status === 200 && r.data?.ok === true, JSON.stringify(r.data));

// 2. De vier vaste tellers blijven werken.
r = await hit("bezoeken-v1");
check("Eerste bezoek telt", r.status === 200 && r.data?.value === 1 && r.data?.counted === true, JSON.stringify(r.data));
r = await hit("bezoeken-v1");
check("Tweede bezoek telt op", r.status === 200 && r.data?.value === 2, JSON.stringify(r.data));

// 3. Unieke bezoekers: één per toestel.
r = await hit("unieke-bezoekers-v1", "telefoon-1");
check("Nieuw toestel telt als unieke bezoeker", r.data?.value === 1 && r.data?.counted === true, JSON.stringify(r.data));
r = await hit("unieke-bezoekers-v1", "telefoon-1");
check("Hetzelfde toestel telt niet dubbel", r.data?.value === 1 && r.data?.counted === false, JSON.stringify(r.data));
r = await hit("unieke-bezoekers-v1", "laptop-2");
check("Ander toestel telt wel mee", r.data?.value === 2 && r.data?.counted === true, JSON.stringify(r.data));

// 4. Installaties blijven werken.
r = await hit("installaties-v1", "telefoon-1");
r = await hit("installaties-v1", "telefoon-1");
check("Installatie telt één keer per toestel", r.data?.value === 1 && r.data?.counted === false, JSON.stringify(r.data));

// 5. Dagelijkse actieve apps.
const day = "actieve-apps-2026-11-16";
r = await hit(day, "telefoon-1");
check("Actieve app van vandaag telt", r.status === 200 && r.data?.value === 1 && r.data?.counted === true, JSON.stringify(r.data));
r = await hit(day, "telefoon-1");
check("Zelfde app telt vandaag niet dubbel", r.data?.value === 1 && r.data?.counted === false, JSON.stringify(r.data));
r = await hit(day, "laptop-2");
check("Tweede app telt vandaag mee", r.data?.value === 2 && r.data?.counted === true, JSON.stringify(r.data));
r = await hit("actieve-apps-2026-11-15", "telefoon-1");
check("Gisteren is een eigen, schone teller", r.data?.value === 1 && r.data?.counted === true, JSON.stringify(r.data));

// 6. Alleen echte datums en bekende sleutels.
for (const bad of [
  "actieve-apps-2026-02-30",
  "actieve-apps-2026-13-01",
  "actieve-apps-1999-01-01",
  "actieve-apps-2026-1-1",
  "actieve-apps-2026-11-16-extra",
  "onbekende-teller",
  "bezoeken-v2"
]) {
  r = await hit(bad);
  check(`Onbekende sleutel geweigerd: ${bad}`, r.status === 400 && !!r.data?.error, `status ${r.status}`);
}

// 7. Lezen van meerdere tellers, inclusief vandaag.
r = await call(`/counts?keys=${encodeURIComponent(`bezoeken-v1,${day},onbekend,actieve-apps-2026-02-30`)}`);
check(
  "Counts leest vaste en dagelijkse tellers",
  r.status === 200 &&
    r.data?.counts?.["bezoeken-v1"] === 2 &&
    r.data?.counts?.[day] === 2 &&
    r.data?.counts?.onbekend === undefined,
  JSON.stringify(r.data)
);

// 8. Onbekende teller lezen geeft 0, geen fout.
r = await call(`/counts?keys=actieve-apps-2026-11-14`);
check("Onbekende dag leest als 0", r.status === 200 && r.data?.counts?.["actieve-apps-2026-11-14"] === 0, JSON.stringify(r.data));

// 9. Te veel sleutels in één keer wordt begrensd.
const many = Array.from({ length: 30 }, (_, index) => `actieve-apps-2026-10-${String((index % 28) + 1).padStart(2, "0")}`)
  .concat(Array.from({ length: 5 }, () => "bezoeken-v1"))
  .join(",");
r = await call(`/counts?keys=${encodeURIComponent(many)}`);
check("Hoogstens 20 tellers per leesverzoek", Object.keys(r.data?.counts || {}).length <= 20, String(Object.keys(r.data?.counts || {}).length));

// 10. CORS en methodes.
r = await call("/hit", { method: "OPTIONS" });
check("OPTIONS geeft 204 met CORS", r.status === 204 && r.headers.get("access-control-allow-origin") === "*", String(r.status));
r = await call("/hit");
check("GET op /hit wordt geweigerd", r.status === 405, String(r.status));
r = await call("/counts", { method: "POST" });
check("POST op /counts wordt geweigerd", r.status === 405, String(r.status));
r = await call("/bestaat-niet");
check("Onbekend pad geeft 404", r.status === 404, String(r.status));

// 11. Kapotte invoer crasht de dienst niet.
r = await call("/hit", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{kapot" });
check("Kapotte JSON geeft een nette fout", r.status === 400, String(r.status));

const failed = results.filter((item) => !item.ok);
console.log(`\n${results.length - failed.length}/${results.length} geslaagd`);
process.exit(failed.length ? 1 : 0);
