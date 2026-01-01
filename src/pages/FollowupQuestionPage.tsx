import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { postQuestion } from '../services/api'
import { getAnswers, setPersona } from '../storage/personaStorage'
import type { Persona } from '../types/persona'

function tryParseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function parseContentString(raw: string): Persona | null {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const recommendations: { id: string; rank: string; title: string; reason: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(\d+)\.[\s]*([^]+)$/)
    if (match) {
      const rank = match[1]
      const title = match[2].trim()
      const next = lines[i + 1] ?? ''
      const reasonMatch = next.match(/^추천이유\s*:\s*(.*)$/)
      const reason = reasonMatch ? reasonMatch[1].trim() : ''
      recommendations.push({
        id: `${rank}-${title}`.replace(/\s+/g, '-'),
        rank,
        title,
        reason,
      })
    }
  }

  if (!recommendations.length) return null

  return {
    keyword: '추천 결과',
    tags: [],
    description: '아래 추천 여행지를 확인하세요.',
    destinations: [],
    itinerary: [],
    recommendations,
  }
}

function normalizeQuestionResponse(data: unknown): Persona {
  // 1) 기존 페르소나 구조 그대로 들어오는 경우
  if (data && typeof data === 'object' && 'keyword' in data) {
    return data as Persona
  }

  // 1-2) { content: "..." } 래핑된 문자열
  if (data && typeof data === 'object' && 'content' in data) {
    const content = (data as { content?: unknown }).content
    if (typeof content === 'string') {
      // content 문자열이 JSON 일 수도 있으므로 먼저 파싱 시도
      const embedded = tryParseJson(content)
      if (embedded) {
        try {
          return normalizeQuestionResponse(embedded)
        } catch {
          // fallback below
        }
      }
      const parsed = parseContentString(content)
      if (parsed) return parsed
    }
  }

  // 2) 새로운 추천 맵 형태: { "1. 제주도 - ...": { "추천이유": "..." }, ... }
  if (data && typeof data === 'object') {
    const entries = Object.entries(
      data as Record<string, { 추천이유?: string; recommend_reason?: string; travel_destination?: string; 여행지?: string } | string>
    )

    const recommendations = entries.map(([key, value], idx) => {
      const [rankPart, ...rest] = key.split('.')
      const rank = rankPart.trim() || String(idx + 1)
      const titleFromKey = rest.join('.').trim()

      const isObject = value && typeof value === 'object'
      const destination = isObject
        ? String(
            (value as { travel_destination?: unknown; 여행지?: unknown }).travel_destination ??
            (value as { travel_destination?: unknown; 여행지?: unknown }).여행지 ??
            ''
          ).trim()
        : typeof value === 'string'
          ? value.trim()
          : ''

      const reasonCandidate = isObject
        ? (value as { recommend_reason?: unknown; 추천이유?: unknown }).recommend_reason ??
          (value as { recommend_reason?: unknown; 추천이유?: unknown }).추천이유
        : undefined

      const title = titleFromKey || destination || key.trim() || `추천 ${idx + 1}`
      const reason = reasonCandidate ? String(reasonCandidate) : ''

      return {
        id: `${rank || idx + 1}-${title}`.replace(/\s+/g, '-'),
        rank,
        title,
        reason,
      }
    })

    return {
      keyword: '추천 결과',
      tags: [],
      description: '아래 추천 여행지를 확인하세요.',
      destinations: [],
      itinerary: [],
      recommendations,
    }
  }

  // 3) content 문자열 안에 목록이 들어있는 경우 (예: "1. 서울 - ...\n추천이유: ...")
  if (typeof data === 'string') {
    const embedded = tryParseJson(data)
    if (embedded) {
      try {
        return normalizeQuestionResponse(embedded)
      } catch {
        // fallback below
      }
    }

    const parsed = parseContentString(data)
    if (parsed) return parsed
  }

  throw new Error('추천 결과를 해석할 수 없습니다.')
}

export default function FollowupQuestionPage() {
  const navigate = useNavigate()
  const [answers] = useState<number[] | null>(() => getAnswers())
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!answers || answers.length === 0) {
      navigate('/planner', { replace: true })
    }
  }, [answers, navigate])

  const runAnalysis = async (value: string) => {
    if (!answers || loading) return
    setLoading(true)
    setError(null)

    try {
      const content = value.trim()

      // 질문 등록 엔드포인트로 자연어 전달 (필수 토큰 자동 포함)
      const response = await postQuestion({ content })
      const persona = normalizeQuestionResponse(response)

      // 2) 성공 시 결과 저장 후 이동
      setPersona(persona)
      navigate('/result', { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '추천 생성에 실패했습니다.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    runAnalysis(prompt)
  }

  return (
    <PageShell outerClassName="py-10">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">조금만 더 알려주세요</h1>
        <p className="mt-2 text-sm text-slate-600">
          궁금한 점이나 여행 목적을 적어주시면 추천에 반영해볼게요. 건너뛰어도 괜찮아요.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-800">추가 요청 (선택)</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={5}
              placeholder="예)서핑이나 바다 액티비티를 넣어줘. 비건 식당도 한 군데 있으면 좋겠어."
              disabled={loading}
            />
            <p className="text-xs text-slate-500">예: 신혼여행, 아이 동반, 할머니와 이동 편한 루트, 야간 이동 최소화 등</p>
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Spinner />}
              결과 보기
            </button>
            <button
              type="button"
              onClick={() => runAnalysis('')}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              건너뛰고 결과 보기
            </button>
          </div>
        </form>
      </Card>
    </PageShell>
  )
}
