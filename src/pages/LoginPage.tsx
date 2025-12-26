import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import ToggleTabs from '../components/ui/ToggleTabs'
import { setAuthed } from '../storage/authStorage'
import { getUsers, setUsers } from '../storage/usersStorage'
import type { StoredUser } from '../storage/usersStorage'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('')

  const [usernameCheck,
    setUsernameCheck,
  ] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')

  const [formError, setFormError] = useState<string | null>(null)

  const completeAuthAndGo = (email: string, username?: string) => {
    setAuthed({ email, username })
    navigate('/planner', { replace: true })
  }

  const onSocialLogin = (provider: 'google' | 'facebook') => {
    navigate(`/auth/${provider}`)
  }

  const onCheckUsername = () => {
    setFormError(null)

    const username = signupUsername.trim()
    if (username.length < 3) {
      setUsernameCheck('invalid')
      return
    }

    setUsernameCheck('checking')
    window.setTimeout(() => {
      const users = getUsers()
      const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase())
      setUsernameCheck(exists ? 'taken' : 'available')
    }, 300)
  }

  const onSubmitLogin = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const email = loginEmail.trim()
    const password = loginPassword

    const users = getUsers()
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (found && found.password !== password) {
      setFormError('비밀번호가 올바르지 않습니다.')
      return
    }

    completeAuthAndGo(email, found?.username)
  }

  const onSubmitSignup = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const email = signupEmail.trim()
    const username = signupUsername.trim()

    if (usernameCheck !== 'available') {
      setFormError('아이디 중복확인을 먼저 완료해주세요.')
      return
    }

    if (signupPassword.length < 6) {
      setFormError('비밀번호는 6자 이상으로 입력해주세요.')
      return
    }

    if (signupPassword !== signupPasswordConfirm) {
      setFormError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    const users = getUsers()
    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase())
    const usernameExists = users.some((u) => u.username.toLowerCase() === username.toLowerCase())

    if (emailExists) {
      setFormError('이미 가입된 이메일입니다.')
      return
    }
    if (usernameExists) {
      setFormError('이미 사용 중인 아이디입니다.')
      setUsernameCheck('taken')
      return
    }

    const nextUsers: StoredUser[] = [...users, { email, username, password: signupPassword }]
    setUsers(nextUsers)

    completeAuthAndGo(email, username)
  }

  const usernameHelpText = (() => {
    switch (usernameCheck) {
      case 'invalid':
        return '아이디는 3자 이상이어야 합니다.'
      case 'checking':
        return '확인 중...'
      case 'available':
        return '사용 가능한 아이디입니다.'
      case 'taken':
        return '이미 사용 중인 아이디입니다.'
      default:
        return null
    }
  })()

  const usernameHelpTone =
    usernameCheck === 'available'
      ? 'text-green-700'
      : usernameCheck === 'taken' || usernameCheck === 'invalid'
        ? 'text-red-600'
        : 'text-slate-500'

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
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  로그인
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
                      onChange={(e) => {
                        setSignupUsername(e.target.value)
                        setUsernameCheck('idle')
                      }}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                      placeholder="아이디를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={onCheckUsername}
                      className="whitespace-nowrap rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50"
                      disabled={usernameCheck === 'checking'}
                    >
                      중복확인
                    </button>
                  </div>
                  {usernameHelpText && (
                    <p className={`mt-2 text-xs ${usernameHelpTone}`}>{usernameHelpText}</p>
                  )}
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
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  회원가입 완료 후 테스트 시작
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
