import { useEditorStore } from "../../store/useEditorStore";

export default function Lights() {
  const environmentEnabled = useEditorStore(
    (s) => s.room.environmentEnabled !== false
  );

  // Stronger lights when environment is off so the room stays readable
  const ambient = environmentEnabled ? 0.35 : 0.85;
  const key = environmentEnabled ? 0.85 : 1.6;
  const fill = environmentEnabled ? 0.25 : 0.55;

  return (
    <>
      <ambientLight intensity={ambient} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={key}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-6, 8, -4]} intensity={fill} />
    </>
  );
}
