// @ts-check
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://www.kaitakami.dev",
  adapter: vercel(),
  env: {
    schema: {
      // Upstash Redis for read counts and email sign-ups. Vercel's Upstash integration sets one of
      // these pairs. Optional: without them the counter stays hidden and sign-ups answer 503.
      UPSTASH_REDIS_REST_URL: envField.string({ context: "server", access: "secret", optional: true }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      KV_REST_API_URL: envField.string({ context: "server", access: "secret", optional: true }),
      KV_REST_API_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
