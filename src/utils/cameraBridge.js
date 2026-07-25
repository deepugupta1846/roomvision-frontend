let api = null;

export function registerCameraApi(next) {
  api = next;
  return () => {
    if (api === next) api = null;
  };
}

export function getCameraApi() {
  if (!api) throw new Error("Camera is not ready");
  return api;
}
