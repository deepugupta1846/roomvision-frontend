import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EditorLayout from "../components/ui/EditorLayout";
import RoomNameField from "../components/ui/RoomNameField";
import { roomApi } from "../api/client";
import { useEditorStore } from "../store/useEditorStore";

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const loadProject = useEditorStore((s) => s.loadProject);
  const resetEditor = useEditorStore((s) => s.resetEditor);
  const setRemoteRoomId = useEditorStore((s) => s.setRemoteRoomId);
  const exitPreview = useEditorStore((s) => s.exitPreview);
  const setShareStatus = useEditorStore((s) => s.setShareStatus);

  const [projectLoading, setProjectLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setProjectLoading(true);
      setError("");
      try {
        const { data } = await roomApi.get(roomId);
        if (cancelled) return;
        const room = data.data;
        const doc = room.dataJson || {
          name: room.name,
          room: {},
          objects: [],
        };
        if (!doc.name) doc.name = room.name;

        // Always open dashboard rooms in edit mode
        loadProject(doc);
        exitPreview();
        setRemoteRoomId(room.id);
        setShareStatus({
          message: `Editing “${room.name}”`,
          isError: false,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Failed to load room");
      } finally {
        if (!cancelled) setProjectLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      resetEditor();
      setRemoteRoomId(null);
    };
  }, [
    roomId,
    loadProject,
    resetEditor,
    setRemoteRoomId,
    setShareStatus,
    exitPreview,
  ]);

  if (error) {
    return (
      <div className="editor-loading">
        <p className="auth-error">{error}</p>
        <button
          type="button"
          className="auth-submit"
          onClick={() => navigate("/dashboard")}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="editor-page-shell">
      <div className="editor-top-bar">
        <div className="editor-top-bar-left">
          <Link to="/dashboard" className="back-dashboard">
            ← Dashboard
          </Link>
          <span className="editor-top-bar-sep" aria-hidden>
            /
          </span>
          <RoomNameField />
        </div>
        <span className="editor-mode-label">
          {projectLoading ? "Loading…" : "Edit mode"}
        </span>
      </div>
      <EditorLayout
        projectLoading={projectLoading}
        loadLabel="Loading room…"
      />
    </div>
  );
}
