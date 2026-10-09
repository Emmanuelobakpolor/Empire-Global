import { useEffect, useState } from 'react'
import { api } from '../utils/api'

// Shown until the server answers, and if it can't be reached
export const DEFAULT_PLATFORM_SETTINGS = {
  platformName: 'Empire Global',
  supportEmail: 'Info@empireglobalbenefits.com',
  supportPhone: '+234 9068410302',
}

let cached = null

/** Public platform details (name and support contacts) set by Super Admins. */
export function usePlatformSettings() {
  const [settings, setSettings] = useState(cached || DEFAULT_PLATFORM_SETTINGS)

  useEffect(() => {
    let active = true
    api('/settings/')
      .then((data) => {
        cached = data.settings
        if (active) setSettings(data.settings)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return settings
}

// After a Super Admin saves new settings, so other pages pick them up
export function setCachedPlatformSettings(settings) {
  cached = settings
}
