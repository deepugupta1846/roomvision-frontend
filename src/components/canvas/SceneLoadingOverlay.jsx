/**
 * Polished overlay for 3D canvas / project loading.
 */
export default function SceneLoadingOverlay({
  forceVisible = false,
  label = "Loading scene…",
  progress = 0,
}) {
  if (!forceVisible) return null;

  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="scene-loader" role="status" aria-live="polite">
      <div className="scene-loader-backdrop" />
      <div className="scene-loader-card">
        <div className="scene-loader-orbit" aria-hidden>
          <span className="scene-loader-ring" />
          <span className="scene-loader-ring scene-loader-ring-delay" />
          <span className="scene-loader-core">RV</span>
        </div>
        <p className="scene-loader-label">{label}</p>
        <div className="scene-loader-track">
          <div
            className="scene-loader-fill"
            style={{ width: `${Math.max(8, pct)}%` }}
          />
        </div>
        <span className="scene-loader-pct">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
