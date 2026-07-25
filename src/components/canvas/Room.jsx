import { useEffect, useMemo } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { createRoomTextureMap } from "../../utils/proceduralTextures";
import { getRoomTexture } from "../../data/roomTextures";
import { getSurfacePbr } from "../../data/environments";

function useSurfaceMap(textureId, worldU, worldV) {
  const map = useMemo(() => createRoomTextureMap(textureId), [textureId]);

  useEffect(() => {
    if (!map) return undefined;
    const def = getRoomTexture(textureId);
    const [rx, ry] = def.repeat || [1, 1];
    map.repeat.set(Math.max(1, worldU * (rx / 4)), Math.max(1, worldV * (ry / 4)));
    map.needsUpdate = true;
    return () => {
      map.dispose();
    };
  }, [map, textureId, worldU, worldV]);

  return map;
}

/**
 * Parametric room: floor slab + four walls, with textures that reflect the HDRI environment.
 */
export default function Room() {
  const room = useEditorStore((s) => s.room);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const isMediaExporting = useEditorStore((s) => s.isMediaExporting);
  const solidFront = isPreviewMode || isMediaExporting;

  const {
    width,
    depth,
    height,
    floorThickness,
    wallThickness,
    floorColor,
    wallColor,
    floorTexture = "none",
    wallTexture = "none",
    environmentEnabled = true,
    envIntensity = 1,
  } = room;

  const halfW = width / 2;
  const halfD = depth / 2;
  const wallY = floorThickness + height / 2;

  const floorMap = useSurfaceMap(floorTexture, width, depth);
  const wallMapLong = useSurfaceMap(wallTexture, width, height);
  const wallMapShort = useSurfaceMap(wallTexture, depth, height);

  const floorPbr = getSurfacePbr(floorTexture, "floor");
  const wallPbr = getSurfacePbr(wallTexture, "wall");
  const envScale = environmentEnabled
    ? Math.max(0.1, Number(envIntensity) || 1)
    : 0;

  const floorMat = {
    color: floorMap ? "#ffffff" : floorColor,
    map: floorMap || undefined,
    roughness: floorPbr.roughness,
    metalness: floorPbr.metalness,
    envMapIntensity: floorPbr.envMapIntensity * envScale,
  };

  const wallMatBase = {
    color: wallMapLong || wallMapShort ? "#ffffff" : wallColor,
    roughness: wallPbr.roughness,
    metalness: wallPbr.metalness,
    envMapIntensity: wallPbr.envMapIntensity * envScale,
  };

  return (
    <group>
      <mesh position={[0, floorThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, floorThickness, depth]} />
        <meshStandardMaterial {...floorMat} />
      </mesh>

      <mesh
        position={[0, wallY, -halfD - wallThickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial {...wallMatBase} map={wallMapLong || undefined} />
      </mesh>

      <mesh
        position={[0, wallY, halfD + wallThickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial
          {...wallMatBase}
          map={wallMapLong || undefined}
          transparent={!solidFront}
          opacity={solidFront ? 1 : 0.35}
        />
      </mesh>

      <mesh
        position={[-halfW - wallThickness / 2, wallY, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMatBase} map={wallMapShort || undefined} />
      </mesh>

      <mesh
        position={[halfW + wallThickness / 2, wallY, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMatBase} map={wallMapShort || undefined} />
      </mesh>
    </group>
  );
}
