import { STORAGE_KEYS } from './keys'
import { readJson, writeJson } from './storage'
import type { Persona } from '../types/persona'

export type HistoryEntry = {
  id: string
  createdAt: number
  persona: Persona
}

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(localStorage, STORAGE_KEYS.history, [])
}

export function prependHistory(persona: Persona, maxEntries = 50) {
  const prev = getHistory()
  const entry: HistoryEntry = {
    id: `h_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    persona,
  }
  writeJson(localStorage, STORAGE_KEYS.history, [entry, ...prev].slice(0, maxEntries))
}
