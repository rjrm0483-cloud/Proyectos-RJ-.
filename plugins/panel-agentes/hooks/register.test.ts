import { expect, test } from 'claude-code/testing'

import { describeTool, miquitoOf, monkeys, parseAgent } from './register'

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

test('dibuja un miquito por agente, con su nombre y su color', () => {
  const team = [miquitoOf('main'), miquitoOf('a1'), miquitoOf('a2')]
  expect(team.map(m => m.name)).toEqual(['Coco', 'Kiki', 'Tito'])
  expect(new Set(team.map(m => m.color)).size).toBe(3)
  expect(miquitoOf('a1')).toEqual(team[1])
  const svg = monkeys(team)
  for (const m of team) {
    expect(svg).toContain(`>${m.name}</text>`)
    expect(svg).toContain(`fill="${m.color}"`)
  }
  expect(svg).toContain('animateTransform')
})
