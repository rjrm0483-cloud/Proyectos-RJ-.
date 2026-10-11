import { expect, test } from 'claude-code/testing'

test('la franja muestra el paso actual y los miquitos en cada superficie', async ($, on) => {
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('tool.call', () => ({ result: 'ok' }) as any)
  await $.turn.start({ text: 'hola', turnId: 't1' })
  await $.tool.call({ tool: 'Read', file_path: '/repo/README.md' } as any)

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ plugin: 'panel-agentes', surface, component: 'AbovePrompt', props: {} as any })
    expect(await ui.find({ type: 'Text', text: /Claude: Lee README\.md/ })).toBeDefined()
    if (surface !== 'terminal') expect(await ui.find({ type: 'Svg' })).toBeDefined()
    await ui.unmount()
  }
})
