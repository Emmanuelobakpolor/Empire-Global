// Agents live on the backend (GET /api/admin/agents/); customers link to one by `agentCode`.

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
