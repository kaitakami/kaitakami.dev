// pnpm new "My title" → src/content/blog/my-title.md, dated today, ready to write
import { existsSync, writeFileSync } from "node:fs";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('usage: pnpm new "Post title"');
  process.exit(1);
}

const slug = title
  .normalize("NFKD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const file = `src/content/blog/${slug}.md`;
if (existsSync(file)) {
  console.error(`${file} already exists`);
  process.exit(1);
}

const today = new Date().toLocaleDateString("sv-SE"); // local YYYY-MM-DD
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${today}
---

Start here.
`,
);
console.log(`${file}\n/blog/${slug}`);
