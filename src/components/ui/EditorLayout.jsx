import { useEffect } from "react";
import { FiPlay } from "react-icons/fi";
import Scene from "../canvas/Scene";
import RoomPanel from "./RoomPanel";
import ObjectCatalog from "./ObjectCatalog";
import PropertiesPanel from "./PropertiesPanel";
import TransformToolbar from "./TransformToolbar";
import ShareExportMenu from "./ShareExportMenu";
import CameraExportPanel from "./CameraExportPanel";
import SaveRoomButton from "./SaveRoomButton";
import { useEditorStore } from "../../store/useEditorStore";
import { useEditorHotkeys } from "../../hooks/useEditorHotkeys";
import {
  decodeSharePayload,
  readSharePayloadFromLocation,
} from "../../utils/roomShare";

export default function EditorLayout({
  projectLoading = false,
  loadLabel = "Loading scene…",
}) {
  useEditorHotkeys();

  const objectCount = useEditorStore((s) => s.objects.length);
  const room = useEditorStore((s) => s.room);
  const transformMode = useEditorStore((s) => s.transformMode);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const enterPreview = useEditorStore((s) => s.enterPreview);
  const exitPreview = useEditorStore((s) => s.exitPreview);
  const loadProject = useEditorStore((s) => s.loadProject);
  const setShareStatus = useEditorStore((s) => s.setShareStatus);

  useEffect(() => {
    const payload = readSharePayloadFromLocation();
    if (!payload) return;

    let cancelled = false;
    (async () => {
      try {
        const doc = await decodeSharePayload(payload);
        if (cancelled) return;
        loadProject(doc);
        useEditorStore.getState().enterPreview();
        setShareStatus({
          message: `Opened shared room “${doc.name || "Untitled"}”`,
          isError: false,
        });
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      } catch {
        if (!cancelled) {
          setShareStatus({
            message: "Could not open shared room link",
            isError: true,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadProject, setShareStatus]);

  return (
    <div className={isPreviewMode ? "editor preview-mode" : "editor"}>
      {!isPreviewMode && (
        <aside className="editor-sidebar left">
          <div className="brand">
            <span className="brand-mark">RV</span>
            <div>
              <strong>RoomVision</strong>
              <small>Interior editor</small>
            </div>
          </div>
          <RoomPanel />
          <ObjectCatalog />
        </aside>
      )}

      <main className="editor-viewport">
        {!isPreviewMode && (
          <div className="viewport-toolbar">
            <TransformToolbar />
            <div className="viewport-meta">
              <span className="mode-pill">{modeLabel(transformMode)}</span>
              <span>
                {room.width.toFixed(1)} × {room.depth.toFixed(1)} ×{" "}
                {room.height.toFixed(1)} m
              </span>
              <span>
                {objectCount} object{objectCount === 1 ? "" : "s"}
              </span>
              <SaveRoomButton />
              {/* <ShareExportMenu /> */}
              <button
                type="button"
                className="preview-btn"
                onClick={enterPreview}
                title="Preview room (P)"
              >
                <FiPlay aria-hidden size={14} />
                Preview
              </button>
            </div>
          </div>
        )}

        <div className="viewport-canvas">
          <Scene projectLoading={projectLoading} loadLabel={loadLabel} />
          {isPreviewMode && (
            <div className="preview-overlay">
              <span className="preview-badge">Preview</span>
              <div className="preview-actions">
                <SaveRoomButton />
                {/* <ShareExportMenu /> */}
                <button
                  type="button"
                  className="preview-exit-btn"
                  onClick={exitPreview}
                  title="Exit preview (Esc)"
                >
                  Exit preview
                  <kbd>Esc</kbd>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {!isPreviewMode && (
        <aside className="editor-sidebar right">
          <PropertiesPanel />
          <CameraExportPanel />
          <section className="panel tips">
            <header className="panel-header">
              <h2>Shortcuts</h2>
            </header>
            <ul className="shortcut-list">
              <li>
                <kbd>1</kbd> Front
              </li>
              <li>
                <kbd>2</kbd> Back
              </li>
              <li>
                <kbd>3</kbd> Left
              </li>
              <li>
                <kbd>4</kbd> Right
              </li>
              <li>
                <kbd>5</kbd> Top
              </li>
              <li>
                <kbd>Ctrl</kbd>+<kbd>S</kbd> Save
              </li>
              <li>
                <kbd>P</kbd> Preview
              </li>
              <li>
                <kbd>W</kbd> Move
              </li>
              <li>
                <kbd>E</kbd> Rotate
              </li>
              <li>
                <kbd>R</kbd> Scale
              </li>
              <li>
                <kbd>Q</kbd> World / Local
              </li>
              <li>
                <kbd>Del</kbd> Delete
              </li>
              <li>
                <kbd>Esc</kbd> Deselect
              </li>
              <li>
                <kbd>Ctrl</kbd>+<kbd>D</kbd> Duplicate
              </li>
              <li>
                <kbd>←↑↓→</kbd> Nudge
              </li>
              <li>
                <kbd>Shift</kbd> Fine nudge
              </li>
              <li>
                <kbd>Alt</kbd>+<kbd>↑↓</kbd> Height
              </li>
            </ul>
          </section>
        </aside>
      )}
    </div>
  );
}

function modeLabel(mode) {
  if (mode === "rotate") return "Rotate";
  if (mode === "scale") return "Scale";
  return "Move";
}
