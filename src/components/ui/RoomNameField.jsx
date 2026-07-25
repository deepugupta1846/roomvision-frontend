import { useEffect, useRef, useState } from "react";
import { roomApi } from "../../api/client";
import { useEditorStore } from "../../store/useEditorStore";

/**
 * Inline-editable room title. Commits on Enter/blur and persists to the API.
 */
export default function RoomNameField() {
  const projectName = useEditorStore((s) => s.projectName);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const remoteRoomId = useEditorStore((s) => s.remoteRoomId);
  const [draft, setDraft] = useState(projectName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(projectName);
  }, [projectName]);

  const commit = async () => {
    const next = draft.trim() || "Untitled Room";
    if (next === projectName) {
      setDraft(projectName);
      return;
    }

    setProjectName(next);
    setDraft(next);

    if (!remoteRoomId) return;

    setSaving(true);
    try {
      const doc = useEditorStore.getState().getProjectDocument();
      await roomApi.update(remoteRoomId, {
        name: next,
        dataJson: doc,
      });
      useEditorStore.getState().setShareStatus({
        message: `Renamed to “${next}”`,
        isError: false,
      });
    } catch (err) {
      useEditorStore.getState().setShareStatus({
        message: err.response?.data?.message || "Failed to rename room",
        isError: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className="room-name-field">
      <span className="visually-hidden">Room name</span>
      <input
        ref={inputRef}
        type="text"
        className="room-name-input"
        value={draft}
        disabled={saving}
        maxLength={80}
        spellCheck={false}
        title="Click to edit room name"
        aria-label="Room name"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          void commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setDraft(projectName);
            inputRef.current?.blur();
          }
        }}
      />
    </label>
  );
}
