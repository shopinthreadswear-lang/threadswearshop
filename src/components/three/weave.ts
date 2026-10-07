import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping } from "three";
import type { Weave } from "./fabrics";

const SIZE = 256;
const cache = new Map<Weave, CanvasTexture>();

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number, period: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const h = (a: number, b: number) => hash(((a % period) + period) % period * 57 + (((b % period) + period) % period) * 131);
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
}

/** Height (0..1) of the cloth surface at tileable coordinates u,v ∈ [0,1). */
function height(weave: Weave, u: number, v: number): number {
  const N = weave === "linen" ? 12 : weave === "hopsack" || weave === "oxford" ? 16 : 16;
  const x = u * N, y = v * N;
  const i = Math.floor(x), j = Math.floor(y);
  const fu = x - i, fv = y - j;
  const warp = Math.sin(Math.PI * fu); // profile across a vertical thread
  const weft = Math.sin(Math.PI * fv);
  let warpOnTop: boolean;
  switch (weave) {
    case "suede":
      return valueNoise(u * 64, v * 64, 64) * 0.6 + valueNoise(u * 16, v * 16, 16) * 0.4;
    case "jersey":
    case "knit": {
      // Interlocking "V" loops of a knit.
      const rows = weave === "knit" ? 14 : 22;
      const cx = u * rows;
      const col = cx - Math.floor(cx);
      const ry = v * rows + Math.abs(col - 0.5) * 0.9;
      const row = ry - Math.floor(ry);
      const loop = Math.sin(Math.PI * col) * (0.55 + 0.45 * Math.sin(Math.PI * row));
      return loop * 0.85 + valueNoise(u * 128, v * 128, 128) * 0.15;
    }
    case "oxford":
      warpOnTop = (Math.floor(i / 2) + j) % 2 === 0;
      break;
    case "hopsack":
      warpOnTop = (Math.floor(i / 2) + Math.floor(j / 2)) % 2 === 0;
      break;
    case "twill":
      warpOnTop = (i + j) % 4 < 2;
      break;
    default: // poplin, linen
      warpOnTop = (i + j) % 2 === 0;
  }
  let h = warpOnTop ? 0.55 + 0.45 * warp * (0.7 + 0.3 * weft) : 0.55 + 0.45 * weft * (0.7 + 0.3 * warp);
  if (weave === "linen") {
    // Slubs: irregular thread thickness along each yarn.
    const slub = warpOnTop ? valueNoise(i * 3.1, v * 24, 24) : valueNoise(u * 24, j * 3.1, 24);
    h *= 0.75 + 0.5 * slub;
  }
  return h;
}

/** Tileable tangent-space normal map for a weave, generated once and shared by every scene. */
export function weaveNormalMap(weave: Weave): CanvasTexture {
  const hit = cache.get(weave);
  if (hit) return hit;
  const H = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) H[y * SIZE + x] = height(weave, x / SIZE, y / SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(SIZE, SIZE);
  const at = (x: number, y: number) => H[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];
  const strength = 3.2;
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const k = (y * SIZE + x) * 4;
      img.data[k] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[k + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[k + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[k + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.colorSpace = NoColorSpace;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.anisotropy = 4;
  cache.set(weave, tex);
  return tex;
}
