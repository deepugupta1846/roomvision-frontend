import { applyCameraSample } from "./cameraExport";
import { getCameraApi } from "./cameraBridge";

/**
 * Orthographic-style view presets for the room.
 * Front looks from +Z (open wall side), back from -Z, left -X, right +X.
 */
export const VIEW_ANGLES = {
  front: { key: "1", label: "Front" },
  back: { key: "2", label: "Back" },
  left: { key: "3", label: "Left" },
  right: { key: "4", label: "Right" },
  top: { key: "5", label: "Top" },
};

/** Bounding box of the room in world space (includes wall thickness). */
export function getRoomExtents(room) {
  const {
    width = 6,
    depth = 5,
    height = 2.8,
    floorThickness = 0.15,
    wallThickness = 0.12,
    footprint,
  } = room || {};

  let minX = -width / 2;
  let maxX = width / 2;
  let minZ = -depth / 2;
  let maxZ = depth / 2;

  if (Array.isArray(footprint) && footprint.length >= 3) {
    minX = Infinity;
    maxX = -Infinity;
    minZ = Infinity;
    maxZ = -Infinity;
    for (const p of footprint) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z);
      maxZ = Math.max(maxZ, p.z);
    }
  }

  const pad = wallThickness;
  return {
    minX: minX - pad,
    maxX: maxX + pad,
    minZ: minZ - pad,
    maxZ: maxZ + pad,
    minY: 0,
    maxY: floorThickness + height,
    width: maxX - minX + pad * 2,
    depth: maxZ - minZ + pad * 2,
    height: floorThickness + height,
    cx: (minX + maxX) / 2,
    cy: (floorThickness + height) * 0.35,
    cz: (minZ + maxZ) / 2,
  };
}

function applyOrbitLimits({
  minDistance = 0.5,
  maxDistance = 80,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI,
} = {}) {
  try {
    const { controls } = getCameraApi();
    if (!controls) return;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.minPolarAngle = minPolarAngle;
    controls.maxPolarAngle = maxPolarAngle;
    controls.enablePan = true;
    controls.update?.();
  } catch {
    // camera not ready
  }
}

/**
 * Elevated 3/4 exterior view that shows the whole floor and all walls.
 */
export function fitRoomCamera(room) {
  const ext = getRoomExtents(room);
  const span = Math.max(ext.width, ext.depth, ext.height);
  // Pull back enough that the full box fits in a ~45–50° FOV
  const dist = span * 1.35 + 2.5;

  const position = {
    x: ext.cx + dist * 0.72,
    y: ext.height * 0.95 + dist * 0.45,
    z: ext.cz + dist * 0.78,
  };
  const target = {
    x: ext.cx,
    y: ext.height * 0.28,
    z: ext.cz,
  };

  applyCameraSample({ position, target });
  applyOrbitLimits({
    minDistance: 0.8,
    maxDistance: Math.max(80, span * 6),
    minPolarAngle: 0.05,
    maxPolarAngle: Math.PI * 0.49,
  });

  return true;
}

export function setCameraViewAngle(angle, room) {
  const ext = getRoomExtents(room);
  const margin = Math.max(ext.width, ext.depth) * 0.35 + 2.2;
  const eyeY = Math.max(ext.height * 0.55, 1.8);
  const lookY = ext.height * 0.35;

  const target = { x: ext.cx, y: lookY, z: ext.cz };
  let position;

  switch (angle) {
    case "front":
      position = { x: ext.cx, y: eyeY, z: ext.maxZ + margin };
      break;
    case "back":
      position = { x: ext.cx, y: eyeY, z: ext.minZ - margin };
      break;
    case "left":
      position = { x: ext.minX - margin, y: eyeY, z: ext.cz };
      break;
    case "right":
      position = { x: ext.maxX + margin, y: eyeY, z: ext.cz };
      break;
    case "top":
      position = {
        x: ext.cx,
        y: Math.max(ext.width, ext.depth) * 1.15 + ext.height,
        z: ext.cz + 0.01,
      };
      break;
    default:
      return false;
  }

  applyCameraSample({ position, target });
  applyOrbitLimits({
    minDistance: 0.8,
    maxDistance: Math.max(80, Math.max(ext.width, ext.depth) * 6),
    maxPolarAngle: Math.PI * 0.49,
  });

  return true;
}

/**
 * Default inside vantage — elevated near center so floor and surrounding
 * walls fill the frame (solid interior view).
 */
export function enterInsideCamera(room) {
  const ext = getRoomExtents(room);
  const floorY = room?.floorThickness ?? 0.15;
  const wallH = Math.max(0.5, (room?.height ?? 2.8));
  const eyeY = floorY + Math.min(Math.max(wallH * 0.48, 1.45), wallH - 0.3);

  // Stand inset from one corner, look across room toward opposite walls + floor
  const insetX = Math.min(ext.width, ext.depth) * 0.22;
  const insetZ = Math.min(ext.width, ext.depth) * 0.22;
  const position = {
    x: ext.minX + insetX,
    y: eyeY,
    z: ext.minZ + insetZ,
  };
  const target = {
    x: ext.cx + ext.width * 0.08,
    y: floorY + 0.05,
    z: ext.cz + ext.depth * 0.08,
  };

  applyCameraSample({ position, target });

  const span = Math.max(ext.width, ext.depth);
  applyOrbitLimits({
    minDistance: 0.35,
    maxDistance: span * 0.95,
    minPolarAngle: 0.12,
    maxPolarAngle: Math.PI * 0.48,
  });

  return true;
}

/** Alias used as the default editor framing. */
export function defaultRoomCamera(room) {
  return enterInsideCamera(room);
}

/** Restore exterior framing that shows the whole room from outside. */
export function exitOutsideCamera(room) {
  return fitRoomCamera(room);
}
