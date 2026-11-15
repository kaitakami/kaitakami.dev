import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { localePath, locales } from "../i18n";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const pages = [
    { loc: "/", lastmod: "2026-11-14" },
    { loc: "/blog", lastmod: "2026-11-14" },
    { loc: "/notes", lastmod: new Date().toISOString().slice(0, 10) },
    ...posts.map((post) => ({
      loc: `/blog/${post.id}`,
      lastmod: post.data.date.toISOString().slice(0, 10),
    })),
  ];
  const urls = locales.flatMap((l) =>
    pages.map((p) => ({ ...p, loc: new URL(localePath(l, p.loc), "https://www.kaitakami.dev").href })),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.loc}</loc><lastmod>${url.lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
