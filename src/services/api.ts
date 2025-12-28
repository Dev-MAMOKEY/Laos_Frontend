import axios, { AxiosHeaders, type AxiosInstance, type AxiosRequestHeaders } from 'axios'
import type { Persona } from '../types/persona'
import { getAuthToken } from '../storage/authStorage'

export type HistoryEntry = {
  id: string
  createdAt: number
  persona: Persona
}

export type AuthResponse = {
  status?: number
  message?: string
  token?: string
  email?: string
  username?: string
}

type ApiInit = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  token?: string | null
  skipAuth?: boolean
  signal?: AbortSignal
  baseOverride?: string
}

function normalizeBase(url: string | undefined): string | undefined {
  if (!url) return undefined
  return url.replace(/\/$/, '')
}

function ensureApiBase(): string {
  const base = normalizeBase(import.meta.env.VITE_API_BASE_URL as string | undefined)
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

  const headers: AxiosRequestHeaders = new AxiosHeaders({ 'Content-Type': 'application/json' })
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

function normalizeFavoriteIds(payload: unknown): string[] {
  if (Array.isArray(payload) && payload.every((v) => typeof v === 'string')) {
    return payload as string[]
  }
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { favorites?: unknown; ids?: unknown }).favorites ?? (payload as { favorites?: unknown; ids?: unknown }).ids
    if (Array.isArray(candidate) && candidate.every((v) => typeof v === 'string')) {
      return candidate as string[]
    }
  }
  return []
}

function toHistoryEntry(raw: unknown): HistoryEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as { id?: unknown; createdAt?: unknown; persona?: unknown }
  if (typeof obj.id !== 'string') return null
  if (typeof obj.createdAt !== 'number') return null
  if (!obj.persona || typeof obj.persona !== 'object') return null
  return { id: obj.id, createdAt: obj.createdAt, persona: obj.persona as Persona }
}

function normalizeHistory(payload: unknown): HistoryEntry[] {
  if (Array.isArray(payload)) {
    return payload.map(toHistoryEntry).filter(Boolean) as HistoryEntry[]
  }
  if (payload && typeof payload === 'object') {
    const maybeEntries = (payload as { history?: unknown; entries?: unknown }).history ?? (payload as { history?: unknown; entries?: unknown }).entries
    if (Array.isArray(maybeEntries)) {
      return maybeEntries.map(toHistoryEntry).filter(Boolean) as HistoryEntry[]
    }
    const single = toHistoryEntry(payload)
    if (single) return [single]
  }
  return []
}

export async function postPersonaAnalysis(answers: number[]): Promise<Persona> {
  const personaBase =
    normalizeBase(import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    normalizeBase(import.meta.env.VITE_PERSONA_API_URL as string | undefined)

  if (!personaBase) {
    throw new Error('VITE_API_BASE_URL 또는 VITE_PERSONA_API_URL이 필요합니다.')
  }

  return apiRequest<Persona>('/persona/analyze', {
    method: 'POST',
    body: { answers },
    skipAuth: true,
    baseOverride: personaBase,
  })
}

export async function postRegister(payload: {
  user_id: string
  password: string
  username: string
  email: string
  'email-code': string
}): Promise<AuthResponse> {
  // 회원가입 요청을 백엔드로 위임한다. 백엔드 미구현 시 에러만 반환됨.
  return apiRequest<AuthResponse>('/register', { method: 'POST', body: payload, skipAuth: true })
}

export async function postLogin(payload: {
    user_id: string; 
    password: string 
}): Promise<AuthResponse> {
  // 로그인 요청을 백엔드로 위임한다. 백엔드 미구현 시 에러만 반환됨.
  return apiRequest<AuthResponse>('/login', { method: 'POST', body: payload, skipAuth: true })
}

export async function fetchFavorites(): Promise<string[]> {
  const res = await apiRequest<unknown>('/favorites')
  return normalizeFavoriteIds(res)
}

export async function addFavorite(destinationId: string): Promise<string[]> {
  const res = await apiRequest<unknown>('/favorites', { method: 'POST', body: { destinationId } })
  return normalizeFavoriteIds(res)
}

export async function removeFavorite(destinationId: string): Promise<string[]> {
  const res = await apiRequest<unknown>(`/favorites/${encodeURIComponent(destinationId)}`, {
    method: 'DELETE',
  })
  return normalizeFavoriteIds(res)
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const res = await apiRequest<unknown>('/history')
  return normalizeHistory(res)
}

export async function createHistoryEntry(persona: Persona): Promise<HistoryEntry> {
  const res = await apiRequest<unknown>('/history', { method: 'POST', body: { persona } })
  const normalized = normalizeHistory(res)
  if (normalized.length > 0) return normalized[0]

  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `history_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    persona,
  }
}
