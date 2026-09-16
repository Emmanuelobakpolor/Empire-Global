import { useState } from 'react'

/**
 * Image with a tinted placeholder that fades out once the file decodes.
 * Keeps photography from popping in abruptly on slower connections.
 *
 * Pass `fill` when the image is a background layer: the component positions
 * itself over the nearest positioned ancestor and stretches the <img> to cover
 * it. The caller supplies that ancestor (`relative`) and any overlay scrims,
 * but must not also pass positioning classes of its own.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  placeholderClass = 'bg-navy-800',
  loading = 'lazy',
  fill = false,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)

  // A `fill` wrapper is positioned here rather than by the caller: emitting both
  // `relative` and `absolute` lets `relative` win the cascade, which drops the
  // wrapper out of absolute flow and collapses `h-full` to zero.
  const position = fill ? 'absolute inset-0' : 'relative'

  return (
    <div className={`${position} overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 ${placeholderClass} transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100 animate-pulse'}`}
        aria-hidden="true"
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`img-fade ${loaded ? 'img-loaded' : ''} ${fill ? 'absolute inset-0 h-full w-full object-cover' : ''} ${imgClassName}`}
        {...rest}
      />
    </div>
  )
}
