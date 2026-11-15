import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { updatesFor } from "../lib/updates";

const plain = (md: string) =>
  md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export async function GET(context: APIContext) {
  const notes = await updatesFor("en");
  return rss({
    title: "Kai Takami · Notes",
    description: "Short notes from Kai Takami: where I am, what I am up to.",
    site: context.site!,
    trailingSlash: false,
    items: notes.map((n) => {
      const text = plain(n.entry.body ?? "");
      return {
        title: text.length > 80 ? `${text.slice(0, 79)}…` : text,
        description: text,
        pubDate: n.date,
        link: `/notes#${n.id}`,
      };
    }),
  });
}
