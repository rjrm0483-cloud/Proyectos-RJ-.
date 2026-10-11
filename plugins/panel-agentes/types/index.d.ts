export type AgentCard = {
  name: string
  origin: 'proyecto' | 'integrado'
  summary: string
  tools?: string
  model?: string
}

export type LiveAgent = {
  id: string
  type: string
  description: string
  status: string
}

declare module 'claude-code' {
  interface PluginState {
    'panel-agentes': { catalogue: AgentCard[]; live: LiveAgent[] }
  }
}
