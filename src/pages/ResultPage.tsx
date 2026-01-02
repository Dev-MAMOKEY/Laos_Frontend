import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import { clearAnswers, clearMbtiPersona, clearPersona, getMbtiPersona, getPersona } from '../storage/personaStorage'
import { clearAuth } from '../storage/authStorage'
import { logout } from '../services/api'

export default function ResultPage() {
  const persona = useMemo(() => getPersona(), [])
  const mbtiPersona = useMemo(() => getMbtiPersona(), [])
  const mbtiKeyword = mbtiPersona?.keyword ?? persona?.keyword ?? ''
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const hasRecommendations = Boolean(persona?.recommendations?.length)

  if (!persona) {
    return <Navigate to="/planner" replace />
  }

  return (
    <PageShell>
      <div className="space-y-4">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900">분석 결과</h1>
          <p className="mt-1 text-sm text-slate-600">
            추천을 바탕으로 일정을 구성해보세요.
          </p>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Link
                to="/planner"
                className="inline-flex rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
              >
                다시 테스트하기
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setLogoutError(null)
                  setLogoutLoading(true)
                  try {
                    await logout()
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : '로그아웃에 실패했습니다.'
                    setLogoutError(msg)
                    setLogoutLoading(false)
                    return
                  }

                  clearAuth()
                  clearPersona()
                  clearMbtiPersona()
                  clearAnswers()
                  setLogoutLoading(false)
                  window.location.href = '/login'
                }}
                disabled={logoutLoading}
                className="inline-flex rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {logoutLoading ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
            {logoutError && <p className="mt-2 text-sm text-red-700">{logoutError}</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">당신의 MBTI 페르소나</h2>
          {mbtiKeyword ? (
            <p className="mt-1 text-sm text-slate-700">
              당신의 MBTI인 <span className="font-semibold text-blue-700">{mbtiKeyword}</span>
              (을)를 바탕으로 분석한 결과입니다.
            </p>
          ) : (
            <p className="mt-1 text-sm text-red-700">MBTI 정보를 불러올 수 없습니다.</p>
          )}
          <p className="mt-3 text-slate-700">{mbtiPersona?.description ?? persona.description ?? ''}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(mbtiPersona?.tags ?? persona.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
        {hasRecommendations ? (
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">추천 결과</h3>
            <p className="mt-1 text-sm text-slate-600">받은 추천 여행지를 확인하세요.</p>

            <div className="mt-4 space-y-3">
              {persona.recommendations?.length ? (
                persona.recommendations.map((item) => (
                  <div key={item.id} className="rounded-2xl border-2 border-slate-200 p-4">
                    <p className="text-base font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">추천 결과가 없습니다.</p>
              )}
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <h3 className="text-lg font-semibold text-slate-900">추천 일정</h3>
              <p className="mt-1 text-sm text-slate-600">
                아래로 내려가며 Day별 일정이 이어집니다.
              </p>

              <div className="mt-4 space-y-3">
                {(persona.itinerary ?? []).map((day) => (
                  <div key={day.day} className="rounded-2xl border-2 border-slate-200 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">Day {day.day}</p>
                      <p className="text-sm text-slate-600">{day.title}</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {day.items.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl border-2 border-slate-200 bg-white p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900">추천 여행지</h3>
              <div className="mt-4 space-y-3">
                {(persona.destinations ?? []).map((d) => (
                  <div key={d.id} className="rounded-2xl border-2 border-slate-200 p-4">
                    <p className="text-base font-semibold text-slate-900">{d.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{d.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </PageShell>
  )
}
