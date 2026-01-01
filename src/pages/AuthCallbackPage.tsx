import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from '../services/authService'
import type { OAuthProvider } from '../services/authService'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { setAuthed } from '../storage/authStorage'

function isProvider(v: string | null): v is OAuthProvider {
  return v === 'google' || v === 'facebook'
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  const providerRaw = params.get('provider')
  const code = params.get('code')
  const token = params.get('token')
  const email = params.get('email')
  const username = params.get('username')

  const immediateError = useMemo(() => {
    if (!isProvider(providerRaw)) return 'provider 정보가 없습니다.'
    if (!email && !code) return 'code 또는 email 파라미터가 없습니다.'
    return null
  }, [code, email, providerRaw])

  useEffect(() => {
    if (immediateError) return
    if (!isProvider(providerRaw)) return

    const finish = (profile: { email: string; username?: string }, accessToken?: string, refreshToken?: string) => {
      setAuthed({ email: profile.email }, accessToken, undefined, refreshToken)
      navigate('/planner', { replace: true })
    }

    // 1) 백엔드가 redirect에서 token/profile을 query로 내려주는 경우
    if (email) {
      finish({ email, username: username ?? undefined }, token ?? undefined)
      return
    }

    // 2) 표준 플로우: code를 백엔드로 보내 교환
    if (!code) return

    const redirectUri = `${window.location.origin}/auth/callback`

    exchangeCodeForToken({ provider: providerRaw, code, redirectUri })
      .then((result) => {
        finish(result.profile, result.token)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '소셜 로그인에 실패했습니다.')
      })
  }, [code, email, immediateError, navigate, providerRaw, token, username])

  return (
    <PageShell outerClassName="py-10">
      <Card>
        {!immediateError && !error ? (
          <div className="flex items-center gap-3">
            <Spinner />
            <p className="text-slate-700">로그인 처리 중...</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-slate-900">로그인 실패</h1>
            <p className="mt-2 text-sm text-red-700">{immediateError ?? error}</p>
            <div className="mt-4">
              <Link
                to="/login"
                className="inline-flex rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </>
        )}
      </Card>
    </PageShell>
  )
}
