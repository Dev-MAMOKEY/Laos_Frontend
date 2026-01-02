import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { postQuestion } from '../services/api'
import { getAnswers, getMbtiPersona, setPersona } from '../storage/personaStorage'
import type { Persona } from '../types/persona'

function tryParseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normalizeQuestionResponse(data: unknown): Persona {
  // 배열 형태만 지원: [{ travel_destination, recommend_reason } ...]
  if (Array.isArray(data)) {
    const recommendations = data.map((item, idx) => {
      const destination = typeof item === 'object' && item
        ? String((item as { travel_destination?: unknown; 여행지?: unknown }).travel_destination ??
            (item as { 여행지?: unknown }).여행지 ?? '').trim()
        : ''
      const reason = typeof item === 'object' && item
        ? String((item as { recommend_reason?: unknown; 추천이유?: unknown }).recommend_reason ??
            (item as { 추천이유?: unknown }).추천이유 ?? '').trim()
        : ''

      const title = destination || `추천 ${idx + 1}`
      return {
        id: `${idx + 1}-${title}`.replace(/\s+/g, '-'),
        rank: String(idx + 1),
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

  // content 래핑 문자열인 경우: 문자열을 JSON으로 파싱 후 재시도
  if (data && typeof data === 'object' && 'content' in data) {
    const content = (data as { content?: unknown }).content
    if (typeof content === 'string') {
      const embedded = tryParseJson(content)
      if (embedded) return normalizeQuestionResponse(embedded)
    }
  }

  // 순수 문자열로 온 경우 JSON 파싱 시도
  if (typeof data === 'string') {
    const embedded = tryParseJson(data)
    if (embedded) return normalizeQuestionResponse(embedded)
  }

  throw new Error('추천 결과를 해석할 수 없습니다. (배열 형태 필요)')
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

      // MBTI 기반 정보는 유지하고, 추천/여행지 응답을 병합해 저장
      const mbtiPersona = getMbtiPersona()
      const merged = mbtiPersona
        ? {
            ...mbtiPersona,
            // 추천 응답이 가진 필드는 우선 적용 (특히 recommendations)
            ...persona,
            keyword: mbtiPersona.keyword,
            description: mbtiPersona.description,
            tags: mbtiPersona.tags,
          }
        : persona

      // 2) 성공 시 결과 저장 후 이동
      setPersona(merged)
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
              placeholder="예)연인과의 여행."
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
