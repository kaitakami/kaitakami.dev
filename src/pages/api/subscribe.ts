import type { APIRoute } from "astro";
import { isLocale } from "../../i18n";
import { SUBSCRIBERS, redis, signupLimit } from "../../lib/redis";

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Email sign-up. Takes a form post (works without JS: answers with a redirect back)
 * or fetch with Accept: application/json.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const wantsJson = request.headers.get("accept")?.includes("application/json");
  const back = (state: string) => {
    const to = new URL(request.headers.get("referer") ?? "/", request.url);
    to.searchParams.set("subscribe", state);
    to.hash = "subscribe";
    return Response.redirect(to.toString(), 303);
  };
  const reply = (state: "ok" | "invalid" | "error", status: number) =>
    wantsJson ? Response.json({ state }, { status, headers: { "Cache-Control": "no-store" } }) : back(state);

  const form = await request.formData().catch(() => null);
  if (!form) return reply("invalid", 400);
  if (String(form.get("website") ?? "")) return reply("ok", 200); // honeypot: bots fill every field

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return reply("invalid", 400);
  const lang = String(form.get("lang") ?? "en");

  const r = redis();
  if (!r) return reply("error", 503);

  try {
    const { success } = await signupLimit()!.limit(clientAddress);
    if (!success) return reply("error", 429);

    await r.hsetnx(SUBSCRIBERS, email, JSON.stringify({ at: new Date().toISOString(), lang: isLocale(lang) ? lang : "en" }));
    return reply("ok", 200);
  } catch {
    return reply("error", 503);
  }
};
