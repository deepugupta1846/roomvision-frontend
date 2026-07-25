import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { setCameraViewAngle } from "../utils/cameraViews";

/**
 * Editor keyboard map:
 * 1 / 2 / 3 / 4 / 5 — Front / Back / Left / Right / Top view
 * Ctrl/Cmd + S — Save room (+ thumbnail)
 * P — Toggle preview
 * W — Move (translate)
 * E — Rotate
 * R — Scale / resize
 * Q — Toggle world / local space
 * Delete / Backspace — Delete selected
 * Escape — Exit preview / Deselect
 * Ctrl/Cmd + D — Duplicate
 * Arrow keys — Nudge on XZ (Shift = fine, Alt = Y)
 */
export function useEditorHotkeys() {
  useEffect(() => {
    const isTypingTarget = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const viewByCode = {
      Digit1: "front",
      Numpad1: "front",
      Digit2: "back",
      Numpad2: "back",
      Digit3: "left",
      Numpad3: "left",
      Digit4: "right",
      Numpad4: "right",
      Digit5: "top",
      Numpad5: "top",
    };

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return;

      const store = useEditorStore.getState();
      const key = e.key.toLowerCase();

      // View angles — work in edit and preview
      if (!e.ctrlKey && !e.metaKey && !e.altKey && viewByCode[e.code]) {
        e.preventDefault();
        const angle = viewByCode[e.code];
        try {
          setCameraViewAngle(angle, store.room);
          const label = angle.charAt(0).toUpperCase() + angle.slice(1);
          store.setShareStatus({
            message: `${label} view`,
            isError: false,
          });
        } catch {
          // camera not ready yet
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("rv:save-room"));
        return;
      }

      if (key === "p") {
        e.preventDefault();
        store.togglePreview();
        return;
      }

      if (key === "escape") {
        e.preventDefault();
        if (store.isPreviewMode) {
          store.exitPreview();
        } else {
          store.clearSelection();
        }
        return;
      }

      // Block edit hotkeys while previewing
      if (store.isPreviewMode) return;

      if (key === "w") {
        e.preventDefault();
        store.setTransformMode("translate");
        return;
      }
      if (key === "e") {
        e.preventDefault();
        store.setTransformMode("rotate");
        return;
      }
      if (key === "r") {
        e.preventDefault();
        store.setTransformMode("scale");
        return;
      }
      if (key === "q") {
        e.preventDefault();
        store.toggleTransformSpace();
        return;
      }
      if (
        (key === "delete" || key === "backspace") &&
        store.selectedId
      ) {
        e.preventDefault();
        store.removeObject(store.selectedId);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === "d" && store.selectedId) {
        e.preventDefault();
        store.duplicateObject(store.selectedId);
        return;
      }

      if (!store.selectedId) return;

      const step = e.shiftKey ? 0.05 : 0.25;

      if (e.altKey) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          store.nudgeSelected("y", step);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          store.nudgeSelected("y", -step);
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        store.nudgeSelected("x", -step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        store.nudgeSelected("x", step);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        store.nudgeSelected("z", -step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        store.nudgeSelected("z", step);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
