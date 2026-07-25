import { useMemo } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { texturesForSurface } from "../../data/roomTextures";
import { getTexturePreviewDataUrl } from "../../utils/proceduralTextures";
import { environments } from "../../data/environments";

const fields = [
  { key: "width", label: "Width (m)", min: 2, max: 20, step: 0.1 },
  { key: "depth", label: "Depth (m)", min: 2, max: 20, step: 0.1 },
  { key: "height", label: "Wall height (m)", min: 2, max: 5, step: 0.05 },
  {
    key: "floorThickness",
    label: "Floor thickness (m)",
    min: 0.05,
    max: 0.5,
    step: 0.01,
  },
  {
    key: "wallThickness",
    label: "Wall thickness (m)",
    min: 0.05,
    max: 0.4,
    step: 0.01,
  },
];

function TexturePicker({ label, surface, value, onChange, color, onColorChange }) {
  const options = useMemo(() => texturesForSurface(surface), [surface]);
  const previews = useMemo(() => {
    const map = {};
    for (const opt of options) {
      map[opt.id] = getTexturePreviewDataUrl(opt.id);
    }
    return map;
  }, [options]);

  return (
    <div className="texture-picker">
      <div className="texture-picker-header">
        <span>{label} texture</span>
        <label className="field-inline texture-color">
          <span>Color</span>
          <input type="color" value={color} onChange={onColorChange} />
        </label>
      </div>
      <div className="texture-grid">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={
              value === opt.id ? "texture-swatch active" : "texture-swatch"
            }
            title={opt.label}
            onClick={() => onChange(opt.id)}
          >
            {previews[opt.id] ? (
              <img src={previews[opt.id]} alt="" />
            ) : (
              <span className="texture-solid" style={{ background: color }} />
            )}
            <span className="texture-name">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EnvironmentSection({ room, setRoom }) {
  const enabled = room.environmentEnabled === true;

  return (
    <div className="env-section">
      <div className="texture-picker-header">
        <span>Environment</span>
        <label className="env-switch" title="Enable or disable environment">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) =>
              setRoom({ environmentEnabled: e.target.checked })
            }
          />
          <span className="env-switch-track" aria-hidden />
          <span className="env-switch-label">
            {enabled ? "On" : "Off"}
          </span>
        </label>
      </div>
      <p className="env-help">
        Lighting &amp; reflections for floor/wall textures
      </p>

      <div className={enabled ? "env-controls" : "env-controls disabled"}>
        <div className="env-grid">
          {environments.map((env) => (
            <button
              key={env.id}
              type="button"
              disabled={!enabled}
              className={
                (room.environment || "apartment") === env.id
                  ? "env-swatch active"
                  : "env-swatch"
              }
              title={env.description}
              onClick={() => setRoom({ environment: env.id })}
            >
              <span
                className="env-accent"
                style={{ background: env.accent }}
              />
              <span className="env-name">{env.label}</span>
            </button>
          ))}
        </div>

        <label className="field">
          <span>
            Reflection strength
            <strong>{Number(room.envIntensity ?? 1).toFixed(2)}</strong>
          </span>
          <input
            type="range"
            min={0.2}
            max={2.5}
            step={0.05}
            disabled={!enabled}
            value={room.envIntensity ?? 1}
            onChange={(e) =>
              setRoom({ envIntensity: Number(e.target.value) })
            }
          />
        </label>

        <label className="field field-inline env-toggle">
          <span>Show environment background</span>
          <input
            type="checkbox"
            disabled={!enabled}
            checked={room.showEnvBackground !== false}
            onChange={(e) =>
              setRoom({ showEnvBackground: e.target.checked })
            }
          />
        </label>
      </div>
    </div>
  );
}

export default function RoomPanel() {
  const room = useEditorStore((s) => s.room);
  const setRoom = useEditorStore((s) => s.setRoom);

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Room</h2>
        <p>Size, environment, textures</p>
      </header>

      <div className="field-list">
        {fields.map((field) => (
          <label key={field.key} className="field">
            <span>
              {field.label}
              <strong>{Number(room[field.key]).toFixed(2)}</strong>
            </span>
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={room[field.key]}
              onChange={(e) =>
                setRoom({ [field.key]: Number(e.target.value) })
              }
            />
          </label>
        ))}

        <EnvironmentSection room={room} setRoom={setRoom} />

        <TexturePicker
          label="Floor"
          surface="floor"
          value={room.floorTexture || "none"}
          color={room.floorColor}
          onChange={(floorTexture) => setRoom({ floorTexture })}
          onColorChange={(e) => setRoom({ floorColor: e.target.value })}
        />

        <TexturePicker
          label="Wall"
          surface="wall"
          value={room.wallTexture || "none"}
          color={room.wallColor}
          onChange={(wallTexture) => setRoom({ wallTexture })}
          onColorChange={(e) => setRoom({ wallColor: e.target.value })}
        />
      </div>
    </section>
  );
}
