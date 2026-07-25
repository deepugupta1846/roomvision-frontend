import { useEffect, useLayoutEffect, useMemo } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { createRoomTextureMap } from "../../utils/proceduralTextures";
import { getRoomTexture } from "../../data/roomTextures";
import { getSurfacePbr } from "../../data/environments";

function useSurfaceMap(textureId, worldU, worldV) {
  const map = useMemo(() => createRoomTextureMap(textureId), [textureId]);

  // Apply UV repeat before paint so the first frame shows the texture
  useLayoutEffect(() => {
    if (!map) return;
    const def = getRoomTexture(textureId);
    const [rx, ry] = def.repeat || [1, 1];
    map.repeat.set(
      Math.max(1, worldU * (rx / 4)),
      Math.max(1, worldV * (ry / 4))
    );
    map.needsUpdate = true;
  }, [map, textureId, worldU, worldV]);

  // Dispose only when the texture instance changes / unmounts
  useEffect(() => {
    return () => {
      map?.dispose();
    };
  }, [map]);

  return map;
}

function SurfaceMaterial({ map, color, roughness, metalness, envMapIntensity, ...rest }) {
  return (
    <meshStandardMaterial
      color={map ? "#ffffff" : color}
      map={map ?? null}
      roughness={roughness}
      metalness={metalness}
      envMapIntensity={envMapIntensity}
      // Remount when map identity changes so Three always uploads the new map
      key={map?.uuid ?? `solid-${color}`}
      onUpdate={(mat) => {
        mat.needsUpdate = true;
      }}
      {...rest}
    />
  );
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
    environmentEnabled = false,
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

  const floorProps = {
    map: floorMap,
    color: floorColor,
    roughness: floorPbr.roughness,
    metalness: floorPbr.metalness,
    envMapIntensity: floorPbr.envMapIntensity * envScale,
  };

  const wallProps = {
    color: wallColor,
    roughness: wallPbr.roughness,
    metalness: wallPbr.metalness,
    envMapIntensity: wallPbr.envMapIntensity * envScale,
  };

  return (
    <group>
      <mesh position={[0, floorThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, floorThickness, depth]} />
        <SurfaceMaterial {...floorProps} />
      </mesh>

      <mesh
        position={[0, wallY, -halfD - wallThickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <SurfaceMaterial {...wallProps} map={wallMapLong} />
      </mesh>

      <mesh
        position={[0, wallY, halfD + wallThickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <SurfaceMaterial
          {...wallProps}
          map={wallMapLong}
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
        <SurfaceMaterial {...wallProps} map={wallMapShort} />
      </mesh>

      <mesh
        position={[halfW + wallThickness / 2, wallY, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallThickness, height, depth]} />
        <SurfaceMaterial {...wallProps} map={wallMapShort} />
      </mesh>
    </group>
  );
}
