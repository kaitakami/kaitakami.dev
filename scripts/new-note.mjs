// pnpm note "Landed in Tokyo" [--where "Tokyo"] → src/content/updates/<today>-landed-in-tokyo.md
import { existsSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const w = args.indexOf("--where");
const where = w >= 0 ? args.splice(w, 2)[1] : undefined;
const text = args.join(" ").trim();
if (!text) {
  console.error('usage: pnpm note "What happened" [--where "City"]');
  process.exit(1);
}

const today = new Date().toLocaleDateString("sv-SE"); // local YYYY-MM-DD
const slug = text
  .normalize("NFKD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 48)
  .replace(/-$/, "") || "note";

let file = `src/content/updates/${today}-${slug}.md`;
for (let i = 2; existsSync(file); i++) file = `src/content/updates/${today}-${slug}-${i}.md`;

writeFileSync(file, `---\ndate: ${today}\n${where ? `where: ${JSON.stringify(where)}\n` : ""}---\n\n${text}\n`);
console.log(file);
