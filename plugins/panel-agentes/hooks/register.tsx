import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { AgentCard, LiveAgent } from '../types'

const PANE = 'panel-agentes'
const catalogue = atom({ plugin: 'panel-agentes', key: 'catalogue' } as const, [])
const live = atom({ plugin: 'panel-agentes', key: 'live' } as const, [])

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
  for (const line of head[1].split(/\r?\n/)) {
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

  on('command.run', { command: 'agentes' }, async $ => {
    const project = await loadProject($)
    await update($, catalogue, () => [...project, ...INTEGRADOS])
    await $.ui.open({ id: PANE, title: 'Agentes' })

    return { text: 'Panel de agentes abierto.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const cards = await read($, catalogue)
    const running = await read($, live)
    const width = Math.max(30, (e.viewport?.columns ?? 60) - 6)

    return (
      <Box flexDirection="column">
        <Text bold>En marcha ahora</Text>
        {running.length === 0 && <Text dimColor>Ningún agente trabajando.</Text>}
        {running.map(a => (
          <Text>
            {ICON[a.status] ?? '?'} {a.type} — {clip(a.description, width)} ({a.status})
          </Text>
        ))}
        <Text> </Text>
        <Text bold>Qué hace cada agente</Text>
        {cards.map(card => (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>
              {card.name} <Text dimColor>[{card.origin}{card.model ? `, ${card.model}` : ''}]</Text>
            </Text>
            <Text>{clip(card.summary, width * 3)}</Text>
            {card.tools && <Text dimColor>Herramientas: {card.tools}</Text>}
          </Box>
        ))}
      </Box>
    )
  })
}
