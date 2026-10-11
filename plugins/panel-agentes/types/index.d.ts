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

export type Activity = {
  id: string
  agent: string
  label: string
  state: 'runs' | 'ok' | 'error'
}

declare module 'claude-code' {
  interface PluginState {
    'panel-agentes': {
      catalogue: AgentCard[]
      live: LiveAgent[]
      activity: Activity[]
      mainBusy: boolean
      slots: Record<string, number>
    }
  }
}
