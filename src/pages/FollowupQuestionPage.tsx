import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { analyzePersonaAsync } from '../services/personaService'
import { postQuestion } from '../services/api'
import { getAnswers, setPersona } from '../storage/personaStorage'

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
      const persona = await postQuestion({ content, answers })

      // 2) 성공 시 결과 저장 후 이동
      setPersona(persona)
      navigate('/result', { replace: true })
    } catch (e) {
      // 실패하면 기존 MBTI 엔드포인트/로컬 로직으로 폴백
      try {
        const persona = await analyzePersonaAsync(answers, value.trim() || undefined)
        setPersona(persona)
        navigate('/result', { replace: true })
        return
      } catch (fallbackErr) {
        const msg = fallbackErr instanceof Error ? fallbackErr.message : '추천 생성에 실패했습니다.'
        setError(msg)
      }
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
