import type { APIRoute } from "astro";

export const prerender = false;

// Awaji, for when the visitor's location isn't known (local dev, or no geo headers)
const AWAJI = [34.35, 134.88];

/** Current weather, sunrise and sunset near the visitor, from Vercel's IP geolocation and Open-Meteo. */
export const GET: APIRoute = async ({ request }) => {
  const h = request.headers;
  const lat = Number(h.get("x-vercel-ip-latitude"));
  const lon = Number(h.get("x-vercel-ip-longitude"));
  const known = h.has("x-vercel-ip-latitude") && Number.isFinite(lat) && Number.isFinite(lon);
  // a tenth of a degree (~10 km) is plenty for weather and keeps the location vague
  const [la, lo] = known ? [Math.round(lat * 10) / 10, Math.round(lon * 10) / 10] : AWAJI;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}` +
    `&current=weather_code,cloud_cover&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    return Response.json(
      { code: d.current.weather_code, cloud: d.current.cloud_cover, sunrise: d.daily.sunrise[0], sunset: d.daily.sunset[0] },
      { headers: { "Cache-Control": "private, max-age=900" } },
    );
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
};
