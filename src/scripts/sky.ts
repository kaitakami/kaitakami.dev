// What the sky over the scene looks like right now: where the sun or moon sits, how much daylight,
// how warm the low light is, and the weather. Time is the visitor's clock; sunrise, sunset and
// weather come from /api/sky (their rough location, or Awaji when that's unknown).

export type Weather = "clear" | "partly" | "overcast" | "fog" | "drizzle" | "rain" | "snow" | "storm";
export const WEATHERS: Weather[] = ["clear", "partly", "overcast", "fog", "drizzle", "rain", "snow", "storm"];

export interface Sky {
  sun: [number, number];
  day: number;
  warm: number;
  moon: number;
  cloud: number;
  rain: number;
  snow: number;
  murk: number;
  storm: number;
}

export interface Conditions {
  weather: Weather;
  cloudCover?: number; // 0..100
  sunrise: number; // minutes after local midnight
  sunset: number;
}

const FALLBACK: Conditions = { weather: "clear", sunrise: 6 * 60 + 30, sunset: 17 * 60 + 30 };

/** WMO weather interpretation codes, as Open-Meteo reports them. */
export function fromWMO(code: number): Weather {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code === 45 || code === 48) return "fog";
  if (code === 3) return "overcast";
  if (code === 2) return "partly";
  return "clear";
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function skyAt(minutes: number, c: Conditions): Sky {
  const { sunrise: sr, sunset: ss } = c;
  let sun: [number, number];
  let elev: number; // roughly sin(sun altitude), negative below the horizon
  let moon = 0;

  if (minutes >= sr && minutes <= ss) {
    const t = (minutes - sr) / (ss - sr);
    elev = Math.sin(Math.PI * t);
    // rises over the island on the right, sets beyond the bridge on the left
    sun = [mix(0.55, -0.32, t), -0.03 + 0.42 * elev];
  } else {
    const after = minutes > ss ? minutes - ss : minutes + 1440 - ss;
    const before = minutes < sr ? sr - minutes : sr + 1440 - minutes;
    elev = -Math.min(after, before) / 120;
    const nightLen = 1440 - (ss - sr);
    const nt = after / nightLen;
    if (elev > -0.18) {
      // twilight: the sun just under the horizon, on the side it went down (or will come up)
      sun = after < before ? [-0.32, -0.03 + 0.42 * elev] : [0.55, -0.03 + 0.42 * elev];
    } else {
      moon = 1;
      sun = [mix(0.5, -0.3, nt), 0.08 + 0.3 * Math.sin(Math.PI * nt)];
    }
  }

  const day = smooth(-0.25, 0.35, elev);
  const warm = Math.exp(-(((elev - 0.04) / 0.22) ** 2));

  const w = c.weather;
  const cover = c.cloudCover !== undefined ? c.cloudCover / 100 : undefined;
  const cloud = {
    clear: Math.min(0.15, cover ?? 0),
    partly: cover !== undefined ? mix(0.25, 0.55, cover) : 0.4,
    overcast: 0.85,
    fog: 0.55,
    drizzle: 0.8,
    rain: 0.9,
    snow: 0.8,
    storm: 1,
  }[w];

  return {
    sun,
    day,
    warm: warm * (1 - 0.6 * cloud),
    moon,
    cloud,
    rain: w === "storm" ? 1 : w === "rain" ? 0.7 : w === "drizzle" ? 0.35 : 0,
    snow: w === "snow" ? 0.8 : 0,
    murk: w === "fog" ? 0.85 : w === "drizzle" ? 0.2 : 0,
    storm: w === "storm" ? 1 : 0,
  };
}

const hhmm = (iso: string) => {
  const m = /T(\d\d):(\d\d)/.exec(iso);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

const KEY = "lake:sky";

/** Conditions from the API, cached for the session; falls back to a clear day at Awaji. */
export async function loadConditions(): Promise<Conditions> {
  const asked = new URLSearchParams(location.search).get("weather") as Weather | null;
  let base = FALLBACK;
  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (cached && Date.now() - cached.at < 15 * 60_000) base = cached.c;
    else {
      const r = await fetch("/api/sky");
      if (r.ok) {
        const d = await r.json();
        const sunrise = hhmm(d.sunrise), sunset = hhmm(d.sunset);
        base = {
          weather: fromWMO(d.code),
          cloudCover: d.cloud,
          sunrise: Number.isFinite(sunrise) ? sunrise : FALLBACK.sunrise,
          sunset: Number.isFinite(sunset) ? sunset : FALLBACK.sunset,
        };
        sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), c: base }));
      }
    }
  } catch {}
  return asked && WEATHERS.includes(asked) ? { ...base, weather: asked, cloudCover: undefined } : base;
}

/** Minutes after local midnight; ?hour=19.5 pins it. */
export function nowMinutes() {
  const h = Number(new URLSearchParams(location.search).get("hour"));
  if (new URLSearchParams(location.search).has("hour") && Number.isFinite(h)) return ((h % 24) + 24) % 24 * 60;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}
