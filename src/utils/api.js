// Thin fetch wrapper for the Django API. Requests go to the same origin (/api),
// which the Vite dev server proxies to Django, so the session cookie just works.

const CSRF_COOKIE = 'csrftoken'
const NETWORK_ERROR = 'Unable to reach the server. Check your connection and try again.'
const SERVER_ERROR = 'Something went wrong on our side. Please try again.'

export class ApiError extends Error {
  constructor(message, { status, code, data }) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

// Called when the server says the session is gone (expired, signed out elsewhere,
// or the account was deactivated) so the app can drop its signed-in state
let onSessionExpired = null
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function refreshCsrf() {
  await fetch('/api/auth/csrf/', { credentials: 'same-origin' })
}

// Django field errors come either as { errors: { field: [...] } } or DRF's { field: [...] }
export function fieldErrors(data) {
  const source = data?.errors || data || {}
  const out = {}
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value) && typeof value[0] === 'string') out[key] = value[0]
  }
  return out
}

function messageFrom(data, status) {
  if (status >= 500) return SERVER_ERROR
  if (typeof data?.detail === 'string') return data.detail
  const first = Object.values(fieldErrors(data))[0]
  return first || SERVER_ERROR
}

export async function api(path, { method = 'GET', body } = {}, retried = false) {
  const unsafe = method !== 'GET'
  // Read the cookie on every request: Django rotates the token on login
  if (unsafe && !readCookie(CSRF_COOKIE)) await refreshCsrf()

  // FormData (file uploads) is sent as-is so the browser sets the multipart boundary
  const isForm = body instanceof FormData
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isForm && { 'Content-Type': 'application/json' }),
        ...(unsafe && { 'X-CSRFToken': readCookie(CSRF_COOKIE) || '' }),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(NETWORK_ERROR, { status: 0, code: 'network_error' })
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (res.ok) return data

  // A stale CSRF cookie (e.g. after the session expired): fetch a fresh one and retry once
  if (res.status === 403 && !retried && data?.detail?.startsWith?.('CSRF Failed')) {
    await refreshCsrf()
    return api(path, { method, body }, true)
  }
  if (res.status === 403 && data?.detail === 'Authentication credentials were not provided.' && path !== '/auth/me/') {
    onSessionExpired?.()
  }
  throw new ApiError(messageFrom(data, res.status), { status: res.status, code: data?.code, data })
}

// Turns an ApiError into the { success: false, ... } shape the pages already use
export function failure(err) {
  return {
    success: false,
    error: err.message || SERVER_ERROR,
    code: err.code,
    fieldErrors: fieldErrors(err.data),
    data: err.data,
  }
}
