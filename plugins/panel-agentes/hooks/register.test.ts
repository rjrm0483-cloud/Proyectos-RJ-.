import { expect, test } from 'claude-code/testing'

import { parseAgent } from './register'

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
