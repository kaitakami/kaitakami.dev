import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { defaultLocale, type Locale } from "../i18n";

export type Post = CollectionEntry<"blog">;

/** A post as shown in one language: translated text when it exists, the original otherwise. */
export type LocalPost = {
  id: string;
  title: string;
  description: string;
  date: Date;
  minutes: number;
  lang: Locale;
  entry: Post | CollectionEntry<"translations">;
};

export async function sortedPosts() {
  return (await getCollection("blog")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function postsFor(locale: Locale): Promise<LocalPost[]> {
  return Promise.all(
    (await sortedPosts()).map(async (post) => {
      const t = locale === defaultLocale ? undefined : await getEntry("translations", `${locale}/${post.id}`);
      const entry = t ?? post;
      return {
        id: post.id,
        title: entry.data.title,
        description: entry.data.description,
        date: post.data.date,
        minutes: readingMinutes(post),
        lang: t ? locale : defaultLocale,
        entry,
      };
    }),
  );
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// measured on the English original so every translation shows the same length
export const readingMinutes = (post: Post) =>
  Math.max(1, Math.round((post.body ?? "").split(/\s+/).filter(Boolean).length / 230));
