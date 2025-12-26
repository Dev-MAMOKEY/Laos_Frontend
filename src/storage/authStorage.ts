import { STORAGE_KEYS } from './keys'

export type AuthProfile = {
  email: string
  username?: string
}

export function isAuthed(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.auth) === '1'
}

export function setAuthed(profile: AuthProfile, token?: string) {
  sessionStorage.setItem(STORAGE_KEYS.auth, '1')
  sessionStorage.setItem(STORAGE_KEYS.email, profile.email.trim())
  if (profile.username) sessionStorage.setItem(STORAGE_KEYS.username, profile.username.trim())
  if (token) sessionStorage.setItem(STORAGE_KEYS.token, token)
}

export function clearAuth() {
  sessionStorage.removeItem(STORAGE_KEYS.auth)
  sessionStorage.removeItem(STORAGE_KEYS.email)
  sessionStorage.removeItem(STORAGE_KEYS.username)
  sessionStorage.removeItem(STORAGE_KEYS.token)
}
