import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  GizmoHelper,
  GizmoViewport,
  ContactShadows,
  useProgress,
} from "@react-three/drei";

import Room from "./Room";
import Light from "./Light";
import PlacedObject from "./PlacedObject";
import SceneLoadingOverlay from "./SceneLoadingOverlay";
import { useEditorStore } from "../../store/useEditorStore";
import { registerCameraApi } from "../../utils/cameraBridge";

function CameraBridge({ controlsRef }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    return registerCameraApi({
      gl,
      scene,
      camera,
      get controls() {
        return controlsRef.current;
      },
      setControlsEnabled(enabled) {
        if (controlsRef.current) controlsRef.current.enabled = enabled;
      },
      capturePng() {
        const prev = gl.getRenderTarget();
        gl.setRenderTarget(null);
        gl.render(scene, camera);
        const dataUrl = gl.domElement.toDataURL("image/png");
        gl.setRenderTarget(prev);
        return dataUrl;
      },
    });
  }, [gl, scene, camera, controlsRef]);

  return null;
}

function ControlsGuard({ controlsRef }) {
  const isPathBusy = useEditorStore(
    (s) => s.isPathPlaying || s.isMediaExporting
  );

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isPathBusy;
    }
  }, [isPathBusy, controlsRef]);

  return null;
}

function SceneEnvironment() {
  const environmentEnabled = useEditorStore(
    (s) => s.room.environmentEnabled === true
  );
  const environment = useEditorStore((s) => s.room.environment || "apartment");
  const showEnvBackground = useEditorStore(
    (s) => s.room.showEnvBackground !== false
  );
  const envIntensity = useEditorStore((s) => s.room.envIntensity ?? 1);
  const { scene } = useThree();

  useEffect(() => {
    if (environmentEnabled) return undefined;
    scene.environment = null;
    scene.background = null;
    return undefined;
  }, [environmentEnabled, scene]);

  if (!environmentEnabled) return null;

  return (
    <Environment
      key={`${environment}-${showEnvBackground}`}
      preset={environment}
      background={showEnvBackground}
      environmentIntensity={envIntensity}
      backgroundIntensity={Math.min(envIntensity, 1.2) * 0.85}
      blur={showEnvBackground ? 0.35 : 0}
    />
  );
}

/** Signals first successful frame so we can hide the bootstrap loader */
function FirstFrameReady({ onReady }) {
  const { gl } = useThree();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return undefined;
    let frames = 0;
    let raf = 0;
    const tick = () => {
      frames += 1;
      // Wait a couple of rendered frames so the room is visible
      if (frames >= 2) {
        fired.current = true;
        onReady?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gl, onReady]);

  return null;
}

function SceneContent({ onFirstFrame }) {
  const controlsRef = useRef(null);
  const objects = useEditorStore((s) => s.objects);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const room = useEditorStore((s) => s.room);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const isMediaExporting = useEditorStore((s) => s.isMediaExporting);
  const hideEditorChrome = isPreviewMode || isMediaExporting;

  return (
    <>
      <FirstFrameReady onReady={onFirstFrame} />
      <CameraBridge controlsRef={controlsRef} />
      <ControlsGuard controlsRef={controlsRef} />
      <Light />

      {!hideEditorChrome && (
        <Grid
          infiniteGrid
          cellSize={0.5}
          sectionSize={2}
          fadeDistance={40}
          position={[0, 0.001, 0]}
        />
      )}

      <Room />

      {objects.map((obj) => (
        <PlacedObject key={obj.id} object={obj} />
      ))}

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={hideEditorChrome ? 0.45 : 0.35}
        scale={Math.max(room.width, room.depth) + 4}
        blur={2}
      />

      <OrbitControls ref={controlsRef} makeDefault />
      <SceneEnvironment />

      {!hideEditorChrome && (
        <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
          <GizmoViewport />
        </GizmoHelper>
      )}

      {!hideEditorChrome && (
        <mesh
          visible={false}
          position={[0, -0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={() => clearSelection()}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial />
        </mesh>
      )}
    </>
  );
}

export default function Scene({
  projectLoading = false,
  loadLabel = "Loading scene…",
}) {
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const { active, progress } = useProgress();
  const sceneEpoch = useEditorStore((s) => s.sceneEpoch);

  // Reset first-frame gate when a new project is loaded into the editor
  useEffect(() => {
    setFirstFrameReady(false);
  }, [sceneEpoch]);

  const bootstrapping = !firstFrameReady;
  const forceVisible = projectLoading || bootstrapping || active;

  let label = loadLabel;
  if (projectLoading) label = "Loading room…";
  else if (active) label = "Loading environment…";
  else if (bootstrapping) label = "Preparing 3D scene…";

  const minProgress = projectLoading
    ? 12
    : bootstrapping && !active
      ? 55
      : 0;

  const displayProgress = projectLoading
    ? Math.max(minProgress, progress * 0.4)
    : Math.max(minProgress, progress);

  return (
    <div className="scene-root">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, toneMappingExposure: 1.05 }}
        camera={{ position: [7, 5, 8], fov: 45 }}
        onPointerMissed={() => {
          const state = useEditorStore.getState();
          if (!state.isPreviewMode && !state.isMediaExporting) {
            state.clearSelection();
          }
        }}
      >
        <Suspense fallback={null}>
          <SceneContent onFirstFrame={() => setFirstFrameReady(true)} />
        </Suspense>
      </Canvas>

      <SceneLoadingOverlay
        forceVisible={forceVisible}
        label={label}
        progress={displayProgress}
      />
    </div>
  );
}
