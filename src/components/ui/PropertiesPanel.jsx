import { useEditorStore } from "../../store/useEditorStore";

export default function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const objects = useEditorStore((s) => s.objects);
  const updateObject = useEditorStore((s) => s.updateObject);
  const removeObject = useEditorStore((s) => s.removeObject);
  const duplicateObject = useEditorStore((s) => s.duplicateObject);

  const selected = objects.find((o) => o.id === selectedId);

  if (!selected) {
    return (
      <section className="panel">
        <header className="panel-header">
          <h2>Properties</h2>
          <p>Select an object in the scene</p>
        </header>
      </section>
    );
  }

  const setAxis = (key, axis, value) => {
    updateObject(selected.id, {
      [key]: { ...selected[key], [axis]: Number(value) },
    });
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{selected.label}</h2>
        <p>{selected.category}</p>
      </header>

      <div className="field-list">
        <label className="field field-inline">
          <span>Color</span>
          <input
            type="color"
            value={selected.color}
            onChange={(e) => updateObject(selected.id, { color: e.target.value })}
          />
        </label>

        {["position", "rotation", "scale"].map((key) => (
          <div key={key} className="axis-group">
            <span className="axis-label">{key}</span>
            {["x", "y", "z"].map((axis) => (
              <label key={axis} className="axis-field">
                <span>{axis}</span>
                <input
                  type="number"
                  step={key === "rotation" ? 0.1 : 0.05}
                  value={Number(selected[key][axis].toFixed(3))}
                  onChange={(e) => setAxis(key, axis, e.target.value)}
                />
              </label>
            ))}
          </div>
        ))}

        <div className="action-row">
          <button type="button" onClick={() => duplicateObject(selected.id)}>
            Duplicate
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => removeObject(selected.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}
