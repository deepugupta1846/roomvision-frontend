import * as THREE from "three";
import { getRoomTexture } from "../data/roomTextures";

const cache = new Map();

function hashNoise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function fillNoise(ctx, size, alpha = 0.08) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = hashNoise(x, y) * 255;
      d[i] = n;
      d[i + 1] = n;
      d[i + 2] = n;
      d[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function drawWood(ctx, size, def) {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 28; i++) {
    const y = (i / 28) * size + hashNoise(i, 2) * 6;
    ctx.strokeStyle = def.grain;
    ctx.globalAlpha = 0.25 + hashNoise(i, 5) * 0.35;
    ctx.lineWidth = 1 + hashNoise(i, 8) * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 8) {
      ctx.lineTo(x, y + Math.sin(x * 0.04 + i) * 3);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // plank seams
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    const x = (i / 4) * size;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
}

function drawTile(ctx, size, def) {
  const cells = 4;
  const cell = size / cells;
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = def.line;
  ctx.lineWidth = 3;
  for (let i = 0; i <= cells; i++) {
    const p = i * cell;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  fillNoise(ctx, size, 0.05);
}

function drawMarble(ctx, size, def) {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = def.vein;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    ctx.globalAlpha = 0.25 + hashNoise(i, 1) * 0.4;
    ctx.beginPath();
    let x = hashNoise(i, 3) * size;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      x += (hashNoise(x, y + i) - 0.5) * 18;
      y += 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawConcrete(ctx, size, def) {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  fillNoise(ctx, size, 0.18);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let i = 0; i < 40; i++) {
    const x = hashNoise(i, 9) * size;
    const y = hashNoise(i, 11) * size;
    ctx.fillRect(x, y, 2 + hashNoise(i, 2) * 6, 1);
  }
}

function drawCarpet(ctx, size, def) {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      if (hashNoise(x, y) > 0.55) {
        ctx.fillStyle = def.fleck;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
}

function drawBrick(ctx, size, def) {
  const rows = 8;
  const cols = 6;
  const bh = size / rows;
  const bw = size / cols;
  ctx.fillStyle = def.mortar;
  ctx.fillRect(0, 0, size, size);
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : bw / 2;
    for (let c = -1; c < cols + 1; c++) {
      const x = c * bw + offset;
      const y = r * bh;
      const shade = 0.85 + hashNoise(r, c) * 0.2;
      ctx.fillStyle = shadeColor(def.base, shade);
      ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2);
    }
  }
}

function drawPlaster(ctx, size, def) {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  fillNoise(ctx, size, 0.07);
}

function drawWallpaper(ctx, size, def) {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, size, size);
  const stripeW = size / 10;
  ctx.fillStyle = def.stripe;
  for (let i = 0; i < 10; i += 2) {
    ctx.fillRect(i * stripeW, 0, stripeW, size);
  }
  fillNoise(ctx, size, 0.04);
}

function shadeColor(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  let r = ((n >> 16) & 255) * factor;
  let g = ((n >> 8) & 255) * factor;
  let b = (n & 255) * factor;
  r = Math.min(255, Math.max(0, r | 0));
  g = Math.min(255, Math.max(0, g | 0));
  b = Math.min(255, Math.max(0, b | 0));
  return `rgb(${r},${g},${b})`;
}

function paintCanvas(def) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  switch (def.kind) {
    case "wood":
      drawWood(ctx, size, def);
      break;
    case "tile":
      drawTile(ctx, size, def);
      break;
    case "marble":
      drawMarble(ctx, size, def);
      break;
    case "concrete":
      drawConcrete(ctx, size, def);
      break;
    case "carpet":
      drawCarpet(ctx, size, def);
      break;
    case "brick":
      drawBrick(ctx, size, def);
      break;
    case "plaster":
      drawPlaster(ctx, size, def);
      break;
    case "wallpaper":
      drawWallpaper(ctx, size, def);
      break;
    default:
      ctx.fillStyle = "#cccccc";
      ctx.fillRect(0, 0, size, size);
  }

  return canvas;
}

/**
 * Returns a cloned, configured CanvasTexture for a room texture id.
 * Caller owns the clone and should dispose when done.
 */
export function createRoomTextureMap(textureId) {
  const def = getRoomTexture(textureId);
  if (!def || def.kind === "none") return null;

  let source = cache.get(def.id);
  if (!source) {
    const canvas = paintCanvas(def);
    source = new THREE.CanvasTexture(canvas);
    source.colorSpace = THREE.SRGBColorSpace;
    source.wrapS = THREE.RepeatWrapping;
    source.wrapT = THREE.RepeatWrapping;
    source.needsUpdate = true;
    cache.set(def.id, source);
  }

  const map = source.clone();
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  const [rx, ry] = def.repeat || [1, 1];
  map.repeat.set(rx, ry);
  map.needsUpdate = true;
  return map;
}

export function getTexturePreviewDataUrl(textureId) {
  const def = getRoomTexture(textureId);
  if (!def || def.kind === "none") return null;
  return paintCanvas(def).toDataURL("image/png");
}
