import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
  }),
});

// src/content/translations/<locale>/<slug>.md, id "<locale>/<slug>"
const translations = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/translations" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

// src/content/updates/<date-slug>.md, translations in src/content/updates/<locale>/<date-slug>.md
const updates = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/updates" }),
  schema: z.object({
    date: z.coerce.date().optional(), // required on the original, inherited by translations
    where: z.string().optional(),
  }),
});

export const collections = { blog, translations, updates };
