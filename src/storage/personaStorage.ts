import { STORAGE_KEYS } from './keys'
import { writeJson } from './storage'
import type { Persona } from '../services/personaService'

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

export function setAnswers(answers: number[]) {
  writeJson(sessionStorage, STORAGE_KEYS.answers, answers)
}
