import { useEditorStore } from "../../store/useEditorStore";

const tools = [
  { id: "translate", label: "Move", shortcut: "W" },
  { id: "rotate", label: "Rotate", shortcut: "E" },
  { id: "scale", label: "Scale", shortcut: "R" },
];

export default function TransformToolbar() {
  const transformMode = useEditorStore((s) => s.transformMode);
  const transformSpace = useEditorStore((s) => s.transformSpace);
  const setTransformMode = useEditorStore((s) => s.setTransformMode);
  const toggleTransformSpace = useEditorStore((s) => s.toggleTransformSpace);
  const selectedId = useEditorStore((s) => s.selectedId);

  return (
    <div className="transform-toolbar" role="toolbar" aria-label="Transform tools">
      <div className="tool-group">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={
              transformMode === tool.id ? "tool-btn active" : "tool-btn"
            }
            title={`${tool.label} (${tool.shortcut})`}
            aria-pressed={transformMode === tool.id}
            disabled={!selectedId}
            onClick={() => setTransformMode(tool.id)}
          >
            <ToolIcon mode={tool.id} />
            <span className="tool-label">{tool.label}</span>
            <kbd>{tool.shortcut}</kbd>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="tool-btn space-btn"
        title="Toggle world / local space (Q)"
        disabled={!selectedId}
        onClick={toggleTransformSpace}
      >
        <span className="tool-label">
          {transformSpace === "world" ? "World" : "Local"}
        </span>
        <kbd>Q</kbd>
      </button>
    </div>
  );
}

function ToolIcon({ mode }) {
  if (mode === "translate") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path
          fill="currentColor"
          d="M13 4v7h7v2h-7v7h-2v-7H4v-2h7V4h2zm-1 9.5L15.5 17 14 18.5 12 16.5 10 18.5 8.5 17 12 13.5zm0-3L8.5 7 10 5.5 12 7.5 14 5.5 15.5 7 12 10.5z"
        />
      </svg>
    );
  }
  if (mode === "rotate") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path
          fill="currentColor"
          d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 0 1-8.66 3.54l-1.42 1.42A7 7 0 0 0 19 13c0-3.87-3.13-7-7-7z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M9 3H3v6h2V5h4V3zm12 0h-6v2h4v4h2V3zM5 19v-4H3v6h6v-2H5zm16-4v4h-4v2h6v-6h-2z"
      />
    </svg>
  );
}
