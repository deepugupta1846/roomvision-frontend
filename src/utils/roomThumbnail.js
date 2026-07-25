import { captureScenePng } from "./sceneCapture";

/**
 * Capture the current WebGL view as a compressed JPEG data URL for thumbnails.
 */
export async function captureRoomThumbnail(maxWidth = 480) {
  const full = captureScenePng();
  if (!full || typeof full !== "string" || !full.startsWith("data:image")) {
    throw new Error("Invalid canvas capture");
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.fillStyle = "#1a1c1f";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        if (!dataUrl || dataUrl.length < 32) {
          reject(new Error("Empty thumbnail"));
          return;
        }
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Could not decode scene image"));
    img.src = full;
  });
}
