import { useState } from 'react'

export function initialsOf(name, fallback = 'U') {
  return (name || fallback)
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// A user's display picture, or their initials when they haven't set one (or it fails to load).
// `className` sets the size, shape and initials colours, e.g. "w-9 h-9 bg-navy-900 text-white text-xs".
export default function Avatar({ src, name, className = '', fallback }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = src && failedSrc !== src

  return (
    <span className={`rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0 ${className}`}>
      {showImage ? (
        <img src={src} alt={name ? `${name}'s profile picture` : 'Profile picture'} className="w-full h-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        initialsOf(name, fallback)
      )}
    </span>
  )
}
