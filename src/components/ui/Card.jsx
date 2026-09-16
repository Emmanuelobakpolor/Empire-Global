export default function Card({ children, className = '', padded = true, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`bg-white rounded-2xl border border-navy-100 shadow-card ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
