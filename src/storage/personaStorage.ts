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

export function getMbtiPersona(): Persona | null {
  const raw = sessionStorage.getItem(STORAGE_KEYS.mbti_persona)
  console.log('getMbtiPersona raw:', raw)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    // 정상 객체라면 그대로 반환
    if (parsed && typeof parsed === 'object' && 'keyword' in (parsed as Record<string, unknown>)) {
      return parsed as Persona
    }
    // 단순 문자열(예: "ESTJ")이면 최소 구조로 감싸서 반환
    if (typeof parsed === 'string') {
      return {
        keyword: parsed,
        tags: [],
        description: '',
        destinations: [],
        itinerary: [],
      }
    }
    return null
  } catch {
    // JSON 파싱이 안 되고 raw 문자열만 있는 경우도 처리
    return {
      keyword: raw,
      tags: [],
      description: '',
      destinations: [],
      itinerary: [],
    }
  }
}

export function setMbtiPersona(persona: Persona) {
  writeJson(sessionStorage, STORAGE_KEYS.mbti_persona, persona)
}

export function clearPersona() {
  sessionStorage.removeItem(STORAGE_KEYS.persona)
}

export function clearMbtiPersona() {
  sessionStorage.removeItem(STORAGE_KEYS.mbti_persona)
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
