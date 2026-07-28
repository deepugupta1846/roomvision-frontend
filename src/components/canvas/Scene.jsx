import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
import {
  enterInsideCamera,
  exitOutsideCamera,
  defaultRoomCamera,
} from "../../utils/cameraViews";

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

/** Keep orbit target inside the room; allow camera enough range to see floor + walls. */
function InsideRoomController({ controlsRef }) {
  const isInsideRoom = useEditorStore((s) => s.isInsideRoom);
  const room = useEditorStore((s) => s.room);
  const { camera } = useThree();
  const prevInside = useRef(false);

  useEffect(() => {
    if (isInsideRoom && !prevInside.current) {
      enterInsideCamera(useEditorStore.getState().room);
    } else if (!isInsideRoom && prevInside.current) {
      exitOutsideCamera(useEditorStore.getState().room);
    }
    prevInside.current = isInsideRoom;
  }, [isInsideRoom]);

  useFrame(() => {
    if (!isInsideRoom || !controlsRef.current) return;

    const {
      width = 6,
      depth = 5,
      height = 2.8,
      floorThickness = 0.15,
      wallThickness = 0.12,
      footprint,
    } = room;

    // Soft bounds — slight inset so we stay in the room but can look around
    const margin = Math.max(0.2, wallThickness);
    let minX = -width / 2 + margin;
    let maxX = width / 2 - margin;
    let minZ = -depth / 2 + margin;
    let maxZ = depth / 2 - margin;

    if (Array.isArray(footprint) && footprint.length >= 3) {
      minX = Infinity;
      maxX = -Infinity;
      minZ = Infinity;
      maxZ = -Infinity;
      for (const p of footprint) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minZ = Math.min(minZ, p.z);
        maxZ = Math.max(maxZ, p.z);
      }
      minX += margin;
      maxX -= margin;
      minZ += margin;
      maxZ -= margin;
    }

    const minY = floorThickness + 0.55;
    const maxY = floorThickness + height - 0.2;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const t = controlsRef.current.target;
    // Target stays on the floor / lower walls so you always see the room surface
    t.x = clamp(t.x, minX, maxX);
    t.y = clamp(t.y, floorThickness, floorThickness + height * 0.55);
    t.z = clamp(t.z, minZ, maxZ);

    camera.position.x = clamp(camera.position.x, minX, maxX);
    camera.position.y = clamp(camera.position.y, minY, maxY);
    camera.position.z = clamp(camera.position.z, minZ, maxZ);

    const dx = camera.position.x - t.x;
    const dy = camera.position.y - t.y;
    const dz = camera.position.z - t.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist < 0.35) {
      const scale = 0.6 / Math.max(dist, 0.01);
      camera.position.x = t.x + dx * scale;
      camera.position.y = t.y + Math.max(dy * scale, 0.3);
      camera.position.z = t.z + dz * scale;
    }

    controlsRef.current.update();
  });

  return null;
}

/** Default framing: inside room looking at floor + walls. */
function RoomFitController() {
  const isInsideRoom = useEditorStore((s) => s.isInsideRoom);
  const width = useEditorStore((s) => s.room.width);
  const depth = useEditorStore((s) => s.room.depth);
  const height = useEditorStore((s) => s.room.height);
  const footprint = useEditorStore((s) => s.room.footprint);
  const editorPhase = useEditorStore((s) => s.editorPhase);

  useEffect(() => {
    if (editorPhase !== "edit" || !isInsideRoom) return undefined;
    const id = requestAnimationFrame(() => {
      defaultRoomCamera(useEditorStore.getState().room);
    });
    return () => cancelAnimationFrame(id);
  }, [width, depth, height, footprint, editorPhase, isInsideRoom]);

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

function FirstFrameReady({ onReady }) {
  const { gl } = useThree();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return undefined;
    let frames = 0;
    let raf = 0;
    const tick = () => {
      frames += 1;
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
  const isInsideRoom = useEditorStore((s) => s.isInsideRoom);
  const isMediaExporting = useEditorStore((s) => s.isMediaExporting);
  const hideEditorChrome =
    isPreviewMode || isMediaExporting || isInsideRoom;

  const maxDim = Math.max(room.width, room.depth);

  return (
    <>
      <FirstFrameReady onReady={onFirstFrame} />
      <CameraBridge controlsRef={controlsRef} />
      <ControlsGuard controlsRef={controlsRef} />
      <InsideRoomController controlsRef={controlsRef} />
      <RoomFitController />
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
        scale={maxDim + 4}
        blur={2}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        maxDistance={isInsideRoom ? maxDim * 1.25 : 120}
        minDistance={isInsideRoom ? 0.4 : 0.8}
        maxPolarAngle={Math.PI * 0.495}
        minPolarAngle={0.05}
      />
      <SceneEnvironment />

      {!hideEditorChrome && (
        <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
          <GizmoViewport />
        </GizmoHelper>
      )}

      {!isPreviewMode && !isMediaExporting && (
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
        camera={{ position: [2.5, 1.6, 2.5], fov: 60 }}
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
