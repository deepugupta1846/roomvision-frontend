import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import { createRoomTextureMap } from "../../utils/proceduralTextures";
import { paintMaterialCanvas } from "../../utils/patternTextures";
import { getRoomTexture } from "../../data/roomTextures";
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

function useSurfaceMap(textureId, worldU, worldV, material) {
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

  useLayoutEffect(() => {
    if (!map) return;
    if (textureId === "material") {
      map.repeat.set(
        Math.max(1, worldU * 0.5),
        Math.max(1, worldV * 0.5)
      );
      map.needsUpdate = true;
      return;
    }
    const def = getRoomTexture(textureId);
    const [rx, ry] = def?.repeat || [1, 1];
    map.repeat.set(
      Math.max(1, worldU * (rx / 4)),
      Math.max(1, worldV * (ry / 4))
    );
    map.needsUpdate = true;
  }, [map, textureId, worldU, worldV]);

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
      key={map?.uuid ?? `solid-${color}`}
      onUpdate={(mat) => {
        mat.needsUpdate = true;
      }}
      {...rest}
    />
  );
}

/** Signed area in XZ (positive = CCW when viewed from +Y). */
function signedAreaXz(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    area += a.x * b.z - b.x * a.z;
  }
  return area / 2;
}

/** Clean + ensure CCW contour for triangulation. */
function normalizeFootprint(points) {
  if (!points?.length) return [];
  const cleaned = [];
  for (const p of points) {
    const x = Number(p.x);
    const z = Number(p.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
    const prev = cleaned[cleaned.length - 1];
    if (prev && Math.hypot(prev.x - x, prev.z - z) < 1e-4) continue;
    cleaned.push({ x, z });
  }
  if (
    cleaned.length >= 2 &&
    Math.hypot(
      cleaned[0].x - cleaned[cleaned.length - 1].x,
      cleaned[0].z - cleaned[cleaned.length - 1].z
    ) < 1e-4
  ) {
    cleaned.pop();
  }
  if (cleaned.length < 3) return [];
  if (signedAreaXz(cleaned) < 0) cleaned.reverse();
  return cleaned;
}

/**
 * Solid floor slab that fully fills the polygon (no miter expand —
 * expand breaks concave L-shapes and leaves holes).
 */
function buildFloorSlabGeometry(footprint, thickness) {
  const pts = normalizeFootprint(footprint);
  if (pts.length < 3) return null;

  const shapePts = pts.map((p) => new THREE.Vector2(p.x, p.z));
  const faces = THREE.ShapeUtils.triangulateShape(shapePts, []);
  if (!faces?.length) return null;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }
  const spanX = Math.max(1e-6, maxX - minX);
  const spanZ = Math.max(1e-6, maxZ - minZ);

  const topY = thickness;
  const botY = 0;

  // Top face vertices (0..n-1), bottom (n..2n-1)
  for (const p of pts) {
    positions.push(p.x, topY, p.z);
    normals.push(0, 1, 0);
    uvs.push((p.x - minX) / spanX, (p.z - minZ) / spanZ);
  }
  for (const p of pts) {
    positions.push(p.x, botY, p.z);
    normals.push(0, -1, 0);
    uvs.push((p.x - minX) / spanX, (p.z - minZ) / spanZ);
  }

  const n = pts.length;
  for (const tri of faces) {
    const [a, b, c] = tri;
    // Top (CCW from above)
    indices.push(a, b, c);
    // Bottom (flip winding)
    indices.push(n + a, n + c, n + b);
  }

  // Side walls of the slab
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = pts[i];
    const b = pts[j];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    // Outward normal
    const nx = dz / len;
    const nz = -dx / len;

    const base = positions.length / 3;
    positions.push(a.x, botY, a.z, b.x, botY, b.z, b.x, topY, b.z, a.x, topY, a.z);
    for (let k = 0; k < 4; k++) normals.push(nx, 0, nz);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

function PolygonRoom({
  footprint,
  height,
  floorThickness,
  wallThickness,
  floorProps,
  wallProps,
  wallMap,
  solidFront,
}) {
  const floorGeo = useMemo(
    () => buildFloorSlabGeometry(footprint, floorThickness),
    [footprint, floorThickness]
  );

  const walls = useMemo(() => {
    const pts = normalizeFootprint(footprint);
    if (pts.length < 3) return [];
    const n = pts.length;
    const items = [];
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.01) continue;
      const angle = Math.atan2(dz, dx);
      const mx = (a.x + b.x) / 2;
      const mz = (a.z + b.z) / 2;
      // Outward normal — inner face sits on the floor edge
      const nx = dz / len;
      const nz = -dx / len;
      items.push({
        key: `w${i}`,
        position: [
          mx + nx * (wallThickness / 2),
          floorThickness + height / 2,
          mz + nz * (wallThickness / 2),
        ],
        rotation: [0, -angle, 0],
        length: len + wallThickness,
        index: i,
      });
    }
    return items;
  }, [footprint, height, floorThickness, wallThickness]);

  useEffect(() => {
    return () => {
      floorGeo?.dispose();
    };
  }, [floorGeo]);

  if (!floorGeo) return null;

  return (
    <group>
      <mesh
        geometry={floorGeo}
        receiveShadow
        castShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          useEditorStore.getState().openMaterialModal("floor");
        }}
      >
        <SurfaceMaterial {...floorProps} />
      </mesh>
      {walls.map((w, i) => (
        <mesh
          key={w.key}
          position={w.position}
          rotation={w.rotation}
          castShadow
          receiveShadow
          onDoubleClick={(e) => {
            e.stopPropagation();
            useEditorStore.getState().openMaterialModal("wall");
          }}
        >
          <boxGeometry args={[w.length, height, wallThickness]} />
          <SurfaceMaterial
            {...wallProps}
            map={wallMap}
            transparent={!solidFront && i === 0}
            opacity={!solidFront && i === 0 ? 0.35 : 1}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Parametric room: rectangular box or polygon footprint from floor-plan draw.
 */
export default function Room() {
  const room = useEditorStore((s) => s.room);
  const openMaterialModal = useEditorStore((s) => s.openMaterialModal);
  // Always render solid walls so the interior shows floor + all walls
  const solidFront = true;

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
    footprint,
    floorMaterial,
    wallMaterial,
  } = room;

  const halfW = width / 2;
  const halfD = depth / 2;
  const wallY = floorThickness + height / 2;
  const usePolygon = Array.isArray(footprint) && footprint.length >= 3;

  const floorMap = useSurfaceMap(
    floorTexture,
    width + wallThickness * 2,
    depth + wallThickness * 2,
    floorMaterial
  );
  const wallMapLong = useSurfaceMap(
    wallTexture,
    width,
    height,
    wallMaterial
  );
  const wallMapShort = useSurfaceMap(
    wallTexture,
    depth,
    height,
    wallMaterial
  );

  const floorPbr = getSurfacePbr(
    floorTexture === "material" ? "tile-light" : floorTexture,
    "floor"
  );
  const wallPbr = getSurfacePbr(
    wallTexture === "material" ? "tile-light" : wallTexture,
    "wall"
  );
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

  if (usePolygon) {
    return (
      <group>
        <PolygonRoom
          footprint={footprint}
          height={height}
          floorThickness={floorThickness}
          wallThickness={wallThickness}
          floorProps={floorProps}
          wallProps={wallProps}
          wallMap={wallMapLong}
          solidFront={solidFront}
        />
        {/* Invisible floor click target for materials */}
        <mesh
          position={[0, floorThickness + 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onDoubleClick={(e) => {
            e.stopPropagation();
            openMaterialModal("floor");
          }}
        >
          <planeGeometry
            args={[width + wallThickness * 2 + 0.5, depth + wallThickness * 2 + 0.5]}
          />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh
        position={[0, floorThickness / 2, 0]}
        receiveShadow
        castShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          openMaterialModal("floor");
        }}
      >
        {/* Extend under walls so floor fully covers the room */}
        <boxGeometry
          args={[
            width + wallThickness * 2,
            floorThickness,
            depth + wallThickness * 2,
          ]}
        />
        <SurfaceMaterial {...floorProps} />
      </mesh>

      <mesh
        position={[0, wallY, -halfD - wallThickness / 2]}
        castShadow
        receiveShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          openMaterialModal("wall");
        }}
      >
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <SurfaceMaterial {...wallProps} map={wallMapLong} />
      </mesh>

      <mesh
        position={[0, wallY, halfD + wallThickness / 2]}
        castShadow
        receiveShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          openMaterialModal("wall");
        }}
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
        onDoubleClick={(e) => {
          e.stopPropagation();
          openMaterialModal("wall");
        }}
      >
        <boxGeometry
          args={[wallThickness, height, depth + wallThickness * 2]}
        />
        <SurfaceMaterial {...wallProps} map={wallMapShort} />
      </mesh>

      <mesh
        position={[halfW + wallThickness / 2, wallY, 0]}
        castShadow
        receiveShadow
        onDoubleClick={(e) => {
          e.stopPropagation();
          openMaterialModal("wall");
        }}
      >
        <boxGeometry
          args={[wallThickness, height, depth + wallThickness * 2]}
        />
        <SurfaceMaterial {...wallProps} map={wallMapShort} />
      </mesh>
    </group>
  );
}
