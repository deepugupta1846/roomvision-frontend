import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dist,
  formatFeetInches,
  edgeLengths,
  polygonBounds,
  snap,
  uniqueVertices,
} from "../../utils/floorPlan";

const PX_PER_FT = 28;
const GRID_FT = 1;

function worldToScreen(p, camera) {
  return {
    x: (p.x - camera.ox) * camera.scale + camera.cx,
    y: (p.y - camera.oy) * camera.scale + camera.cy,
  };
}

function screenToWorld(sx, sy, camera) {
  return {
    x: (sx - camera.cx) / camera.scale + camera.ox,
    y: (sy - camera.cy) / camera.scale + camera.oy,
  };
}

export default function FloorPlanCanvas({
  points,
  drawing,
  cursorWorld,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.max(1, width), h: Math.max(1, height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const camera = useMemo(() => {
    const bounds = polygonBounds(points.length ? points : [{ x: 0, y: 0 }, { x: 10, y: 8 }]);
    const pad = 4;
    const bw = Math.max(bounds.width + pad * 2, 16);
    const bd = Math.max(bounds.depth + pad * 2, 12);
    const scale = Math.min(size.w / bw, size.h / bd, PX_PER_FT * 1.4);
    const ox = bounds.minX - pad + bw / 2;
    const oy = bounds.minY - pad + bd / 2;
    // If empty drawing, center on origin-ish
    const empty = !points.length;
    return {
      scale: empty ? PX_PER_FT : scale,
      cx: size.w / 2,
      cy: size.h / 2,
      ox: empty ? 5 : (bounds.minX + bounds.maxX) / 2,
      oy: empty ? 4 : (bounds.minY + bounds.maxY) / 2,
    };
  }, [points, size]);

  const getLocal = useCallback(
    (e) => {
      const rect = wrapRef.current.getBoundingClientRect();
      return screenToWorld(e.clientX - rect.left, e.clientY - rect.top, camera);
    },
    [camera]
  );

  const handleDown = (e) => {
    e.preventDefault();
    onPointerDown?.(getLocal(e), e);
  };
  const handleMove = (e) => {
    onPointerMove?.(getLocal(e), e);
  };
  const handleUp = (e) => {
    onPointerUp?.(getLocal(e), e);
  };

  const verts = uniqueVertices(points);
  const closed =
    points.length >= 4 &&
    dist(points[0], points[points.length - 1]) < 0.05;
  const edges = closed
    ? edgeLengths(points)
    : points.slice(0, -1).map((a, i) => {
        const b = points[i + 1];
        return {
          a,
          b,
          length: dist(a, b),
          mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        };
      });

  // Live edge while drawing
  const liveEdge =
    drawing && points.length && cursorWorld
      ? {
          a: points[points.length - 1],
          b: cursorWorld,
          length: dist(points[points.length - 1], cursorWorld),
          mid: {
            x: (points[points.length - 1].x + cursorWorld.x) / 2,
            y: (points[points.length - 1].y + cursorWorld.y) / 2,
          },
        }
      : null;

  const gridLines = [];
  const extent = 40;
  for (let i = -extent; i <= extent; i += GRID_FT) {
    const a = worldToScreen({ x: i, y: -extent }, camera);
    const b = worldToScreen({ x: i, y: extent }, camera);
    const major = i % 5 === 0;
    gridLines.push(
      <line
        key={`vx${i}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={
          i === 0
            ? "rgba(61,139,122,0.45)"
            : major
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,255,255,0.035)"
        }
        strokeWidth={i === 0 ? 1.5 : 1}
      />
    );
    const c = worldToScreen({ x: -extent, y: i }, camera);
    const d = worldToScreen({ x: extent, y: i }, camera);
    gridLines.push(
      <line
        key={`hz${i}`}
        x1={c.x}
        y1={c.y}
        x2={d.x}
        y2={d.y}
        stroke={
          i === 0
            ? "rgba(61,139,122,0.45)"
            : major
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,255,255,0.035)"
        }
        strokeWidth={i === 0 ? 1.5 : 1}
      />
    );
  }

  const pathD = points
    .map((p, i) => {
      const s = worldToScreen(p, camera);
      return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
    })
    .join(" ");

  const livePath =
    liveEdge &&
    (() => {
      const a = worldToScreen(liveEdge.a, camera);
      const b = worldToScreen(liveEdge.b, camera);
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    })();

  return (
    <div
      ref={wrapRef}
      className="fp-canvas-wrap"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
    >
      <svg className="fp-canvas" width={size.w} height={size.h}>
        <defs>
          <radialGradient id="fp-vignette" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#242830" />
            <stop offset="100%" stopColor="#15171a" />
          </radialGradient>
          <linearGradient id="fp-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(61,139,122,0.22)" />
            <stop offset="100%" stopColor="rgba(61,139,122,0.06)" />
          </linearGradient>
        </defs>
        <rect width={size.w} height={size.h} fill="url(#fp-vignette)" />
        {gridLines}
        {closed && pathD && (
          <path d={pathD} fill="url(#fp-fill)" stroke="none" />
        )}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#3d8b7a"
            strokeWidth={3.25}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {livePath && (
          <path
            d={livePath}
            fill="none"
            stroke="#4aa390"
            strokeWidth={2.75}
            strokeDasharray="7 5"
            strokeLinecap="round"
            className="fp-live-path"
          />
        )}
        {[...edges, ...(liveEdge ? [liveEdge] : [])].map((edge, i) => {
          if (edge.length < 0.05) return null;
          const mid = worldToScreen(edge.mid, camera);
          const dx = edge.b.x - edge.a.x;
          const dy = edge.b.y - edge.a.y;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          let rot = angle;
          if (rot > 90 || rot < -90) rot += 180;
          return (
            <g key={`lbl${i}`} transform={`translate(${mid.x},${mid.y})`}>
              <text
                transform={`rotate(${rot}) translate(0, -10)`}
                textAnchor="middle"
                className="fp-dim"
              >
                {formatFeetInches(edge.length)}
              </text>
            </g>
          );
        })}
        {verts.map((p, i) => {
          const s = worldToScreen(p, camera);
          const isOrigin = i === 0 && drawing;
          return (
            <g key={`v${i}`}>
              {isOrigin && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={10}
                  fill="none"
                  stroke="rgba(74,163,144,0.55)"
                  strokeWidth={1.5}
                  className="fp-vertex-pulse"
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={5.5}
                fill="#1a1c1f"
                stroke="#4aa390"
                strokeWidth={2}
              />
              <circle cx={s.x} cy={s.y} r={2} fill="#f2f3f5" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { snap, screenToWorld };
