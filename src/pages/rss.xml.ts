import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { sortedPosts } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = await sortedPosts();
  return rss({
    title: "Kai Takami",
    description: "Essays by Kai Takami.",
    site: context.site!,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
    })),
  });
}
