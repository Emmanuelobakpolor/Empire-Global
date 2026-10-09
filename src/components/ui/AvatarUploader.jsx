import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import Avatar from './Avatar'
import { useSession } from '../../context/SessionContext'
import { useToast } from '../../context/ToastContext'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

// The signed-in user's display picture with change / remove controls.
// `className` sets the avatar's size and initials colours.
export default function AvatarUploader({ className = 'w-[72px] h-[72px] bg-navy-900 text-white text-xl', fallback, ring = 'ring-4 ring-white shadow-soft' }) {
  const { account, updateAvatar } = useSession()
  const { showToast } = useToast()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const save = async (file) => {
    setBusy(true)
    const result = await updateAvatar(file)
    setBusy(false)
    if (!result.success) {
      showToast(result.error, 'error')
      return
    }
    showToast(file ? 'Profile picture updated.' : 'Profile picture removed.', 'success')
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      showToast('Choose a JPG, PNG or WebP image.', 'error')
      return
    }
    if (file.size > MAX_BYTES) {
      showToast('Images must be 5 MB or smaller.', 'error')
      return
    }
    save(file)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar src={account?.avatarUrl} name={account?.fullName} fallback={fallback} className={`${className} ${ring}`} />
        {busy && (
          <span className="absolute inset-0 rounded-full bg-navy-950/50 flex items-center justify-center">
            <Loader2 size={20} className="text-white animate-spin" />
          </span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white shadow-soft transition-colors disabled:opacity-60"
          aria-label={account?.avatarUrl ? 'Change profile picture' : 'Add profile picture'}
          title={account?.avatarUrl ? 'Change profile picture' : 'Add profile picture'}
        >
          <Camera size={14} />
        </button>
        <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={handleFile} />
      </div>
      {account?.avatarUrl && (
        <button
          type="button"
          onClick={() => save(null)}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-400 hover:text-red-500 transition-colors disabled:opacity-60"
        >
          <Trash2 size={12} /> Remove photo
        </button>
      )}
    </div>
  )
}
