export function readJson<T>(
  storage: Storage,
  key: string,
  fallback: T,
): T {
  const raw = storage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(storage: Storage, key: string, value: unknown) {
  storage.setItem(key, JSON.stringify(value))
}
