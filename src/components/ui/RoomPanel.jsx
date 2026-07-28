import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useEditorStore } from "../../store/useEditorStore";
import { environments } from "../../data/environments";
import TexturePicker from "./TexturePicker";

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

function CollapseSection({ id, title, summary, open, onToggle, children }) {
  return (
    <div className={open ? "collapse-section open" : "collapse-section"}>
      <button
        type="button"
        className="collapse-header"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="collapse-title">
          <strong>{title}</strong>
          {summary ? <small>{summary}</small> : null}
        </span>
        <FiChevronDown className="collapse-chevron" aria-hidden />
      </button>
      {open && <div className="collapse-body">{children}</div>}
    </div>
  );
}

function EnvironmentSection({ room, setRoom }) {
  const enabled = room.environmentEnabled === true;

  return (
    <div className="env-section nested">
      <div className="texture-picker-header">
        <span>Lighting</span>
        <label className="env-switch" title="Enable or disable environment">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setRoom({ environmentEnabled: e.target.checked })}
          />
          <span className="env-switch-track" aria-hidden />
          <span className="env-switch-label">{enabled ? "On" : "Off"}</span>
        </label>
      </div>
      <p className="env-help">Reflections for floor and wall surfaces</p>

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

function textureSummary(textureId, color) {
  if (textureId === "material") return "Pattern / grout";
  if (!textureId || textureId === "none") return `Solid ${color}`;
  return textureId.replace(/-/g, " ");
}

export default function RoomPanel() {
  const room = useEditorStore((s) => s.room);
  const setRoom = useEditorStore((s) => s.setRoom);
  const openMaterialModal = useEditorStore((s) => s.openMaterialModal);

  const [openSections, setOpenSections] = useState({
    size: true,
    environment: false,
    floor: false,
    wall: false,
  });

  const toggle = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="panel room-panel">
      <header className="panel-header">
        <h2>Room</h2>
        <p>Size &amp; surfaces</p>
      </header>

      <div className="field-list">
        <CollapseSection
          id="size"
          title="Size"
          summary={`${Number(room.width).toFixed(1)} × ${Number(room.depth).toFixed(1)} × ${Number(room.height).toFixed(1)} m`}
          open={openSections.size}
          onToggle={toggle}
        >
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
        </CollapseSection>

        <CollapseSection
          id="environment"
          title="Environment"
          summary={
            room.environmentEnabled
              ? room.environment || "apartment"
              : "Off"
          }
          open={openSections.environment}
          onToggle={toggle}
        >
          <EnvironmentSection room={room} setRoom={setRoom} />
        </CollapseSection>

        <CollapseSection
          id="floor"
          title="Floor texture"
          summary={textureSummary(room.floorTexture, room.floorColor)}
          open={openSections.floor}
          onToggle={toggle}
        >
          <TexturePicker
            label="Floor"
            surface="floor"
            value={room.floorTexture || "none"}
            color={room.floorColor}
            onChange={(floorTexture) => setRoom({ floorTexture })}
            onColorChange={(e) => setRoom({ floorColor: e.target.value })}
          />
          <button
            type="button"
            className="collapse-link-btn"
            onClick={() => openMaterialModal("floor")}
          >
            Open pattern / tiles / grout
          </button>
        </CollapseSection>

        <CollapseSection
          id="wall"
          title="Wall texture"
          summary={textureSummary(room.wallTexture, room.wallColor)}
          open={openSections.wall}
          onToggle={toggle}
        >
          <TexturePicker
            label="Wall"
            surface="wall"
            value={room.wallTexture || "none"}
            color={room.wallColor}
            onChange={(wallTexture) => setRoom({ wallTexture })}
            onColorChange={(e) => setRoom({ wallColor: e.target.value })}
          />
          <button
            type="button"
            className="collapse-link-btn"
            onClick={() => openMaterialModal("wall")}
          >
            Open pattern / tiles / grout
          </button>
        </CollapseSection>
      </div>
    </section>
  );
}
