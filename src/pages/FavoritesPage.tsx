import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import ToggleTabs from '../components/ui/ToggleTabs'
import HeartButton from '../components/ui/HeartButton'
import {
  addFavorite,
  fetchFavorites,
  fetchHistory,
  removeFavorite,
  type HistoryEntry,
} from '../services/api'

export default function FavoritesPage() {
  const [tab, setTab] = useState<'history' | 'favorites'>('favorites')

  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)

  const [favorites, setFavorites] = useState<string[]>([])
  const [favoritesError, setFavoritesError] = useState<string | null>(null)
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [favoriteMutating, setFavoriteMutating] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const result = await fetchHistory()
      setHistory(result.slice().sort((a, b) => b.createdAt - a.createdAt))
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : '히스토리를 불러오지 못했습니다.')
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const loadFavorites = useCallback(async () => {
    setFavoritesLoading(true)
    setFavoritesError(null)
    try {
      const result = await fetchFavorites()
      setFavorites(result)
    } catch (e) {
      setFavoritesError(e instanceof Error ? e.message : '즐겨찾기를 불러오지 못했습니다.')
    } finally {
      setFavoritesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
    loadFavorites()
  }, [loadFavorites, loadHistory])

  const favoriteItems = useMemo(() => {
    if (favorites.length === 0) return [] as { id: string; title: string; description: string; dayLabel?: string }[]

    const itemMap = new Map<string, { title: string; description: string; dayLabel?: string }>()

    for (const entry of history) {
      for (const day of entry.persona.itinerary) {
        for (const item of day.items) {
          itemMap.set(item.id, {
            title: item.title,
            description: item.description,
            dayLabel: `Day ${day.day} · ${day.title}`,
          })
        }
      }
    }

    return favorites
      .map((id) => {
        const meta = itemMap.get(id)
        if (!meta) return null
        return { id, ...meta }
      })
      .filter(Boolean) as { id: string; title: string; description: string; dayLabel?: string }[]
  }, [favorites, history])

  const onToggleFavorite = (id: string) => {
    setFavoritesError(null)
    setFavoriteMutating(id)

    setFavorites((prev) => {
      const isAdding = !prev.includes(id)
      const snapshot = prev
      const next = isAdding ? [...prev, id] : prev.filter((x) => x !== id)

      const request = isAdding ? addFavorite(id) : removeFavorite(id)

      request
        .then((updated) => {
          setFavorites(updated)
        })
        .catch((e) => {
          setFavorites(snapshot)
          setFavoritesError(e instanceof Error ? e.message : '즐겨찾기 처리에 실패했습니다.')
        })
        .finally(() => setFavoriteMutating(null))

      return next
    })
  }

  return (
    <PageShell>
      <div className="space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">내 보관함</h1>
              <p className="mt-1 text-sm text-slate-600">히스토리와 즐겨찾기를 확인하세요.</p>
            </div>
            <Link
              to="/result"
              className="inline-flex rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
            >
              결과로
            </Link>
          </div>

          <div className="mt-5">
            <ToggleTabs
              value={tab}
              onChange={setTab}
              left={{ value: 'favorites', label: '즐겨찾기' }}
              right={{ value: 'history', label: '히스토리' }}
            />
          </div>
        </Card>

        {tab === 'favorites' ? (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">즐겨찾기</h2>
            <p className="mt-1 text-sm text-slate-600">저장한 일정 항목이 여기에 모입니다.</p>

            <div className="mt-4 space-y-3">
              {favoritesLoading && (
                <p className="text-sm text-slate-600">즐겨찾기를 불러오는 중입니다...</p>
              )}

              {!favoritesLoading && favoritesError && (
                <p className="text-sm text-red-700">{favoritesError}</p>
              )}

              {!favoritesLoading && favorites.length === 0 && !favoritesError && (
                <p className="text-sm text-slate-600">아직 즐겨찾기가 없습니다.</p>
              )}

              {favorites.length > 0 && favoriteItems.length === 0 && (
                <p className="text-sm text-slate-600">
                  즐겨찾기 데이터는 있지만, 연결된 히스토리가 없습니다.
                </p>
              )}

              {favoriteItems.map((item) => {
                const isFavorite = favorites.includes(item.id)
                return (
                  <div key={item.id} className="rounded-2xl border-2 border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {item.dayLabel && (
                          <p className="text-xs font-medium text-slate-500">{item.dayLabel}</p>
                        )}
                        <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                      </div>
                      <HeartButton
                        active={isFavorite}
                        onClick={() => onToggleFavorite(item.id)}
                        disabled={favoriteMutating === item.id}
                        ariaLabel={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">히스토리</h2>
            <p className="mt-1 text-sm text-slate-600">이전에 생성된 결과 목록입니다.</p>

            <div className="mt-4 space-y-3">
              {historyLoading && (
                <p className="text-sm text-slate-600">히스토리를 불러오는 중입니다...</p>
              )}

              {!historyLoading && historyError && (
                <p className="text-sm text-red-700">{historyError}</p>
              )}

              {!historyLoading && history.length === 0 && !historyError ? (
                <p className="text-sm text-slate-600">아직 히스토리가 없습니다.</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="rounded-2xl border-2 border-slate-200 p-4">
                    <p className="text-xs text-slate-500">
                      {new Date(h.createdAt).toLocaleString('ko-KR')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{h.persona.keyword}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{h.persona.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {h.persona.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}
