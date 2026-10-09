export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
}

// Admin accounts live on the backend, which uses role codes; the UI shows these labels
const ROLE_CODES = { [ROLES.SUPER_ADMIN]: 'super_admin', [ROLES.ADMIN]: 'admin' }
const ROLE_LABELS = { super_admin: ROLES.SUPER_ADMIN, admin: ROLES.ADMIN }

export const roleLabel = (code) => ROLE_LABELS[code] || null
export const roleCode = (label) => ROLE_CODES[label]

// An admin from the API, with its role as a UI label
export const fromApiAdmin = (admin) => ({ ...admin, role: roleLabel(admin.role) })
