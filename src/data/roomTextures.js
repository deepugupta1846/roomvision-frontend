/** Built-in procedural room textures (floor + wall). */
export const roomTextures = [
  {
    id: "none",
    label: "Solid color",
    surfaces: ["floor", "wall"],
    kind: "none",
  },
  {
    id: "wood-oak",
    label: "Oak wood",
    surfaces: ["floor", "wall"],
    kind: "wood",
    base: "#c4a574",
    grain: "#a07848",
    repeat: [2, 2],
  },
  {
    id: "wood-walnut",
    label: "Walnut",
    surfaces: ["floor"],
    kind: "wood",
    base: "#6b4423",
    grain: "#4a2f18",
    repeat: [2, 2],
  },
  {
    id: "tile-light",
    label: "Light tile",
    surfaces: ["floor", "wall"],
    kind: "tile",
    base: "#e8e4dc",
    line: "#c8c2b6",
    repeat: [4, 4],
  },
  {
    id: "tile-dark",
    label: "Dark tile",
    surfaces: ["floor"],
    kind: "tile",
    base: "#4a4f55",
    line: "#2f3338",
    repeat: [4, 4],
  },
  {
    id: "marble",
    label: "Marble",
    surfaces: ["floor", "wall"],
    kind: "marble",
    base: "#f0ece6",
    vein: "#b8b0a4",
    repeat: [2, 2],
  },
  {
    id: "concrete",
    label: "Concrete",
    surfaces: ["floor", "wall"],
    kind: "concrete",
    base: "#9a9a96",
    repeat: [2, 2],
  },
  {
    id: "carpet",
    label: "Carpet",
    surfaces: ["floor"],
    kind: "carpet",
    base: "#6a4a3a",
    fleck: "#8a6a55",
    repeat: [3, 3],
  },
  {
    id: "brick",
    label: "Brick",
    surfaces: ["wall"],
    kind: "brick",
    base: "#a85a42",
    mortar: "#d4cbbf",
    repeat: [3, 2],
  },
  {
    id: "plaster",
    label: "Plaster",
    surfaces: ["wall"],
    kind: "plaster",
    base: "#f2eee6",
    repeat: [1, 1],
  },
  {
    id: "wallpaper",
    label: "Wallpaper",
    surfaces: ["wall"],
    kind: "wallpaper",
    base: "#e6dfd2",
    stripe: "#d2c4b0",
    repeat: [2, 1],
  },
];

export function getRoomTexture(id) {
  return roomTextures.find((t) => t.id === id) || roomTextures[0];
}

export function texturesForSurface(surface) {
  return roomTextures.filter((t) => t.surfaces.includes(surface));
}
