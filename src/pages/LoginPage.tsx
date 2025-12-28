import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import ToggleTabs from '../components/ui/ToggleTabs'
import { setAuthed } from '../storage/authStorage'
import { postLogin, postRegister } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('')

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const completeAuthAndGo = (email: string, username?: string) => {
    setAuthed({ email, username })
    navigate('/planner', { replace: true })
  }

  const onSocialLogin = (provider: 'google' | 'facebook') => {
    navigate(`/auth/${provider}`)
  }

  const onSubmitLogin = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const email = loginEmail.trim()
    const password = loginPassword

    // 백엔드 로그인 호출 (서버 없으면 에러 메시지 표출)
    setIsSubmitting(true)
    postLogin({ user_id: email, password })
      .then((res) => {
        const username = res.username ?? email.split('@')[0]
        const token = res.token
        completeAuthAndGo(email, username)
        if (token) {
          // setAuthed already stores token when provided
          setAuthed({ email, username }, token)
        }
      })
      .catch((e) => {
        setFormError(e instanceof Error ? e.message : '로그인에 실패했습니다.')
      })
      .finally(() => setIsSubmitting(false))
  }

  const onSubmitSignup = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const email = signupEmail.trim()
    const username = signupUsername.trim()

    if (signupPassword.length < 6) {
      setFormError('비밀번호는 6자 이상으로 입력해주세요.')
      return
    }

    if (signupPassword !== signupPasswordConfirm) {
      setFormError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    // 백엔드 회원가입 호출 (서버 없으면 에러 메시지 표출)
    setIsSubmitting(true)
    postRegister({
      user_id: username,
      username,
      password: signupPassword,
      email,
      'email-code': '000000',
    })
      .then((res) => {
        const token = res.token
        if (token) setAuthed({ email, username }, token)
        completeAuthAndGo(email, username)
      })
      .catch((e) => {
        setFormError(e instanceof Error ? e.message : '회원가입에 실패했습니다.')
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <PageShell outerClassName="py-10">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">MBTI Travel</h1>
        <p className="mt-1 text-sm text-slate-600">로그인 또는 회원가입 후 시작하세요.</p>

        <div className="mt-5">
          <ToggleTabs
            value={mode}
            onChange={(next) => {
              setMode(next)
              setFormError(null)
            }}
            left={{ value: 'login', label: '로그인' }}
            right={{ value: 'signup', label: '회원가입' }}
          />
        </div>

        <div className="mt-5">
          {formError && (
            <div className="mb-4 rounded-2xl border-2 border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={onSubmitLogin}>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="loginEmail">
                    이메일
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="loginPassword">
                    비밀번호
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </button>

                <p className="text-xs text-slate-500">
                  데모용 UI입니다. 실제 인증은 연결되어 있지 않습니다.
                </p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={onSubmitSignup}>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="signupEmail">
                    이메일
                  </label>
                  <input
                    id="signupEmail"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="signupUsername">
                    아이디
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="signupUsername"
                      type="text"
                      required
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                      placeholder="아이디를 입력하세요"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="signupPassword">
                    비밀번호
                  </label>
                  <input
                    id="signupPassword"
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="6자 이상"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="signupPasswordConfirm"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    id="signupPasswordConfirm"
                    type="password"
                    required
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    placeholder="비밀번호를 다시 입력"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {isSubmitting ? '회원가입 중...' : '회원가입 완료 후 테스트 시작'}
                </button>

                <p className="text-xs text-slate-500">
                  회원가입이 완료되면 바로 테스트 화면으로 이동합니다.
                </p>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">또는</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onSocialLogin('google')}
              className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-colors hover:bg-blue-50"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => onSocialLogin('facebook')}
              className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-colors hover:bg-blue-50"
            >
              Facebook
            </button>
          </div>
        </div>
      </Card>
    </PageShell>
  )
}
