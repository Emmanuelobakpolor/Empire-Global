// Google sign-in through Google Identity Services (authorization-code popup).
// The browser only gets a one-time code; the backend exchanges it with Google using the
// client secret and decides whether to sign the customer in or start their sign-up.
import { useEffect, useState } from 'react'
import { api } from './api'

const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

let scriptPromise = null
let setupPromise = null
let codeClient = null
let settlePending = null

function loadScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_URL
      script.async = true
      script.onload = resolve
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Could not load Google sign-in. Check your connection or ad blocker and try again.'))
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

function settle(result) {
  const resolve = settlePending
  settlePending = null
  resolve?.(result)
}

// Fetches the backend's Google settings and loads Google's script ahead of the click,
// so the popup can open straight from the click (browsers block popups opened later).
export function prepareGoogle() {
  if (!setupPromise) {
    setupPromise = api('/auth/google/')
      .then(async (config) => {
        if (!config.enabled) return config
        await loadScript()
        codeClient = window.google.accounts.oauth2.initCodeClient({
          client_id: config.clientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: (response) =>
            settle(response.error ? { error: 'Google sign-in failed. Please try again.' } : { code: response.code }),
          error_callback: (err) =>
            settle(
              err?.type === 'popup_failed_to_open'
                ? { error: 'Allow pop-ups for this site to continue with Google.' }
                : { cancelled: true },
            ),
        })
        return config
      })
      .catch((err) => {
        setupPromise = null
        throw err
      })
  }
  return setupPromise
}

// Opens Google's popup. Resolves to { code }, { cancelled }, { error } or { disabled }.
// Call it directly from a click handler.
export async function requestGoogleCode() {
  if (!codeClient) {
    const config = await prepareGoogle()
    if (!config.enabled) return { disabled: true }
  }
  // A previous popup the user abandoned without Google telling us
  settle({ cancelled: true })
  return new Promise((resolve) => {
    settlePending = resolve
    codeClient.requestCode()
  })
}

// null while checking, then whether the Google button should be shown
export function useGoogleAvailable() {
  const [available, setAvailable] = useState(null)
  useEffect(() => {
    let live = true
    prepareGoogle()
      .then((config) => live && setAvailable(!!config.enabled))
      .catch(() => live && setAvailable(false))
    return () => {
      live = false
    }
  }, [])
  return available
}
