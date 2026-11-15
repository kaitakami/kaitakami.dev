import type { APIRoute } from "astro";
import { defaultLocale, locales } from "../../i18n";
import { postOgImage } from "../../lib/og";
import { postsFor } from "../../lib/posts";

// /og/<slug>.png for English, /og/<lang>/<slug>.png for the rest, with the title in that language
export async function getStaticPaths() {
  const paths = [];
  for (const l of locales)
    for (const post of await postsFor(l))
      paths.push({
        params: { path: l === defaultLocale ? post.id : `${l}/${post.id}` },
        props: { seed: post.id, title: post.title, lang: post.lang },
      });
  return paths;
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await postOgImage(props.seed, props.title, props.lang)), {
    headers: { "Content-Type": "image/png" },
  });
