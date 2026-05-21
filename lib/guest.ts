const GUEST_ID_KEY = "rally_guest_id"
const GUEST_NAME_KEY = "rally_guest_name"
const GUEST_FLAG_KEY = "rally_is_guest"

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

export function getGuestName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(GUEST_NAME_KEY)
}

export function setGuestName(name: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(GUEST_NAME_KEY, name.trim() || "Guest")
}

/** Activate guest mode: sets the flag auth-gate checks to allow access to protected routes. */
export function activateGuestMode(name: string): void {
  if (typeof window === "undefined") return
  setGuestName(name)
  getOrCreateGuestId()
  localStorage.setItem(GUEST_FLAG_KEY, "true")
}

export function isGuestMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(GUEST_FLAG_KEY) === "true"
}

export function clearGuestMode(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(GUEST_FLAG_KEY)
  localStorage.removeItem(GUEST_ID_KEY)
  localStorage.removeItem(GUEST_NAME_KEY)
}
