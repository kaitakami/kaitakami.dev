import { getCollection, type CollectionEntry } from "astro:content";
import { defaultLocale, type Locale } from "../i18n";

export type Update = {
  id: string;
  date: Date;
  where?: string;
  lang: Locale;
  entry: CollectionEntry<"updates">;
};

export async function updatesFor(locale: Locale): Promise<Update[]> {
  const all = await getCollection("updates");
  const byId = new Map(all.map((e) => [e.id, e]));
  return all
    .filter((e) => !e.id.includes("/"))
    .map((e) => {
      if (!e.data.date) throw new Error(`update ${e.id} needs a date`);
      const t = locale === defaultLocale ? undefined : byId.get(`${locale}/${e.id}`);
      return {
        id: e.id,
        date: e.data.date,
        where: t?.data.where ?? e.data.where,
        lang: t ? locale : defaultLocale,
        entry: t ?? e,
      };
    })
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export const shortDate = (d: Date, intl: string) =>
  d.toLocaleDateString(intl, { dateStyle: "medium", timeZone: "UTC" });
