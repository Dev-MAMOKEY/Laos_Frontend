import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { buildStartOAuthUrl } from '../services/authService'
import type { OAuthProvider } from '../services/authService'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

function isProvider(v: string | undefined): v is OAuthProvider {
  return v === 'google' || v === 'facebook'
}

export default function AuthStartPage() {
  const params = useParams()
  const provider = params.provider

  useEffect(() => {
    if (!isProvider(provider)) return

    const redirectUri = `${window.location.origin}/auth/callback`
    const url = buildStartOAuthUrl(provider, redirectUri)
    window.location.assign(url)
  }, [provider])

  if (!isProvider(provider)) {
    return <Navigate to="/login" replace />
  }

  return (
    <PageShell outerClassName="py-10">
      <Card>
        <div className="flex items-center gap-3">
          <Spinner />
          <p className="text-slate-700">{provider} 로그인으로 이동 중...</p>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          잠시만 기다려 주세요. 자동으로 전환되지 않으면 뒤로 가서 다시 시도해 주세요.
        </p>
      </Card>
    </PageShell>
  )
}
