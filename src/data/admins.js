export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
}

// Mock admin accounts. Passwords are plain text only because there is no backend yet.
export const initialAdmins = [
  {
    id: 'ADM-001',
    fullName: 'Sarah Johnson',
    email: 'admin@empireglobal.com',
    password: 'admin123',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: 'ADM-002',
    fullName: 'Michael Bassey',
    email: 'michael@empireglobal.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    status: 'active',
    createdAt: '2024-06-03',
  },
  {
    id: 'ADM-003',
    fullName: 'Ngozi Eze',
    email: 'ngozi@empireglobal.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    status: 'inactive',
    createdAt: '2025-02-18',
  },
]
