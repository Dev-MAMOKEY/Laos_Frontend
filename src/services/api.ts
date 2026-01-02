import axios, { AxiosHeaders, type AxiosInstance, type AxiosRequestHeaders } from 'axios'
import type { Persona } from '../types/persona'
import { jwtDecode } from 'jwt-decode' //jwt 디코드 라이브러리
import { getAuthToken } from '../storage/authStorage'

export type AuthResponse = {
  status?: number
  message?: string
  token?: string // legacy
  accessToken?: string
  refreshToken?: string
  email?: string
  username?: string
  user_num?: string | number
}

export type OAuthTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export type MbtiAnswer = {
  questionId: number
  answer: 0 | 1
}

type ApiInit = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  token?: string | null
  skipAuth?: boolean
  signal?: AbortSignal
  baseOverride?: string
  headers?: Record<string, string>
}

function normalizeBase(url: string | undefined): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/\/$/, '')
}

function ensureApiBase(): string {
  // dev에서는 기본적으로 프록시(/api)로 우선 보내고, 필요 시 VITE_API_BASE_URL_FORCE_REMOTE=true 로 원격 사용
  const useRemote = String(import.meta.env.VITE_API_BASE_URL_FORCE_REMOTE ?? '').toLowerCase() === 'true'
  const base = import.meta.env.DEV && !useRemote
    ? '/api'
    : normalizeBase(import.meta.env.VITE_API_BASE_URL as string | undefined)

  if (!base) throw new Error('VITE_API_BASE_URL이 설정되지 않았습니다.')
  return base
}

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  })
  return client
}

function getClient(baseOverride?: string): AxiosInstance {
  const base = baseOverride ?? ensureApiBase()
  return createClient(base)
}

async function apiRequest<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { baseOverride, skipAuth, method = 'GET', body, signal } = init
  const client = getClient(baseOverride)

  const headers: AxiosRequestHeaders = new AxiosHeaders({ 'Content-Type': 'application/json', ...(init.headers ?? {}) })
  if (!skipAuth) {
    const token = init.token ?? getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  try {
    const res = await client.request<T>({
      url: path,
      method,
      data: body,
      signal,
      headers,
    })
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message =
        typeof err.response?.data === 'object' && err.response?.data !== null && 'message' in (err.response?.data as object)
          ? String((err.response?.data as { message?: unknown }).message)
          : err.message || 'API 요청에 실패했습니다.'
      throw new Error(message)
    }
    throw err instanceof Error ? err : new Error('API 요청에 실패했습니다.')
  }
}

export async function postPersonaAnalysis(answers: MbtiAnswer[]): Promise<Persona> {
  const useRemote = String(import.meta.env.VITE_API_BASE_URL_FORCE_REMOTE ?? '').toLowerCase() === 'true'
  const personaBase = import.meta.env.DEV && !useRemote
    ? '/api'
    : normalizeBase(import.meta.env.VITE_API_BASE_URL as string | undefined) ??
      normalizeBase(import.meta.env.VITE_PERSONA_API_URL as string | undefined)

  if (!personaBase) {
    throw new Error('VITE_API_BASE_URL 또는 VITE_PERSONA_API_URL이 필요합니다.')
  }

  // MBTI 테스트 백엔드에 답변과 선택적 자연어 조건을 전송
  return apiRequest<Persona>('/mbti/test', {
    method: 'POST',
    body: { answers },
    // MBTI 테스트는 인증이 필요하므로 기본 토큰 전송
    skipAuth: false,
    baseOverride: personaBase,
  })
}

export async function postQuestion(payload: { content: string }): Promise<unknown> {
  // 질문 등록 엔드포인트로 자연어 요청을 보냄 (응답 포맷이 유동적이라 unknown 처리)
  return apiRequest<unknown>('/question', {
    method: 'POST',
    body: payload,
  })
}

export async function postRegister(payload: {
  localId: string
  password: string
  nickname: string
  email: string
  // 'email-code': string
}): Promise<AuthResponse> {
  // 회원가입 요청을 백엔드로 위임한다. 백엔드 미구현 시 에러만 반환됨.
  return apiRequest<AuthResponse>('/register', { method: 'POST', body: payload, skipAuth: true })
}

export async function postLogin(payload: {
    localId: string; 
    password: string 
}): Promise<AuthResponse> {
  // 로컬(이메일/비번) 로그인 엔드포인트
  return apiRequest<AuthResponse>('/login', { method: 'POST', body: payload, skipAuth: true })
}

// export async function postEmailCode(payload: { email: string }): Promise<AuthResponse> {
//   // 이메일 인증 코드 요청
//   return apiRequest<AuthResponse>('/auth/email/send', { method: 'POST', body: payload, skipAuth: true })
// }
// export async function 

export async function postFacebookOAuthCallback(code: string): Promise<OAuthTokenResponse> {
  // 페이스북 OAuth 콜백: 인가 코드를 Authorization 헤더로 전달
  const base = normalizeBase(import.meta.env.VITE_BASE_API_URL as string | undefined) ?? ensureApiBase()
  return apiRequest<OAuthTokenResponse>('/oauth/callback/facebook', {
    method: 'POST',
    skipAuth: true,
    headers: { Authorization: code },
    baseOverride: base,
  })
}

export async function postGoogleOAuthCallback(code: string): Promise<OAuthTokenResponse> {
  // 구글 OAuth 콜백: 인가 코드를 Authorization 헤더로 전달
  const base = normalizeBase(import.meta.env.VITE_AUTH_API_URL as string | undefined) ?? ensureApiBase()
  return apiRequest<OAuthTokenResponse>('/oauth/callback/google', {
    method: 'POST',
    skipAuth: true,
    headers: { Authorization: code },
    baseOverride: base,
  })
}

export async function logout(): Promise<void> {
  const token = getAuthToken()
  const decoded = token ? jwtDecode<{ userNum?: string }>(token) : null // JWT 디코딩
  await apiRequest<void>(`/logout/${decoded?.userNum}`, { method: 'POST' })
}