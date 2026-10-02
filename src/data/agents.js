// Seed agents. The live list is kept in DataStoreContext and managed from
// the admin portal's Agents page; customers link to an agent by `agentCode`.
export const initialAgents = [
  { code: 'AG-1001', name: 'Kunle Adebayo', phone: '+234 803 410 2201', location: 'Ikorodu, Lagos', status: 'active', createdAt: '2024-03-04' },
  { code: 'AG-1002', name: 'Funmi Oladipo', phone: '+234 806 552 9013', location: 'Ikeja, Lagos', status: 'active', createdAt: '2024-05-21' },
  { code: 'AG-1003', name: 'Emeka Obi', phone: '+234 809 774 3150', location: 'Lekki, Lagos', status: 'active', createdAt: '2024-09-12' },
  { code: 'AG-1004', name: 'Hauwa Sani', phone: '+234 810 238 6672', location: 'Garki, Abuja', status: 'active', createdAt: '2025-01-27' },
]

export function normalizeAgentCode(code) {
  return (code || '').trim().toUpperCase()
}

export function findAgent(agents, code) {
  const normalized = normalizeAgentCode(code)
  if (!normalized) return null
  return agents.find((a) => a.code === normalized) || null
}

// Next sequential code, e.g. AG-1004 -> AG-1005
export function nextAgentCode(agents) {
  const max = agents.reduce((m, a) => Math.max(m, Number(a.code.replace(/\D/g, '')) || 0), 1000)
  return `AG-${max + 1}`
}
