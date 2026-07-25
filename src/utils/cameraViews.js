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

export function setCameraViewAngle(angle, room) {
  const {
    width = 6,
    depth = 5,
    height = 2.8,
    floorThickness = 0.15,
  } = room || {};

  const eyeY = floorThickness + Math.min(height * 0.45, 1.6);
  const lookY = floorThickness + Math.min(height * 0.35, 1.1);
  const margin = 2.8;
  const distZ = depth / 2 + margin;
  const distX = width / 2 + margin;
  const topHeight = Math.max(width, depth) * 0.9 + height;

  const target = { x: 0, y: lookY, z: 0 };
  let position;

  switch (angle) {
    case "front":
      position = { x: 0, y: eyeY, z: distZ };
      break;
    case "back":
      position = { x: 0, y: eyeY, z: -distZ };
      break;
    case "left":
      position = { x: -distX, y: eyeY, z: 0 };
      break;
    case "right":
      position = { x: distX, y: eyeY, z: 0 };
      break;
    case "top":
      position = { x: 0, y: topHeight, z: 0.01 };
      break;
    default:
      return false;
  }

  applyCameraSample({ position, target });

  // Keep orbit controls in sync for subsequent dragging
  try {
    const { controls } = getCameraApi();
    controls?.update?.();
  } catch {
    // camera not ready
  }

  return true;
}
