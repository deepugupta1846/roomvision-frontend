/**
 * Object catalog mirrored from decode editor categories:
 * Furniture (asset_type: 9) and Interior (asset_type: 5).
 * Instances are procedural meshes until GLTF assets are wired.
 */
export const categories = [
  { id: "furniture", label: "Furniture", assetType: 9 },
  { id: "interior", label: "Interior", assetType: 5 },
];

export const objectCatalog = [
  // —— Furniture ——
  {
    id: "sofa",
    label: "Sofa",
    category: "furniture",
    type: "primitive",
    defaultColor: "#5b6b7a",
    size: { w: 2.1, h: 0.75, d: 0.85 },
  },
  {
    id: "armchair",
    label: "Armchair",
    category: "furniture",
    type: "primitive",
    defaultColor: "#6d5a4e",
    size: { w: 0.85, h: 0.85, d: 0.85 },
  },
  {
    id: "dining-chair",
    label: "Dining Chair",
    category: "furniture",
    type: "primitive",
    defaultColor: "#8b7355",
    size: { w: 0.45, h: 0.9, d: 0.5 },
  },
  {
    id: "coffee-table",
    label: "Coffee Table",
    category: "furniture",
    type: "primitive",
    defaultColor: "#a07855",
    size: { w: 1.1, h: 0.4, d: 0.55 },
  },
  {
    id: "dining-table",
    label: "Dining Table",
    category: "furniture",
    type: "primitive",
    defaultColor: "#9a7b5a",
    size: { w: 1.6, h: 0.75, d: 0.9 },
  },
  {
    id: "bed",
    label: "Bed",
    category: "furniture",
    type: "primitive",
    defaultColor: "#d9d2c5",
    size: { w: 1.6, h: 0.55, d: 2.1 },
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    category: "furniture",
    type: "primitive",
    defaultColor: "#7a6552",
    size: { w: 1.2, h: 2.0, d: 0.55 },
  },
  {
    id: "desk",
    label: "Desk",
    category: "furniture",
    type: "primitive",
    defaultColor: "#8f734f",
    size: { w: 1.3, h: 0.75, d: 0.6 },
  },
  {
    id: "bookshelf",
    label: "Bookshelf",
    category: "furniture",
    type: "primitive",
    defaultColor: "#6f5742",
    size: { w: 0.9, h: 1.8, d: 0.35 },
  },
  {
    id: "nightstand",
    label: "Nightstand",
    category: "furniture",
    type: "primitive",
    defaultColor: "#8a6f52",
    size: { w: 0.45, h: 0.5, d: 0.4 },
  },
  {
    id: "tv-stand",
    label: "TV Stand",
    category: "furniture",
    type: "primitive",
    defaultColor: "#555555",
    size: { w: 1.4, h: 0.45, d: 0.4 },
  },
  {
    id: "ottoman",
    label: "Ottoman",
    category: "furniture",
    type: "primitive",
    defaultColor: "#6a5a4a",
    size: { w: 0.6, h: 0.4, d: 0.6 },
  },

  // —— Interior ——
  {
    id: "floor-lamp",
    label: "Floor Lamp",
    category: "interior",
    type: "primitive",
    defaultColor: "#d4c4a8",
    size: { w: 0.35, h: 1.6, d: 0.35 },
  },
  {
    id: "table-lamp",
    label: "Table Lamp",
    category: "interior",
    type: "primitive",
    defaultColor: "#e8dcc8",
    size: { w: 0.25, h: 0.45, d: 0.25 },
  },
  {
    id: "plant",
    label: "Plant",
    category: "interior",
    type: "primitive",
    defaultColor: "#4f7a4a",
    size: { w: 0.4, h: 0.9, d: 0.4 },
  },
  {
    id: "rug",
    label: "Rug",
    category: "interior",
    type: "primitive",
    defaultColor: "#8b4a3a",
    size: { w: 2.0, h: 0.02, d: 1.4 },
  },
  {
    id: "wall-art",
    label: "Wall Art",
    category: "interior",
    type: "primitive",
    defaultColor: "#3d4f66",
    size: { w: 0.9, h: 0.65, d: 0.04 },
  },
  {
    id: "mirror",
    label: "Mirror",
    category: "interior",
    type: "primitive",
    defaultColor: "#b8c4ce",
    size: { w: 0.7, h: 1.1, d: 0.05 },
  },
  {
    id: "tv",
    label: "TV",
    category: "interior",
    type: "primitive",
    defaultColor: "#1a1a1a",
    size: { w: 1.2, h: 0.7, d: 0.08 },
  },
  {
    id: "vase",
    label: "Vase",
    category: "interior",
    type: "primitive",
    defaultColor: "#c27a5a",
    size: { w: 0.2, h: 0.35, d: 0.2 },
  },
  {
    id: "ceiling-light",
    label: "Ceiling Light",
    category: "interior",
    type: "primitive",
    defaultColor: "#f2e8d5",
    size: { w: 0.5, h: 0.15, d: 0.5 },
  },
  {
    id: "sideboard",
    label: "Sideboard",
    category: "interior",
    type: "primitive",
    defaultColor: "#7d6550",
    size: { w: 1.5, h: 0.75, d: 0.4 },
  },
];

export function getCatalogItem(id) {
  return objectCatalog.find((item) => item.id === id);
}
