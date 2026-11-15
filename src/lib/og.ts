// Share images for posts, rendered at build time: the post's dithered cover, full bleed, with its title on top.
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import { COVER_COLS, COVER_ROWS, coverGrid } from "../scripts/cover";

export const OG_W = 1200;
export const OG_H = 630;
const PAPER = [11, 11, 14];

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

/** The cover at share-image size: whole dots with a one-pixel gap, cropped to fill. */
async function coverPng(seed: string) {
  const { inks, grid } = coverGrid(seed);
  const rgb = inks.map(([h, s, l]) => hslToRgb(h, s, l));
  const cell = Math.ceil(Math.max(OG_W / COVER_COLS, OG_H / COVER_ROWS));
  const W = COVER_COLS * cell, H = COVER_ROWS * cell;
  const ox = Math.floor((W - OG_W) / 2), oy = Math.floor((H - OG_H) / 2);
  const buf = Buffer.alloc(OG_W * OG_H * 3);
  for (let y = 0; y < OG_H; y++)
    for (let x = 0; x < OG_W; x++) {
      const gx = x + ox, gy = y + oy;
      const gap = gx % cell === cell - 1 || gy % cell === cell - 1;
      const c = gap ? PAPER : rgb[grid[Math.floor(gy / cell) * COVER_COLS + Math.floor(gx / cell)]];
      buf.set(c, (y * OG_W + x) * 3);
    }
  return sharp(buf, { raw: { width: OG_W, height: OG_H, channels: 3 } }).png().toBuffer();
}

/** A Google Fonts subset holding just the characters we draw. */
async function font(family: string, weight: number, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`,
  ).then((r) => r.text());
  const url = /src: url\((.+?)\) format/.exec(css)?.[1];
  if (!url) throw new Error(`no font for ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

const CJK: Record<string, string> = { ja: "Noto Sans JP", ko: "Noto Sans KR" };

export async function postOgImage(seed: string, title: string, lang: string) {
  const bg = `data:image/png;base64,${(await coverPng(seed)).toString("base64")}`;
  const byline = "Kai Takami · kaitakami.dev";
  try {
    const sans = CJK[lang] ?? "Inter";
    const fonts = [
      { name: "Title", data: await font(sans, 600, title), weight: 600 as const, style: "normal" as const },
      { name: "Mono", data: await font("Geist Mono", 400, byline), weight: 400 as const, style: "normal" as const },
    ];
    const svg = await satori(
      {
        type: "div",
        props: {
          style: { width: OG_W, height: OG_H, display: "flex", position: "relative", backgroundColor: "#0b0b0e" },
          children: [
            { type: "img", props: { src: bg, width: OG_W, height: OG_H, style: { position: "absolute", top: 0, left: 0 } } },
            {
              type: "div",
              props: {
                style: {
                  position: "absolute", left: 0, right: 0, bottom: 0, height: 380,
                  backgroundImage: "linear-gradient(to bottom, rgba(11,11,14,0), rgba(11,11,14,0.88))",
                },
              },
            },
            {
              type: "div",
              props: {
                style: { position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column" },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { fontFamily: "Title", fontSize: 68, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#fff" },
                      children: title,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { marginTop: 18, fontFamily: "Mono", fontSize: 24, color: "rgba(255,255,255,0.75)" },
                      children: byline,
                    },
                  },
                ],
              },
            },
          ],
        },
      } as any,
      { width: OG_W, height: OG_H, fonts },
    );
    return new Resvg(svg, { fitTo: { mode: "width", value: OG_W } }).render().asPng();
  } catch (e) {
    // no network for fonts: the cover alone still beats a generic image
    console.warn(`og: ${seed} (${lang}) without text:`, (e as Error).message);
    return coverPng(seed);
  }
}
