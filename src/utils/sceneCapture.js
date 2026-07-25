import { getCameraApi } from "./cameraBridge";

/**
 * Capture the current WebGL canvas as a PNG data URL.
 * Uses the live R3F camera/gl bridge registered by Scene.
 */
export function captureScenePng() {
  try {
    const { capturePng } = getCameraApi();
    if (typeof capturePng !== "function") {
      throw new Error("Capture is not available");
    }
    return capturePng();
  } catch (err) {
    throw new Error(err?.message || "Scene is not ready to capture");
  }
}
