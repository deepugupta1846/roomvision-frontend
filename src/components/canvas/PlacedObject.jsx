import { useEffect, useRef, useState } from "react";
import { TransformControls } from "@react-three/drei";
import { ObjectMesh } from "../objects/ObjectMesh";
import { useEditorStore } from "../../store/useEditorStore";

export default function PlacedObject({ object }) {
  const groupRef = useRef(null);
  const draggingRef = useRef(false);
  const [target, setTarget] = useState(null);
  const selectedId = useEditorStore((s) => s.selectedId);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const isMediaExporting = useEditorStore((s) => s.isMediaExporting);
  const transformMode = useEditorStore((s) => s.transformMode);
  const transformSpace = useEditorStore((s) => s.transformSpace);
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);

  const selected =
    !isPreviewMode && !isMediaExporting && selectedId === object.id;

  useEffect(() => {
    if (groupRef.current) setTarget(groupRef.current);
  }, [object.id]);

  // Apply store transforms when not dragging the gizmo
  useEffect(() => {
    const g = groupRef.current;
    if (!g || draggingRef.current) return;
    g.position.set(object.position.x, object.position.y, object.position.z);
    g.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
    g.scale.set(object.scale.x, object.scale.y, object.scale.z);
  }, [
    object.position.x,
    object.position.y,
    object.position.z,
    object.rotation.x,
    object.rotation.y,
    object.rotation.z,
    object.scale.x,
    object.scale.y,
    object.scale.z,
  ]);

  if (!object.visible) return null;

  const syncTransform = () => {
    const g = groupRef.current;
    if (!g) return;
    updateObject(object.id, {
      position: { x: g.position.x, y: g.position.y, z: g.position.z },
      rotation: { x: g.rotation.x, y: g.rotation.y, z: g.rotation.z },
      scale: { x: g.scale.x, y: g.scale.y, z: g.scale.z },
    });
  };

  return (
    <>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          selectObject(object.id);
        }}
      >
        <ObjectMesh catalogId={object.catalogId} color={object.color} />
      </group>

      {selected && target && (
        <TransformControls
          object={target}
          mode={transformMode}
          space={transformSpace}
          onMouseDown={() => {
            draggingRef.current = true;
          }}
          onMouseUp={() => {
            draggingRef.current = false;
            syncTransform();
          }}
        />
      )}
    </>
  );
}
