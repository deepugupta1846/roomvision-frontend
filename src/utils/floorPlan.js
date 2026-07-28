/** Floor-plan geometry helpers. Internal units are feet; 3D uses meters. */

export const FT_TO_M = 0.3048;
export const SNAP_FT = 0.5; // 6"

export function snap(value, step = SNAP_FT) {
  return Math.round(value / step) * step;
}

export function feetToMeters(ft) {
  return ft * FT_TO_M;
}

export function metersToFeet(m) {
  return m / FT_TO_M;
}

/** Format feet as 10' 0" */
export function formatFeetInches(feet) {
  const totalIn = Math.round(Math.abs(feet) * 12);
  const f = Math.floor(totalIn / 12);
  const inches = totalIn % 12;
  return `${f}' ${inches}"`;
}

export function dist(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

export function polygonClosed(points, threshold = 0.75) {
  if (!points || points.length < 3) return false;
  return dist(points[0], points[points.length - 1]) <= threshold;
}

export function closePolygon(points) {
  if (!points?.length) return [];
  const pts = points.map((p) => ({ x: p.x, y: p.y }));
  if (pts.length >= 3 && dist(pts[0], pts[pts.length - 1]) > 0.01) {
    pts[pts.length - 1] = { x: pts[0].x, y: pts[0].y };
  }
  return pts;
}

/** Unique vertices without duplicating the closing point */
export function uniqueVertices(points) {
  if (!points?.length) return [];
  const pts = points.map((p) => ({ x: p.x, y: p.y }));
  if (pts.length >= 2 && dist(pts[0], pts[pts.length - 1]) < 0.01) {
    pts.pop();
  }
  return pts;
}

export function polygonBounds(points) {
  const verts = uniqueVertices(points);
  if (!verts.length) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, depth: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of verts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    depth: maxY - minY,
  };
}

/** Center polygon on origin (feet). Returns centered unique vertices. */
export function centerPolygon(points) {
  const verts = uniqueVertices(points);
  if (!verts.length) return [];
  const b = polygonBounds(verts);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return verts.map((p) => ({ x: p.x - cx, y: p.y - cy }));
}

/**
 * Convert plan points (feet, Y-down screen) to 3D floor vertices in meters
 * (X right, Z forward). Y in plan maps to -Z in Three.js so +Y plan = -Z.
 */
export function planToWorldMeters(points) {
  return centerPolygon(points).map((p) => ({
    x: feetToMeters(p.x),
    z: feetToMeters(p.y),
  }));
}

export function edgeLengths(points) {
  const verts = uniqueVertices(points);
  if (verts.length < 2) return [];
  const edges = [];
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    edges.push({
      a,
      b,
      length: dist(a, b),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    });
  }
  return edges;
}

/** Axis-aligned rect preset (feet) */
export function rectPreset(widthFt = 10, depthFt = 8.5) {
  return [
    { x: 0, y: 0 },
    { x: widthFt, y: 0 },
    { x: widthFt, y: depthFt },
    { x: 0, y: depthFt },
    { x: 0, y: 0 },
  ];
}

/** L-shape preset (feet) */
export function lShapePreset() {
  return [
    { x: 0, y: 0 },
    { x: 12, y: 0 },
    { x: 12, y: 8 },
    { x: 6, y: 8 },
    { x: 6, y: 14 },
    { x: 0, y: 14 },
    { x: 0, y: 0 },
  ];
}

/** U-shape preset */
export function uShapePreset() {
  return [
    { x: 0, y: 0 },
    { x: 14, y: 0 },
    { x: 14, y: 10 },
    { x: 10, y: 10 },
    { x: 10, y: 4 },
    { x: 4, y: 4 },
    { x: 4, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 0 },
  ];
}

export const ROOM_SHAPE_PRESETS = [
  {
    id: "rect",
    label: "Rectangle",
    points: rectPreset(10, 8.5),
  },
  {
    id: "l-shape",
    label: "L-Shape",
    points: lShapePreset(),
  },
  {
    id: "u-shape",
    label: "U-Shape",
    points: uShapePreset(),
  },
  {
    id: "wide",
    label: "Wide Room",
    points: rectPreset(16, 10),
  },
];

/**
 * Build room fields from a closed floor plan (feet) + height (feet).
 */
export function roomFromFloorPlan(points, heightFt = 10) {
  const world = planToWorldMeters(points);
  const bounds = polygonBounds(centerPolygon(points));
  return {
    width: feetToMeters(bounds.width) || 6,
    depth: feetToMeters(bounds.depth) || 5,
    height: feetToMeters(heightFt) || 2.8,
    floorPlan: {
      points: uniqueVertices(points).map((p) => ({ x: p.x, y: p.y })),
      closed: true,
      unit: "ft",
    },
    footprint: world,
  };
}
