/** HDRI environments from @react-three/drei Environment presets */
export const environments = [
  {
    id: "apartment",
    label: "Apartment",
    description: "Soft indoor light",
    accent: "#c4b8a8",
  },
  {
    id: "studio",
    label: "Studio",
    description: "Clean product lighting",
    accent: "#d8d8d8",
  },
  {
    id: "lobby",
    label: "Lobby",
    description: "Bright interior hall",
    accent: "#e8dcc8",
  },
  {
    id: "warehouse",
    label: "Warehouse",
    description: "Industrial indoor",
    accent: "#9aa0a6",
  },
  {
    id: "city",
    label: "City",
    description: "Urban outdoor",
    accent: "#6a8aaa",
  },
  {
    id: "park",
    label: "Park",
    description: "Green outdoor",
    accent: "#6a9a6a",
  },
  {
    id: "forest",
    label: "Forest",
    description: "Natural canopy",
    accent: "#4a7a4a",
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm evening light",
    accent: "#e09050",
  },
  {
    id: "dawn",
    label: "Dawn",
    description: "Cool morning light",
    accent: "#a8c4d8",
  },
  {
    id: "night",
    label: "Night",
    description: "Dark ambient",
    accent: "#2a3448",
  },
];

export function getEnvironment(id) {
  return environments.find((e) => e.id === id) || environments[0];
}

/** Per-texture PBR so environment reflections read on surfaces */
export function getSurfacePbr(textureId, surface = "floor") {
  const table = {
    none: { roughness: surface === "floor" ? 0.55 : 0.75, metalness: 0.0, envMapIntensity: 0.85 },
    "wood-oak": { roughness: 0.55, metalness: 0.02, envMapIntensity: 0.7 },
    "wood-walnut": { roughness: 0.6, metalness: 0.02, envMapIntensity: 0.65 },
    "tile-light": { roughness: 0.28, metalness: 0.05, envMapIntensity: 1.2 },
    "tile-dark": { roughness: 0.3, metalness: 0.08, envMapIntensity: 1.15 },
    marble: { roughness: 0.12, metalness: 0.05, envMapIntensity: 1.6 },
    concrete: { roughness: 0.85, metalness: 0.0, envMapIntensity: 0.45 },
    carpet: { roughness: 0.95, metalness: 0.0, envMapIntensity: 0.2 },
    brick: { roughness: 0.92, metalness: 0.0, envMapIntensity: 0.3 },
    plaster: { roughness: 0.78, metalness: 0.0, envMapIntensity: 0.5 },
    wallpaper: { roughness: 0.82, metalness: 0.0, envMapIntensity: 0.4 },
  };
  return table[textureId] || table.none;
}
