import * as THREE from "three";
import { downloadDataUrl } from "./roomShare";
import { getCameraApi } from "./cameraBridge";

export function buildDefaultOrbitPath(room, segments = 8) {
  const radius = Math.max(room.width, room.depth) * 0.85 + 3.5;
  const height = Math.min(Math.max(room.height * 0.75, 2.2), 4.5);
  const target = {
    x: 0,
    y: room.floorThickness + Math.min(room.height * 0.35, 1.2),
    z: 0,
  };

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push({
      id: `orbit-${i}`,
      position: {
        x: Math.cos(a) * radius,
        y: height,
        z: Math.sin(a) * radius,
      },
      target: { ...target },
    });
  }
  return points;
}

export function resolvePathKeyframes(storeState) {
  const { cameraPath, room } = storeState;
  if (cameraPath.length >= 2) return cameraPath;
  return buildDefaultOrbitPath(room);
}

function samplePath(keyframes, t) {
  if (keyframes.length === 1) {
    return {
      position: { ...keyframes[0].position },
      target: { ...keyframes[0].target },
    };
  }

  const clamped = Math.min(Math.max(t, 0), 1);
  const seg = clamped * (keyframes.length - 1);
  const i = Math.min(Math.floor(seg), keyframes.length - 2);
  const localT = seg - i;
  const a = keyframes[i];
  const b = keyframes[i + 1];
  const ease = localT * localT * (3 - 2 * localT); // smoothstep

  return {
    position: {
      x: a.position.x + (b.position.x - a.position.x) * ease,
      y: a.position.y + (b.position.y - a.position.y) * ease,
      z: a.position.z + (b.position.z - a.position.z) * ease,
    },
    target: {
      x: a.target.x + (b.target.x - a.target.x) * ease,
      y: a.target.y + (b.target.y - a.target.y) * ease,
      z: a.target.z + (b.target.z - a.target.z) * ease,
    },
  };
}

export function applyCameraSample(sample) {
  const { camera, controls } = getCameraApi();
  camera.position.set(sample.position.x, sample.position.y, sample.position.z);
  if (controls) {
    controls.target.set(sample.target.x, sample.target.y, sample.target.z);
    controls.update();
  } else {
    camera.lookAt(sample.target.x, sample.target.y, sample.target.z);
  }
  camera.updateProjectionMatrix();
}

/**
 * Animate camera along path. Returns a cancel function.
 * onProgress(t 0..1), onDone()
 */
export function playCameraPath({
  keyframes,
  durationMs,
  onProgress,
  onDone,
}) {
  let cancelled = false;
  let raf = 0;
  const start = performance.now();

  const tick = (now) => {
    if (cancelled) return;
    const t = Math.min((now - start) / durationMs, 1);
    const sample = samplePath(keyframes, t);
    applyCameraSample(sample);
    onProgress?.(t, sample);

    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  };

  raf = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

export function captureCurrentImage(filename) {
  const { capturePng } = getCameraApi();
  const dataUrl = capturePng();
  downloadDataUrl(dataUrl, filename);
  return dataUrl;
}

export async function exportPathImages({
  keyframes,
  projectName,
  includeInBetween = false,
  steps = 0,
}) {
  const safe = (projectName || "room").replace(/[^\w\-]+/g, "_").slice(0, 40);
  const { capturePng } = getCameraApi();
  const samples = [];

  if (includeInBetween && steps > 0) {
    for (let i = 0; i <= steps; i++) {
      samples.push(samplePath(keyframes, i / steps));
    }
  } else {
    for (const kf of keyframes) {
      samples.push({ position: kf.position, target: kf.target });
    }
  }

  for (let i = 0; i < samples.length; i++) {
    applyCameraSample(samples[i]);
    // Allow one frame to settle
    await new Promise((r) => requestAnimationFrame(() => r()));
    const dataUrl = capturePng();
    downloadDataUrl(
      dataUrl,
      `${safe || "roomvision"}_cam_${String(i + 1).padStart(2, "0")}.png`
    );
    // Stagger downloads slightly
    await new Promise((r) => setTimeout(r, 120));
  }

  return samples.length;
}

function pickRecorderMimeType() {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const type of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function evenSize(n) {
  const v = Math.max(2, Math.round(n));
  return v % 2 === 0 ? v : v - 1;
}

/**
 * Fast MP4 via WebCodecs (hardware encode when available) + mp4-muxer.
 * Much faster than ffmpeg.wasm re-encode.
 */
async function exportMp4WebCodecs({
  keyframes,
  durationMs,
  projectName,
  fps = 30,
  onProgress,
  onStatus,
}) {
  if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") {
    throw new Error("WebCodecs not supported");
  }

  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const { gl, scene, camera, setControlsEnabled } = getCameraApi();
  const canvas = gl.domElement;

  // Cap resolution for speed / smaller files
  const maxW = 1280;
  let width = canvas.width || 1280;
  let height = canvas.height || 720;
  if (width > maxW) {
    height = (height * maxW) / width;
    width = maxW;
  }
  width = evenSize(width);
  height = evenSize(height);

  const drawCanvas = document.createElement("canvas");
  drawCanvas.width = width;
  drawCanvas.height = height;
  const ctx = drawCanvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not create encode canvas");

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: "avc",
      width,
      height,
    },
    fastStart: "in-memory",
  });

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error("VideoEncoder error:", e),
  });

  const codecCandidates = [
    "avc1.42001f", // Baseline
    "avc1.4d001f", // Main
    "avc1.64001f", // High
  ];

  let configured = false;
  for (const codec of codecCandidates) {
    const config = {
      codec,
      width,
      height,
      bitrate: 3_500_000,
      framerate: fps,
      latencyMode: "realtime",
      hardwareAcceleration: "prefer-hardware",
      avc: { format: "avc" },
    };
    try {
      const check = await VideoEncoder.isConfigSupported(config);
      if (check.supported) {
        encoder.configure(config);
        configured = true;
        break;
      }
    } catch {
      // try next
    }
  }

  if (!configured) {
    encoder.close();
    throw new Error("H.264 encoding is not supported in this browser");
  }

  const totalFrames = Math.max(2, Math.round((durationMs / 1000) * fps));
  const frameDuration = Math.round(1_000_000 / fps);

  setControlsEnabled?.(false);
  onStatus?.("Encoding MP4…");

  try {
    for (let i = 0; i < totalFrames; i++) {
      const t = i / (totalFrames - 1);
      applyCameraSample(samplePath(keyframes, t));
      gl.render(scene, camera);

      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0, width, height);

      const timestamp = i * frameDuration;
      const frame = new VideoFrame(drawCanvas, {
        timestamp,
        duration: frameDuration,
      });

      // Keep encode queue small so we don't stall
      while (encoder.encodeQueueSize > 6) {
        await new Promise((r) => setTimeout(r, 4));
      }

      encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 || i === 0 });
      frame.close();

      onProgress?.(i / (totalFrames - 1));

      // Yield occasionally so UI stays responsive
      if (i % 3 === 0) {
        await new Promise((r) => requestAnimationFrame(() => r()));
      }
    }

    await encoder.flush();
  } finally {
    try {
      encoder.close();
    } catch {
      // already closed
    }
    setControlsEnabled?.(true);
  }

  muxer.finalize();
  const buffer = target.buffer;
  if (!buffer || buffer.byteLength < 32) {
    throw new Error("MP4 encode produced an empty file");
  }

  const blob = new Blob([buffer], { type: "video/mp4" });
  const safe = (projectName || "room").replace(/[^\w\-]+/g, "_").slice(0, 48);
  downloadBlob(blob, `${safe || "roomvision"}_tour.mp4`);
  onProgress?.(1);
  return blob;
}

/**
 * Record canvas while playing camera path (WebM via MediaRecorder).
 */
async function exportWebmMediaRecorder({
  keyframes,
  durationMs,
  projectName,
  fps = 30,
  onProgress,
  onStatus,
}) {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Video recording is not supported in this browser");
  }

  const { gl, setControlsEnabled } = getCameraApi();
  const canvas = gl.domElement;
  const stream = canvas.captureStream(fps);
  const mimeType = pickRecorderMimeType();
  if (!mimeType) {
    throw new Error("Video recording is not supported in this browser");
  }

  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Recording failed"));
  });

  setControlsEnabled?.(false);
  onStatus?.("Recording WebM…");
  recorder.start(100);

  try {
    await new Promise((resolve) => {
      playCameraPath({
        keyframes,
        durationMs,
        onProgress: (t) => onProgress?.(t),
        onDone: resolve,
      });
    });
    await new Promise((r) => setTimeout(r, 200));
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
  }

  await stopped;
  setControlsEnabled?.(true);
  stream.getTracks().forEach((t) => t.stop());

  const blob = new Blob(chunks, { type: mimeType || "video/webm" });
  if (!blob.size) throw new Error("Recorded video was empty");

  const safe = (projectName || "room").replace(/[^\w\-]+/g, "_").slice(0, 48);
  downloadBlob(blob, `${safe || "roomvision"}_tour.webm`);
  onProgress?.(1);
  return blob;
}

/**
 * Export camera-path video.
 * MP4 uses fast WebCodecs encode (no ffmpeg.wasm).
 * WebM uses MediaRecorder.
 */
export async function exportPathVideo({
  keyframes,
  durationMs,
  projectName,
  fps = 30,
  format = "mp4",
  onProgress,
  onStatus,
}) {
  if (format === "mp4") {
    try {
      return await exportMp4WebCodecs({
        keyframes,
        durationMs,
        projectName,
        fps,
        onProgress,
        onStatus,
      });
    } catch (err) {
      console.warn("Fast MP4 encode failed, falling back to WebM:", err);
      onStatus?.("MP4 unavailable — exporting WebM…");
      const blob = await exportWebmMediaRecorder({
        keyframes,
        durationMs,
        projectName,
        fps,
        onProgress,
        onStatus,
      });
      // Return webm but signal via property for UI messaging
      blob.__fallbackFromMp4 = true;
      blob.__mp4Error = err?.message || "encode failed";
      return blob;
    }
  }

  return exportWebmMediaRecorder({
    keyframes,
    durationMs,
    projectName,
    fps,
    onProgress,
    onStatus,
  });
}

export function getCurrentCameraKeyframe() {
  const { camera, controls } = getCameraApi();
  const target = controls?.target ?? new THREE.Vector3(0, 0, 0);
  return {
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    target: {
      x: target.x,
      y: target.y,
      z: target.z,
    },
  };
}
