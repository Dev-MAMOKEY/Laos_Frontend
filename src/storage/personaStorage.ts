import { STORAGE_KEYS } from './keys'
import { writeJson } from './storage'
import type { Persona } from '../types/persona'

export function getPersona(): Persona | null {
  const raw = sessionStorage.getItem(STORAGE_KEYS.persona)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Persona
  } catch {
    return null
  }
}

export function setPersona(persona: Persona) {
  writeJson(sessionStorage, STORAGE_KEYS.persona, persona)
}

export function clearPersona() {
  sessionStorage.removeItem(STORAGE_KEYS.persona)
}

export function setAnswers(answers: number[]) {
  writeJson(sessionStorage, STORAGE_KEYS.answers, answers)
}

export function getAnswers(): number[] | null {
  const raw = sessionStorage.getItem(STORAGE_KEYS.answers)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as number[]) : null
  } catch {
    return null
  }
}

export function clearAnswers() {
  sessionStorage.removeItem(STORAGE_KEYS.answers)
}
