import { ZONE_COLORS } from "../data/tilePatterns";

/**
 * Draw a Visualez-style pattern thumbnail onto a canvas.
 */
export function drawPatternPreview(ctx, size, pattern, options = {}) {
  const { tileColor = "#d4c4a8", groutColor = "#B8B2AB" } = options;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 0, size, size);

  const pad = size * 0.08;
  const w = size - pad * 2;
  const h = size - pad * 2;
  const x0 = pad;
  const y0 = pad;

  const kind = pattern?.kind || "grid";

  if (kind === "paint") {
    drawPaintWheel(ctx, size);
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  ctx.clip();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x0, y0, w, h);

  switch (kind) {
    case "columns":
      drawColumns(ctx, x0, y0, w, h, pattern.count || 3);
      break;
    case "rows":
      drawRows(ctx, x0, y0, w, h, pattern.count || 3);
      break;
    case "herringbone":
      drawHerringbone(ctx, x0, y0, w, h);
      break;
    case "border":
      drawBorder(ctx, x0, y0, w, h, pattern.rings || 4);
      break;
    case "alternate-row":
      drawAlternateRows(ctx, x0, y0, w, h);
      break;
    case "brick":
      drawBrick(ctx, x0, y0, w, h, pattern.offset ?? 0.5, tileColor, groutColor);
      break;
    case "checkered":
      drawCheckered(ctx, x0, y0, w, h);
      break;
    case "grid":
    default:
      drawGrid(ctx, x0, y0, w, h, tileColor, groutColor);
      break;
  }

  ctx.restore();
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
}

function labelZone(ctx, x, y, n, color = "#374151") {
  const r = 10;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(n), x, y + 0.5);
}

function drawGrid(ctx, x0, y0, w, h, tileColor, groutColor) {
  const cells = 4;
  const cw = w / cells;
  const ch = h / cells;
  ctx.fillStyle = tileColor;
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = groutColor;
  ctx.lineWidth = 2;
  for (let i = 0; i <= cells; i++) {
    ctx.beginPath();
    ctx.moveTo(x0 + i * cw, y0);
    ctx.lineTo(x0 + i * cw, y0 + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, y0 + i * ch);
    ctx.lineTo(x0 + w, y0 + i * ch);
    ctx.stroke();
  }
  labelZone(ctx, x0 + w / 2, y0 + h / 2, 1);
}

function drawColumns(ctx, x0, y0, w, h, count) {
  const cw = w / count;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = ZONE_COLORS[i % ZONE_COLORS.length];
    ctx.fillRect(x0 + i * cw, y0, cw, h);
    labelZone(ctx, x0 + i * cw + cw / 2, y0 + h / 2, i + 1);
  }
}

function drawRows(ctx, x0, y0, w, h, count) {
  const ch = h / count;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = ZONE_COLORS[i % ZONE_COLORS.length];
    ctx.fillRect(x0, y0 + i * ch, w, ch);
    labelZone(ctx, x0 + w / 2, y0 + i * ch + ch / 2, i + 1);
  }
}

function drawHerringbone(ctx, x0, y0, w, h) {
  const cols = 6;
  const rows = 8;
  const tw = w / cols;
  const th = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = -1; c < cols + 1; c++) {
      const offset = (r % 2) * (tw / 2);
      ctx.fillStyle = ZONE_COLORS[(c + r) % 3];
      ctx.fillRect(x0 + c * tw + offset, y0 + r * th, tw - 1, th - 1);
    }
  }
}

function drawBorder(ctx, x0, y0, w, h, rings) {
  const step = Math.min(w, h) / (rings * 2 + 1);
  for (let i = 0; i < rings; i++) {
    const inset = i * step;
    ctx.fillStyle = ZONE_COLORS[i % ZONE_COLORS.length];
    ctx.fillRect(x0 + inset, y0 + inset, w - inset * 2, h - inset * 2);
    if (i < rings - 1) {
      const inner = inset + step * 0.65;
      ctx.fillStyle = "#fff";
      ctx.fillRect(x0 + inner, y0 + inner, w - inner * 2, h - inner * 2);
    }
    labelZone(
      ctx,
      x0 + inset + step * 0.35,
      y0 + h / 2,
      i + 1
    );
  }
}

function drawAlternateRows(ctx, x0, y0, w, h) {
  const rows = 6;
  const ch = h / rows;
  for (let i = 0; i < rows; i++) {
    ctx.fillStyle = ZONE_COLORS[i % 2];
    ctx.fillRect(x0, y0 + i * ch, w, ch);
  }
  labelZone(ctx, x0 + w / 2, y0 + ch / 2, 1);
  labelZone(ctx, x0 + w / 2, y0 + ch * 1.5, 2);
}

function drawBrick(ctx, x0, y0, w, h, offset, tileColor, groutColor) {
  const rows = 5;
  const cols = 4;
  const bh = h / rows;
  const bw = w / cols;
  ctx.fillStyle = groutColor;
  ctx.fillRect(x0, y0, w, h);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * bw * offset;
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = tileColor;
      ctx.fillRect(x0 + c * bw + off + 1, y0 + r * bh + 1, bw - 2, bh - 2);
    }
  }
  // 1/3 guide mark
  if (Math.abs(offset - 1 / 3) < 0.05) {
    ctx.strokeStyle = "#ef4444";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x0 + bw / 3, y0);
    ctx.lineTo(x0 + bw / 3, y0 + h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ef4444";
    ctx.font = "10px sans-serif";
    ctx.fillText("1/3", x0 + 4, y0 + 12);
  }
}

function drawCheckered(ctx, x0, y0, w, h) {
  const n = 4;
  const cw = w / n;
  const ch = h / n;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? ZONE_COLORS[0] : ZONE_COLORS[1];
      ctx.fillRect(x0 + c * cw, y0 + r * ch, cw, ch);
    }
  }
  labelZone(ctx, x0 + cw / 2, y0 + ch / 2, 1);
  labelZone(ctx, x0 + cw * 1.5, y0 + ch / 2, 2);
}

function drawPaintWheel(ctx, size) {
  const cx = size / 2;
  const cy = size / 2 - 4;
  const R = size * 0.32;
  const hues = [0, 30, 60, 120, 180, 210, 270, 300];
  const slice = (Math.PI * 2) / hues.length;
  hues.forEach((hue, i) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, i * slice - Math.PI / 2, (i + 1) * slice - Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = "#374151";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAINT", cx, cy);
}

/**
 * Procedural floor/wall map for selected pattern + tile + grout.
 */
export function paintMaterialCanvas(options = {}) {
  const {
    patternId = "single",
    tileColor = "#d4c4a8",
    secondaryColor = "#c4b49a",
    groutColor = "#B8B2AB",
    groutSize = 1,
    kind = "tile",
    size = 512,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (kind === "paint" || patternId === "paint") {
    ctx.fillStyle = tileColor;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  }

  const line = Math.max(1, groutSize * 2);
  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, size, size);

  if (patternId === "herringbone") {
    const tw = size / 8;
    const th = size / 16;
    for (let r = 0; r < 18; r++) {
      const off = (r % 2) * (tw / 2);
      for (let c = -1; c < 10; c++) {
        ctx.fillStyle = (c + r) % 2 === 0 ? tileColor : secondaryColor;
        ctx.fillRect(c * tw + off + line / 2, r * th + line / 2, tw - line, th - line);
      }
    }
    return canvas;
  }

  if (patternId === "checkered") {
    const n = 8;
    const cell = size / n;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? tileColor : secondaryColor;
        ctx.fillRect(c * cell + line / 2, r * cell + line / 2, cell - line, cell - line);
      }
    }
    return canvas;
  }

  if (patternId === "brick-1-3" || patternId === "half-brick") {
    const rows = 10;
    const cols = 6;
    const bh = size / rows;
    const bw = size / cols;
    const offset = patternId === "brick-1-3" ? 1 / 3 : 0.5;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * bw * offset;
      for (let c = -1; c <= cols; c++) {
        ctx.fillStyle = tileColor;
        ctx.fillRect(c * bw + off + line / 2, r * bh + line / 2, bw - line, bh - line);
      }
    }
    return canvas;
  }

  if (patternId === "alternate-row") {
    const rows = 10;
    const bh = size / rows;
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = r % 2 === 0 ? tileColor : secondaryColor;
      ctx.fillRect(line / 2, r * bh + line / 2, size - line, bh - line);
    }
    return canvas;
  }

  if (patternId === "3-columns" || patternId === "8-columns") {
    const count = patternId === "8-columns" ? 8 : 3;
    const cw = size / count;
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = i % 2 === 0 ? tileColor : secondaryColor;
      ctx.fillRect(i * cw + line / 2, line / 2, cw - line, size - line);
    }
    return canvas;
  }

  if (patternId === "3-rows" || patternId === "8-rows") {
    const count = patternId === "8-rows" ? 8 : 3;
    const ch = size / count;
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = i % 2 === 0 ? tileColor : secondaryColor;
      ctx.fillRect(line / 2, i * ch + line / 2, size - line, ch - line);
    }
    return canvas;
  }

  if (patternId === "border-4") {
    ctx.fillStyle = tileColor;
    ctx.fillRect(0, 0, size, size);
    const rings = 4;
    const step = size / (rings * 2);
    for (let i = 0; i < rings; i++) {
      const inset = i * step;
      ctx.strokeStyle = groutColor;
      ctx.lineWidth = line;
      ctx.strokeRect(inset + line, inset + line, size - inset * 2 - line * 2, size - inset * 2 - line * 2);
    }
    return canvas;
  }

  // default single grid
  const cells = 6;
  const cell = size / cells;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      ctx.fillStyle = tileColor;
      ctx.fillRect(c * cell + line / 2, r * cell + line / 2, cell - line, cell - line);
    }
  }
  return canvas;
}
