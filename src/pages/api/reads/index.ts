import type { APIRoute } from "astro";
import { READS, redis } from "../../../lib/redis";

export const prerender = false;

export const GET: APIRoute = async () => {
  const r = redis();
  if (!r) return new Response(null, { status: 503 });
  const all = (await r.hgetall<Record<string, number>>(READS)) ?? {};
  const counts = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, Number(v)]));
  return Response.json(counts, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } });
};
