/** SVG thumbnails for procedural furniture / interior catalog items */

function Frame({ children }) {
  return (
    <svg viewBox="0 0 80 64" className="catalog-thumb-svg" aria-hidden>
      <rect width="80" height="64" rx="6" fill="#15171a" />
      {children}
    </svg>
  );
}

export default function CatalogThumb({ catalogId, color = "#888" }) {
  const c = color;
  const wood = "#5a4634";
  const dark = "#2a2e34";
  const soft = "#eee8e0";

  switch (catalogId) {
    case "sofa":
      return (
        <Frame color={c}>
          <rect x="10" y="34" width="60" height="14" rx="3" fill={c} />
          <rect x="10" y="22" width="60" height="10" rx="2" fill={c} opacity="0.85" />
          <rect x="10" y="26" width="8" height="18" rx="2" fill={c} />
          <rect x="62" y="26" width="8" height="18" rx="2" fill={c} />
        </Frame>
      );
    case "armchair":
      return (
        <Frame color={c}>
          <rect x="24" y="32" width="32" height="14" rx="3" fill={c} />
          <rect x="24" y="20" width="32" height="10" rx="2" fill={c} opacity="0.85" />
          <rect x="20" y="24" width="7" height="18" rx="2" fill={c} />
          <rect x="53" y="24" width="7" height="18" rx="2" fill={c} />
        </Frame>
      );
    case "dining-chair":
      return (
        <Frame color={c}>
          <rect x="28" y="30" width="24" height="4" rx="1" fill={c} />
          <rect x="28" y="12" width="24" height="18" rx="2" fill={c} opacity="0.9" />
          <rect x="30" y="34" width="3" height="16" fill={wood} />
          <rect x="47" y="34" width="3" height="16" fill={wood} />
        </Frame>
      );
    case "coffee-table":
      return (
        <Frame color={c}>
          <rect x="14" y="30" width="52" height="5" rx="1" fill={c} />
          <rect x="18" y="35" width="4" height="14" fill={wood} />
          <rect x="58" y="35" width="4" height="14" fill={wood} />
        </Frame>
      );
    case "dining-table":
      return (
        <Frame color={c}>
          <rect x="10" y="26" width="60" height="6" rx="1" fill={c} />
          <rect x="14" y="32" width="5" height="18" fill={wood} />
          <rect x="61" y="32" width="5" height="18" fill={wood} />
        </Frame>
      );
    case "bed":
      return (
        <Frame color={c}>
          <rect x="12" y="28" width="56" height="18" rx="2" fill={c} />
          <rect x="12" y="16" width="56" height="12" rx="2" fill={wood} />
          <rect x="18" y="20" width="18" height="8" rx="1" fill={soft} />
          <rect x="44" y="20" width="18" height="8" rx="1" fill={soft} />
        </Frame>
      );
    case "wardrobe":
      return (
        <Frame color={c}>
          <rect x="22" y="8" width="36" height="46" rx="2" fill={c} />
          <line x1="40" y1="12" x2="40" y2="50" stroke={dark} strokeWidth="1.5" />
          <circle cx="36" cy="32" r="1.5" fill={dark} />
          <circle cx="44" cy="32" r="1.5" fill={dark} />
        </Frame>
      );
    case "desk":
      return (
        <Frame color={c}>
          <rect x="12" y="26" width="56" height="5" rx="1" fill={c} />
          <rect x="14" y="31" width="8" height="18" fill={wood} />
          <rect x="58" y="31" width="8" height="18" fill={wood} />
        </Frame>
      );
    case "bookshelf":
      return (
        <Frame color={c}>
          <rect x="22" y="8" width="36" height="46" rx="2" fill={c} />
          <rect x="25" y="20" width="30" height="3" fill={wood} />
          <rect x="25" y="32" width="30" height="3" fill={wood} />
          <rect x="25" y="44" width="30" height="3" fill={wood} />
          <rect x="27" y="12" width="8" height="7" fill="#6b8cae" />
          <rect x="38" y="23" width="10" height="8" fill="#c45c5c" />
        </Frame>
      );
    case "nightstand":
      return (
        <Frame color={c}>
          <rect x="26" y="22" width="28" height="28" rx="2" fill={c} />
          <rect x="36" y="34" width="8" height="2" fill={dark} />
        </Frame>
      );
    case "tv-stand":
      return (
        <Frame color={c}>
          <rect x="12" y="30" width="56" height="18" rx="2" fill={c} />
          <rect x="16" y="36" width="48" height="2" fill={dark} />
        </Frame>
      );
    case "ottoman":
      return (
        <Frame color={c}>
          <rect x="22" y="28" width="36" height="18" rx="4" fill={c} />
        </Frame>
      );
    case "floor-lamp":
      return (
        <Frame color={c}>
          <ellipse cx="40" cy="52" rx="10" ry="3" fill={dark} />
          <rect x="38.5" y="16" width="3" height="36" fill="#777" />
          <path d="M28 16 L40 6 L52 16 Z" fill={c} />
        </Frame>
      );
    case "table-lamp":
      return (
        <Frame color={c}>
          <ellipse cx="40" cy="48" rx="8" ry="3" fill={dark} />
          <rect x="39" y="28" width="2" height="20" fill="#777" />
          <path d="M30 28 L40 16 L50 28 Z" fill={c} />
        </Frame>
      );
    case "plant":
      return (
        <Frame color={c}>
          <rect x="32" y="40" width="16" height="12" rx="2" fill="#8b5a3c" />
          <ellipse cx="40" cy="28" rx="14" ry="16" fill={c} />
          <ellipse cx="48" cy="26" rx="8" ry="12" fill="#3d6b3a" />
        </Frame>
      );
    case "rug":
      return (
        <Frame color={c}>
          <rect x="12" y="22" width="56" height="28" rx="3" fill={c} />
          <rect
            x="16"
            y="26"
            width="48"
            height="20"
            rx="2"
            fill="none"
            stroke={soft}
            strokeWidth="1.5"
            opacity="0.5"
          />
        </Frame>
      );
    case "wall-art":
      return (
        <Frame color={c}>
          <rect x="16" y="14" width="48" height="36" rx="2" fill={dark} />
          <rect x="20" y="18" width="40" height="28" rx="1" fill={c} />
        </Frame>
      );
    case "mirror":
      return (
        <Frame color={c}>
          <rect x="24" y="8" width="32" height="48" rx="2" fill="#555" />
          <rect x="28" y="12" width="24" height="40" rx="1" fill={c} opacity="0.85" />
          <line x1="30" y1="16" x2="42" y2="48" stroke="#fff" strokeWidth="1" opacity="0.35" />
        </Frame>
      );
    case "tv":
      return (
        <Frame color={c}>
          <rect x="14" y="14" width="52" height="32" rx="2" fill={c} />
          <rect x="18" y="18" width="44" height="24" rx="1" fill="#111" />
          <rect x="36" y="46" width="8" height="6" fill="#333" />
        </Frame>
      );
    case "vase":
      return (
        <Frame color={c}>
          <path
            d="M32 48 L34 20 H46 L48 48 Z"
            fill={c}
          />
          <ellipse cx="40" cy="20" rx="6" ry="3" fill={c} />
        </Frame>
      );
    case "ceiling-light":
      return (
        <Frame color={c}>
          <rect x="39" y="8" width="2" height="14" fill="#888" />
          <ellipse cx="40" cy="28" rx="16" ry="8" fill={c} />
          <ellipse cx="40" cy="26" rx="10" ry="4" fill="#fff" opacity="0.35" />
        </Frame>
      );
    case "sideboard":
      return (
        <Frame>
          <rect x="10" y="24" width="60" height="26" rx="2" fill={c} />
          <line x1="40" y1="28" x2="40" y2="46" stroke={dark} strokeWidth="1.5" />
          <circle cx="34" cy="37" r="1.5" fill={dark} />
          <circle cx="46" cy="37" r="1.5" fill={dark} />
        </Frame>
      );
    case "bathtub":
      return (
        <Frame>
          <rect x="12" y="28" width="56" height="22" rx="6" fill={c} />
          <rect x="18" y="34" width="44" height="12" rx="4" fill="#c8d4de" />
        </Frame>
      );
    case "toilet":
      return (
        <Frame>
          <rect x="28" y="34" width="24" height="16" rx="4" fill={c} />
          <rect x="30" y="18" width="20" height="16" rx="3" fill={c} />
          <circle cx="44" cy="24" r="2" fill="#888" />
        </Frame>
      );
    case "bathroom-sink":
      return (
        <Frame>
          <rect x="28" y="36" width="24" height="16" rx="2" fill="#6a7680" />
          <ellipse cx="40" cy="34" rx="14" ry="6" fill={c} />
          <rect x="39" y="20" width="2" height="12" fill="#888" />
        </Frame>
      );
    case "vanity":
      return (
        <Frame>
          <rect x="14" y="30" width="52" height="20" rx="2" fill={c} />
          <rect x="14" y="26" width="52" height="5" fill={soft} />
          <ellipse cx="28" cy="26" rx="7" ry="3" fill="#f5f7f9" />
          <ellipse cx="52" cy="26" rx="7" ry="3" fill="#f5f7f9" />
        </Frame>
      );
    case "shower":
      return (
        <Frame>
          <rect x="20" y="10" width="40" height="42" rx="2" fill={c} opacity="0.55" />
          <rect x="22" y="48" width="36" height="4" fill="#9aa8b2" />
          <circle cx="40" cy="16" r="4" fill="#555" />
        </Frame>
      );
    case "towel-rack":
      return (
        <Frame>
          <rect x="18" y="28" width="44" height="3" fill="#888" />
          <rect x="22" y="24" width="36" height="14" rx="2" fill={c} />
        </Frame>
      );
    case "bathroom-cabinet":
      return (
        <Frame>
          <rect x="26" y="18" width="28" height="34" rx="2" fill={c} />
          <rect x="38" y="28" width="2" height="14" fill={dark} />
        </Frame>
      );
    case "kitchen-counter":
      return (
        <Frame>
          <rect x="8" y="28" width="64" height="22" rx="2" fill="#8a9098" />
          <rect x="8" y="24" width="64" height="6" fill={c} />
        </Frame>
      );
    case "kitchen-island":
      return (
        <Frame>
          <rect x="14" y="26" width="52" height="24" rx="2" fill="#7a828a" />
          <rect x="14" y="22" width="52" height="6" fill={c} />
        </Frame>
      );
    case "fridge":
      return (
        <Frame>
          <rect x="26" y="8" width="28" height="46" rx="2" fill={c} />
          <line x1="28" y1="30" x2="52" y2="30" stroke="#bbb" strokeWidth="1" />
          <rect x="48" y="16" width="2" height="10" fill="#555" />
        </Frame>
      );
    case "stove":
      return (
        <Frame>
          <rect x="22" y="24" width="36" height="28" rx="2" fill={c} />
          <circle cx="32" cy="34" r="4" fill="#555" />
          <circle cx="48" cy="34" r="4" fill="#555" />
          <circle cx="32" cy="44" r="4" fill="#555" />
          <circle cx="48" cy="44" r="4" fill="#555" />
        </Frame>
      );
    case "kitchen-sink":
      return (
        <Frame>
          <rect x="18" y="28" width="44" height="22" rx="2" fill="#8a9098" />
          <rect x="18" y="24" width="44" height="5" fill={c} />
          <rect x="28" y="30" width="24" height="10" rx="2" fill="#b0b8c0" />
        </Frame>
      );
    case "dishwasher":
      return (
        <Frame>
          <rect x="24" y="16" width="32" height="38" rx="2" fill={c} />
          <rect x="28" y="22" width="24" height="4" fill="#333" />
          <rect x="28" y="30" width="24" height="18" fill="#aeb4ba" />
        </Frame>
      );
    case "upper-cabinet":
      return (
        <Frame>
          <rect x="18" y="16" width="44" height="32" rx="2" fill={c} />
          <line x1="40" y1="20" x2="40" y2="44" stroke={dark} strokeWidth="1.5" />
        </Frame>
      );
    case "microwave":
      return (
        <Frame>
          <rect x="18" y="22" width="44" height="24" rx="2" fill={c} />
          <rect x="22" y="26" width="26" height="16" fill="#111" />
          <rect x="52" y="26" width="6" height="16" fill="#444" />
        </Frame>
      );
    default:
      return (
        <Frame>
          <rect x="26" y="18" width="28" height="28" rx="4" fill={c} />
        </Frame>
      );
  }
}
