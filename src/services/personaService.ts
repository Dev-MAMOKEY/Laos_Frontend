import { postPersonaAnalysis, type MbtiAnswer } from './api'
import type { Persona } from '../types/persona'

export type { Destination, ItineraryDay, ItineraryItem, Persona } from '../types/persona'

export async function analyzePersonaAsync(answers: number[], _prompt?: string): Promise<Persona> {
  const mappedAnswers: MbtiAnswer[] = answers.map((answer, idx) => ({
    questionId: idx + 1,
    answer: answer ? 1 : 0,
  }))

  return postPersonaAnalysis(mappedAnswers)
}
