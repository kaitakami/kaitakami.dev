import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { READS, redis } from "../../../lib/redis";

export const prerender = false;

const known = async (slug: string) => (await getCollection("blog")).some((p) => p.id === slug);

export const GET: APIRoute = async ({ params }) => {
  const r = redis();
  if (!r) return new Response(null, { status: 503 });
  const reads = Number((await r.hget<number>(READS, params.slug!)) ?? 0);
  return Response.json({ reads }, { headers: { "Cache-Control": "no-store" } });
};

export const POST: APIRoute = async ({ params }) => {
  const r = redis();
  if (!r) return new Response(null, { status: 503 });
  if (!(await known(params.slug!))) return new Response(null, { status: 404 });
  const reads = await r.hincrby(READS, params.slug!, 1);
  return Response.json({ reads }, { headers: { "Cache-Control": "no-store" } });
};
