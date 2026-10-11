import { expect, test } from 'claude-code/testing'

import { describeTool, miquitoAt, monkeys, parseAgent, pickSlot } from './register'

test('lee nombre, herramientas y modelo del frontmatter', () => {
  const card = parseAgent('x.md', '---\nname: demo\ndescription: Hace cosas\ntools: Read, Grep\nmodel: opus\n---\ncuerpo')
  expect(card).toEqual({ name: 'demo', origin: 'proyecto', summary: 'Hace cosas', tools: 'Read, Grep', model: 'opus' })
})

test('usa el resumen en español de los agentes conocidos', () => {
  const card = parseAgent('security-auditor.md', '---\nname: security-auditor\ndescription: english\n---\n')
  expect(card?.summary).toContain('Auditor de seguridad')
})

test('ignora archivos sin frontmatter', () => {
  expect(parseAgent('x.md', 'solo texto')).toBeUndefined()
})

test('describe en español lo que hace cada herramienta', () => {
  expect(describeTool({ tool: 'Read', file_path: '/a/b/README.md' })).toBe('Lee README.md')
  expect(describeTool({ tool: 'Bash', command: 'ls', description: 'Lista archivos' })).toBe('Ejecuta: Lista archivos')
  expect(describeTool({ tool: 'Agent', subagent_type: 'Explore', description: 'buscar rutas' })).toBe('Lanza el agente Explore: buscar rutas')
  expect(describeTool({ tool: 'mcp__github__get_me' })).toBe('Usa get_me (github)')
})

test('cada miquito tiene nombre y color distintos y se dibuja con ellos', () => {
  const team = [0, 1, 2].map(miquitoAt)
  expect(team.map(m => m.name)).toEqual(['Coco', 'Kiki', 'Tito'])
  expect(new Set(team.map(m => m.color)).size).toBe(3)
  const svg = monkeys(team)
  for (const m of team) {
    expect(svg).toContain(`>${m.name}</text>`)
    expect(svg).toContain(`fill="${m.color}"`)
  }
  expect(svg).toContain('animateTransform')
})

test('elige el primer miquito libre y no repite mientras queden', () => {
  expect(pickSlot([])).toBe(1)
  expect(pickSlot([1, 2])).toBe(3)
  expect(pickSlot([2])).toBe(1)
  const all = [1, 2, 3, 4, 5, 6, 7]
  expect(all).toContain(pickSlot(all))
  expect(pickSlot([...all, 1, 2])).toBe(3)
})

test('frontmatter: comillas, bloques, listas, sangrías y descripciones vacías', () => {
  const card = parseAgent('x.md', [
    '---',
    'name: "demo"',
    'description: >',
    '  Primera línea',
    '  segunda línea',
    'tools:',
    '  - Read',
    '  - Grep',
    'meta:',
    '  name: otro',
    '---',
  ].join('\n'))
  expect(card).toEqual({ name: 'demo', origin: 'proyecto', summary: 'Primera línea segunda línea', tools: 'Read, Grep', model: undefined })
  expect(parseAgent('y.md', '---\nname: y\ndescription: ""\n---\n')?.summary).toBe('(sin descripción)')
})
