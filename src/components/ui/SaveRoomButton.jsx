import { useCallback, useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import { roomApi } from "../../api/client";
import { useEditorStore } from "../../store/useEditorStore";
import { captureRoomThumbnail } from "../../utils/roomThumbnail";

export default function SaveRoomButton() {
  const [saving, setSaving] = useState(false);
  const remoteRoomId = useEditorStore((s) => s.remoteRoomId);

  const handleSave = useCallback(async () => {
    const {
      remoteRoomId: id,
      getProjectDocument,
      setShareStatus,
      clearSelection,
    } = useEditorStore.getState();

    if (!id || saving) return;
    setSaving(true);
    clearSelection();

    // Let selection gizmos clear, then force a rendered frame
    await new Promise((r) => requestAnimationFrame(() => r()));
    await new Promise((r) => requestAnimationFrame(() => r()));

    try {
      let thumbnail = null;
      try {
        thumbnail = await captureRoomThumbnail(480);
      } catch (captureErr) {
        console.error("Thumbnail capture failed:", captureErr);
        setShareStatus({
          message: `Saved without thumbnail: ${captureErr.message}`,
          isError: true,
        });
      }

      const doc = getProjectDocument();
      await roomApi.update(id, {
        name: doc.name,
        dataJson: doc,
        ...(thumbnail ? { thumbnail } : {}),
      });

      if (thumbnail) {
        setShareStatus({
          message: "Room saved with thumbnail",
          isError: false,
        });
      }
    } catch (err) {
      setShareStatus({
        message: err.response?.data?.message || "Save failed",
        isError: true,
      });
    } finally {
      setSaving(false);
    }
  }, [saving]);

  useEffect(() => {
    const onSave = () => {
      handleSave();
    };
    window.addEventListener("rv:save-room", onSave);
    return () => window.removeEventListener("rv:save-room", onSave);
  }, [handleSave]);

  if (!remoteRoomId) return null;

  return (
    <button
      type="button"
      className="save-btn"
      onClick={handleSave}
      disabled={saving}
      title="Save room with thumbnail (Ctrl+S)"
    >
      <FiSave aria-hidden size={14} />
      {saving ? "Saving…" : "Save"}
    </button>
  );
}
