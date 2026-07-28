import { create } from "zustand";
import { objectCatalog } from "../data/objectCatalog";
import { createProjectDocument } from "../utils/roomShare";

let nextId = 1;

function createId(prefix = "obj") {
  return `${prefix}-${nextId++}`;
}

const defaultRoom = {
  width: 6,
  depth: 5,
  height: 2.8,
  floorThickness: 0.15,
  wallThickness: 0.12,
  floorColor: "#cfc8bc",
  wallColor: "#ece7df",
  floorTexture: "none",
  wallTexture: "none",
  environmentEnabled: false,
  environment: "apartment",
  envIntensity: 1,
  showEnvBackground: true,
  /** Closed floor plan in feet (Visualez draw step) */
  floorPlan: null,
  /** World-space footprint [{x,z}] meters, centered */
  footprint: null,
  /** Floor material from Pattern/Tiles/Grout wizard */
  floorMaterial: null,
  wallMaterial: null,
  /** When true, editor opens in Visualez draw step */
  needsFloorPlan: false,
};

/** @typedef {'draw' | 'edit'} EditorPhase */

/** @typedef {'translate' | 'rotate' | 'scale'} TransformMode */

export const useEditorStore = create((set, get) => ({
  room: { ...defaultRoom },
  objects: [],
  projectName: "Untitled Room",
  remoteRoomId: null,
  selectedId: null,
  activeCategory: "all",
  /** @type {TransformMode} */
  transformMode: "translate",
  transformSpace: "world",
  isPreviewMode: false,
  /** Default: inside the room so floor + walls are the main view */
  isInsideRoom: true,
  shareStatus: null,
  cameraPath: [],
  pathDurationSec: 6,
  isPathPlaying: false,
  isMediaExporting: false,
  mediaExportProgress: 0,
  sceneEpoch: 0,
  _pathCancel: null,
  /** @type {EditorPhase} */
  editorPhase: "edit",
  materialModal: null, // { surface: 'floor'|'wall'|'object', objectId?, open: true }

  setProjectName: (name) => set({ projectName: name || "Untitled Room" }),

  setRemoteRoomId: (remoteRoomId) => set({ remoteRoomId }),

  setEditorPhase: (editorPhase) => set({ editorPhase }),

  openMaterialModal: (surface = "floor", objectId = null) =>
    set({ materialModal: { surface, objectId, open: true } }),

  closeMaterialModal: () => set({ materialModal: null }),

  applySurfaceMaterial: (surface, material) => {
    if (surface === "object") {
      const objectId = get().materialModal?.objectId;
      if (!objectId) {
        set({ materialModal: null });
        return;
      }
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === objectId
            ? {
                ...obj,
                texture: "material",
                material: { ...material },
                color: material.tileColor || obj.color,
              }
            : obj
        ),
        materialModal: null,
      }));
      return;
    }

    set((state) => {
      const key = surface === "wall" ? "wallMaterial" : "floorMaterial";
      const colorKey = surface === "wall" ? "wallColor" : "floorColor";
      const texKey = surface === "wall" ? "wallTexture" : "floorTexture";
      return {
        room: {
          ...state.room,
          [key]: material,
          [colorKey]: material.tileColor || state.room[colorKey],
          // Prefer procedural material map over catalog texture
          [texKey]: "material",
        },
        materialModal: null,
      };
    });
  },

  resetEditor: () =>
    set((state) => ({
      room: { ...defaultRoom },
      objects: [],
      projectName: "Untitled Room",
      remoteRoomId: null,
      selectedId: null,
      cameraPath: [],
      pathDurationSec: 6,
      isPreviewMode: false,
      isInsideRoom: true,
      transformMode: "translate",
      editorPhase: "edit",
      materialModal: null,
      sceneEpoch: state.sceneEpoch + 1,
    })),

  setShareStatus: (shareStatus) => set({ shareStatus }),

  setPathDurationSec: (sec) =>
    set({ pathDurationSec: Math.min(Math.max(Number(sec) || 6, 2), 60) }),

  addCameraKeyframe: (keyframe) =>
    set((state) => ({
      cameraPath: [
        ...state.cameraPath,
        {
          id: `cam-${Date.now()}-${state.cameraPath.length}`,
          position: { ...keyframe.position },
          target: { ...keyframe.target },
        },
      ],
    })),

  removeCameraKeyframe: (id) =>
    set((state) => ({
      cameraPath: state.cameraPath.filter((k) => k.id !== id),
    })),

  clearCameraPath: () => set({ cameraPath: [] }),

  goToCameraKeyframe: (id) => {
    const kf = get().cameraPath.find((k) => k.id === id);
    if (!kf) return;
    // dynamic import avoided — caller uses applyCameraSample
    return kf;
  },

  setPathPlaying: (isPathPlaying) => set({ isPathPlaying }),

  setMediaExporting: (isMediaExporting, mediaExportProgress = 0) =>
    set({ isMediaExporting, mediaExportProgress }),

  setMediaExportProgress: (mediaExportProgress) => set({ mediaExportProgress }),

  getProjectDocument: () => {
    const { room, objects, projectName, cameraPath, pathDurationSec } = get();
    return {
      ...createProjectDocument({ room, objects, name: projectName }),
      cameraPath,
      pathDurationSec,
    };
  },

  loadProject: (doc) => {
    if (!doc?.room || !Array.isArray(doc.objects)) {
      throw new Error("Invalid project file");
    }

    // Keep new object ids unique after import
    let maxN = 0;
    for (const obj of doc.objects) {
      const m = String(obj.id || "").match(/-(\d+)$/);
      if (m) maxN = Math.max(maxN, Number(m[1]));
    }
    nextId = Math.max(nextId, maxN + 1);

    const mergedRoom = { ...defaultRoom, ...doc.room };
    const hasPlan = mergedRoom.floorPlan?.closed === true;

    set((state) => ({
      projectName: doc.name || "Untitled Room",
      room: mergedRoom,
      objects: doc.objects.map((obj) => ({
        id: obj.id || createId(obj.catalogId || "obj"),
        catalogId: obj.catalogId,
        label: obj.label || obj.catalogId,
        category: obj.category || "furniture",
        type: obj.type || "primitive",
        color: obj.color || "#888888",
        texture: obj.texture || "none",
        material: obj.material || null,
        position: { x: 0, y: 0, z: 0, ...obj.position },
        rotation: { x: 0, y: 0, z: 0, ...obj.rotation },
        scale: { x: 1, y: 1, z: 1, ...obj.scale },
        visible: obj.visible !== false,
      })),
      cameraPath: Array.isArray(doc.cameraPath)
        ? doc.cameraPath.map((k, i) => ({
            id: k.id || `cam-import-${i}`,
            position: { x: 0, y: 2, z: 5, ...k.position },
            target: { x: 0, y: 1, z: 0, ...k.target },
          }))
        : [],
      pathDurationSec: doc.pathDurationSec || 6,
      // New rooms (needsFloorPlan) open in Visualez draw flow
      editorPhase:
        mergedRoom.needsFloorPlan === true && !hasPlan ? "draw" : "edit",
      materialModal: null,
      selectedId: null,
      isPreviewMode: false,
      isInsideRoom: true,
      sceneEpoch: state.sceneEpoch + 1,
    }));
  },

  setRoom: (partial) =>
    set((state) => ({
      room: { ...state.room, ...partial },
    })),

  setActiveCategory: (category) => set({ activeCategory: category }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  setTransformSpace: (space) => set({ transformSpace: space }),

  toggleTransformSpace: () =>
    set((state) => ({
      transformSpace: state.transformSpace === "world" ? "local" : "world",
    })),

  enterPreview: () =>
    set({ isPreviewMode: true, selectedId: null }),

  exitPreview: () => set({ isPreviewMode: false }),

  togglePreview: () => {
    const { isPreviewMode } = get();
    if (isPreviewMode) {
      set({ isPreviewMode: false });
    } else {
      set({ isPreviewMode: true, selectedId: null });
    }
  },

  enterRoom: () => set({ isInsideRoom: true, isPreviewMode: false }),

  exitRoom: () => set({ isInsideRoom: false }),

  toggleInsideRoom: () => {
    const { isInsideRoom } = get();
    if (isInsideRoom) {
      set({ isInsideRoom: false });
    } else {
      set({ isInsideRoom: true, isPreviewMode: false });
    }
  },

  selectObject: (id) => {
    if (get().isPreviewMode) return;
    set({ selectedId: id });
  },

  clearSelection: () => set({ selectedId: null }),

  nudgeSelected: (axis, delta) => {
    const { selectedId, objects, updateObject } = get();
    if (!selectedId) return;
    const obj = objects.find((o) => o.id === selectedId);
    if (!obj) return;
    updateObject(selectedId, {
      position: { [axis]: obj.position[axis] + delta },
    });
  },

  addObject: (catalogId, overrides = {}) => {
    const def = objectCatalog.find((item) => item.id === catalogId);
    if (!def) return null;

    const { room } = get();
    const id = createId(def.id);

    const object = {
      id,
      catalogId: def.id,
      label: def.label,
      category: def.category,
      type: def.type,
      color: def.defaultColor,
      texture: "none",
      material: null,
      position: {
        x: overrides.position?.x ?? 0,
        y: overrides.position?.y ?? room.floorThickness,
        z: overrides.position?.z ?? 0,
      },
      rotation: {
        x: overrides.rotation?.x ?? 0,
        y: overrides.rotation?.y ?? 0,
        z: overrides.rotation?.z ?? 0,
      },
      scale: {
        x: overrides.scale?.x ?? 1,
        y: overrides.scale?.y ?? 1,
        z: overrides.scale?.z ?? 1,
      },
      visible: true,
      ...overrides,
    };

    set((state) => ({
      objects: [...state.objects, object],
      selectedId: id,
    }));

    return id;
  },

  updateObject: (id, partial) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              ...partial,
              position: partial.position
                ? { ...obj.position, ...partial.position }
                : obj.position,
              rotation: partial.rotation
                ? { ...obj.rotation, ...partial.rotation }
                : obj.rotation,
              scale: partial.scale
                ? { ...obj.scale, ...partial.scale }
                : obj.scale,
            }
          : obj
      ),
    })),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  duplicateObject: (id) => {
    const source = get().objects.find((obj) => obj.id === id);
    if (!source) return null;

    return get().addObject(source.catalogId, {
      color: source.color,
      texture: source.texture || "none",
      material: source.material ? { ...source.material } : null,
      position: {
        x: source.position.x + 0.4,
        y: source.position.y,
        z: source.position.z + 0.4,
      },
      rotation: { ...source.rotation },
      scale: { ...source.scale },
    });
  },
}));
