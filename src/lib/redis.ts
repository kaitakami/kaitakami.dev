import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  KV_REST_API_TOKEN,
  KV_REST_API_URL,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from "astro:env/server";

let client: Redis | null = null;

/**
 * Upstash Redis over REST. Vercel's Upstash integration sets either the KV_* or the UPSTASH_* pair.
 * null when neither is configured: read counts stay hidden and sign-ups answer 503.
 */
export function redis() {
  const url = UPSTASH_REDIS_REST_URL ?? KV_REST_API_URL;
  const token = UPSTASH_REDIS_REST_TOKEN ?? KV_REST_API_TOKEN;
  if (!url || !token) return null;
  client ??= new Redis({ url, token });
  return client;
}

// keys
export const READS = "reads"; // hash: slug → reads
export const SUBSCRIBERS = "subscribers"; // hash: email → {"at": iso, "lang": "en"}

let signups: Ratelimit | null = null;

/** Five sign-ups an hour per IP: plenty for people, dull for scripts. null without Redis. */
export function signupLimit() {
  const r = redis();
  if (!r) return null;
  signups ??= new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:subscribe" });
  return signups;
}
