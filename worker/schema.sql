-- EasyCodey teller — database-schema voor Cloudflare D1.
-- Voer dit één keer uit:
--   npx wrangler d1 execute easycodey-counter --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alleen een onleesbare hash van een willekeurig toestelnummer.
-- Geen namen, geen e-mail, geen IP-adres.
CREATE TABLE IF NOT EXISTS devices (
  counter_key TEXT NOT NULL,
  device_hash TEXT NOT NULL,
  first_seen TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (counter_key, device_hash)
);

CREATE INDEX IF NOT EXISTS idx_devices_key ON devices (counter_key);
