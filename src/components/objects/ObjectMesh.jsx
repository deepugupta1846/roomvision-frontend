import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { createRoomTextureMap } from "../../utils/proceduralTextures";
import { paintMaterialCanvas } from "../../utils/patternTextures";
import { getSurfacePbr } from "../../data/environments";

function createMaterialMap(material) {
  if (!material) return null;
  const canvas = paintMaterialCanvas({
    patternId: material.patternId || "single",
    tileColor: material.tileColor || "#d4c4a8",
    secondaryColor: material.secondaryColor || "#b8a888",
    groutColor: material.grout?.color || "#B8B2AB",
    groutSize: material.grout?.size || 1,
    kind: material.tileKind || "tile",
    size: 512,
  });
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.needsUpdate = true;
  return map;
}

function useObjectMap(textureId, material) {
  const materialKey = material
    ? `${material.patternId}|${material.tileColor}|${material.grout?.color}|${material.grout?.size}|${material.tileKind}`
    : "";

  const map = useMemo(() => {
    if (textureId === "material" && material) {
      return createMaterialMap(material);
    }
    return createRoomTextureMap(textureId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureId, materialKey]);

  useEffect(() => {
    return () => {
      map?.dispose();
    };
  }, [map]);

  return map;
}

const DEFAULT_PBR = { roughness: 0.65, metalness: 0.05, envMapIntensity: 0.8 };

function StdMat({ color, map, pbr = null }) {
  const { roughness, metalness, envMapIntensity } = pbr || DEFAULT_PBR;
  return (
    <meshStandardMaterial
      color={map ? "#ffffff" : color}
      map={map ?? null}
      roughness={roughness}
      metalness={metalness}
      envMapIntensity={envMapIntensity}
      key={map?.uuid ?? `solid-${color}-${metalness}-${roughness}`}
    />
  );
}

function Box({
  args,
  position,
  color,
  map = null,
  pbr = null,
  castShadow = true,
  receiveShadow = true,
}) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={args} />
      <StdMat color={color} map={map} pbr={pbr} />
    </mesh>
  );
}

function Cylinder({
  args,
  position,
  color,
  map = null,
  pbr = null,
  castShadow = true,
  receiveShadow = true,
}) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <cylinderGeometry args={args} />
      <StdMat color={color} map={map} pbr={pbr} />
    </mesh>
  );
}

/** Procedural furniture / interior meshes by catalog id */
export const ObjectMesh = forwardRef(function ObjectMesh(
  { catalogId, color = "#888", texture = "none", material = null },
  ref
) {
  const map = useObjectMap(texture, material);
  const pbr = useMemo(() => {
    if (texture === "material") {
      return getSurfacePbr("tile-light", "object");
    }
    return getSurfacePbr(texture || "none", "object");
  }, [texture]);

  return (
    <group ref={ref}>
      {renderMesh(catalogId, color, map, pbr)}
    </group>
  );
});

function renderMesh(catalogId, color, map = null, pbr = null) {
  switch (catalogId) {
    case "sofa":
      return (
        <>
          <Box args={[2.1, 0.35, 0.85]} position={[0, 0.175, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[2.1, 0.45, 0.18]} position={[0, 0.55, -0.335]} color={color} map={map} pbr={pbr} />
          <Box args={[0.18, 0.35, 0.7]} position={[-0.96, 0.4, 0.05]} color={color} map={map} pbr={pbr} />
          <Box args={[0.18, 0.35, 0.7]} position={[0.96, 0.4, 0.05]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "armchair":
      return (
        <>
          <Box args={[0.75, 0.3, 0.75]} position={[0, 0.25, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.75, 0.45, 0.15]} position={[0, 0.55, -0.3]} color={color} map={map} pbr={pbr} />
          <Box args={[0.12, 0.3, 0.6]} position={[-0.315, 0.4, 0.05]} color={color} map={map} pbr={pbr} />
          <Box args={[0.12, 0.3, 0.6]} position={[0.315, 0.4, 0.05]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "dining-chair":
      return (
        <>
          <Box args={[0.4, 0.05, 0.4]} position={[0, 0.42, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.4, 0.45, 0.05]} position={[0, 0.65, -0.175]} color={color} map={map} pbr={pbr} />
          <Box args={[0.05, 0.42, 0.05]} position={[-0.15, 0.21, -0.15]} color="#5a4634" />
          <Box args={[0.05, 0.42, 0.05]} position={[0.15, 0.21, -0.15]} color="#5a4634" />
          <Box args={[0.05, 0.42, 0.05]} position={[-0.15, 0.21, 0.15]} color="#5a4634" />
          <Box args={[0.05, 0.42, 0.05]} position={[0.15, 0.21, 0.15]} color="#5a4634" />
        </>
      );

    case "coffee-table":
      return (
        <>
          <Box args={[1.1, 0.05, 0.55]} position={[0, 0.38, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.06, 0.38, 0.06]} position={[-0.45, 0.19, -0.2]} color="#5a4634" />
          <Box args={[0.06, 0.38, 0.06]} position={[0.45, 0.19, -0.2]} color="#5a4634" />
          <Box args={[0.06, 0.38, 0.06]} position={[-0.45, 0.19, 0.2]} color="#5a4634" />
          <Box args={[0.06, 0.38, 0.06]} position={[0.45, 0.19, 0.2]} color="#5a4634" />
        </>
      );

    case "dining-table":
      return (
        <>
          <Box args={[1.6, 0.06, 0.9]} position={[0, 0.72, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.08, 0.72, 0.08]} position={[-0.7, 0.36, -0.35]} color="#5a4634" />
          <Box args={[0.08, 0.72, 0.08]} position={[0.7, 0.36, -0.35]} color="#5a4634" />
          <Box args={[0.08, 0.72, 0.08]} position={[-0.7, 0.36, 0.35]} color="#5a4634" />
          <Box args={[0.08, 0.72, 0.08]} position={[0.7, 0.36, 0.35]} color="#5a4634" />
        </>
      );

    case "bed":
      return (
        <>
          <Box args={[1.6, 0.25, 2.0]} position={[0, 0.25, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[1.6, 0.5, 0.1]} position={[0, 0.5, -1.0]} color="#6a5a4a" />
          <Box args={[0.5, 0.15, 0.35]} position={[-0.4, 0.45, -0.7]} color="#eee8e0" />
          <Box args={[0.5, 0.15, 0.35]} position={[0.4, 0.45, -0.7]} color="#eee8e0" />
        </>
      );

    case "wardrobe":
      return (
        <>
          <Box args={[1.2, 2.0, 0.5]} position={[0, 1.0, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.02, 1.7, 0.02]} position={[-0.25, 1.0, 0.26]} color="#333" />
          <Box args={[0.02, 1.7, 0.02]} position={[0.25, 1.0, 0.26]} color="#333" />
        </>
      );

    case "desk":
      return (
        <>
          <Box args={[1.3, 0.05, 0.6]} position={[0, 0.72, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.06, 0.72, 0.5]} position={[-0.58, 0.36, 0]} color="#5a4634" />
          <Box args={[0.06, 0.72, 0.5]} position={[0.58, 0.36, 0]} color="#5a4634" />
        </>
      );

    case "bookshelf":
      return (
        <>
          <Box args={[0.9, 1.8, 0.3]} position={[0, 0.9, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.84, 0.03, 0.28]} position={[0, 0.45, 0.01]} color="#5a4634" />
          <Box args={[0.84, 0.03, 0.28]} position={[0, 0.9, 0.01]} color="#5a4634" />
          <Box args={[0.84, 0.03, 0.28]} position={[0, 1.35, 0.01]} color="#5a4634" />
        </>
      );

    case "nightstand":
      return (
        <>
          <Box args={[0.45, 0.45, 0.4]} position={[0, 0.225, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.1, 0.02, 0.02]} position={[0, 0.28, 0.21]} color="#333" />
        </>
      );

    case "tv-stand":
      return (
        <>
          <Box args={[1.4, 0.4, 0.4]} position={[0, 0.2, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[1.3, 0.02, 0.35]} position={[0, 0.28, 0]} color="#333" />
        </>
      );

    case "ottoman":
      return <Box args={[0.6, 0.4, 0.6]} position={[0, 0.2, 0]} color={color} map={map} pbr={pbr} />;

    case "floor-lamp":
      return (
        <>
          <Cylinder args={[0.15, 0.15, 0.04, 16]} position={[0, 0.02, 0]} color="#444" />
          <Cylinder args={[0.02, 0.02, 1.3, 8]} position={[0, 0.67, 0]} color="#666" />
          <Cylinder args={[0.18, 0.12, 0.28, 16]} position={[0, 1.4, 0]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "table-lamp":
      return (
        <>
          <Cylinder args={[0.08, 0.1, 0.04, 16]} position={[0, 0.02, 0]} color="#555" />
          <Cylinder args={[0.015, 0.015, 0.25, 8]} position={[0, 0.15, 0]} color="#777" />
          <Cylinder args={[0.12, 0.08, 0.18, 16]} position={[0, 0.35, 0]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "plant":
      return (
        <>
          <Cylinder args={[0.12, 0.1, 0.25, 12]} position={[0, 0.125, 0]} color="#8b5a3c" />
          <Box args={[0.35, 0.5, 0.15]} position={[0, 0.5, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.15, 0.4, 0.3]} position={[0.05, 0.55, 0.05]} color="#3d6b3a" />
        </>
      );

    case "rug":
      return (
        <mesh
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[2.0, 1.4]} />
          <StdMat color={color} map={map} pbr={pbr} />
        </mesh>
      );

    case "wall-art":
      return (
        <>
          <Box args={[0.9, 0.65, 0.03]} position={[0, 0.325, 0]} color="#2a2a2a" />
          <Box args={[0.8, 0.55, 0.02]} position={[0, 0.325, 0.02]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "mirror":
      return (
        <>
          <Box args={[0.7, 1.1, 0.04]} position={[0, 0.55, 0]} color="#555" />
          <Box args={[0.6, 1.0, 0.02]} position={[0, 0.55, 0.02]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "tv":
      return (
        <>
          <Box args={[1.2, 0.7, 0.06]} position={[0, 0.35, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[1.1, 0.6, 0.02]} position={[0, 0.35, 0.03]} color="#111" />
          <Box args={[0.15, 0.08, 0.08]} position={[0, 0.02, 0]} color="#333" />
        </>
      );

    case "vase":
      return (
        <Cylinder args={[0.07, 0.09, 0.35, 16]} position={[0, 0.175, 0]} color={color} map={map} pbr={pbr} />
      );

    case "ceiling-light":
      return (
        <>
          <Cylinder args={[0.02, 0.02, 0.2, 8]} position={[0, 0.1, 0]} color="#888" />
          <Cylinder args={[0.25, 0.22, 0.08, 24]} position={[0, 0, 0]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "sideboard":
      return (
        <>
          <Box args={[1.5, 0.7, 0.4]} position={[0, 0.35, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.02, 0.4, 0.02]} position={[-0.35, 0.35, 0.21]} color="#333" />
          <Box args={[0.02, 0.4, 0.02]} position={[0.35, 0.35, 0.21]} color="#333" />
        </>
      );

    case "bathtub":
      return (
        <>
          <Box args={[1.7, 0.12, 0.75]} position={[0, 0.06, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[1.65, 0.45, 0.08]} position={[0, 0.3, -0.33]} color={color} map={map} pbr={pbr} />
          <Box args={[1.65, 0.45, 0.08]} position={[0, 0.3, 0.33]} color={color} map={map} pbr={pbr} />
          <Box args={[0.08, 0.45, 0.7]} position={[-0.81, 0.3, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.08, 0.45, 0.7]} position={[0.81, 0.3, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[1.5, 0.04, 0.55]} position={[0, 0.14, 0]} color="#c8d4de" />
        </>
      );

    case "toilet":
      return (
        <>
          <Box args={[0.38, 0.4, 0.5]} position={[0, 0.2, 0.05]} color={color} map={map} pbr={pbr} />
          <Box args={[0.36, 0.08, 0.42]} position={[0, 0.42, 0.02]} color={color} map={map} pbr={pbr} />
          <Box args={[0.36, 0.45, 0.18]} position={[0, 0.55, -0.22]} color={color} map={map} pbr={pbr} />
          <Cylinder args={[0.04, 0.04, 0.12, 10]} position={[0.12, 0.72, -0.22]} color="#888" />
        </>
      );

    case "bathroom-sink":
      return (
        <>
          <Box args={[0.55, 0.55, 0.4]} position={[0, 0.275, 0]} color="#6a7680" />
          <Box args={[0.58, 0.06, 0.42]} position={[0, 0.58, 0]} color={color} map={map} pbr={pbr} />
          <Cylinder args={[0.12, 0.14, 0.08, 16]} position={[0, 0.62, 0.02]} color="#dfe6ec" />
          <Cylinder args={[0.015, 0.015, 0.18, 8]} position={[0, 0.72, -0.12]} color="#888" />
          <Box args={[0.12, 0.03, 0.03]} position={[0, 0.8, -0.06]} color="#888" />
        </>
      );

    case "vanity":
      return (
        <>
          <Box args={[1.2, 0.7, 0.48]} position={[0, 0.35, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[1.22, 0.05, 0.5]} position={[0, 0.72, 0]} color="#eceff2" />
          <Cylinder args={[0.14, 0.16, 0.08, 16]} position={[-0.28, 0.78, 0.02]} color="#f5f7f9" />
          <Cylinder args={[0.14, 0.16, 0.08, 16]} position={[0.28, 0.78, 0.02]} color="#f5f7f9" />
          <Cylinder args={[0.015, 0.015, 0.16, 8]} position={[-0.28, 0.88, -0.14]} color="#777" />
          <Cylinder args={[0.015, 0.015, 0.16, 8]} position={[0.28, 0.88, -0.14]} color="#777" />
        </>
      );

    case "shower":
      return (
        <>
          <Box args={[0.9, 0.06, 0.9]} position={[0, 0.03, 0]} color="#9aa8b2" />
          <Box args={[0.04, 2.0, 0.9]} position={[-0.43, 1.0, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.9, 2.0, 0.04]} position={[0, 1.0, -0.43]} color={color} map={map} pbr={pbr} />
          <Box args={[0.04, 2.0, 0.04]} position={[0.43, 1.0, 0.43]} color="#333" />
          <Box args={[0.02, 1.7, 0.7]} position={[0.42, 0.9, 0]} color="#a8c4d8" />
          <Cylinder args={[0.08, 0.08, 0.04, 12]} position={[-0.2, 1.85, -0.35]} color="#555" />
        </>
      );

    case "towel-rack":
      return (
        <>
          <Box args={[0.7, 0.04, 0.04]} position={[0, 0.25, 0]} color="#888" />
          <Box args={[0.04, 0.2, 0.04]} position={[-0.3, 0.15, 0]} color="#888" />
          <Box args={[0.04, 0.2, 0.04]} position={[0.3, 0.15, 0]} color="#888" />
          <Box args={[0.55, 0.22, 0.06]} position={[0, 0.2, 0.04]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "bathroom-cabinet":
      return (
        <>
          <Box args={[0.55, 0.7, 0.32]} position={[0, 0.35, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.02, 0.45, 0.02]} position={[0, 0.35, 0.17]} color="#333" />
        </>
      );

    case "kitchen-counter":
      return (
        <>
          <Box args={[2.0, 0.8, 0.58]} position={[0, 0.4, 0]} color="#8a9098" />
          <Box args={[2.02, 0.06, 0.6]} position={[0, 0.83, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.02, 0.5, 0.02]} position={[-0.6, 0.4, 0.3]} color="#333" />
          <Box args={[0.02, 0.5, 0.02]} position={[0.6, 0.4, 0.3]} color="#333" />
        </>
      );

    case "kitchen-island":
      return (
        <>
          <Box args={[1.6, 0.8, 0.78]} position={[0, 0.4, 0]} color="#7a828a" />
          <Box args={[1.62, 0.06, 0.8]} position={[0, 0.83, 0]} color={color} map={map} pbr={pbr} />
        </>
      );

    case "fridge":
      return (
        <>
          <Box args={[0.7, 1.8, 0.68]} position={[0, 0.9, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.02, 0.7, 0.02]} position={[0.28, 1.25, 0.35]} color="#555" />
          <Box args={[0.02, 0.5, 0.02]} position={[0.28, 0.45, 0.35]} color="#555" />
          <Box args={[0.66, 0.02, 0.02]} position={[0, 0.95, 0.34]} color="#bbb" />
        </>
      );

    case "stove":
      return (
        <>
          <Box args={[0.7, 0.8, 0.62]} position={[0, 0.4, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.68, 0.04, 0.6]} position={[0, 0.82, 0]} color="#222" />
          <Cylinder args={[0.08, 0.08, 0.02, 12]} position={[-0.18, 0.85, -0.12]} color="#444" />
          <Cylinder args={[0.08, 0.08, 0.02, 12]} position={[0.18, 0.85, -0.12]} color="#444" />
          <Cylinder args={[0.08, 0.08, 0.02, 12]} position={[-0.18, 0.85, 0.12]} color="#444" />
          <Cylinder args={[0.08, 0.08, 0.02, 12]} position={[0.18, 0.85, 0.12]} color="#444" />
          <Box args={[0.5, 0.25, 0.02]} position={[0, 0.55, 0.32]} color="#111" />
        </>
      );

    case "kitchen-sink":
      return (
        <>
          <Box args={[0.8, 0.8, 0.52]} position={[0, 0.4, 0]} color="#8a9098" />
          <Box args={[0.82, 0.05, 0.54]} position={[0, 0.82, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.45, 0.12, 0.32]} position={[0, 0.78, 0.02]} color="#b0b8c0" />
          <Cylinder args={[0.015, 0.015, 0.2, 8]} position={[0, 0.95, -0.12]} color="#777" />
          <Box args={[0.14, 0.03, 0.03]} position={[0, 1.04, -0.05]} color="#777" />
        </>
      );

    case "dishwasher":
      return (
        <>
          <Box args={[0.6, 0.85, 0.58]} position={[0, 0.425, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.5, 0.08, 0.02]} position={[0, 0.7, 0.3]} color="#333" />
          <Box args={[0.55, 0.5, 0.02]} position={[0, 0.35, 0.29]} color="#aeb4ba" />
        </>
      );

    case "upper-cabinet":
      return (
        <>
          <Box args={[1.0, 0.7, 0.32]} position={[0, 0.35, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.02, 0.45, 0.02]} position={[-0.2, 0.35, 0.17]} color="#333" />
          <Box args={[0.02, 0.45, 0.02]} position={[0.2, 0.35, 0.17]} color="#333" />
        </>
      );

    case "microwave":
      return (
        <>
          <Box args={[0.5, 0.3, 0.35]} position={[0, 0.15, 0]} color={color} map={map} pbr={pbr} />
          <Box args={[0.32, 0.18, 0.02]} position={[-0.04, 0.15, 0.18]} color="#111" />
          <Box args={[0.08, 0.18, 0.02]} position={[0.18, 0.15, 0.18]} color="#444" />
        </>
      );

    default:
      return <Box args={[0.5, 0.5, 0.5]} position={[0, 0.25, 0]} color={color} map={map} pbr={pbr} />;
  }
}
