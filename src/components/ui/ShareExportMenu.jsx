import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import {
  buildShareUrl,
  copyText,
  downloadDataUrl,
  downloadProjectJson,
  shareNative,
} from "../../utils/roomShare";
import { captureScenePng } from "../../utils/sceneCapture";
import { roomApi } from "../../api/client";

export default function ShareExportMenu() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const projectName = useEditorStore((s) => s.projectName);
  const remoteRoomId = useEditorStore((s) => s.remoteRoomId);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const getProjectDocument = useEditorStore((s) => s.getProjectDocument);
  const loadProject = useEditorStore((s) => s.loadProject);
  const shareStatus = useEditorStore((s) => s.shareStatus);
  const setShareStatus = useEditorStore((s) => s.setShareStatus);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!shareStatus) return;
    const t = setTimeout(() => setShareStatus(null), 2800);
    return () => clearTimeout(t);
  }, [shareStatus, setShareStatus]);

  const flash = (message, isError = false) => {
    setShareStatus({ message, isError });
  };

  const handleSaveCloud = async () => {
    if (!remoteRoomId) {
      flash("No cloud room linked", true);
      return;
    }
    setSaving(true);
    try {
      let thumbnail = null;
      try {
        const { captureRoomThumbnail } = await import(
          "../../utils/roomThumbnail"
        );
        thumbnail = await captureRoomThumbnail(480);
      } catch (err) {
        console.error("Thumbnail capture failed:", err);
      }
      const doc = getProjectDocument();
      await roomApi.update(remoteRoomId, {
        name: doc.name,
        dataJson: doc,
        ...(thumbnail ? { thumbnail } : {}),
      });
      flash(thumbnail ? "Room saved with thumbnail" : "Room saved");
      setOpen(false);
    } catch (err) {
      flash(err.response?.data?.message || "Save failed", true);
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    downloadProjectJson(getProjectDocument());
    flash("Room JSON downloaded");
    setOpen(false);
  };

  const handleExportImage = () => {
    try {
      const dataUrl = captureScenePng();
      const safe = (projectName || "room")
        .replace(/[^\w\-]+/g, "_")
        .slice(0, 48);
      downloadDataUrl(dataUrl, `${safe || "roomvision"}.png`);
      flash("Screenshot downloaded");
      setOpen(false);
    } catch {
      flash("Could not capture screenshot", true);
    }
  };

  const handleCopyLink = async () => {
    try {
      const doc = getProjectDocument();
      const url = await buildShareUrl(doc);
      if (url.length > 15000) {
        flash("Room too large for link — export JSON instead", true);
        return;
      }
      await copyText(url);
      flash("Share link copied");
      setOpen(false);
    } catch {
      flash("Could not create share link", true);
    }
  };

  const handleNativeShare = async () => {
    try {
      const doc = getProjectDocument();
      const url = await buildShareUrl(doc);
      if (url.length > 15000) {
        flash("Room too large for link — export JSON instead", true);
        return;
      }
      const shared = await shareNative({
        title: doc.name || "RoomVision room",
        text: "Check out this room I designed in RoomVision",
        url,
      });
      if (!shared) {
        await copyText(url);
        flash("Share not available — link copied");
      } else {
        flash("Share sheet opened");
      }
      setOpen(false);
    } catch (err) {
      if (err?.name === "AbortError") return;
      flash("Could not share room", true);
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const doc = JSON.parse(text);
      loadProject(doc);
      flash(`Loaded “${doc.name || file.name}”`);
      setOpen(false);
    } catch {
      flash("Invalid room JSON file", true);
    }
  };

  return (
    <div className="share-menu" ref={menuRef}>
      <button
        type="button"
        className="share-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Export & share"
      >
        Export / Share
      </button>

      {open && (
        <div className="share-dropdown" role="menu">
          <label className="share-name-field">
            <span>Room name</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              maxLength={80}
            />
          </label>

          {remoteRoomId && (
            <button
              type="button"
              role="menuitem"
              disabled={saving}
              onClick={handleSaveCloud}
            >
              {saving ? "Saving…" : "Save to cloud"}
            </button>
          )}
          <button type="button" role="menuitem" onClick={handleExportJson}>
            Export JSON
          </button>
          <button type="button" role="menuitem" onClick={handleExportImage}>
            Export image (PNG)
          </button>
          <p className="share-hint">
            For video &amp; camera path, use the Camera &amp; Export panel
          </p>
          <button type="button" role="menuitem" onClick={handleCopyLink}>
            Copy share link
          </button>
          <button type="button" role="menuitem" onClick={handleNativeShare}>
            Share…
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />
        </div>
      )}

      {shareStatus && (
        <div
          className={
            shareStatus.isError ? "share-toast error" : "share-toast"
          }
          role="status"
        >
          {shareStatus.message}
        </div>
      )}
    </div>
  );
}
