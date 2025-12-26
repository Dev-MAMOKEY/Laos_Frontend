import { STORAGE_KEYS } from './keys'
import { readJson, writeJson } from './storage'

export type StoredUser = {
  email: string
  username: string
  password: string
}

export function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(localStorage, STORAGE_KEYS.users, [])
}

export function setUsers(users: StoredUser[]) {
  writeJson(localStorage, STORAGE_KEYS.users, users)
}
