/** Visualez-style laying patterns for floors/walls */

export const TILE_PATTERNS = [
  {
    id: "single",
    label: "Single",
    zones: 1,
    kind: "grid",
    cols: 1,
    rows: 1,
  },
  {
    id: "3-columns",
    label: "3 Columns",
    zones: 3,
    kind: "columns",
    count: 3,
  },
  {
    id: "3-rows",
    label: "3 Rows",
    zones: 3,
    kind: "rows",
    count: 3,
  },
  {
    id: "8-rows",
    label: "8 Rows",
    zones: 8,
    kind: "rows",
    count: 8,
  },
  {
    id: "herringbone",
    label: "Herring Bone",
    zones: 3,
    kind: "herringbone",
  },
  {
    id: "border-4",
    label: "Border 4",
    zones: 4,
    kind: "border",
    rings: 4,
  },
  {
    id: "alternate-row",
    label: "Alternate Row",
    zones: 2,
    kind: "alternate-row",
  },
  {
    id: "brick-1-3",
    label: "1/3 Brick",
    zones: 1,
    kind: "brick",
    offset: 1 / 3,
  },
  {
    id: "paint",
    label: "Paint",
    zones: 1,
    kind: "paint",
  },
  {
    id: "checkered",
    label: "Checkered",
    zones: 2,
    kind: "checkered",
  },
  {
    id: "8-columns",
    label: "8 Columns",
    zones: 8,
    kind: "columns",
    count: 8,
  },
  {
    id: "half-brick",
    label: "Half Brick",
    zones: 1,
    kind: "brick",
    offset: 0.5,
  },
];

export const TILE_SWATCHES = [
  { id: "tile-white", label: "White", color: "#f5f2eb", kind: "tile" },
  { id: "tile-cream", label: "Cream", color: "#e8dcc8", kind: "tile" },
  { id: "tile-beige", label: "Beige", color: "#d4c4a8", kind: "tile" },
  { id: "tile-sand", label: "Sand", color: "#c4a882", kind: "tile" },
  { id: "tile-taupe", label: "Taupe", color: "#a89880", kind: "tile" },
  { id: "tile-gray", label: "Gray", color: "#9a9a9a", kind: "tile" },
  { id: "tile-slate", label: "Slate", color: "#6b7280", kind: "tile" },
  { id: "tile-charcoal", label: "Charcoal", color: "#3f4450", kind: "tile" },
  { id: "tile-navy", label: "Navy", color: "#2c3e6b", kind: "tile" },
  { id: "tile-teal", label: "Teal", color: "#3d7a7a", kind: "tile" },
  { id: "tile-forest", label: "Forest", color: "#4a6b4a", kind: "tile" },
  { id: "tile-terracotta", label: "Terracotta", color: "#c4785a", kind: "tile" },
  { id: "tile-brick", label: "Brick", color: "#8b4513", kind: "brick" },
  { id: "tile-wood", label: "Wood", color: "#8b6914", kind: "wood" },
  { id: "tile-marble", label: "Marble", color: "#e8e4e0", kind: "marble" },
  { id: "paint-white", label: "Paint White", color: "#f7f5f2", kind: "paint" },
  { id: "paint-soft", label: "Paint Soft", color: "#ece7df", kind: "paint" },
  { id: "paint-blue", label: "Paint Blue", color: "#a8c4d8", kind: "paint" },
];

export const DEFAULT_GROUT = {
  color: "#B8B2AB",
  size: 1,
  orientation: "both", // vertical | horizontal | both
};

export const ZONE_COLORS = [
  "#9ca3af",
  "#f5d76e",
  "#7dd3c0",
  "#60a5fa",
  "#f97316",
  "#a78bfa",
  "#f472b6",
  "#34d399",
];
