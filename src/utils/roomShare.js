const PROJECT_VERSION = 1;
const SHARE_PREFIX = "rv1.";

export function createProjectDocument({ room, objects, name = "Untitled Room" }) {
  return {
    version: PROJECT_VERSION,
    name,
    exportedAt: new Date().toISOString(),
    room: { ...room },
    objects: objects.map((obj) => ({
      id: obj.id,
      catalogId: obj.catalogId,
      label: obj.label,
      category: obj.category,
      type: obj.type,
      color: obj.color,
      texture: obj.texture || "none",
      material: obj.material || null,
      position: { ...obj.position },
      rotation: { ...obj.rotation },
      scale: { ...obj.scale },
      visible: obj.visible !== false,
    })),
  };
}

export function downloadProjectJson(doc) {
  const safeName = (doc.name || "room")
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 48);
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName || "roomvision"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function bytesToBase64Url(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gzipEncode(text) {
  if (typeof CompressionStream === "undefined") {
    return new TextEncoder().encode(text);
  }
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gzipDecode(bytes) {
  // Heuristic: gzip magic 1f 8b
  const isGzip = bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!isGzip || typeof DecompressionStream === "undefined") {
    return new TextDecoder().decode(bytes);
  }
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).text();
}

export async function encodeSharePayload(doc) {
  const json = JSON.stringify(doc);
  const compressed = await gzipEncode(json);
  return SHARE_PREFIX + bytesToBase64Url(compressed);
}

export async function decodeSharePayload(payload) {
  if (!payload || typeof payload !== "string") {
    throw new Error("Invalid share payload");
  }
  const raw = payload.startsWith(SHARE_PREFIX)
    ? payload.slice(SHARE_PREFIX.length)
    : payload;
  const bytes = base64UrlToBytes(raw);
  const json = await gzipDecode(bytes);
  const doc = JSON.parse(json);
  if (!doc || !doc.room || !Array.isArray(doc.objects)) {
    throw new Error("Invalid room document");
  }
  return doc;
}

export async function buildShareUrl(doc) {
  const encoded = await encodeSharePayload(doc);
  const url = new URL(window.location.href);
  url.hash = `room=${encoded}`;
  return url.toString();
}

export function readSharePayloadFromLocation() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash.includes("=") ? hash : `room=${hash}`);
  return params.get("room");
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export async function shareNative({ title, text, url }) {
  if (!navigator.share) return false;
  await navigator.share({ title, text, url });
  return true;
}
