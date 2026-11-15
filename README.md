# kaitakami.dev

Personal site. Astro on Vercel. The home page is a WebGL dither of the Seto Inland Sea at dusk.

```
pnpm install
pnpm dev
```

## Read counts

Read counts and email sign-ups live in Upstash Redis (database `kaitakami-dev`, us-east-1). Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` locally and in the Vercel project (already done for Production, Preview and Development); the `KV_REST_API_*` pair from the Vercel Marketplace integration works too. Without them the counter stays hidden and sign-ups answer 503. Keys: `reads` (hash slug → count), `subscribers` (hash email → {at, lang}).
Without it the counter stays hidden and everything else works.

A read is counted once per browser, when someone reaches the end of an essay or stays 45 seconds.

## Feeds

- `/rss.xml`
- `/sitemap.xml`

## Writing a post

```sh
pnpm new "Post title"
```

That creates `src/content/blog/post-title.md` dated today. Fill in `description`, write in Markdown, and push. The cover, reading time, read counter, RSS and sitemap all pick it up on their own.

Translations are optional. Without one, `/es`, `/pt` and `/ja` show the English text. To add one, put `title` and `description` in the frontmatter of `src/content/translations/<es|pt|ja>/post-title.md`, followed by the translated body.

## Posting a note

```sh
pnpm note "Landed in Tokyo for the week" --where "Tokyo"
```

Notes are short Markdown files in `src/content/updates/`. The newest shows on the home page, all of them live at `/notes`, and they have their own feed at `/notes.xml`. `--where` is optional. Translations go in `src/content/updates/<es|pt|ja|ko>/<same-name>.md` (body only); without one, the English note shows.
