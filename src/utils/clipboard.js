// Copies text and reports whether it really worked. The Clipboard API is only available on
// HTTPS (or localhost) and can be blocked, e.g. on a phone opening the site over a LAN address,
// so fall back to a hidden textarea before giving up.
export async function copyText(text) {
  const value = String(text ?? '')
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // fall through to the fallback
  }
  try {
    const el = document.createElement('textarea')
    el.value = value
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    el.setSelectionRange(0, value.length)
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  } catch {
    return false
  }
}
