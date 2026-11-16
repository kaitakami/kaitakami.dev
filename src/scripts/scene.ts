import { loadConditions, nowMinutes, skyAt, type Conditions, type Sky } from "./sky";

// The Seto Inland Sea from a sea wall near Awaji, at the visitor's time of day and in their weather, drawn as an ordered colour dither of square dots.
// Fog sits over the gap between the hills. It lifts the longer someone stays, and the sea shows.
// A pointer carries a small lantern; the fog thins around it.
// The canvas is rendered one pixel per dot and scaled up; CSS draws the gaps between dots.

const FRAG = /* glsl */ `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform float uReveal;
uniform vec2 uPointer;
uniform float uLamp;
uniform float uMinW;
uniform vec3 uPaper;
// sky state: where the sun (or moon) is, how much daylight, how warm the low light is, and the weather
uniform vec2 uSun;
uniform float uDay;     // 0 night .. 1 full day
uniform float uWarm;    // 0..1, the band of warm light around sunrise and sunset
uniform float uMoon;    // 1 when the body in the sky is the moon
uniform float uCloud;   // 0 clear .. 1 overcast
uniform float uRain;
uniform float uSnow;
uniform float uMurk;    // weather fog, on top of the fog that lifts
uniform float uFlash;   // lightning

float gLamp = 0.0;
float gPx = 0.001;   // one dot, in scene units
float gHalfW = 0.5;

float h11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
float bayer4(vec2 c) {
  ivec2 p = ivec2(mod(c, 4.0));
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[p.y * 4 + p.x]) + 0.5) / 16.0;
}
float seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

// Rounded tree crowns along a ridge. Returns the ridge height at x.
float crowns(float x, float w, float base, float lift, float seed) {
  float i = floor(x / w), top = -9.0;
  for (int j = -1; j <= 1; j++) {
    float c = i + float(j);
    float cx = (c + 0.5 + (h11(c + seed) - 0.5) * 0.6) * w;
    float r = w * (0.7 + 0.5 * h11(c * 1.7 + seed));
    float t = base + lift * (0.6 + 0.4 * h11(c * 3.1 + seed));
    float dx = x - cx;
    if (abs(dx) < r) top = max(top, t - r + sqrt(r * r - dx * dx));
  }
  return top;
}

const float YH = 0.0;        // horizon
const float GROUND = -0.4;   // top of the sea wall we're standing on
const float T1 = -0.5;       // bridge towers
const float T2 = -0.06;
const float TOWER = 0.165;
const float DECK = 0.03;

// The palette is set per frame from the time of day and the weather (see palette()).
// ZENITH overhead, VIOLET mid sky, ROSE low sky, EMBER at the horizon.
vec3 ZENITH, VIOLET, ROSE, EMBER, SHADE, HILL, MIST, GLOW;
vec2 SUN;
float BODY;   // how bright the sun or moon reads through the cloud

vec3 grey(vec3 c) { return vec3(dot(c, vec3(0.3, 0.5, 0.2))); }

void palette() {
  // night, midday, and the dusk this scene was first painted at
  // night has to stay above the dither's first step (1/7) or it all reads as black: moonlit blue
  vec3 nZ = vec3(0.035, 0.06, 0.13), nV = vec3(0.07, 0.11, 0.21), nR = vec3(0.11, 0.15, 0.26), nE = vec3(0.14, 0.18, 0.29);
  vec3 dZ = vec3(0.2, 0.42, 0.76), dV = vec3(0.38, 0.6, 0.88), dR = vec3(0.66, 0.79, 0.92), dE = vec3(0.86, 0.9, 0.94);
  vec3 wZ = vec3(0.035, 0.075, 0.185), wV = vec3(0.14, 0.24, 0.39), wR = vec3(0.74, 0.57, 0.47), wE = vec3(0.95, 0.8, 0.55);
  ZENITH = mix(mix(nZ, dZ, uDay), wZ, uWarm * 0.7);
  VIOLET = mix(mix(nV, dV, uDay), wV, uWarm * 0.85);
  ROSE = mix(mix(nR, dR, uDay), wR, uWarm);
  EMBER = mix(mix(nE, dE, uDay), wE, uWarm);
  SHADE = mix(mix(vec3(0.012, 0.018, 0.03), vec3(0.07, 0.09, 0.1), uDay), vec3(0.03, 0.045, 0.065), uWarm * 0.6);
  HILL = mix(mix(vec3(0.03, 0.045, 0.065), vec3(0.17, 0.25, 0.2), uDay), vec3(0.08, 0.13, 0.15), uWarm * 0.6);
  MIST = mix(mix(vec3(0.2, 0.23, 0.3), vec3(0.8, 0.82, 0.84), uDay), vec3(0.54, 0.58, 0.62), uWarm * 0.5);
  GLOW = uMoon > 0.5 ? vec3(0.55, 0.65, 0.85) * 0.5 : mix(vec3(1.0, 0.96, 0.88), vec3(0.95, 0.78, 0.5), uWarm);
  // cloud cover greys the sky out and takes the light down
  // a few clouds shouldn't grey the whole sky; at night keep some of the moonlit blue
  float g = smoothstep(0.3, 1.0, uCloud) * 0.75 * mix(0.45, 1.0, uDay);
  // overcast in daylight is a bright, flat grey, not a dim one: grey it out and even it out
  float lift = 1.0 + 0.25 * uDay;
  ZENITH = mix(ZENITH, grey(mix(ZENITH, VIOLET, 0.6)) * lift, g);
  VIOLET = mix(VIOLET, grey(mix(VIOLET, ROSE, 0.4)) * lift, g);
  ROSE = mix(ROSE, grey(ROSE) * lift, g);
  EMBER = mix(EMBER, grey(EMBER) * lift, g);
  HILL = mix(HILL, grey(HILL) * 1.1, g * 0.6);
  MIST = mix(MIST, grey(MIST), g);
  SUN = uSun;
  BODY = (1.0 - 0.9 * uCloud) * smoothstep(-0.06, 0.0, SUN.y);
}

float fogAt(vec2 p) {
  float band = exp(-pow((p.y - YH - 0.04) / 0.08, 2.0)) * smoothstep(0.2, -0.1, p.x);
  float drift = fbm(vec2(p.x * 2.4 - uTime * 0.012, p.y * 6.0 + uTime * 0.004));
  float lifting = band * (0.8 + 0.7 * drift) * (1.0 - uReveal);
  // weather fog doesn't lift: a wide low blanket over everything
  float murk = uMurk * exp(-pow((p.y - YH) / 0.16, 2.0)) * (0.65 + 0.5 * drift);
  return clamp(max(lifting, murk) * (1.0 - 0.9 * gLamp), 0.0, 1.0);
}

float cloudDensity(vec2 p) {
  float h = p.y - YH;
  float band = smoothstep(0.1 - 0.12 * uCloud, 0.22 - 0.1 * uCloud, h) * (1.0 - smoothstep(0.36 + 0.3 * uCloud, 0.5 + 0.4 * uCloud, h));
  return fbm(vec2(p.x * 1.6 + uTime * 0.003, h * 5.5 - 3.0)) * band;
}

vec3 sky(vec2 p) {
  float h = p.y - YH;
  vec3 c = mix(EMBER, ROSE, smoothstep(0.0, 0.08, h));
  c = mix(c, VIOLET, smoothstep(0.06, 0.26, h));
  c = mix(c, ZENITH, smoothstep(0.22, 0.52, h));
  vec2 s = (p - SUN) * vec2(0.7, 1.8);
  c += GLOW * exp(-length(s) * 5.0) * 0.45 * BODY;
  float r = uMoon > 0.5 ? 0.02 : 0.035;
  if (length(p - SUN) < r) c = mix(c, uMoon > 0.5 ? vec3(0.86, 0.89, 0.96) : mix(vec3(1.0, 0.99, 0.94), vec3(1.0, 0.97, 0.82), uWarm), BODY);

  float d = cloudDensity(p);
  float cut = 0.36 - 0.22 * uCloud;
  float mask = smoothstep(cut, cut + 0.08, d);
  if (mask > 0.0) {
    float lit = smoothstep(0.0, 0.07, d - cloudDensity(p - vec2(0.0, 0.025)));
    float warm = exp(-abs(p.x - SUN.x) * 1.4) * BODY;
    vec3 under = VIOLET * 0.75 + ZENITH * 0.15;
    float light = max(uDay, uWarm * 0.8);
    vec3 top = mix(ROSE, mix(vec3(0.98, 0.88, 0.68), vec3(0.95), 1.0 - uWarm), warm * 0.7) * mix(0.15, 1.0, light);
    under *= mix(0.6, 1.0, light);
    vec3 cc = mix(under, top, lit * (0.35 + 0.65 * warm));
    // under heavy cover the clouds are the sky: lit grey, not their shadowed undersides
    vec3 sheet = mix(mix(VIOLET, ROSE, 0.5), grey(mix(VIOLET, ROSE, 0.5)), uDay) * mix(1.1, 1.05, uDay);
    c = mix(c, mix(cc, sheet, smoothstep(0.4, 1.0, uCloud) * 0.85), mask);
  }
  float star = h21(floor(p * 260.0));
  float night = (1.0 - smoothstep(0.05, 0.4, uDay)) * (1.0 - uCloud);
  if (star > 0.993 && h > 0.12 && mask < 0.1)
    c += vec3(0.8, 0.85, 1.0) * night * smoothstep(0.12, 0.4, h) * (0.6 + 0.4 * sin(uTime * (0.4 + star) + star * 50.0));
  c += vec3(0.55, 0.6, 0.75) * uFlash * (0.5 + 0.5 * mask);
  return c;
}

// soft rolling ridgeline, the way Awaji's hills sit low and long on the water
float ridge(float x, float seed, float f) {
  return 0.5 * sin(x * f + seed) + 0.3 * sin(x * f * 2.3 + seed * 1.7) + 0.2 * sin(x * f * 5.1 + seed * 0.3);
}

// Akashi-style suspension bridge: two towers, main cable, deck. Returns coverage.
float bridge(vec2 p, out float light) {
  light = 0.0;
  float w = gPx * 0.7;
  float cov = 0.0;
  // deck from the mainland off-screen left to the island
  if (p.x < 0.1 && p.y < DECK + 0.003 && p.y > DECK - 0.007) cov = 1.0;   // deck and its truss
  if (p.x < 0.1 && abs(p.y - DECK + 0.002) < 0.0015) cov = max(cov, 1.0);
  // towers: two legs and cross beams
  for (int i = 0; i < 2; i++) {
    float tx = i == 0 ? T1 : T2;
    float dx = abs(p.x - tx);
    if (p.y > YH - 0.004 && p.y < TOWER && abs(dx - 0.0045) < max(0.0026, w * 0.8)) cov = 1.0;
    if (dx < 0.007 && (abs(p.y - TOWER) < 0.003 || abs(p.y - 0.115) < 0.0022 || abs(p.y - 0.07) < 0.0022)) cov = 1.0;
    if (length(p - vec2(tx, TOWER + 0.006)) < 0.0035) light = 1.0;
  }
  // main span cable: a parabola between the tower tops
  float mid = 0.5 * (T1 + T2), half_ = 0.5 * (T2 - T1);
  float cable = -9.0;
  if (p.x > T1 && p.x < T2) { float t = (p.x - mid) / half_; cable = DECK + 0.006 + (TOWER - DECK - 0.006) * t * t; }
  else if (p.x <= T1) { float t = clamp((T1 - p.x) / 0.4, 0.0, 1.0); cable = TOWER - (TOWER - DECK) * (2.0 * t - t * t); }
  else if (p.x < 0.12) { float t = clamp((p.x - T2) / 0.18, 0.0, 1.0); cable = TOWER - (TOWER - DECK) * (2.0 * t - t * t); }
  if (cable > 0.0) {
    if (abs(p.y - cable) < max(0.0018, w * 0.7)) cov = 1.0;
    // hangers, too fine to draw solid: let the dither carry them
    if (p.y > DECK && p.y < cable && fract(p.x / 0.007) < 0.25) cov = max(cov, 0.45);
  }
  return cov;
}

// Everything beyond the near water: sky, far ranges, bridge, the island.
vec3 farAwaji(vec2 p) {
  vec3 c = sky(p);
  vec3 haze = mix(EMBER, ROSE, 0.5);

  // distant mainland ranges, pale with haze
  float t1 = YH + 0.04 + 0.025 * ridge(p.x, 1.0, 4.0) * smoothstep(0.35, -0.2, p.x);
  if (p.y < t1) c = mix(haze, VIOLET, 0.35);

  // bridge, in front of the far ranges
  float lt;
  float b = bridge(p, lt);
  vec3 steel = mix(HILL * 0.85, haze, 0.12);
  c = mix(c, steel, b);
  if (lt > 0.0) c = mix(c, vec3(1.0, 0.32, 0.28), lt * (0.6 + 0.4 * sin(uTime * 2.2)));

  // the island: low, long, rolling, rising out of the sea past the bridge
  float rise = smoothstep(0.04, 0.34, p.x);
  float t2 = YH + rise * (0.09 + 0.035 * ridge(p.x, 4.0, 6.0)) + max(0.0, crowns(p.x, 0.016, 0.0, 0.006, 3.0)) * rise;
  if (p.y < t2) {
    vec3 h = mix(HILL * vec3(0.95, 1.07, 1.0), haze, 0.25);
    h += ROSE * 0.25 * smoothstep(-0.008, 0.0, p.y - t2);      // backlit ridge
    h = mix(h, HILL * 0.8, smoothstep(0.0, 0.08, t2 - p.y));
    // town lights along the shore
    float town = h21(floor(p * vec2(320.0, 400.0)));
    float lightsOn = 1.0 - smoothstep(0.25, 0.6, uDay);
    if (p.y < YH + 0.012 && town > 0.93) h = mix(h, vec3(1.0, 0.85, 0.55), lightsOn * (0.5 + 0.5 * sin(uTime * 0.7 + town * 40.0)));
    c = h;
  }

  // a nearer headland on the right, darker, with tree crowns
  float rise3 = smoothstep(gHalfW - 0.55, gHalfW - 0.15, p.x);
  float t3 = YH + rise3 * (0.16 + 0.03 * ridge(p.x, 7.0, 9.0)) + max(0.0, crowns(p.x, 0.022, 0.0, 0.01, 9.0)) * rise3;
  if (p.y < t3) {
    vec3 h = HILL * 0.75;
    h += ROSE * 0.3 * smoothstep(-0.01, 0.0, p.y - t3);
    c = mix(h, SHADE, smoothstep(0.0, 0.12, t3 - p.y) * 0.7);
  }
  return c;
}

vec3 far(vec2 p) {
  return mix(farAwaji(p), MIST + 0.12 * fbm(p * 5.0 + uTime * 0.01), fogAt(p));
}

vec3 sea(vec2 p) {
  float dd = YH - p.y;
  float z = 1.0 / (dd + 0.02);
  float ripple = (vnoise(vec2(p.x * 3.0, z * 6.0 + uTime * 0.15)) - 0.5) * 0.01 * (0.3 + dd * 5.0);
  vec3 c = far(vec2(p.x + ripple, YH + dd * 1.1)) * vec3(0.68, 0.75, 0.8);
  float s = vnoise(vec2(p.x * z * 1.1 + uTime * 0.015, z * 15.0 + uTime * 0.04));
  if (s > 0.74) c += vec3(0.06, 0.08, 0.09);
  if (s < 0.22) c *= 0.62;
  float gx = abs(p.x - SUN.x - ripple * 3.0), gw = 0.018 + dd * 0.25;
  if (gx < gw) c += GLOW * 0.95 * BODY * step(0.34 + 0.55 * gx / gw, vnoise(vec2(p.x * z * 5.0, z * 15.0 + uTime * 0.25)));
  return c * (1.0 - 0.3 * smoothstep(0.12, 0.4, dd));
}

// A road bike, side on. Units are wheel radii (one is ~340mm), origin between the axles.
// Geometry from a real endurance frame: 990mm wheelbase, 73.5° seat, 73° head, 70mm BB drop.
float bike(vec2 b, float w) {
  vec2 rear = vec2(-1.455, 0.0), front = vec2(1.455, 0.0);
  vec2 bb = vec2(-0.267, -0.206);
  vec2 stTop = vec2(-0.684, 1.204);        // seat tube top
  vec2 ttRear = vec2(-0.622, 0.993);       // sloping top tube meets seat tube
  vec2 htTop = vec2(0.865, 1.441), htBot = vec2(0.994, 1.019);
  vec2 saddleAt = vec2(-0.868, 1.826);
  vec2 stem = vec2(1.15, 1.53), hood = vec2(1.38, 1.5);

  // wheels: thin tyre, deep rim, small hub, faint spokes
  float d = 9.0;
  for (int k = 0; k < 2; k++) {
    vec2 c = k == 0 ? rear : front;
    vec2 q = b - c;
    float r = length(q);
    d = min(d, abs(r - 0.965) - 0.035);                  // 25mm tyre
    d = min(d, abs(r - 0.86) - 0.07);                    // deep carbon rim
    d = min(d, r - 0.06);
  }
  d = min(d, length(b - rear) - 0.16);                   // cassette

  d = min(d, seg(b, ttRear, htTop) - w);                 // top tube
  d = min(d, seg(b, bb, htBot) - w * 1.35);              // down tube
  d = min(d, seg(b, bb, stTop) - w * 1.1);               // seat tube
  d = min(d, seg(b, bb, rear) - w * 0.8);                // chainstay
  d = min(d, seg(b, ttRear, rear) - w * 0.7);            // seatstay
  d = min(d, seg(b, htBot, htTop) - w * 1.5);            // head tube
  d = min(d, seg(b, htBot, front + vec2(-0.04, 0.0)) - w); // fork
  d = min(d, seg(b, stTop, saddleAt) - w * 0.8);         // seatpost
  d = min(d, seg(b, saddleAt + vec2(-0.26, 0.03), saddleAt + vec2(0.2, 0.0)) - w * 1.3); // saddle
  d = min(d, seg(b, htTop, htTop + vec2(-0.015, 0.06)) - w * 1.2);  // spacers
  d = min(d, seg(b, htTop + vec2(-0.015, 0.06), stem) - w);         // stem
  d = min(d, seg(b, stem, hood) - w);                    // bar tops to hoods
  d = min(d, length(b - hood - vec2(0.02, 0.04)) - w * 1.6);        // hood bump
  vec2 q = b - (hood + vec2(0.0, -0.19));                // the drop
  if (q.x > 0.0) d = min(d, abs(length(q) - 0.19) - w);
  d = min(d, seg(b, hood + vec2(0.0, -0.38), hood + vec2(-0.16, -0.36)) - w);
  d = min(d, abs(length(b - bb) - 0.3) - w * 0.7);       // chainring
  d = min(d, seg(b, bb, bb + vec2(0.24, -0.45)) - w);    // crank
  d = min(d, seg(b, bb + vec2(0.18, -0.45), bb + vec2(0.32, -0.45)) - w); // pedal
  d = min(d, seg(b, rear + vec2(0.02, -0.12), rear + vec2(-0.02, -0.32)) - w * 0.9); // derailleur
  // bottle on the down tube
  vec2 dt = normalize(htBot - bb), nrm = vec2(-dt.y, dt.x);
  vec2 bc = bb + dt * 0.62 + nrm * 0.11;
  d = min(d, seg(b, bc - dt * 0.2, bc + dt * 0.2) - 0.07);
  return d;
}

// The sea wall we stand on: a railing, the bike leaning on it, and one pole with wires.
vec4 near(vec2 p) {
  float ground = GROUND + 0.003 * vnoise(vec2(p.x * 40.0, 0.0));
  float cover = 0.0, rim = 0.0;
  if (p.y < ground) { cover = 1.0; rim = smoothstep(-0.008, 0.0, p.y - ground) * 0.6; }

  float railY = ground + 0.085;
  float post = abs(fract(p.x / 0.12) - 0.5) * 0.12;
  if (p.y < railY && p.y > ground && post < 0.004) cover = 1.0;
  if (abs(p.y - railY) < 0.0045) { cover = 1.0; rim = max(rim, step(railY, p.y) * 0.8); }
  if (abs(p.y - (railY - 0.04)) < 0.0022) cover = 1.0;

  float S = 0.072;
  vec2 bp = vec2(min(0.2, gHalfW - 0.34), ground + S);
  float w = max(0.04, 0.6 * gPx / S);
  float bd = bike((p - bp) / S, w) * S;
  if (bd < gPx * 0.5) {
    cover = 1.0;
    // anime rim light: the edge that faces the sky catches it
    float above = bike((p + vec2(0.0, gPx * 1.5) - bp) / S, w) * S;
    if (above > gPx * 0.5) rim = 1.0;
  }

  float px = gHalfW - 0.15;
  if (abs(p.x - px) < 0.008 && p.y > ground - 0.02) cover = 1.0;
  if (abs(p.y - 0.37) < 0.0035 && abs(p.x - px) < 0.07) cover = 1.0;
  if (abs(p.y - 0.32) < 0.003 && abs(p.x - px) < 0.05) cover = 1.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float ax = px - 0.06 + fi * 0.06;
    float t = (ax - p.x) / 1.9;
    float wy = 0.376 - (0.1 + fi * 0.012) * 4.0 * t * (1.0 - t);
    if (t > 0.0 && abs(p.y - wy) < gPx * 0.5) cover = 1.0;
  }
  return vec4(SHADE * 0.6 + mix(ROSE, EMBER, 0.5) * rim * 0.45, cover);
}

float h1(float n) { return fract(sin(n * 91.7) * 1234.5); }

// rain: thin slanted streaks falling down the dot grid. snow: single dots, drifting.
float rainAt(vec2 cell) {
  float x = cell.x + cell.y * 0.18;
  float col = floor(x);
  float h = h11(col * 0.37);
  if (h > uRain * 0.55) return 0.0;
  float y = cell.y + uTime * (70.0 + 40.0 * h1(col)) + h * 900.0;
  return step(fract(y / (34.0 + 30.0 * h)), 0.11) * (0.5 + 0.5 * h);
}
float snowAt(vec2 cell) {
  vec2 q = cell / 7.0;
  q.y += uTime * 2.2;
  q.x += sin(q.y * 0.6 + floor(q.x) * 1.7) * 0.6;
  vec2 g = floor(q);
  float h = h21(g * 0.71);
  if (h > uSnow * 0.35) return 0.0;
  return step(length(fract(q) - 0.5), 0.12);
}

void main() {
  palette();
  vec2 cell = floor(gl_FragCoord.xy);
  float scale = min(uRes.y, uRes.x / uMinW);
  vec2 p = (cell + 0.5 - 0.5 * uRes) / scale;
  vec2 halfSize = 0.5 * uRes / scale;
  gPx = 1.0 / scale;
  gHalfW = halfSize.x;

  vec2 dl = p - uPointer;
  gLamp = uLamp * exp(-dot(dl, dl) / 0.01);

  vec3 c = p.y >= YH ? far(p) : sea(p);
  vec4 n = near(p);
  c = mix(c, n.rgb, n.a);
  c += vec3(0.95, 0.9, 0.65) * 0.1 * gLamp;
  if (uRain > 0.0) c = mix(c, mix(MIST, vec3(0.85, 0.9, 1.0), 0.4), rainAt(cell) * 0.55);
  if (uSnow > 0.0) c = mix(c, vec3(0.92, 0.94, 0.98) * (0.55 + 0.45 * uDay), snowAt(cell));

  float fade = (1.0 - smoothstep(0.94, 1.0, abs(p.x) / halfSize.x)) * (1.0 - smoothstep(0.86, 1.0, -p.y / halfSize.y));
  c *= fade;

  // ordered dither, eight levels per channel: enough for real gradients, still visibly dotted
  vec3 q = floor(clamp(c, 0.0, 1.0) * 7.0 + bayer4(cell)) / 7.0;
  outColor = vec4(uPaper + q * (1.0 - uPaper), 1.0);
}
`;

const VERT = /* glsl */ `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const STAY_KEY = "lake:seconds";
const STAY_FULL = 150;

function staySeconds() {
  const forced = new URLSearchParams(location.search).get("fog");
  if (forced === "gone") return STAY_FULL;
  if (forced === "thick") return 0;
  return Number(localStorage.getItem(STAY_KEY) ?? 0) || 0;
}


export interface Reading {
  seconds: number;
  visibility: number; // 0..1
}

export function mountScene(canvas: HTMLCanvasElement, stage: HTMLElement, onReading?: (r: Reading) => void) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  if (!gl) return () => {};

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  try {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
  } catch (e) {
    console.error(e);
    return () => {};
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes"), uTime = u("uTime"), uReveal = u("uReveal");
  const uPointer = u("uPointer"), uLamp = u("uLamp"), uMinW = u("uMinW");
  const uSky = {
    sun: u("uSun"), day: u("uDay"), warm: u("uWarm"), moon: u("uMoon"), cloud: u("uCloud"),
    rain: u("uRain"), snow: u("uSnow"), murk: u("uMurk"), flash: u("uFlash"),
  };
  let cell = 3; // CSS px per dot
  let minW = 0.9;
  gl.uniform3fv(u("uPaper"), new Float32Array(hex("#0b0b0e")));

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const t0 = performance.now() - 30_000;
  let stayed = staySeconds();
  let raf = 0;
  let last = 0;
  let saved = 0;
  let visible = true;

  // sky: the target comes from the clock and the weather; the drawn one eases toward it
  let conditions: Conditions = { weather: "clear", sunrise: 390, sunset: 1050 };
  let target: Sky = skyAt(nowMinutes(), conditions);
  const sky: Sky = { ...target, sun: [...target.sun] as [number, number] };
  let flash = 0;
  let nextFlash = 3;
  let skyChecked = 0;
  // Hold the fade-in until the real sky is known, so the sun starts where it belongs instead of sliding there.
  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    target = skyAt(nowMinutes(), conditions);
    Object.assign(sky, target, { sun: [...target.sun] });
    draw(performance.now());
    requestAnimationFrame(() => stage.classList.add("ready"));
  };
  loadConditions().then((c) => {
    conditions = c;
    show();
  });
  setTimeout(show, 1500);

  // lantern: target follows the pointer, the drawn one eases after it
  const lamp = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };

  const visibility = () => {
    const x = Math.min(1, stayed / STAY_FULL);
    return x * x * (3 - 2 * x);
  };

  const report = () => onReading?.({ seconds: stayed, visibility: visibility() });

  const toScene = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    const scale = Math.min(canvas.height, canvas.width / minW);
    const cx = (clientX - r.left) / cell;
    const cy = canvas.height - (clientY - r.top) / cell;
    return [(cx - canvas.width / 2) / scale, (cy - canvas.height / 2) / scale];
  };

  const resize = () => {
    const r = stage.getBoundingClientRect();
    // narrow screens get finer dots and a wider view, so the hills stay in frame
    const narrow = r.width < 640;
    // Snap dots and gaps to whole device pixels; a 0.5px gap on a 3x phone rounds unevenly and shimmers.
    const dpr = window.devicePixelRatio || 1;
    cell = Math.max(1, Math.round((narrow ? 2 : 3) * dpr)) / dpr;
    minW = narrow ? 1.25 : 0.9;
    stage.style.setProperty("--cell", `${cell}px`);
    stage.style.setProperty("--hair", `${dpr >= 2 ? 1 / dpr : 1}px`);
    gl.uniform1f(uMinW, minW);
    const cols = Math.max(1, Math.ceil(r.width / cell));
    const rows = Math.max(1, Math.ceil(r.height / cell));
    canvas.width = cols;
    canvas.height = rows;
    canvas.style.width = `${cols * cell}px`;
    canvas.style.height = `${rows * cell}px`;
    gl.viewport(0, 0, cols, rows);
    draw(performance.now());
  };

  const draw = (now: number) => {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduce ? 30 : (now - t0) / 1000);
    gl.uniform1f(uReveal, visibility());
    gl.uniform2f(uPointer, lamp.x, lamp.y);
    gl.uniform1f(uLamp, lamp.on);
    gl.uniform2f(uSky.sun, sky.sun[0], sky.sun[1]);
    gl.uniform1f(uSky.day, sky.day);
    gl.uniform1f(uSky.warm, sky.warm);
    gl.uniform1f(uSky.moon, sky.moon);
    gl.uniform1f(uSky.cloud, sky.cloud);
    gl.uniform1f(uSky.rain, sky.rain);
    gl.uniform1f(uSky.snow, sky.snow);
    gl.uniform1f(uSky.murk, sky.murk);
    gl.uniform1f(uSky.flash, flash);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = last ? Math.min(0.25, (now - last) / 1000) : 0;
    // slow, ambient motion; 24fps keeps it calm and cheap
    if (now - last >= 1000 / 24 || !last) {
      stayed += dt;
      const k = reduce ? 1 : 1 - Math.exp(-dt * 5);
      lamp.x += (lamp.tx - lamp.x) * k;
      lamp.y += (lamp.ty - lamp.y) * k;
      lamp.on += (lamp.ton - lamp.on) * (reduce ? 1 : 1 - Math.exp(-dt * 2));
      if (now - skyChecked > 60_000) {
        target = skyAt(nowMinutes(), conditions);
        skyChecked = now;
      }
      const ks = reduce ? 1 : 1 - Math.exp(-dt * 1.2);
      for (const k of ["day", "warm", "cloud", "rain", "snow", "murk", "storm"] as const) sky[k] += (target[k] - sky[k]) * ks;
      // the sun and moon swap places in a blink rather than sliding across the sky
      if (sky.moon !== target.moon) [sky.moon, sky.sun] = [target.moon, [...target.sun] as [number, number]];
      sky.sun[0] += (target.sun[0] - sky.sun[0]) * ks;
      sky.sun[1] += (target.sun[1] - sky.sun[1]) * ks;
      // lightning: a flash, a fainter second one, then quiet for a while
      if (sky.storm > 0.5 && !reduce) {
        nextFlash -= dt;
        if (nextFlash <= 0) {
          flash = 1;
          nextFlash = 4 + Math.random() * 8;
          setTimeout(() => (flash = 0.6), 160);
        }
      }
      flash *= Math.exp(-dt * 9);
      if (now - saved > 2000) {
        localStorage.setItem(STAY_KEY, String(Math.round(stayed)));
        saved = now;
        report();
      }
      if (!reduce || now - last > 1000 || lamp.ton || lamp.on > 0.01) draw(now);
      last = now;
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    last = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    [lamp.tx, lamp.ty] = toScene(e.clientX, e.clientY);
    if (!lamp.ton) [lamp.x, lamp.y] = [lamp.tx, lamp.ty];
    lamp.ton = 1;
  };
  const onLeave = () => (lamp.ton = 0);
  if (finePointer) {
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", wake);
  report();
  wake();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", wake);
    localStorage.setItem(STAY_KEY, String(Math.round(stayed)));
  };
}
