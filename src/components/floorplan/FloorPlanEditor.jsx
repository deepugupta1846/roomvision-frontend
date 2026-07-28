import { useCallback, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiEdit3,
  FiCheck,
} from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import FloorPlanCanvas from "./FloorPlanCanvas";
import {
  ROOM_SHAPE_PRESETS,
  dist,
  formatFeetInches,
  snap,
  uniqueVertices,
} from "../../utils/floorPlan";

function ShapeThumb({ points, selected, presetId = "shape" }) {
  const verts = uniqueVertices(points);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of verts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const w = Math.max(maxX - minX, 1);
  const h = Math.max(maxY - minY, 1);
  const pad = 10;
  const vw = 132;
  const vh = 78;
  const scale = Math.min((vw - pad * 2) / w, (vh - pad * 2) / h);
  const ox = (vw - w * scale) / 2 - minX * scale;
  const oy = (vh - h * scale) / 2 - minY * scale;
  const d = verts
    .map((p, i) => {
      const x = p.x * scale + ox;
      const y = p.y * scale + oy;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const closed = `${d} Z`;
  const edges = verts.map((a, i) => {
    const b = verts[(i + 1) % verts.length];
    return {
      mid: {
        x: ((a.x + b.x) / 2) * scale + ox,
        y: ((a.y + b.y) / 2) * scale + oy,
      },
      len: dist(a, b),
    };
  });
  const gridId = `fp-grid-${presetId}`;

  return (
    <svg
      className={selected ? "fp-shape-thumb active" : "fp-shape-thumb"}
      viewBox={`0 0 ${vw} ${vh}`}
      width="100%"
      height={vh}
    >
      <defs>
        <pattern
          id={gridId}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 8 0 L 0 0 0 8"
            fill="none"
            stroke={
              selected ? "rgba(61,139,122,0.25)" : "rgba(255,255,255,0.06)"
            }
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width={vw} height={vh} fill="#1a1c1f" rx="6" />
      <rect width={vw} height={vh} fill={`url(#${gridId})`} rx="6" />
      <path
        d={closed}
        fill={selected ? "rgba(61,139,122,0.18)" : "rgba(61,139,122,0.08)"}
        stroke="#3d8b7a"
        strokeWidth="2"
      />
      {edges.map((e, i) => (
        <text
          key={i}
          x={e.mid.x}
          y={e.mid.y - 2}
          textAnchor="middle"
          fontSize="7"
          fill="#8b919b"
        >
          {formatFeetInches(e.len)}
        </text>
      ))}
    </svg>
  );
}

export default function FloorPlanEditor({
  initialName = "Project 1",
  initialHeight = 10,
  initialPoints = null,
  onBack,
  onSave,
  onCreateRoom,
}) {
  const [name, setName] = useState(initialName);
  const [heightFt, setHeightFt] = useState(initialHeight);
  const [points, setPoints] = useState(initialPoints || []);
  const [drawing, setDrawing] = useState(false);
  const [cursorWorld, setCursorWorld] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const closed =
    points.length >= 4 && dist(points[0], points[points.length - 1]) < 0.05;
  const vertCount = uniqueVertices(points).length;

  const pushHistory = useCallback(
    (next) => {
      setHistory((h) => [...h.slice(-40), points]);
      setFuture([]);
      setPoints(next);
    },
    [points]
  );

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setFuture((f) => [points, ...f]);
    setHistory((h) => h.slice(0, -1));
    setPoints(prev);
    setDrawing(false);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((h) => [...h, points]);
    setFuture((f) => f.slice(1));
    setPoints(next);
    setDrawing(false);
  };

  const startDraw = () => {
    pushHistory([]);
    setDrawing(true);
    setSelectedPreset(null);
    setDragIndex(null);
  };

  const applyPreset = (preset) => {
    pushHistory(preset.points.map((p) => ({ ...p })));
    setSelectedPreset(preset.id);
    setDrawing(false);
  };

  const findVertexIndex = (world, threshold = 0.45) => {
    const verts = uniqueVertices(points);
    for (let i = 0; i < verts.length; i++) {
      if (dist(verts[i], world) <= threshold) return i;
    }
    return -1;
  };

  const onPointerDown = (world) => {
    const snapped = { x: snap(world.x), y: snap(world.y) };

    if (!drawing && closed) {
      const idx = findVertexIndex(snapped);
      if (idx >= 0) {
        setDragIndex(idx);
        return;
      }
    }

    if (!drawing) return;

    if (points.length >= 3 && dist(points[0], snapped) <= 0.75) {
      pushHistory([...points, { x: points[0].x, y: points[0].y }]);
      setDrawing(false);
      setCursorWorld(null);
      return;
    }

    if (!points.length) {
      pushHistory([snapped]);
      return;
    }

    const last = points[points.length - 1];
    if (dist(last, snapped) < 0.25) return;
    pushHistory([...points, snapped]);
  };

  const onPointerMove = (world) => {
    const snapped = { x: snap(world.x), y: snap(world.y) };
    setCursorWorld(snapped);

    if (dragIndex != null) {
      setPoints((prev) => {
        const verts = uniqueVertices(prev);
        verts[dragIndex] = snapped;
        return [...verts, { x: verts[0].x, y: verts[0].y }];
      });
    }
  };

  const onPointerUp = () => {
    if (dragIndex != null) {
      setHistory((h) => [...h.slice(-40), points]);
      setFuture([]);
      setDragIndex(null);
    }
  };

  const canCreate = closed && vertCount >= 3;
  const heightDisplay = useMemo(() => String(heightFt), [heightFt]);

  let statusLabel = "Pick a shape or start drawing";
  if (drawing) statusLabel = "Drawing — click corners, close on first point";
  else if (closed) statusLabel = "Plan ready — drag corners to refine";
  else if (points.length) statusLabel = "Finish the outline to continue";

  return (
    <div className="fp-editor">
      <aside className="fp-sidebar">
        <header className="fp-brand">
          <span className="brand-mark">RV</span>
          <div>
            <strong>RoomVision</strong>
            <small>Floor plan</small>
          </div>
        </header>

        <div className="fp-toolbar">
          <button type="button" className="fp-btn ghost" onClick={onBack}>
            <FiArrowLeft /> Back
          </button>
          <button
            type="button"
            className="fp-btn accent"
            onClick={() => onSave?.({ name, heightFt, points })}
          >
            <FiSave /> Save
          </button>
          <div className="fp-history">
            <button
              type="button"
              className="fp-icon-btn"
              title="Undo"
              onClick={undo}
              disabled={!history.length}
            >
              <FiRotateCcw />
            </button>
            <button
              type="button"
              className="fp-icon-btn"
              title="Redo"
              onClick={redo}
              disabled={!future.length}
            >
              <FiRotateCw />
            </button>
          </div>
        </div>

        <section className="fp-section">
          <h3 className="fp-section-title">Room</h3>
          <label className="fp-field">
            <span>Name</span>
            <div className="fp-input-wrap">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Untitled room"
              />
              <MdEdit className="fp-input-icon" />
            </div>
          </label>

          <div className="fp-field">
            <span>
              Wall height <em>{heightFt} ft</em>
            </span>
            <div className="fp-stepper">
              <button
                type="button"
                onClick={() => setHeightFt((h) => Math.max(6, h - 1))}
                aria-label="Decrease height"
              >
                −
              </button>
              <input
                type="number"
                value={heightDisplay}
                min={6}
                max={20}
                onChange={(e) =>
                  setHeightFt(
                    Math.min(20, Math.max(6, Number(e.target.value) || 8))
                  )
                }
              />
              <button
                type="button"
                onClick={() => setHeightFt((h) => Math.min(20, h + 1))}
                aria-label="Increase height"
              >
                +
              </button>
            </div>
          </div>
        </section>

        <section className="fp-section">
          <h3 className="fp-section-title">Draw</h3>
          <button
            type="button"
            className={drawing ? "fp-btn draw active block" : "fp-btn draw block"}
            onClick={startDraw}
          >
            <FiEdit3 />
            {drawing ? "Drawing…" : "Draw new room"}
          </button>
          {drawing && (
            <p className="fp-hint">
              Click each corner on the grid. Close by clicking the first point.
            </p>
          )}
        </section>

        <section className="fp-section fp-shapes">
          <h3 className="fp-section-title">Presets</h3>
          <div className="fp-shape-list">
            {ROOM_SHAPE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={
                  selectedPreset === preset.id
                    ? "fp-shape-btn active"
                    : "fp-shape-btn"
                }
                onClick={() => applyPreset(preset)}
              >
                <span className="fp-shape-label">{preset.label}</span>
                <ShapeThumb
                  points={preset.points}
                  selected={selectedPreset === preset.id}
                  presetId={preset.id}
                />
              </button>
            ))}
          </div>
        </section>

        <div className="fp-footer">
          <button
            type="button"
            className="fp-btn create block"
            disabled={!canCreate}
            onClick={() =>
              onCreateRoom?.({
                name: name.trim() || "Untitled Room",
                heightFt,
                points: uniqueVertices(points),
              })
            }
          >
            <FiCheck />
            Create room
          </button>
        </div>
      </aside>

      <div className="fp-stage">
        <div className="fp-stage-bar">
          <div className="fp-status">
            <span
              className={
                closed ? "fp-status-dot ready" : drawing ? "fp-status-dot live" : "fp-status-dot"
              }
            />
            <span>{statusLabel}</span>
          </div>
          <div className="fp-meta">
            <span>{vertCount} corners</span>
            <span>{heightFt} ft high</span>
          </div>
        </div>
        <FloorPlanCanvas
          points={points}
          drawing={drawing}
          cursorWorld={cursorWorld}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
    </div>
  );
}
