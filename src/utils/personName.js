// Forms collect a first name and a last name; the server stores them together as the full name
// (and refuses a name without both).

export const EMPTY_NAME = { firstName: '', lastName: '' }

const tidy = (value) => (value || '').trim().replace(/\s+/g, ' ')

// Everything after the first word counts as the last name
export function splitName(fullName) {
  const [firstName = '', ...rest] = tidy(fullName).split(' ')
  return { firstName, lastName: rest.join(' ') }
}

export function joinName({ firstName, lastName }) {
  return [tidy(firstName), tidy(lastName)].filter(Boolean).join(' ')
}

export function nameErrors({ firstName, lastName }, whose = '') {
  const errs = {}
  if (!tidy(firstName)) errs.firstName = `${whose}First name is required.`
  if (!tidy(lastName)) errs.lastName = `${whose}Last name is required.`
  return errs
}

// The server reports name problems against `fullName`; show them under the name fields
export function withNameErrors(fieldErrors = {}) {
  const { fullName, ...rest } = fieldErrors
  return fullName ? { ...rest, firstName: fullName } : rest
}
