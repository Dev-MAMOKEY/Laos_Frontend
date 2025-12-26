import { STORAGE_KEYS } from './keys'
import { readJson, writeJson } from './storage'

export function getFavorites(): string[] {
  return readJson<string[]>(sessionStorage, STORAGE_KEYS.favorites, [])
}

export function setFavorites(next: string[]) {
  writeJson(sessionStorage, STORAGE_KEYS.favorites, next)
}
