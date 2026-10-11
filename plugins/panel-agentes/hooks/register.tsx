import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Activity, AgentCard, LiveAgent } from '../types'

const PANE = 'panel-agentes'
const catalogue = atom({ plugin: 'panel-agentes', key: 'catalogue' } as const, [])
const live = atom({ plugin: 'panel-agentes', key: 'live' } as const, [])
const activity = atom({ plugin: 'panel-agentes', key: 'activity' } as const, [])
const mainBusy = atom({ plugin: 'panel-agentes', key: 'mainBusy' } as const, false)
const slotsAtom = atom({ plugin: 'panel-agentes', key: 'slots' } as const, {})
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

const unquote = (value: string) => value.replace(/^(['"])([\s\S]*)\1$/, '$2')

export function parseAgent(file: string, source: string): AgentCard | undefined {
  const head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (!head) return undefined
  const fields: Record<string, string> = {}
  const lines = (head[1] ?? '').split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const field = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (!field) continue
    const key = field[1]!
    let value = (field[2] ?? '').trim()
    // Lo que sigue indentado es parte de este campo: un bloque `>`/`|` o una lista `- x`.
    const more: string[] = []
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1] ?? '')) more.push((lines[++i] ?? '').trim())
    if (/^[>|][-+]?$/.test(value)) value = more.join(' ')
    else if (value === '' && more.length > 0) value = more.map(item => unquote(item.replace(/^-\s*/, ''))).join(', ')
    fields[key] = unquote(value)
  }
  const name = fields.name || file.replace(/\.md$/, '')
  return {
    name,
    origin: 'proyecto',
    summary: RESUMEN[name] || fields.description || '(sin descripción)',
    tools: fields.tools || undefined,
    model: fields.model || undefined,
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

// Cada agente es un miquito con nombre y color propios: el principal siempre
// Coco; cada subagente, el primero libre entre los que no están trabajando.
const MIQUITOS = [
  { name: 'Coco', color: '#e8833a' },
  { name: 'Kiki', color: '#3b82f6' },
  { name: 'Tito', color: '#22c55e' },
  { name: 'Lola', color: '#a855f7' },
  { name: 'Pancho', color: '#ef4444' },
  { name: 'Nina', color: '#eab308' },
  { name: 'Bongo', color: '#14b8a6' },
  { name: 'Mimi', color: '#ec4899' },
]
export type Miquito = { name: string; color: string }

const ACTIVE = new Set(['pending', 'running', 'waiting', 'idle'])
const isActive = (status: string) => ACTIVE.has(status)

// El primer miquito libre; con todos ocupados, el que menos se repite.
export function pickSlot(taken: number[]): number {
  for (let slot = 1; slot < MIQUITOS.length; slot++) if (!taken.includes(slot)) return slot
  const uses = (slot: number) => taken.filter(t => t === slot).length
  let best = 1
  for (let slot = 2; slot < MIQUITOS.length; slot++) if (uses(slot) < uses(best)) best = slot

  return best
}

export function miquitoAt(slot: number | undefined): Miquito {
  return MIQUITOS[slot ?? 0] ?? MIQUITOS[0]!
}

// Reservas hechas al lanzar un agente, por llamada, hasta que el motor da su id.
const pending = new Map<string, number>()

async function takenSlots($: any): Promise<number[]> {
  const slots = await read($, slotsAtom)
  const agents = await read($, live)

  return [
    ...agents.filter(a => isActive(a.status)).map(a => slots[a.id]).filter((s): s is number => s !== undefined),
    ...pending.values(),
  ]
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

  // Da miquito a quien aún no tiene y olvida a los que el motor ya no lista.
  const slots = await read($, slotsAtom)
  const known = new Set(next.map(a => a.id))
  const kept: Record<string, number> = {}
  for (const [id, slot] of Object.entries(slots)) if (known.has(id)) kept[id] = slot
  for (const agent of next) {
    if (kept[agent.id] !== undefined) continue
    const taken = [...Object.entries(kept).filter(([id]) => next.find(a => a.id === id && isActive(a.status))).map(([, s]) => s), ...pending.values()]
    kept[agent.id] = pickSlot(taken)
  }
  if (JSON.stringify(kept) !== JSON.stringify(slots)) await update($, slotsAtom, () => kept)
}

// Un miquito dibujado en su color, que camina y salta, con su nombre debajo.
export function monkeys(team: Miquito[]): string {
  const step = 70
  const width = Math.max(1, team.length) * step + 30
  const one = ({ name, color }: Miquito, i: number) => {
    const x = i * step + 20
    const delay = (i * 0.3).toFixed(1)
    return `<g transform="translate(${x} 0)">` +
      `<g><animateTransform attributeName="transform" type="translate" values="0 0;12 -7;24 0;12 -7;0 0" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>` +
      `<circle cx="4" cy="16" r="5" fill="${color}"/><circle cx="28" cy="16" r="5" fill="${color}"/>` +
      `<circle cx="16" cy="18" r="12" fill="${color}"/>` +
      `<ellipse cx="16" cy="22" rx="8" ry="6" fill="#f5deb3"/>` +
      `<circle cx="12" cy="15" r="2" fill="#222"/><circle cx="20" cy="15" r="2" fill="#222"/>` +
      `<path d="M12 24 Q16 27 20 24" stroke="#222" stroke-width="1.5" fill="none"/>` +
      `</g>` +
      `<text x="16" y="46" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="${color}">${name}</text>` +
      `</g>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="52" viewBox="0 0 ${width} 52">${team.map(one).join('')}</svg>`
}

const ICON: Record<string, string> = {
  pending: '…', running: '▶', waiting: '⏸', idle: '○', completed: '✓', failed: '✗', killed: '■',
}

// El arranque se hace una sola vez por carga del módulo, venga de donde venga:
// tras una recarga session.start no vuelve a dispararse.
let started: Promise<void> | undefined

async function startOnce($: any) {
  await $.command.register({
    name: 'agentes',
    description: 'Abre el panel que explica qué hace cada agente',
  })
  const project = await loadProject($)
  await update($, catalogue, () => [...project, ...INTEGRADOS])
  $.clock.every(2000, () => void refreshLive($).catch(() => undefined))
}

function ensureStarted($: any): Promise<void> {
  started ??= startOnce($).catch(() => {
    started = undefined
  })

  return started
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await ensureStarted($)
    void $.ui.open({ id: PANE, title: 'Agentes' }).catch(() => undefined)

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    await ensureStarted($)
    await update($, mainBusy, () => true)
    // Una tarea nueva limpia la lista, salvo los pasos de subagentes que siguen trabajando.
    const working = new Set((await read($, live)).filter(a => isActive(a.status)).map(a => a.id))
    await update($, activity, list => list.filter(a => working.has(a.agent)))
    void $.ui.open({ id: PANE, title: 'Agentes' }).catch(() => undefined)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      await update($, mainBusy, () => false)
    } else {
      // El final de verdad de un subagente, también de los que van en segundo plano.
      await refreshLive($).catch(() => undefined)
      const agent = (await read($, live)).find(a => a.id === e.agentId)
      const m = miquitoAt((await read($, slotsAtom))[e.agentId])
      const who = `${m.name} (${agent?.type ?? 'agente'})`
      const what = agent?.description ?? ''
      $.ui.log(e.reason === 'answer' ? `✓ ${who} entregó su trabajo: ${what}` : `✗ ${who} no pudo terminar: ${what}`)
    }

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    void ensureStarted($)
    const item: Activity = {
      id: e.tool_use_id,
      agent: e.agentId ?? MAIN,
      label: describeTool(e as Record<string, any>),
      state: 'runs',
    }
    await update($, activity, list => [...list, item].slice(-300))
    let who = ''
    if (e.tool === 'Agent') {
      const slot = pickSlot(await takenSlots($))
      pending.set(e.tool_use_id, slot)
      who = `${miquitoAt(slot).name} (${e.subagent_type ?? 'general-purpose'})`
      $.ui.log(`🐒 ${who} arranca${e.run_in_background ? ' en segundo plano' : ''}: ${e.description}`)
    }
    let failed = true
    try {
      const ran = await next(e)
      failed = ('deny' in ran && !!ran.deny) || ran.isError === true
      if (e.tool === 'Agent' && 'deny' in ran && ran.deny) $.ui.log(`✗ ${who} no pudo arrancar: ${e.description}`)

      return ran
    } finally {
      pending.delete(e.tool_use_id)
      await update($, activity, list =>
        list.map(one => (one.id === item.id ? { ...one, state: failed ? 'error' : 'ok' } : one)),
      )
    }
  })

  on('agent.spawn', async ($, e, next) => {
    const ran = await next(e)
    const slot = pending.get(e.tool_use_id)
    const agentId = ran.agentId
    if (agentId && slot !== undefined) await update($, slotsAtom, slots => ({ ...slots, [agentId]: slot }))

    return ran
  })

  on('command.run', { command: 'agentes' }, async $ => {
    await ensureStarted($)
    const project = await loadProject($)
    await update($, catalogue, () => [...project, ...INTEGRADOS])
    const opened = await $.ui.open({ id: PANE, title: 'Agentes' })
    await refreshLive($)
    const cards = await read($, catalogue)
    const running = await read($, live)
    const slots = await read($, slotsAtom)
    const lines = [
      opened.isPlaced
        ? 'Panel de agentes abierto. También aquí:'
        : 'Esta pantalla no muestra el panel; aquí tienes los agentes:',
      '',
      'En marcha ahora:',
      ...(running.length === 0
        ? ['  Ningún agente trabajando.']
        : running.map(a => `  ${ICON[a.status] ?? '?'} ${miquitoAt(slots[a.id]).name} (${a.type}) — ${a.description} (${a.status})`)),
      '',
      'Qué hace cada agente:',
      ...cards.map(c => `  • ${c.name} [${c.origin}]: ${c.summary}`),
    ]

    return { text: lines.join('\n') }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const busy = await read($, mainBusy)
    const agents = await read($, live)
    const slots = await read($, slotsAtom)
    const done = await read($, activity)
    const width = Math.max(30, (e.viewport?.columns ?? 60) - 6)
    const rows = Math.max(8, (e.viewport?.rows ?? 24) - 2)
    // Los que trabajan llevan sus pasos; de los que acabaron, solo los tres últimos, en una línea.
    const working = agents.filter(a => isActive(a.status))
    const finished = agents.filter(a => !isActive(a.status)).slice(-3)
    const room = rows - 3 - finished.length - (working.length + 1) * 2
    const per = Math.max(1, Math.floor(room / (working.length + 1)))
    const coco = miquitoAt(0)

    const steps = (agent: string) =>
      done.filter(a => a.agent === agent).slice(-per).map(a => (
        <Text dimColor={a.state === 'ok'} color={a.state === 'error' ? 'red' : undefined}>
          {'  '}{a.state === 'runs' ? '▶' : a.state === 'ok' ? '✓' : '✗'} {clip(a.label, width - 4)}
        </Text>
      ))
    const header = (a: LiveAgent) => {
      const m = miquitoAt(slots[a.id])
      return (
        <Text bold color={m.color}>
          {ICON[a.status] ?? '?'} {m.name} ({a.type}) <Text dimColor>{clip(a.description, Math.max(10, width - a.type.length - m.name.length - 8))} · {a.status}</Text>
        </Text>
      )
    }

    return (
      <Box flexDirection="column">
        <Text bold color={coco.color}>
          {busy ? '▶' : '○'} {coco.name} (Claude, principal) <Text dimColor>{busy ? 'trabajando' : 'en espera'}</Text>
        </Text>
        {steps(MAIN)}
        {!busy && done.length === 0 && <Text dimColor>  Pídeme algo y verás aquí cada paso.</Text>}
        {working.map(a => (
          <Box flexDirection="column" marginTop={1}>
            {header(a)}
            {steps(a.id)}
          </Box>
        ))}
        {finished.length > 0 && <Box flexDirection="column" marginTop={1}>{finished.map(header)}</Box>}
        <Text dimColor> </Text>
        <Text dimColor>/agentes: qué hace cada agente</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const busy = await read($, mainBusy)
    const running = (await read($, live)).filter(a => a.status === 'running' || a.status === 'pending')
    if (!busy && running.length === 0) return next(e)

    const els = $.ui.resolve(e)
    const { Box, Text } = els
    const done = await read($, activity)
    const slots = await read($, slotsAtom)
    const lastOf = (agent: string) => [...done].reverse().find(a => a.agent === agent)?.label ?? 'pensando…'
    const width = Math.max(20, (e.viewport?.columns ?? 50) - 4)
    const team = [...(busy ? [miquitoAt(0)] : []), ...running.map(a => miquitoAt(slots[a.id]))]
    const coco = miquitoAt(0)

    return (
      <Box flexDirection="column">
        {'Svg' in els && <els.Svg source={monkeys(team)} alt={team.map(m => m.name).join(', ') + ' trabajando'} isInteractive />}
        {busy && (
          <Text color={coco.color}>
            ● {coco.name} (Claude): <Text>{clip(lastOf(MAIN), width - 20)}</Text>
          </Text>
        )}
        {running.map(a => {
          const m = miquitoAt(slots[a.id])
          return (
            <Text color={m.color}>
              ● {m.name} ({a.type}): <Text>{clip(lastOf(a.id), Math.max(10, width - a.type.length - m.name.length - 8))}</Text>
            </Text>
          )
        })}
      </Box>
    )
  })
}
