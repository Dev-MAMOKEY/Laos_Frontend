import { STORAGE_KEYS } from './keys'

export type AuthProfile = {
  email: string
}

export function isAuthed(): boolean {
  return Boolean(getAuthToken())
}

export function setAuthed(
  profile: AuthProfile,
  accessToken?: string,
  userNum?: string | number,
  refreshToken?: string,
) {
  sessionStorage.setItem(STORAGE_KEYS.email, profile.email.trim())
  if (accessToken) {
    sessionStorage.setItem(STORAGE_KEYS.access_token, accessToken)
  }
  if (refreshToken) {
    sessionStorage.setItem(STORAGE_KEYS.refresh_token, refreshToken)
  }
  if (userNum !== undefined && userNum !== null) {
    sessionStorage.setItem(STORAGE_KEYS.user_num, String(userNum))
  }
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.access_token)
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.refresh_token)
}

export function getAuthUserNum(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.user_num)
}

export function getAuthEmail(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.email)
}

export function clearAuth() { //로그아웃
  sessionStorage.removeItem(STORAGE_KEYS.email)
  sessionStorage.removeItem(STORAGE_KEYS.user_num)
  sessionStorage.removeItem(STORAGE_KEYS.access_token)
  sessionStorage.removeItem(STORAGE_KEYS.refresh_token)
}
