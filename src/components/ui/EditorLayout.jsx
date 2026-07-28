import { useEffect, useState } from "react";
import { FiPlay, FiLogIn, FiLogOut } from "react-icons/fi";
import Scene from "../canvas/Scene";
import RoomPanel from "./RoomPanel";
import ObjectCatalog from "./ObjectCatalog";
import PropertiesPanel from "./PropertiesPanel";
import TransformToolbar from "./TransformToolbar";
import CameraExportPanel from "./CameraExportPanel";
import SaveRoomButton from "./SaveRoomButton";
import FloorPlanEditor from "../floorplan/FloorPlanEditor";
import MaterialSelectionModal from "../materials/MaterialSelectionModal";
import { useEditorStore } from "../../store/useEditorStore";
import { useEditorHotkeys } from "../../hooks/useEditorHotkeys";
import {
  decodeSharePayload,
  readSharePayloadFromLocation,
} from "../../utils/roomShare";
import { metersToFeet, roomFromFloorPlan } from "../../utils/floorPlan";
import { defaultRoomCamera } from "../../utils/cameraViews";
import { roomApi } from "../../api/client";

export default function EditorLayout({
  projectLoading = false,
  loadLabel = "Loading scene…",
}) {
  useEditorHotkeys();

  const objectCount = useEditorStore((s) => s.objects.length);
  const objects = useEditorStore((s) => s.objects);
  const room = useEditorStore((s) => s.room);
  const transformMode = useEditorStore((s) => s.transformMode);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const enterPreview = useEditorStore((s) => s.enterPreview);
  const exitPreview = useEditorStore((s) => s.exitPreview);
  const isInsideRoom = useEditorStore((s) => s.isInsideRoom);
  const enterRoom = useEditorStore((s) => s.enterRoom);
  const exitRoom = useEditorStore((s) => s.exitRoom);
  const loadProject = useEditorStore((s) => s.loadProject);
  const setShareStatus = useEditorStore((s) => s.setShareStatus);
  const editorPhase = useEditorStore((s) => s.editorPhase);
  const setEditorPhase = useEditorStore((s) => s.setEditorPhase);
  const setRoom = useEditorStore((s) => s.setRoom);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const projectName = useEditorStore((s) => s.projectName);
  const remoteRoomId = useEditorStore((s) => s.remoteRoomId);
  const materialModal = useEditorStore((s) => s.materialModal);
  const closeMaterialModal = useEditorStore((s) => s.closeMaterialModal);
  const openMaterialModal = useEditorStore((s) => s.openMaterialModal);
  const applySurfaceMaterial = useEditorStore((s) => s.applySurfaceMaterial);
  const getProjectDocument = useEditorStore((s) => s.getProjectDocument);

  const [pendingCreate, setPendingCreate] = useState(null);

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

  const persistRoom = async (extraRoom = {}) => {
    if (!remoteRoomId) return;
    const doc = getProjectDocument();
    doc.room = { ...doc.room, ...extraRoom };
    try {
      await roomApi.update(remoteRoomId, {
        name: doc.name,
        dataJson: doc,
      });
    } catch {
      /* save is best-effort during wizard */
    }
  };

  const handleCreateRoom = ({ name, heightFt, points }) => {
    const derived = roomFromFloorPlan(points, heightFt);
    setProjectName(name);
    setRoom({
      ...derived,
      needsFloorPlan: false,
    });
    setPendingCreate({ name, heightFt, points, derived });
    setEditorPhase("edit");
    // Pattern / color step after 3D room is created
    openMaterialModal("floor");
    persistRoom({ needsFloorPlan: false, ...derived });
  };

  const handleMaterialDone = (material) => {
    applySurfaceMaterial(material.surface || "floor", material);
    if (pendingCreate) {
      setPendingCreate(null);
      setEditorPhase("edit");
      persistRoom({ needsFloorPlan: false });
      // Default view: inside room — floor + all walls
      enterRoom();
    }
  };

  const handleMaterialClose = () => {
    closeMaterialModal();
    if (pendingCreate) {
      setPendingCreate(null);
      setEditorPhase("edit");
      persistRoom({ needsFloorPlan: false });
      enterRoom();
    }
  };

  if (editorPhase === "draw" && !projectLoading) {
    const planPoints = room.floorPlan?.points || null;
    const heightFt = room.height
      ? Math.round(metersToFeet(room.height))
      : 10;

    return (
      <>
        <FloorPlanEditor
          initialName={projectName}
          initialHeight={heightFt}
          initialPoints={planPoints}
          onBack={() => {
            window.history.length > 1
              ? window.history.back()
              : (window.location.href = "/dashboard");
          }}
          onSave={({ name, heightFt: h, points }) => {
            setProjectName(name);
            if (points?.length >= 3) {
              const derived = roomFromFloorPlan(points, h);
              setRoom({ ...derived, needsFloorPlan: true });
            } else {
              setRoom({ height: h * 0.3048 });
            }
            persistRoom();
            setShareStatus({ message: "Floor plan saved", isError: false });
          }}
          onCreateRoom={handleCreateRoom}
        />
        <MaterialSelectionModal
          open={!!materialModal?.open}
          surface={materialModal?.surface || "floor"}
          initial={materialModalInitial(materialModal, room, objects)}
          onClose={handleMaterialClose}
          onDone={handleMaterialDone}
        />
      </>
    );
  }

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
          <ObjectCatalog />
          <RoomPanel />
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
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setEditorPhase("draw")}
                title="Edit floor plan"
              >
                Floor plan
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => openMaterialModal("floor")}
                title="Floor pattern & color"
              >
                Floor materials
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  enterRoom();
                  requestAnimationFrame(() => {
                    defaultRoomCamera(useEditorStore.getState().room);
                  });
                }}
                title="Reset camera inside room (floor + walls)"
              >
                Fit room
              </button>
              <button
                type="button"
                className={isInsideRoom ? "preview-btn inside-active" : "ghost-btn"}
                onClick={() => (isInsideRoom ? exitRoom() : enterRoom())}
                title={
                  isInsideRoom
                    ? "Exit room (I) — exterior view"
                    : "Enter room (I) — stay inside and edit objects"
                }
              >
                {isInsideRoom ? (
                  <>
                    <FiLogOut aria-hidden size={14} /> Exit room
                  </>
                ) : (
                  <>
                    <FiLogIn aria-hidden size={14} /> Enter room
                  </>
                )}
              </button>
              <SaveRoomButton />
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
          {isInsideRoom && !isPreviewMode && (
            <div className="inside-room-banner">
              <span className="inside-room-badge">Inside room</span>
              <span className="inside-room-hint">
                Place &amp; customize objects from the catalog
              </span>
              <button type="button" className="ghost-btn" onClick={exitRoom}>
                Exit room
                <kbd>I</kbd>
              </button>
            </div>
          )}
          {isPreviewMode && (
            <div className="preview-overlay">
              <span className="preview-badge">Preview</span>
              <div className="preview-actions">
                <SaveRoomButton />
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
                <kbd>I</kbd> Enter / Exit room
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

      <MaterialSelectionModal
        open={!!materialModal?.open}
        surface={materialModal?.surface || "floor"}
        initial={materialModalInitial(materialModal, room, objects)}
        onClose={handleMaterialClose}
        onDone={handleMaterialDone}
      />
    </div>
  );
}

function modeLabel(mode) {
  if (mode === "rotate") return "Rotate";
  if (mode === "scale") return "Scale";
  return "Move";
}

function materialModalInitial(materialModal, room, objects) {
  if (!materialModal) return undefined;
  if (materialModal.surface === "object") {
    return (
      objects.find((o) => o.id === materialModal.objectId)?.material || undefined
    );
  }
  if (materialModal.surface === "wall") return room.wallMaterial || undefined;
  return room.floorMaterial || undefined;
}
