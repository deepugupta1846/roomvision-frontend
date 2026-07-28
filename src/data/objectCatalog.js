/**
 * Object catalog: Furniture, Interior, Bathroom, Kitchen.
 * Instances are procedural meshes until GLTF assets are wired.
 */
export const categories = [
  { id: "furniture", label: "Furniture", assetType: 9 },
  { id: "interior", label: "Interior", assetType: 5 },
  { id: "bathroom", label: "Bathroom", assetType: 11 },
  { id: "kitchen", label: "Kitchen", assetType: 12 },
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

  // —— Bathroom ——
  {
    id: "bathtub",
    label: "Bathtub",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#f0f2f4",
    size: { w: 1.7, h: 0.55, d: 0.75 },
  },
  {
    id: "toilet",
    label: "Toilet",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#f5f5f5",
    size: { w: 0.4, h: 0.75, d: 0.65 },
  },
  {
    id: "bathroom-sink",
    label: "Sink",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#eceff2",
    size: { w: 0.6, h: 0.85, d: 0.45 },
  },
  {
    id: "vanity",
    label: "Vanity",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#7a8a96",
    size: { w: 1.2, h: 0.85, d: 0.5 },
  },
  {
    id: "shower",
    label: "Shower",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#c5d0d8",
    size: { w: 0.9, h: 2.0, d: 0.9 },
  },
  {
    id: "towel-rack",
    label: "Towel Rack",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#d8dde2",
    size: { w: 0.7, h: 0.35, d: 0.12 },
  },
  {
    id: "bathroom-cabinet",
    label: "Cabinet",
    category: "bathroom",
    type: "primitive",
    defaultColor: "#6e7c88",
    size: { w: 0.55, h: 0.7, d: 0.35 },
  },

  // —— Kitchen ——
  {
    id: "kitchen-counter",
    label: "Counter",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#cfc8bc",
    size: { w: 2.0, h: 0.9, d: 0.6 },
  },
  {
    id: "kitchen-island",
    label: "Island",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#b8aea0",
    size: { w: 1.6, h: 0.9, d: 0.8 },
  },
  {
    id: "fridge",
    label: "Fridge",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#e8eaed",
    size: { w: 0.7, h: 1.8, d: 0.7 },
  },
  {
    id: "stove",
    label: "Stove",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#3a3a3a",
    size: { w: 0.7, h: 0.9, d: 0.65 },
  },
  {
    id: "kitchen-sink",
    label: "Sink",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#d5d9de",
    size: { w: 0.8, h: 0.9, d: 0.55 },
  },
  {
    id: "dishwasher",
    label: "Dishwasher",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#c8ccd0",
    size: { w: 0.6, h: 0.85, d: 0.6 },
  },
  {
    id: "upper-cabinet",
    label: "Upper Cabinet",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#8a939c",
    size: { w: 1.0, h: 0.7, d: 0.35 },
  },
  {
    id: "microwave",
    label: "Microwave",
    category: "kitchen",
    type: "primitive",
    defaultColor: "#2f3236",
    size: { w: 0.5, h: 0.3, d: 0.35 },
  },
];

export function getCatalogItem(id) {
  return objectCatalog.find((item) => item.id === id);
}

export function categoryBadge(category) {
  if (category === "furniture") return "F";
  if (category === "interior") return "I";
  if (category === "bathroom") return "B";
  if (category === "kitchen") return "K";
  return "?";
}
