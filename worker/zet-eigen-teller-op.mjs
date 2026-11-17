/* Eén script dat de gratis eigen teller helemaal klaarzet.
   Gebruik:  node worker/zet-eigen-teller-op.mjs
   Het vraagt alleen om inloggen bij Cloudflare. Verder gaat het vanzelf. */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const tomlPath = path.join(dir, "wrangler.toml");
const configPath = path.join(root, "site-config.json");
const DB_NAME = "easycodey-counter";

function run(args, { capture = false, allowFail = false } = {}) {
  const result = spawnSync("npx", args, {
    cwd: dir,
    shell: true,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8"
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (capture && output.trim()) process.stdout.write(output);
  if (result.status !== 0 && !allowFail) {
    console.error(`\nDeze stap lukte niet: npx ${args.join(" ")}`);
    console.error("Kijk hierboven wat er fout ging en probeer het opnieuw.");
    process.exit(1);
  }
  return output;
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 18) {
  console.error("Dit script heeft Node 18 of nieuwer nodig.");
  process.exit(1);
}

console.log("============================================================");
console.log(" EasyCodey — gratis eigen teller klaarzetten");
console.log("============================================================\n");
console.log("Duurt ongeveer 5 minuten. Je hebt een gratis Cloudflare-account nodig.");
console.log("Er komen geen namen, e-mails of wachtwoorden in de database.\n");

// 1. Inloggen (opent een browservenster; de gebruiker klikt op Allow).
console.log("Stap 1/5: log in bij Cloudflare (er opent een venster)...\n");
run(["wrangler", "login"], { allowFail: true });

// 2. Database maken. Bij een bestaande database vragen we het nummer op.
console.log("\nStap 2/5: maak de database...\n");
const createOutput = run(
  ["wrangler", "d1", "create", DB_NAME],
  { capture: true, allowFail: true }
);
let idMatch =
  createOutput.match(/database_id"\s*:\s*"([^"]+)"/i) ||
  createOutput.match(/database_id\s*=\s*"([^"]+)"/i) ||
  createOutput.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);

const rl = createInterface({ input: stdin, output: stdout });
let dbId = idMatch?.[1] || "";
if (!dbId) {
  console.log("\nIk kon het database-nummer niet automatisch lezen.");
  dbId = (await rl.question("Plak hier het database_id-nummer: ")).trim();
}
if (!dbId) {
  rl.close();
  console.error("Geen database-nummer gekregen. Gestopt.");
  process.exit(1);
}

// 3. Nummer in wrangler.toml zetten.
let toml = readFileSync(tomlPath, "utf8");
toml = toml.replace(/database_id\s*=\s*"[^"]*"/, `database_id = "${dbId}"`);
writeFileSync(tomlPath, toml);
console.log(`\nDatabase-nummer opgeslagen: ${dbId}`);

// 4. Tabellen maken.
console.log("\nStap 3/5: maak de tabellen...\n");
run(["wrangler", "d1", "execute", DB_NAME, "--remote", "--file=schema.sql"]);

// 5. De teller publiceren.
console.log("\nStap 4/5: zet de teller live...\n");
const deployOutput = run(["wrangler", "deploy"], { capture: true });
const urlMatch = deployOutput.match(/https:\/\/[^\s"'()]+\.workers\.dev/);
rl.close();

if (!urlMatch) {
  console.log("\nDe teller staat live, maar ik kon het adres niet automatisch lezen.");
  console.log("Kijk hierboven naar het adres dat eindigt op .workers.dev en zet dat");
  console.log("in site-config.json bij \"counterApi\".");
  process.exit(0);
}

const url = urlMatch[0].replace(/\/+$/, "");

// 6. Adres automatisch in site-config.json zetten.
const config = JSON.parse(readFileSync(configPath, "utf8"));
config.counterApi = url;
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

console.log("\nStap 5/5: controleer of de teller antwoordt...\n");
try {
  const response = await fetch(`${url}/health`);
  const body = await response.text();
  console.log(`Antwoord: ${body.slice(0, 200)}`);
} catch (error) {
  console.log("Geen antwoord gekregen; dat komt vaak door een paar seconden vertraging.");
}

console.log("\n============================================================");
console.log(" KLAAR");
console.log("============================================================");
console.log(`Telleradres: ${url}`);
console.log("Dit adres staat nu in site-config.json bij \"counterApi\".");
console.log("\nLaat nog wel de website publiceren. Vraag gerust: \"publiceer de site\".");
