import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Activity, AgentCard, LiveAgent } from '../types'

const PANE = 'panel-agentes'
const catalogue = atom({ plugin: 'panel-agentes', key: 'catalogue' } as const, [])
const live = atom({ plugin: 'panel-agentes', key: 'live' } as const, [])
const activity = atom({ plugin: 'panel-agentes', key: 'activity' } as const, [])
const mainBusy = atom({ plugin: 'panel-agentes', key: 'mainBusy' } as const, false)
const MAIN = 'main'

// Agentes que trae el propio Claude Code: qué hace cada uno, en una línea.
const INTEGRADOS: AgentCard[] = [
  { name: 'general-purpose', origin: 'integrado', summary: 'Investiga preguntas complejas, busca código y ejecuta tareas de varios pasos.', tools: 'todas' },
  { name: 'Explore', origin: 'integrado', summary: 'Busca por muchos archivos y carpetas en solo lectura y devuelve solo la conclusión.', tools: 'solo lectura' },
  { name: 'Plan', origin: 'integrado', summary: 'Diseña el plan de implementación: pasos, archivos clave y compromisos de arquitectura.', tools: 'solo lectura' },
  { name: 'claude-code-guide', origin: 'integrado', summary: 'Responde dudas sobre Claude Code, el Agent SDK y la API de Claude.', tools: 'Glob, Grep, Read, WebFetch, WebSearch' },
  { name: 'statusline-setup', origin: 'integrado', summary: 'Configura la línea de estado de Claude Code.', tools: 'Read, Edit' },
]

// Resúmenes en español para los agentes del proyecto; si no hay, se usa la descripción del archivo.
const RESUMEN: Record<string, string> = {
  'security-auditor': 'Auditor de seguridad: vulnerabilidades, modelado de amenazas, OWASP, DevSecOps, cumplimiento (GDPR/HIPAA/SOC2) y respuesta a incidentes.',
  'hipaa-compliance': 'Explica las obligaciones de HIPAA para productos de salud: PHI, entidades cubiertas, BAA y salvaguardas.',
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

export function parseAgent(file: string, source: string): AgentCard | undefined {
  const head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (!head) return undefined
  const fields: Record<string, string> = {}
  for (const line of (head[1] ?? "").split(/\r?\n/)) {
    const at = line.indexOf(':')
    if (at > 0) fields[line.slice(0, at).trim()] = line.slice(at + 1).trim()
  }
  const name = fields.name || file.replace(/\.md$/, '')
  return {
    name,
    origin: 'proyecto',
    summary: RESUMEN[name] ?? fields.description ?? '(sin descripción)',
    tools: fields.tools,
    model: fields.model,
  }
}

const base = (path: unknown) => String(path ?? '').split('/').pop() || String(path ?? '')

// Una frase en español de lo que hace cada llamada a herramienta.
export function describeTool(e: Record<string, any>): string {
  switch (e.tool) {
    case 'Bash': return `Ejecuta: ${clip(String(e.description ?? e.command ?? ''), 70)}`
    case 'Read': return `Lee ${base(e.file_path)}`
    case 'Edit': return `Edita ${base(e.file_path)}`
    case 'Write': return `Escribe ${base(e.file_path)}`
    case 'NotebookEdit': return `Edita el cuaderno ${base(e.notebook_path)}`
    case 'Grep': return `Busca «${clip(String(e.pattern ?? ''), 40)}» en el código`
    case 'Glob': return `Busca archivos ${clip(String(e.pattern ?? ''), 40)}`
    case 'Agent': return `Lanza el agente ${e.subagent_type ?? 'general-purpose'}: ${clip(String(e.description ?? ''), 50)}`
    case 'WebFetch': return `Abre ${clip(String(e.url ?? ''), 60)}`
    case 'WebSearch': return `Busca en la web «${clip(String(e.query ?? ''), 50)}»`
    case 'Skill': return `Usa la habilidad ${e.skill ?? ''}`
    case 'TaskCreate': case 'TaskUpdate': return 'Actualiza la lista de tareas'
  }
  const mcp = /^mcp__(.+?)__(.+)$/.exec(String(e.tool))
  if (mcp) return `Usa ${mcp[2]} (${mcp[1]})`

  return `Usa ${e.tool}`
}

async function loadProject($: any): Promise<AgentCard[]> {
  const cards: AgentCard[] = []
  try {
    const dir = `${await $.session.cwd()}/.claude/agents`
    for (const entry of await $.fs.list(dir)) {
      if (entry.kind !== 'file' || !entry.name.endsWith('.md')) continue
      const card = parseAgent(entry.name, await $.fs.read(`${dir}/${entry.name}`))
      if (card) cards.push(card)
    }
  } catch {
    // sin carpeta .claude/agents: solo se muestran los integrados
  }
  return cards
}

async function refreshLive($: any) {
  const list = await $.agent.list()
  const next: LiveAgent[] = list.map((a: any) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    status: a.status,
  }))
  const before = await read($, live)
  if (JSON.stringify(before) !== JSON.stringify(next)) await update($, live, () => next)
}

const ICON: Record<string, string> = {
  pending: '…', running: '▶', waiting: '⏸', idle: '○', completed: '✓', failed: '✗', killed: '■',
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'agentes',
      description: 'Abre el panel que explica qué hace cada agente',
    })
    const project = await loadProject($)
    await update($, catalogue, () => [...project, ...INTEGRADOS])
    void $.ui.open({ id: PANE, title: 'Agentes' })
    $.clock.every(2000, () => void refreshLive($))

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    await update($, mainBusy, () => true)
    await update($, activity, () => [])
    void $.ui.open({ id: PANE, title: 'Agentes' })

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) await update($, mainBusy, () => false)
    void refreshLive($)

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const item: Activity = {
      id: e.tool_use_id,
      agent: e.agentId ?? MAIN,
      label: describeTool(e as Record<string, any>),
      state: 'runs',
    }
    await update($, activity, list => [...list, item].slice(-300))
    const ran = await next(e)
    const failed = ('deny' in ran && !!ran.deny) || ran.isError === true
    await update($, activity, list =>
      list.map(one => (one.id === item.id ? { ...one, state: failed ? 'error' : 'ok' } : one)),
    )

    return ran
  })

  on('command.run', { command: 'agentes' }, async $ => {
    const project = await loadProject($)
    await update($, catalogue, () => [...project, ...INTEGRADOS])
    const opened = await $.ui.open({ id: PANE, title: 'Agentes' })
    await refreshLive($)
    const cards = await read($, catalogue)
    const running = await read($, live)
    const lines = [
      opened.isPlaced
        ? 'Panel de agentes abierto. También aquí:'
        : 'Esta pantalla no muestra el panel; aquí tienes los agentes:',
      '',
      'En marcha ahora:',
      ...(running.length === 0
        ? ['  Ningún agente trabajando.']
        : running.map(a => `  ${ICON[a.status] ?? '?'} ${a.type} — ${a.description} (${a.status})`)),
      '',
      'Qué hace cada agente:',
      ...cards.map(c => `  • ${c.name} [${c.origin}]: ${c.summary}`),
    ]

    return { text: lines.join('\n') }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const busy = await read($, mainBusy)
    const running = await read($, live)
    const done = await read($, activity)
    const width = Math.max(30, (e.viewport?.columns ?? 60) - 6)
    const rows = Math.max(8, (e.viewport?.rows ?? 24) - 2)
    const groups = 1 + running.length
    const per = Math.max(2, Math.floor((rows - groups * 2) / groups))

    const steps = (agent: string) =>
      done.filter(a => a.agent === agent).slice(-per).map(a => (
        <Text dimColor={a.state === 'ok'} color={a.state === 'error' ? 'red' : undefined}>
          {'  '}{a.state === 'runs' ? '▶' : a.state === 'ok' ? '✓' : '✗'} {clip(a.label, width - 4)}
        </Text>
      ))

    return (
      <Box flexDirection="column">
        <Text bold>
          {busy ? '▶' : '○'} Claude (principal) <Text dimColor>{busy ? 'trabajando' : 'en espera'}</Text>
        </Text>
        {steps(MAIN)}
        {!busy && done.length === 0 && <Text dimColor>  Pídeme algo y verás aquí cada paso.</Text>}
        {running.map(a => (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>
              {ICON[a.status] ?? '?'} {a.type} <Text dimColor>{clip(a.description, width - a.type.length - 4)} · {a.status}</Text>
            </Text>
            {steps(a.id)}
          </Box>
        ))}
        <Text dimColor> </Text>
        <Text dimColor>/agentes: qué hace cada agente</Text>
      </Box>
    )
  })
}
