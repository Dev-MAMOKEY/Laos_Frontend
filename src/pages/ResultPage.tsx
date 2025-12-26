import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import HeartButton from '../components/ui/HeartButton'
import { getFavorites, setFavorites } from '../storage/favoritesStorage'
import { getPersona } from '../storage/personaStorage'

export default function ResultPage() {
  const persona = useMemo(() => getPersona(), [])

  const [favorites, setFavoritesState] = useState<string[]>(() => getFavorites())

  if (!persona) {
    return <Navigate to="/planner" replace />
  }

  const onToggleFavorite = (destinationId: string) => {
    setFavoritesState((prev) => {
      const next = prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId]
      setFavorites(next)
      return next
    })
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

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">추천 일정</h3>
          <p className="mt-1 text-sm text-slate-600">
            아래로 내려가며 Day별 일정이 이어집니다.
          </p>

          <div className="mt-4 space-y-3">
            {persona.itinerary.map((day) => (
              <div key={day.day} className="rounded-2xl border-2 border-slate-200 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Day {day.day}</p>
                  <p className="text-sm text-slate-600">{day.title}</p>
                </div>

                <div className="mt-3 space-y-2">
                  {day.items.map((item) => {
                    const isFavorite = favorites.includes(item.id)
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
                          <HeartButton
                            active={isFavorite}
                            onClick={() => onToggleFavorite(item.id)}
                            ariaLabel={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                            title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                          />
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
      </div>
    </PageShell>
  )
}
