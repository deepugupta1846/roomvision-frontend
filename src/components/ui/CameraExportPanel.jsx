import { useRef, useState } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import {
  applyCameraSample,
  captureCurrentImage,
  exportPathImages,
  exportPathVideo,
  getCurrentCameraKeyframe,
  playCameraPath,
  resolvePathKeyframes,
} from "../../utils/cameraExport";

export default function CameraExportPanel() {
  const cancelRef = useRef(null);
  const [busyLabel, setBusyLabel] = useState("");

  const cameraPath = useEditorStore((s) => s.cameraPath);
  const pathDurationSec = useEditorStore((s) => s.pathDurationSec);
  const projectName = useEditorStore((s) => s.projectName);
  const isPathPlaying = useEditorStore((s) => s.isPathPlaying);
  const isMediaExporting = useEditorStore((s) => s.isMediaExporting);
  const mediaExportProgress = useEditorStore((s) => s.mediaExportProgress);

  const addCameraKeyframe = useEditorStore((s) => s.addCameraKeyframe);
  const removeCameraKeyframe = useEditorStore((s) => s.removeCameraKeyframe);
  const clearCameraPath = useEditorStore((s) => s.clearCameraPath);
  const setPathDurationSec = useEditorStore((s) => s.setPathDurationSec);
  const setPathPlaying = useEditorStore((s) => s.setPathPlaying);
  const setMediaExporting = useEditorStore((s) => s.setMediaExporting);
  const setMediaExportProgress = useEditorStore((s) => s.setMediaExportProgress);
  const setShareStatus = useEditorStore((s) => s.setShareStatus);
  const enterPreview = useEditorStore((s) => s.enterPreview);

  const busy = isPathPlaying || isMediaExporting;

  const flash = (message, isError = false) => {
    setShareStatus({ message, isError });
  };

  const handleAddPoint = () => {
    try {
      const kf = getCurrentCameraKeyframe();
      addCameraKeyframe(kf);
      flash(`Camera point ${cameraPath.length + 1} added`);
    } catch {
      flash("Camera not ready", true);
    }
  };

  const handleGoTo = (kf) => {
    try {
      applyCameraSample(kf);
    } catch {
      flash("Could not move camera", true);
    }
  };

  const stopPlayback = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setPathPlaying(false);
    setBusyLabel("");
  };

  const handlePreviewPath = () => {
    if (busy) {
      stopPlayback();
      return;
    }

    try {
      const keyframes = resolvePathKeyframes(useEditorStore.getState());
      setPathPlaying(true);
      setBusyLabel("Playing path…");
      cancelRef.current = playCameraPath({
        keyframes,
        durationMs: pathDurationSec * 1000,
        onDone: () => {
          cancelRef.current = null;
          setPathPlaying(false);
          setBusyLabel("");
          flash("Path preview finished");
        },
      });
    } catch {
      setPathPlaying(false);
      flash("Could not play camera path", true);
    }
  };

  const handleExportImage = () => {
    try {
      const safe = (projectName || "room").replace(/[^\w\-]+/g, "_").slice(0, 48);
      captureCurrentImage(`${safe || "roomvision"}.png`);
      flash("Image exported");
    } catch {
      flash("Could not export image", true);
    }
  };

  const handleExportPathImages = async () => {
    if (busy) return;
    try {
      setMediaExporting(true, 0);
      setBusyLabel("Exporting images…");
      enterPreview();
      await new Promise((r) => requestAnimationFrame(() => r()));

      const keyframes = resolvePathKeyframes(useEditorStore.getState());
      const count = await exportPathImages({
        keyframes,
        projectName,
      });
      flash(`Exported ${count} camera images`);
    } catch {
      flash("Could not export path images", true);
    } finally {
      setMediaExporting(false, 0);
      setBusyLabel("");
    }
  };

  const handleExportVideo = async (format = "mp4") => {
    if (busy) return;
    try {
      setMediaExporting(true, 0);
      setBusyLabel(format === "mp4" ? "Encoding MP4…" : "Recording WebM…");
      enterPreview();
      await new Promise((r) => requestAnimationFrame(() => r()));

      const keyframes = resolvePathKeyframes(useEditorStore.getState());
      const result = await exportPathVideo({
        keyframes,
        durationMs: pathDurationSec * 1000,
        projectName,
        format,
        fps: format === "mp4" ? 24 : 30,
        onProgress: (t) => setMediaExportProgress(t),
        onStatus: (label) => setBusyLabel(label),
      });
      if (result?.__fallbackFromMp4) {
        flash(
          `MP4 not supported here — WebM downloaded instead (${result.__mp4Error})`,
          true
        );
      } else {
        flash(
          format === "mp4" ? "Video exported (MP4)" : "Video exported (WebM)"
        );
      }
    } catch (err) {
      flash(err?.message || "Could not export video", true);
    } finally {
      setMediaExporting(false, 0);
      setBusyLabel("");
    }
  };

  return (
    <section className="panel camera-export-panel">
      <header className="panel-header">
        <h2>Camera &amp; Export</h2>
        <p>Record a path, then export image or video</p>
      </header>

      <div className="field-list">
        <p className="camera-help">
          Orbit to a view, add points, then export along the path. With fewer
          than 2 points, video uses an automatic orbit.
        </p>

        <div className="action-row">
          <button type="button" disabled={busy} onClick={handleAddPoint}>
            Add camera point
          </button>
          <button
            type="button"
            disabled={busy || cameraPath.length === 0}
            onClick={clearCameraPath}
          >
            Clear
          </button>
        </div>

        <div className="camera-points">
          {cameraPath.length === 0 ? (
            <span className="camera-empty">No points — auto orbit will be used</span>
          ) : (
            cameraPath.map((kf, index) => (
              <div key={kf.id} className="camera-point-row">
                <button
                  type="button"
                  className="camera-point-go"
                  disabled={busy}
                  onClick={() => handleGoTo(kf)}
                  title="Go to this camera"
                >
                  Point {index + 1}
                </button>
                <button
                  type="button"
                  className="danger-link"
                  disabled={busy}
                  onClick={() => removeCameraKeyframe(kf.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <label className="field">
          <span>
            Path duration
            <strong>{pathDurationSec}s</strong>
          </span>
          <input
            type="range"
            min={2}
            max={30}
            step={1}
            value={pathDurationSec}
            disabled={busy}
            onChange={(e) => setPathDurationSec(Number(e.target.value))}
          />
        </label>

        <div className="action-row">
          <button type="button" onClick={handlePreviewPath}>
            {isPathPlaying ? "Stop preview" : "Preview path"}
          </button>
        </div>

        <div className="export-media-actions">
          <button type="button" disabled={busy} onClick={handleExportImage}>
            Export image (PNG)
          </button>
          <button type="button" disabled={busy} onClick={handleExportPathImages}>
            Export path images
          </button>
          {/* <button
            type="button"
            className="primary-export"
            disabled={busy}
            onClick={() => handleExportVideo("mp4")}
          >
            Export video (MP4)
          </button> */}
          <button
            type="button"
            className="primary-export"
            disabled={busy}
            onClick={() => handleExportVideo("webm")}
          >
            Export video (WebM)
          </button>
        </div>

        {busy && (
          <div className="export-progress">
            <span>{busyLabel || "Working…"}</span>
            {isMediaExporting && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round(mediaExportProgress * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
