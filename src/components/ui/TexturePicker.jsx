import { useMemo } from "react";
import { texturesForSurface } from "../../data/roomTextures";
import { getTexturePreviewDataUrl } from "../../utils/proceduralTextures";

export default function TexturePicker({
  label,
  surface,
  value,
  onChange,
  color,
  onColorChange,
}) {
  const options = useMemo(() => texturesForSurface(surface), [surface]);
  const previews = useMemo(() => {
    const map = {};
    for (const opt of options) {
      map[opt.id] = getTexturePreviewDataUrl(opt.id);
    }
    return map;
  }, [options]);

  const activeValue = value === "material" ? "none" : value;

  return (
    <div className="texture-picker">
      <div className="texture-picker-header">
        <span>{label}</span>
        <label className="field-inline texture-color">
          <span>Color</span>
          <input type="color" value={color} onChange={onColorChange} />
        </label>
      </div>
      {value === "material" && (
        <p className="env-help">
          Using pattern / tile / grout from material picker
        </p>
      )}
      <div className="texture-grid">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={
              activeValue === opt.id ? "texture-swatch active" : "texture-swatch"
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
