import { STORAGE_KEYS } from './keys'

export type AuthProfile = {
  email: string
  username?: string
}

export function isAuthed(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.auth) === '1'
}

export function setAuthed(profile: AuthProfile, token?: string, userNum?: string | number) {
  sessionStorage.setItem(STORAGE_KEYS.auth, '1')
  sessionStorage.setItem(STORAGE_KEYS.email, profile.email.trim())
  if (profile.username) sessionStorage.setItem(STORAGE_KEYS.username, profile.username.trim())
  if (token) sessionStorage.setItem(STORAGE_KEYS.token, token)
  if (userNum !== undefined && userNum !== null) {
    sessionStorage.setItem(STORAGE_KEYS.user_num, String(userNum))
  }
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.token)
}

export function getAuthUsername(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.username)
}

export function getAuthUserNum(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.user_num)
}

export function getAuthEmail(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.email)
}

export function clearAuth() { //로그아웃
  sessionStorage.removeItem(STORAGE_KEYS.auth)
  sessionStorage.removeItem(STORAGE_KEYS.email)
  sessionStorage.removeItem(STORAGE_KEYS.username)
  sessionStorage.removeItem(STORAGE_KEYS.user_num)
  sessionStorage.removeItem(STORAGE_KEYS.token)
}
