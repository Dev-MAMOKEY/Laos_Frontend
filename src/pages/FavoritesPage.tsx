import { useEffect, useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import { fetchFavorites, fetchHistory, addFavorite, removeFavorite, type BookmarkItem, type HistoryEntry } from '../services/api'

function useHistoryList() {
  const [data, setData] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    setLoading(true)
    setError(null)
    fetchHistory()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : '히스토리를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  return { data, loading, error, refresh }
}

function useFavorites() {
  const [data, setData] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState<string | null>(null)

  const refresh = () => {
    setLoading(true)
    setError(null)
    fetchFavorites()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : '즐겨찾기를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  const toggle = async (ai_num: string) => {
    const existing = data.find((f) => f.ai_num === ai_num)
    const like = existing?.like_num ?? ai_num
    setMutating(like)
    setError(null)

    try {
      if (existing) {
        await removeFavorite(like)
        setData((prev) => prev.filter((f) => f.ai_num !== ai_num))
      } else {
        const created = await addFavorite(ai_num, ai_num)
        setData((prev) => [...prev, created])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '즐겨찾기 처리에 실패했습니다.')
    } finally {
      setMutating(null)
    }
  }

  return { data, loading, error, mutating, toggle, refresh }
}

export default function FavoritesPage() {
  const history = useHistoryList()
  const favorites = useFavorites()

  const favoriteSet = useMemo(() => new Set(favorites.data.map((f) => f.ai_num)), [favorites.data])

  return (
    <PageShell outerClassName="py-6">
      <div className="space-y-4">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900">즐겨찾기</h1>
          <p className="mt-1 text-sm text-slate-600">히스토리에서 바로 즐겨찾기를 관리하세요.</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">히스토리</h2>
              <p className="mt-1 text-sm text-slate-600">생성된 항목을 즐겨찾기에 추가할 수 있습니다.</p>
            </div>
            <button
              type="button"
              onClick={history.refresh}
              className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50"
            >
              새로고침
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {history.loading && <p className="text-sm text-slate-600">불러오는 중...</p>}
            {!history.loading && history.error && <p className="text-sm text-red-700">{history.error}</p>}
            {!history.loading && history.data.length === 0 && !history.error && (
              <p className="text-sm text-slate-600">히스토리가 없습니다.</p>
            )}

            {history.data.map((h) => {
              const isFav = favoriteSet.has(h.ai_num)
              return (
                <div key={h.ai_num} className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{h.title}</p>
                    <p className="text-xs text-slate-600">ai_num: {h.ai_num}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => favorites.toggle(h.ai_num)}
                    disabled={favorites.mutating === h.ai_num}
                    className={
                      'rounded-2xl border-2 px-3 py-1 text-xs font-semibold transition-colors ' +
                      (isFav
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50')
                    }
                  >
                    {isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  </button>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">즐겨찾기 목록</h2>
          <p className="mt-1 text-sm text-slate-600">현재 저장된 즐겨찾기입니다.</p>

          <div className="mt-3 space-y-2">
            {favorites.loading && <p className="text-sm text-slate-600">불러오는 중...</p>}
            {!favorites.loading && favorites.error && <p className="text-sm text-red-700">{favorites.error}</p>}
            {!favorites.loading && favorites.data.length === 0 && !favorites.error && (
              <p className="text-sm text-slate-600">즐겨찾기가 없습니다.</p>
            )}

            {favorites.data.map((f) => (
              <div key={f.like_num} className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white px-3 py-2">
                <div className="text-sm text-slate-800">ai_num: {f.ai_num} · like_num: {f.like_num}</div>
                <button
                  type="button"
                  onClick={() => favorites.toggle(f.ai_num)}
                  disabled={favorites.mutating === f.like_num}
                  className="rounded-2xl border-2 border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
