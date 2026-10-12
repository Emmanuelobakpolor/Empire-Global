import { User } from 'lucide-react'
import Input from './Input'

// First and last name side by side. `value` is { firstName, lastName }.
export default function NameFields({ value, onChange, errors = {}, required = true, disabled, className = '' }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <Input
        label="First Name"
        icon={User}
        placeholder="e.g. Adewale"
        autoComplete="given-name"
        value={value.firstName}
        onChange={set('firstName')}
        error={errors.firstName}
        required={required}
        disabled={disabled}
      />
      <Input
        label="Last Name"
        icon={User}
        placeholder="e.g. Alao"
        autoComplete="family-name"
        value={value.lastName}
        onChange={set('lastName')}
        error={errors.lastName}
        required={required}
        disabled={disabled}
      />
    </div>
  )
}
