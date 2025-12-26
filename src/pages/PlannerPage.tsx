import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../questions'
import { analyzePersonaAsync } from '../services/personaService'
import PageShell from '../components/layout/PageShell'
import ProgressBar from '../components/ui/ProgressBar'
import Spinner from '../components/ui/Spinner'
import { prependHistory } from '../storage/historyStorage'
import { setAnswers, setPersona } from '../storage/personaStorage'

type Message = {
  id: string
  role: 'system' | 'user'
  content: string
  options?: [string, string]
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`
}

export default function PlannerPage() {
  const navigate = useNavigate()

  const totalSteps = QUESTIONS.length
  const [step, setStep] = useState(0)
  const [, setAnswersState] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: makeId('sys'),
      role: 'system',
      content: '좋아요. 몇 가지 질문으로 당신에게 맞는 여행 일정을 추천해드릴게요.',
    },
    {
      id: makeId('q'),
      role: 'system',
      content: QUESTIONS[0].title,
      options: QUESTIONS[0].options,
    },
  ])

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading])

  const currentQuestion = useMemo(() => {
    if (step >= totalSteps) return null
    return QUESTIONS[step]
  }, [step, totalSteps])

  const appendNextQuestion = (nextStep: number) => {
    if (nextStep >= totalSteps) return

    const next = QUESTIONS[nextStep]
    setMessages((prev) => [
      ...prev,
      { id: makeId('q'), role: 'system', content: next.title, options: next.options },
    ])
  }

  const startAnalyze = (finalAnswers: number[]) => {
    setIsLoading(true)

    window.setTimeout(() => {
      analyzePersonaAsync(finalAnswers)
        .then((persona) => {
          setPersona(persona)
          setAnswers(finalAnswers)
          prependHistory(persona)

          navigate('/result', { replace: true })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }, 600)
  }

  const onSelect = (optionIndex: number) => {
    if (!currentQuestion || isLoading) return

    const chosen = currentQuestion.options[optionIndex]

    setMessages((prev) => [
      ...prev,
      { id: makeId('u'), role: 'user', content: chosen },
    ])

    setAnswersState((prev) => {
      const next = [...prev, optionIndex]
      if (next.length === totalSteps) {
        startAnalyze(next)
      }
      return next
    })
    const nextStep = step + 1
    setStep(nextStep)

    if (nextStep < totalSteps) {
      window.setTimeout(() => {
        appendNextQuestion(nextStep)
      }, 120)
    }
  }

  const progressCurrent = Math.min(step + 1, totalSteps)
  const percent = totalSteps === 0 ? 0 : Math.round((progressCurrent / totalSteps) * 100)

  return (
    <PageShell>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">여행 일정 추천</h1>
        <p className="mt-1 text-sm text-slate-600">
          질문에 답하면 아래로 이어서 안내해드려요.
        </p>
        <div className="mt-3">
          <ProgressBar percent={percent} />
        </div>
      </header>

      <main className="space-y-3">
          {messages.map((m) => {
            const isSystem = m.role === 'system'
            return (
              <div key={m.id} className={isSystem ? 'flex' : 'flex justify-end'}>
                <div
                  className={
                    'max-w-[85%] rounded-2xl p-4 shadow-lg ' +
                    (isSystem
                      ? 'bg-white text-slate-800'
                      : 'bg-blue-600 text-white')
                  }
                >
                  <p className="text-sm leading-relaxed">{m.content}</p>

                  {m.options && !isLoading && step < totalSteps && (
                    <div className="mt-3 space-y-2">
                      {m.options.map((label, idx) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => onSelect(idx)}
                          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-left text-slate-900 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex">
              <div className="max-w-[85%] rounded-2xl bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <Spinner />
                  <p className="text-sm text-slate-700">
                    OpenAI가 당신의 페르소나를 분석 중입니다...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
      </main>
    </PageShell>
  )
}
