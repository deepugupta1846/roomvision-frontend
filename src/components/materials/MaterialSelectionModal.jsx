import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiGrid, FiX } from "react-icons/fi";
import { MdOutlineLayers, MdOutlineTerrain } from "react-icons/md";
import { SketchPicker } from "react-color";
import {
  DEFAULT_GROUT,
  TILE_PATTERNS,
  TILE_SWATCHES,
} from "../../data/tilePatterns";
import { drawPatternPreview } from "../../utils/patternTextures";

function PatternCard({ pattern, selected, tileColor, groutColor, onSelect }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawPatternPreview(ctx, 160, pattern, { tileColor, groutColor });
  }, [pattern, tileColor, groutColor]);

  return (
    <button
      type="button"
      className={selected ? "mat-card selected" : "mat-card"}
      onClick={() => onSelect(pattern.id)}
    >
      <span className="mat-card-preview">
        <canvas ref={canvasRef} width={160} height={160} />
        {selected && (
          <span className="mat-card-check" aria-hidden>
            <FiCheck />
          </span>
        )}
      </span>
      <span className="mat-card-label">{pattern.label}</span>
    </button>
  );
}

function PatternsPanel({ value, onChange, tileColor, groutColor }) {
  return (
    <div className="mat-panel">
      <p className="mat-panel-lead">
        Choose how tiles are laid on this surface
      </p>
      <div className="mat-grid">
        {TILE_PATTERNS.map((p) => (
          <PatternCard
            key={p.id}
            pattern={p}
            selected={value === p.id}
            tileColor={tileColor}
            groutColor={groutColor}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function TilesPanel({ value, onChange }) {
  return (
    <div className="mat-panel">
      <p className="mat-panel-lead">Pick a tile or paint color</p>
      <div className="mat-grid tiles">
        {TILE_SWATCHES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={value === t.id ? "mat-card selected" : "mat-card"}
            onClick={() => onChange(t.id)}
          >
            <span className="mat-card-preview">
              <span
                className="mat-tile-swatch"
                style={{ background: t.color }}
              />
              {value === t.id && (
                <span className="mat-card-check" aria-hidden>
                  <FiCheck />
                </span>
              )}
            </span>
            <span className="mat-card-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GroutPanel({ grout, onChange, tileColor, patternId }) {
  const previewRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [hexDraft, setHexDraft] = useState(grout.color.replace("#", ""));

  useEffect(() => {
    setHexDraft(grout.color.replace("#", ""));
  }, [grout.color]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 280;
    const cells = 6;
    const cell = size / cells;
    const line = Math.max(1, grout.size * 2);
    ctx.fillStyle = tileColor;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = grout.color;
    ctx.lineWidth = line;
    const drawV =
      grout.orientation === "vertical" || grout.orientation === "both";
    const drawH =
      grout.orientation === "horizontal" || grout.orientation === "both";
    for (let i = 0; i <= cells; i++) {
      const p = i * cell;
      if (drawV) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, size);
        ctx.stroke();
      }
      if (drawH) {
        ctx.beginPath();
        ctx.moveTo(0, p);
        ctx.lineTo(size, p);
        ctx.stroke();
      }
    }
  }, [grout, tileColor, patternId]);

  const setOrientation = (key) => {
    const hasV =
      grout.orientation === "vertical" || grout.orientation === "both";
    const hasH =
      grout.orientation === "horizontal" || grout.orientation === "both";
    let nextV = hasV;
    let nextH = hasH;
    if (key === "vertical") nextV = !hasV;
    if (key === "horizontal") nextH = !hasH;
    if (!nextV && !nextH) {
      if (key === "vertical") nextV = true;
      else nextH = true;
    }
    let orientation = "both";
    if (nextV && nextH) orientation = "both";
    else if (nextV) orientation = "vertical";
    else orientation = "horizontal";
    onChange({ ...grout, orientation });
  };

  const hasV =
    grout.orientation === "vertical" || grout.orientation === "both";
  const hasH =
    grout.orientation === "horizontal" || grout.orientation === "both";

  return (
    <div className="grout-layout">
      <div className="grout-preview-col">
        <h3 className="mat-section-title">Live preview</h3>
        <div className="grout-preview-box">
          <canvas ref={previewRef} width={280} height={280} />
        </div>
        <p className="grout-preview-hint">
          Updates as you change size, axes, and color
        </p>
      </div>

      <div className="grout-controls-col">
        <h3 className="mat-section-title">Grout lines</h3>
        <div className="grout-orient">
          <button
            type="button"
            className={hasV ? "grout-chip active" : "grout-chip"}
            onClick={() => setOrientation("vertical")}
          >
            Vertical
          </button>
          <button
            type="button"
            className={hasH ? "grout-chip active" : "grout-chip"}
            onClick={() => setOrientation("horizontal")}
          >
            Horizontal
          </button>
        </div>

        <label className="grout-size">
          <span>
            Line size <em>{grout.size}</em>
          </span>
          <input
            type="range"
            min={1}
            max={8}
            value={grout.size}
            onChange={(e) =>
              onChange({
                ...grout,
                size: Math.min(8, Math.max(1, Number(e.target.value) || 1)),
              })
            }
          />
        </label>

        <h3 className="mat-section-title">Color</h3>
        <div className="grout-selected">
          <button
            type="button"
            className="grout-swatch"
            style={{ background: grout.color }}
            onClick={() => setShowPicker((s) => !s)}
            title="Toggle color picker"
          />
          <div className="grout-selected-meta">
            <span>Selected</span>
            <strong>{grout.color.toUpperCase()}</strong>
          </div>
        </div>

        <div className="grout-picker-wrap">
          {showPicker ? (
            <div className="grout-sketch">
              <SketchPicker
                color={grout.color}
                onChangeComplete={(c) =>
                  onChange({ ...grout, color: c.hex.toUpperCase() })
                }
                disableAlpha
              />
            </div>
          ) : (
            <button
              type="button"
              className="grout-sat"
              style={{
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, ${grout.color})
                `,
              }}
              onClick={() => setShowPicker(true)}
              aria-label="Open color picker"
            />
          )}
          <label className="grout-hex">
            Hex
            <span className="grout-hex-field">
              <span>#</span>
              <input
                value={hexDraft}
                maxLength={6}
                onChange={(e) => {
                  const raw = e.target.value
                    .replace(/[^0-9a-fA-F]/g, "")
                    .slice(0, 6);
                  setHexDraft(raw);
                  if (raw.length === 6) {
                    onChange({ ...grout, color: `#${raw}` });
                  }
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "patterns", label: "Patterns", icon: FiGrid },
  { id: "tiles", label: "Tiles", icon: MdOutlineLayers },
  { id: "grout", label: "Grout", icon: MdOutlineTerrain },
];

export default function MaterialSelectionModal({
  open,
  surface = "floor",
  initial,
  onClose,
  onDone,
}) {
  const [tab, setTab] = useState("patterns");
  const [patternId, setPatternId] = useState(initial?.patternId || "single");
  const [tileId, setTileId] = useState(initial?.tileId || "tile-beige");
  const [grout, setGrout] = useState(initial?.grout || { ...DEFAULT_GROUT });

  useEffect(() => {
    if (!open) return;
    setTab("patterns");
    setPatternId(initial?.patternId || "single");
    setTileId(initial?.tileId || "tile-beige");
    setGrout(initial?.grout || { ...DEFAULT_GROUT });
  }, [open, initial]);

  const tile = useMemo(
    () => TILE_SWATCHES.find((t) => t.id === tileId) || TILE_SWATCHES[2],
    [tileId]
  );

  const patternLabel =
    TILE_PATTERNS.find((p) => p.id === patternId)?.label || "Single";

  if (!open) return null;

  const title =
    tab === "grout"
      ? "Grout"
      : tab === "tiles"
        ? "Tiles"
        : "Patterns";

  const handleDone = () => {
    onDone?.({
      surface,
      patternId,
      tileId,
      tileColor: tile.color,
      tileKind: tile.kind,
      grout: { ...grout },
    });
  };

  return (
    <div className="mat-overlay" role="dialog" aria-modal="true">
      <div className="mat-modal">
        <header className="mat-header">
          <div className="mat-header-text">
            <p className="mat-eyebrow">
              {surface === "wall"
                ? "Wall surface"
                : surface === "object"
                  ? "Object surface"
                  : "Floor surface"}
            </p>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="mat-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </header>

        <nav className="mat-tabs" aria-label="Material steps">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? "mat-tab active" : "mat-tab"}
                onClick={() => setTab(t.id)}
              >
                <Icon />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="mat-body">
          {tab === "patterns" && (
            <PatternsPanel
              value={patternId}
              onChange={setPatternId}
              tileColor={tile.color}
              groutColor={grout.color}
            />
          )}
          {tab === "tiles" && (
            <TilesPanel value={tileId} onChange={setTileId} />
          )}
          {tab === "grout" && (
            <GroutPanel
              grout={grout}
              onChange={setGrout}
              tileColor={tile.color}
              patternId={patternId}
            />
          )}
        </div>

        <footer className="mat-footer">
          <div className="mat-summary">
            <span
              className="mat-summary-swatch"
              style={{ background: tile.color }}
            />
            <div>
              <strong>{tile.label}</strong>
              <small>
                {patternLabel} · Grout {grout.color.toUpperCase()}
              </small>
            </div>
          </div>
          <div className="mat-footer-actions">
            <button type="button" className="mat-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="mat-done" onClick={handleDone}>
              <FiCheck /> Apply
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
