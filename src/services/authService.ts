export type OAuthProvider = 'google' | 'facebook'

export type AuthProfile = {
  email: string
  username?: string
}

export type AuthCallbackResult = {
  profile: AuthProfile
  token?: string
}

function getAuthApiUrl(): string | undefined {
  return import.meta.env.VITE_AUTH_API_URL as string | undefined
}

export function buildStartOAuthUrl(provider: OAuthProvider, redirectUri: string): string {
  const apiUrl = getAuthApiUrl()

  if (!apiUrl) {
    throw new Error('VITE_AUTH_API_URL이 설정되지 않았습니다.')
  }

  const url = new URL(`${apiUrl.replace(/\/$/, '')}/auth/${provider}/start`)
  url.searchParams.set('redirect_uri', redirectUri)
  return url.toString()
}

export async function exchangeCodeForToken(params: {
  provider: OAuthProvider
  code: string
  redirectUri: string
}): Promise<AuthCallbackResult> {
  const apiUrl = getAuthApiUrl()
  if (!apiUrl) {
    throw new Error('VITE_AUTH_API_URL이 설정되지 않았습니다.')
  }

  const res = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: params.provider,
      code: params.code,
      redirect_uri: params.redirectUri,
    }),
  })


  if (!res.ok) {
    throw new Error('소셜 로그인 처리에 실패했습니다.')
  }

  const data = (await res.json()) as AuthCallbackResult
  if (!data?.profile?.email) {
    throw new Error('프로필 정보가 올바르지 않습니다.')
  }

  return data
}
