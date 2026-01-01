import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import { clearAnswers, clearPersona, getPersona } from '../storage/personaStorage'
import { addFavorite, fetchFavorites, removeFavorite, type BookmarkItem } from '../services/api'

function findLikeNum(favorites: BookmarkItem[], aiId: string): string | null {
  const hit = favorites.find((f) => f.ai_num === aiId)
  return hit ? hit.like_num : null
}

export default function ResultPage() {
  const persona = useMemo(() => getPersona(), [])
  const [favorites, setFavorites] = useState<BookmarkItem[]>([])
  const [favoritesError, setFavoritesError] = useState<string | null>(null)
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [mutatingLike, setMutatingLike] = useState<string | null>(null)
  const hasRecommendations = Boolean(persona?.recommendations?.length)

  useEffect(() => {
    return () => {
      clearAnswers()
      clearPersona()
    }
  }, [])

  if (!persona) {
    return <Navigate to="/planner" replace />
  }

  const toggleFavorite = async (aiId: string) => {
    const existingLike = findLikeNum(favorites, aiId)
    setFavoritesError(null)
    setMutatingLike(existingLike ?? aiId)

    try {
      if (existingLike) {
        await removeFavorite(existingLike)
        setFavorites((prev) => prev.filter((f) => f.ai_num !== aiId))
      } else {
        const created = await addFavorite(aiId, aiId)
        setFavorites((prev) => [...prev, created])
      }
    } catch (e) {
      setFavoritesError(e instanceof Error ? e.message : '즐겨찾기 처리에 실패했습니다.')
    } finally {
      setMutatingLike(null)
    }
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
              <Link
                to="/favorites"
                className="inline-flex rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
              >
                즐겨찾기
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">당신의 페르소나</h2>
          <p className="mt-1 text-xl font-bold text-blue-600">{persona.keyword}</p>
          <p className="mt-3 text-slate-700">{persona.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {persona.tags.map((tag) => (
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
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {item.rank}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-700">{item.reason}</p>
                      </div>
                    </div>
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

              {favoritesLoading && (
                <p className="mt-2 text-sm text-slate-500">즐겨찾기 동기화 중...</p>
              )}
              {!favoritesLoading && favoritesError && (
                <p className="mt-2 text-sm text-red-700">{favoritesError}</p>
              )}

              <div className="mt-4 space-y-3">
                {persona.itinerary.map((day) => (
                  <div key={day.day} className="rounded-2xl border-2 border-slate-200 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">Day {day.day}</p>
                      <p className="text-sm text-slate-600">{day.title}</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {day.items.map((item) => {
                        const likeNum = findLikeNum(favorites, item.id)
                        const isFavorite = Boolean(likeNum)
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
                              <button
                                type="button"
                                onClick={() => toggleFavorite(item.id)}
                                disabled={mutatingLike === likeNum || mutatingLike === item.id}
                                className={
                                  'inline-flex items-center rounded-2xl border-2 px-3 py-1 text-xs font-semibold transition-colors ' +
                                  (isFavorite
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50')
                                }
                              >
                                {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                              </button>
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
                {persona.destinations.map((d) => (
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
