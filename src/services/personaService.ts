import { postPersonaAnalysis } from './api'
import type { Persona } from '../types/persona'

export type { Destination, ItineraryDay, ItineraryItem, Persona } from '../types/persona'

export async function analyzePersonaAsync(answers: number[], prompt?: string): Promise<Persona> {
  return postPersonaAnalysis(answers, prompt)
}
