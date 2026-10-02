import { findAgent } from '../data/agents'

// Agent Code is optional at registration, but if one is entered it must belong
// to an active agent. Returns an error message, or null when the code is fine.
export function validateAgentCode(agents, code) {
  if (!code?.trim()) return null
  const agent = findAgent(agents, code)
  if (!agent) return 'Agent code not found. Check the code with your agent, or leave it blank.'
  if (agent.status !== 'active') return 'This agent code is no longer active. Check with your agent, or leave it blank.'
  return null
}
