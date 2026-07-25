import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  GizmoHelper,
  GizmoViewport,
  ContactShadows,
} from "@react-three/drei";

import Room from "./Room";
import Light from "./Light";
import PlacedObject from "./PlacedObject";
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
        // Force a render into the drawing buffer, then read pixels
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
    (s) => s.room.environmentEnabled !== false
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

function SceneContent() {
  const controlsRef = useRef(null);
  const objects = useEditorStore((s) => s.objects);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const room = useEditorStore((s) => s.room);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const isMediaExporting = useEditorStore((s) => s.isMediaExporting);
  const hideEditorChrome = isPreviewMode || isMediaExporting;

  return (
    <>
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

export default function Scene() {
  return (
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
      <SceneContent />
    </Canvas>
  );
}
