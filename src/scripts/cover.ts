// A generated picture per essay: one hue, a landscape assembled from seeded parts,
// drawn as an ordered dither of small square dots. Seeded by the slug, so each essay keeps its picture.

const COLS = 168;
const ROWS = 105;

const BAYER8 = (() => {
  const m = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20,
    62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31,
    55, 23, 61, 29, 53, 21];
  return m.map((v) => (v + 0.5) / 64);
})();

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function noise(r: () => number) {
  const p = Array.from({ length: 256 }, () => r());
  const at = (i: number, j: number) => p[(i * 57 + j * 131 + ((i * j) & 255)) & 255];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const v = (x: number, y: number) => {
    const i = Math.floor(x), j = Math.floor(y), fx = smooth(x - i), fy = smooth(y - j);
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  return (x: number, y: number, oct = 4) => {
    let s = 0, a = 0.5, f = 1;
    for (let o = 0; o < oct; o++, a *= 0.5, f *= 2.03) s += a * v(x * f + o * 7.1, y * f + o * 3.3);
    return s;
  };
}

const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

type Field = (x: number, y: number) => number; // x, y in 0..1 with y up; brightness 0..1

// A scene is a sky, a ground, and something in the sky. Each part is seeded.
function landscape(r: () => number): Field {
  const n = noise(r);
  const hy = 0.3 + r() * 0.22;
  const light = { x: 0.15 + r() * 0.7, y: hy + 0.02 + r() * 0.2, size: 0.035 + r() * 0.05 };
  const kind = pick(r, ["sea", "ridges", "ridges", "dunes", "field"]);
  const sky = pick(r, ["clear", "clouds", "stars", "plain"]);
  const body = pick(r, ["sun", "moon", "ring", "none", "none"]);
  const count = 3 + Math.floor(r() * 3);
  const layers = Array.from({ length: count }, (_, i) => ({
    base: hy + 0.08 - i * (0.05 + r() * 0.04),
    amp: 0.03 + r() * 0.07,
    f: 1.5 + r() * 4,
    ph: r() * 100,
  }));
  const cloudScale = 2 + r() * 3, cloudY = hy + 0.2 + r() * 0.2;
  const top = (l: (typeof layers)[number], x: number) => l.base + l.amp * (n(x * l.f + l.ph, l.ph, 4) - 0.35) * 2;

  const skyAt = (x: number, y: number) => {
    const h = Math.max(0, y - hy);
    const d = Math.hypot((x - light.x) * 1.5, y - light.y);
    let v = 0.06 + 0.5 * Math.exp(-h * 4.5) + 0.3 * Math.exp(-d * 6);
    if (sky === "clouds") {
      const c = n(x * cloudScale, (y - cloudY) * 7, 5) * Math.exp(-Math.pow((y - cloudY) / 0.16, 2));
      if (c > 0.4) {
        const lit = clamp((n(x * cloudScale, (y - cloudY - 0.02) * 7, 5) - c) * 12 + 0.4);
        v = 0.12 + 0.55 * lit * Math.exp(-Math.abs(x - light.x) * 1.8);
      }
    } else if (sky === "stars" && h > 0.12 && n(x * 120, y * 120, 1) > 0.9) {
      v = 0.7;
    }
    if (body === "sun" && d < light.size) v = 1;
    if (body === "moon" && d < light.size && Math.hypot((x - light.x - light.size * 0.45) * 1.5, y - light.y - light.size * 0.25) > light.size) v = 0.92;
    if (body === "ring") {
      if (d < light.size) v = 0.75 - 0.35 * ((y - light.y) / light.size);
      const rr = Math.hypot((x - light.x) * 1.5, (y - light.y) * 4);
      if (Math.abs(rr - light.size * 1.9) < 0.008 && (y < light.y || d > light.size)) v = 0.85;
    }
    return v;
  };

  return (x, y) => {
    if (kind === "sea") {
      if (y >= hy) return skyAt(x, y);
      const dd = hy - y;
      const z = 1 / (dd + 0.03);
      const wob = (n(x * 4, z * 0.5, 2) - 0.5) * 0.03;
      let v = skyAt(x + wob, hy + dd) * 0.62;
      const streak = n(x * 3 * z * 0.1, z * 1.2, 2);
      if (streak > 0.62) v += 0.12;
      if (streak < 0.3) v *= 0.6;
      if (Math.abs(x - light.x) < light.size * (0.5 + dd * 2.5) && n(x * 50, z * 2, 2) > 0.5) v = Math.max(v, 0.9 - dd * 1.2);
      return v * (1 - dd * 0.8);
    }
    if (kind === "ridges") {
      for (let i = count - 1; i >= 0; i--) {
        const t = top(layers[i], x);
        if (y < t) {
          const depth = i / (count - 1);
          const haze = skyAt(x, hy) * (1 - depth);
          return Math.max(0.05, haze * 0.9 + 0.06 + (t - y < 0.005 ? 0.1 * (1 - depth) : 0));
        }
      }
      return skyAt(x, y);
    }
    if (kind === "dunes") {
      const t = hy + 0.05 * (n(x * 2.5, 0, 3) - 0.5) * 2;
      if (y >= t) return skyAt(x, y);
      const dd = t - y;
      const crest = n(x * 4 + y * 6, dd * 14, 3);
      return (0.12 + 0.5 * Math.pow(crest, 2.2)) * (1 - dd * 0.9);
    }
    // field: furrows running to a vanishing point under the light
    if (y >= hy) return skyAt(x, y);
    const dd = hy - y;
    const rows = 0.5 + 0.5 * Math.sin(((x - light.x) / (dd + 0.04)) * 5);
    return (0.06 + 0.3 * rows * Math.min(1, dd * 5) + 0.35 * Math.exp(-dd * 18)) * (1 - dd * 0.7);
  };
}

// A contour map: iso-lines of a noise terrain, brighter on the peaks.
function contours(r: () => number): Field {
  const n = noise(r);
  const sc = 1.5 + r() * 2.5, step = 10 + Math.floor(r() * 14);
  return (x, y) => {
    const h = n(x * sc * 1.6, y * sc, 5);
    const line = Math.abs(((h * step) % 1) - 0.5) > 0.42 ? 1 : 0;
    return 0.06 + h * 0.35 + line * (0.25 + h * 0.5);
  };
}

// Light on shallow water, seen from above.
function caustics(r: () => number): Field {
  const n = noise(r);
  const sc = 4 + r() * 6;
  return (x, y) => {
    const a = n(x * sc * 1.6, y * sc, 3), b = n(x * sc * 1.6 + 9.1, y * sc + 3.7, 3);
    const v = Math.pow(1 - Math.abs(a - b) * 4, 6);
    return 0.12 + 0.2 * a + Math.max(0, v) * 0.75;
  };
}

// A stand of trunks in fog: bamboo or cedar, depending on the seed.
function grove(r: () => number): Field {
  const n = noise(r);
  const trunks = Array.from({ length: 14 + Math.floor(r() * 18) }, () => ({
    x: r(), w: 0.004 + r() * 0.02, depth: r(), joints: r() > 0.5 ? 0.06 + r() * 0.08 : 0,
  })).sort((a, b) => a.depth - b.depth);
  const lx = r();
  return (x, y) => {
    let v = 0.35 + 0.35 * Math.exp(-Math.abs(x - lx) * 3) * y + 0.1 * n(x * 3, y * 2, 3);
    for (const t of trunks) {
      if (Math.abs(x - t.x - Math.sin(y * 3 + t.x * 9) * 0.01) < t.w) {
        v = 0.06 + t.depth * 0.4;
        if (t.joints && (y % t.joints) < 0.006) v += 0.15;
      }
    }
    return v * (0.7 + 0.3 * y);
  };
}

// A spiral of stars.
function galaxy(r: () => number): Field {
  const n = noise(r);
  const cx = 0.3 + r() * 0.4, cy = 0.35 + r() * 0.3, arms = 2 + Math.floor(r() * 3), tilt = 1.4 + r() * 1.2, twist = 4 + r() * 6;
  return (x, y) => {
    const dx = (x - cx) * 1.6, dy = (y - cy) * tilt;
    const d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const arm = Math.pow(0.5 + 0.5 * Math.cos(arms * (a - Math.log(d + 0.01) * twist)), 3);
    let v = 0.04 + Math.exp(-d * 9) * 0.9 + arm * Math.exp(-d * 4) * (0.3 + 0.4 * n(x * 20, y * 20, 2));
    if (n(x * 140, y * 140, 1) > 0.9) v += 0.5;
    return v;
  };
}

// Rings from a stone in a still pond.
function ripples(r: () => number): Field {
  const drops = Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({ x: r(), y: r(), f: 50 + r() * 60, k: 2 + r() * 3 }));
  return (x, y) => {
    let v = 0.1 + 0.15 * y;
    for (const d of drops) {
      const dist = Math.hypot((x - d.x) * 1.6, y - d.y);
      v += Math.pow(0.5 + 0.5 * Math.cos(dist * d.f), 4) * Math.exp(-dist * d.k) * 0.6;
    }
    return v;
  };
}

const families = [landscape, contours, caustics, grove, galaxy, ripples];

function scene(r: () => number): Field {
  return pick(r, families)(r);
}

export const COVER_COLS = COLS;
export const COVER_ROWS = ROWS;

/** The cover as data: one hue, a 7-step ink ramp as [h, s, l], and a level per cell. Same seed, same cover. */
export function coverGrid(seed: string) {
  const r = rng(seed);
  const hue = Math.floor(r() * 360);
  const field = scene(r);

  // a tonal ramp around one hue: cool, dark shadows; warmer, lighter highlights
  const LEVELS = 7;
  const inks = Array.from({ length: LEVELS }, (_, i) => {
    const t = i / (LEVELS - 1);
    const h = hue - 20 + t * 35;                 // shadows lean cool, highlights warm
    const s = 14 + 40 * Math.sin(t * Math.PI);    // muted at both ends, like real light
    const l = 6 + Math.pow(t, 1.1) * 86;
    return [h, s, l] as const;
  });

  const grid = new Uint8Array(COLS * ROWS);
  for (let j = 0; j < ROWS; j++)
    for (let i = 0; i < COLS; i++) {
      const v = clamp(field((i + 0.5) / COLS, 1 - (j + 0.5) / ROWS));
      grid[j * COLS + i] = Math.min(LEVELS - 1, Math.floor(v * (LEVELS - 1) + BAYER8[(j % 8) * 8 + (i % 8)]));
    }
  return { hue, inks, grid };
}

export function drawCover(canvas: HTMLCanvasElement, seed: string) {
  const { hue, inks: hsl, grid } = coverGrid(seed);
  const inks = hsl.map(([h, s, l]) => `hsl(${h} ${s}% ${l}%)`);

  const paint = () => {
    const w = canvas.clientWidth;
    if (!w) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(((w * ROWS) / COLS) * dpr);
    const ctx = canvas.getContext("2d")!;
    const cw = canvas.width / COLS, ch = canvas.height / ROWS;
    const gap = cw > 3 ? 1 : 0;
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let j = 0; j < ROWS; j++)
      for (let i = 0; i < COLS; i++) {
        ctx.fillStyle = inks[grid[j * COLS + i]];
        const x0 = Math.round(i * cw), y0 = Math.round(j * ch);
        ctx.fillRect(x0, y0, Math.round((i + 1) * cw) - x0 - gap, Math.round((j + 1) * ch) - y0 - gap);
      }
  };

  paint();
  const ro = new ResizeObserver(paint);
  ro.observe(canvas);
  return { hue, stop: () => ro.disconnect() };
}

export function drawAllCovers(root: ParentNode = document) {
  for (const c of root.querySelectorAll<HTMLCanvasElement>("canvas[data-cover]")) {
    const { hue } = drawCover(c, c.dataset.cover!);
    c.closest<HTMLElement>("[data-hue-host]")?.style.setProperty("--hue", String(hue));
  }
}
