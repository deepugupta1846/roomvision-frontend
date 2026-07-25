import { forwardRef } from "react";

function Box({ args, position, color, castShadow = true, receiveShadow = true }) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Cylinder({
  args,
  position,
  color,
  castShadow = true,
  receiveShadow = true,
}) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow={receiveShadow}>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/** Procedural furniture / interior meshes by catalog id */
export const ObjectMesh = forwardRef(function ObjectMesh(
  { catalogId, color = "#888" },
  ref
) {
  return (
    <group ref={ref}>
      {renderMesh(catalogId, color)}
    </group>
  );
});

function renderMesh(catalogId, color) {
  switch (catalogId) {
    case "sofa":
      return (
        <>
          <Box args={[2.1, 0.35, 0.85]} position={[0, 0.175, 0]} color={color} />
          <Box args={[2.1, 0.45, 0.18]} position={[0, 0.55, -0.335]} color={color} />
          <Box args={[0.18, 0.35, 0.7]} position={[-0.96, 0.4, 0.05]} color={color} />
          <Box args={[0.18, 0.35, 0.7]} position={[0.96, 0.4, 0.05]} color={color} />
        </>
      );

    case "armchair":
      return (
        <>
          <Box args={[0.75, 0.3, 0.75]} position={[0, 0.25, 0]} color={color} />
          <Box args={[0.75, 0.45, 0.15]} position={[0, 0.55, -0.3]} color={color} />
          <Box args={[0.12, 0.3, 0.6]} position={[-0.315, 0.4, 0.05]} color={color} />
          <Box args={[0.12, 0.3, 0.6]} position={[0.315, 0.4, 0.05]} color={color} />
        </>
      );

    case "dining-chair":
      return (
        <>
          <Box args={[0.4, 0.05, 0.4]} position={[0, 0.42, 0]} color={color} />
          <Box args={[0.4, 0.45, 0.05]} position={[0, 0.65, -0.175]} color={color} />
          <Box args={[0.05, 0.42, 0.05]} position={[-0.15, 0.21, -0.15]} color="#5a4634" />
          <Box args={[0.05, 0.42, 0.05]} position={[0.15, 0.21, -0.15]} color="#5a4634" />
          <Box args={[0.05, 0.42, 0.05]} position={[-0.15, 0.21, 0.15]} color="#5a4634" />
          <Box args={[0.05, 0.42, 0.05]} position={[0.15, 0.21, 0.15]} color="#5a4634" />
        </>
      );

    case "coffee-table":
      return (
        <>
          <Box args={[1.1, 0.05, 0.55]} position={[0, 0.38, 0]} color={color} />
          <Box args={[0.06, 0.38, 0.06]} position={[-0.45, 0.19, -0.2]} color="#5a4634" />
          <Box args={[0.06, 0.38, 0.06]} position={[0.45, 0.19, -0.2]} color="#5a4634" />
          <Box args={[0.06, 0.38, 0.06]} position={[-0.45, 0.19, 0.2]} color="#5a4634" />
          <Box args={[0.06, 0.38, 0.06]} position={[0.45, 0.19, 0.2]} color="#5a4634" />
        </>
      );

    case "dining-table":
      return (
        <>
          <Box args={[1.6, 0.06, 0.9]} position={[0, 0.72, 0]} color={color} />
          <Box args={[0.08, 0.72, 0.08]} position={[-0.7, 0.36, -0.35]} color="#5a4634" />
          <Box args={[0.08, 0.72, 0.08]} position={[0.7, 0.36, -0.35]} color="#5a4634" />
          <Box args={[0.08, 0.72, 0.08]} position={[-0.7, 0.36, 0.35]} color="#5a4634" />
          <Box args={[0.08, 0.72, 0.08]} position={[0.7, 0.36, 0.35]} color="#5a4634" />
        </>
      );

    case "bed":
      return (
        <>
          <Box args={[1.6, 0.25, 2.0]} position={[0, 0.25, 0]} color={color} />
          <Box args={[1.6, 0.5, 0.1]} position={[0, 0.5, -1.0]} color="#6a5a4a" />
          <Box args={[0.5, 0.15, 0.35]} position={[-0.4, 0.45, -0.7]} color="#eee8e0" />
          <Box args={[0.5, 0.15, 0.35]} position={[0.4, 0.45, -0.7]} color="#eee8e0" />
        </>
      );

    case "wardrobe":
      return (
        <>
          <Box args={[1.2, 2.0, 0.5]} position={[0, 1.0, 0]} color={color} />
          <Box args={[0.02, 1.7, 0.02]} position={[-0.25, 1.0, 0.26]} color="#333" />
          <Box args={[0.02, 1.7, 0.02]} position={[0.25, 1.0, 0.26]} color="#333" />
        </>
      );

    case "desk":
      return (
        <>
          <Box args={[1.3, 0.05, 0.6]} position={[0, 0.72, 0]} color={color} />
          <Box args={[0.06, 0.72, 0.5]} position={[-0.58, 0.36, 0]} color="#5a4634" />
          <Box args={[0.06, 0.72, 0.5]} position={[0.58, 0.36, 0]} color="#5a4634" />
        </>
      );

    case "bookshelf":
      return (
        <>
          <Box args={[0.9, 1.8, 0.3]} position={[0, 0.9, 0]} color={color} />
          <Box args={[0.84, 0.03, 0.28]} position={[0, 0.45, 0.01]} color="#5a4634" />
          <Box args={[0.84, 0.03, 0.28]} position={[0, 0.9, 0.01]} color="#5a4634" />
          <Box args={[0.84, 0.03, 0.28]} position={[0, 1.35, 0.01]} color="#5a4634" />
        </>
      );

    case "nightstand":
      return (
        <>
          <Box args={[0.45, 0.45, 0.4]} position={[0, 0.225, 0]} color={color} />
          <Box args={[0.1, 0.02, 0.02]} position={[0, 0.28, 0.21]} color="#333" />
        </>
      );

    case "tv-stand":
      return (
        <>
          <Box args={[1.4, 0.4, 0.4]} position={[0, 0.2, 0]} color={color} />
          <Box args={[1.3, 0.02, 0.35]} position={[0, 0.28, 0]} color="#333" />
        </>
      );

    case "ottoman":
      return <Box args={[0.6, 0.4, 0.6]} position={[0, 0.2, 0]} color={color} />;

    case "floor-lamp":
      return (
        <>
          <Cylinder args={[0.15, 0.15, 0.04, 16]} position={[0, 0.02, 0]} color="#444" />
          <Cylinder args={[0.02, 0.02, 1.3, 8]} position={[0, 0.67, 0]} color="#666" />
          <Cylinder args={[0.18, 0.12, 0.28, 16]} position={[0, 1.4, 0]} color={color} />
        </>
      );

    case "table-lamp":
      return (
        <>
          <Cylinder args={[0.08, 0.1, 0.04, 16]} position={[0, 0.02, 0]} color="#555" />
          <Cylinder args={[0.015, 0.015, 0.25, 8]} position={[0, 0.15, 0]} color="#777" />
          <Cylinder args={[0.12, 0.08, 0.18, 16]} position={[0, 0.35, 0]} color={color} />
        </>
      );

    case "plant":
      return (
        <>
          <Cylinder args={[0.12, 0.1, 0.25, 12]} position={[0, 0.125, 0]} color="#8b5a3c" />
          <Box args={[0.35, 0.5, 0.15]} position={[0, 0.5, 0]} color={color} />
          <Box args={[0.15, 0.4, 0.3]} position={[0.05, 0.55, 0.05]} color="#3d6b3a" />
        </>
      );

    case "rug":
      return (
        <mesh
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[2.0, 1.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );

    case "wall-art":
      return (
        <>
          <Box args={[0.9, 0.65, 0.03]} position={[0, 0.325, 0]} color="#2a2a2a" />
          <Box args={[0.8, 0.55, 0.02]} position={[0, 0.325, 0.02]} color={color} />
        </>
      );

    case "mirror":
      return (
        <>
          <Box args={[0.7, 1.1, 0.04]} position={[0, 0.55, 0]} color="#555" />
          <Box args={[0.6, 1.0, 0.02]} position={[0, 0.55, 0.02]} color={color} />
        </>
      );

    case "tv":
      return (
        <>
          <Box args={[1.2, 0.7, 0.06]} position={[0, 0.35, 0]} color={color} />
          <Box args={[1.1, 0.6, 0.02]} position={[0, 0.35, 0.03]} color="#111" />
          <Box args={[0.15, 0.08, 0.08]} position={[0, 0.02, 0]} color="#333" />
        </>
      );

    case "vase":
      return (
        <Cylinder args={[0.07, 0.09, 0.35, 16]} position={[0, 0.175, 0]} color={color} />
      );

    case "ceiling-light":
      return (
        <>
          <Cylinder args={[0.02, 0.02, 0.2, 8]} position={[0, 0.1, 0]} color="#888" />
          <Cylinder args={[0.25, 0.22, 0.08, 24]} position={[0, 0, 0]} color={color} />
        </>
      );

    case "sideboard":
      return (
        <>
          <Box args={[1.5, 0.7, 0.4]} position={[0, 0.35, 0]} color={color} />
          <Box args={[0.02, 0.4, 0.02]} position={[-0.35, 0.35, 0.21]} color="#333" />
          <Box args={[0.02, 0.4, 0.02]} position={[0.35, 0.35, 0.21]} color="#333" />
        </>
      );

    default:
      return <Box args={[0.5, 0.5, 0.5]} position={[0, 0.25, 0]} color={color} />;
  }
}
