export function createId(prefix = "id") {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return `${prefix}-${randomUUID.call(globalThis.crypto)}`;
  }

  const timestamp = Date.now().toString(36);
  const randomText = Math.random().toString(36).slice(2, 10);

  return `${prefix}-${timestamp}-${randomText}`;
}
