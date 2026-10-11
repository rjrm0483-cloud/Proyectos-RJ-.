# Proyectos-RJ-.

Repositorio con el sitio público de **Agenda Psiquiátrica Pro** y la configuración de Claude Code del proyecto: agentes, skills, comandos y el mod `panel-agentes`.

## Contenido

| Ruta | Qué es |
| --- | --- |
| `index.html` | Política de privacidad de Agenda Psiquiátrica Pro |
| `.github/workflows/publicar-sitio.yml` | Publica el sitio en GitHub Pages (se lanza a mano desde Actions) |
| `.claude/agents/` | Agentes del proyecto |
| `.claude/skills/` | Skills del proyecto |
| `.claude/commands/` | Comandos `/` del proyecto |
| `.claude/settings.json` | Activa el mod `panel-agentes` en este repositorio |
| `.claude-plugin/marketplace.json` | Hace del repo un marketplace de plugins (`proyectos-rj`) |
| `plugins/panel-agentes/` | Código del mod `panel-agentes` |
| `.claude/LICENSES/` | Licencias del contenido de la comunidad |

## Agentes

- **security-auditor**: auditoría de seguridad (vulnerabilidades, modelado de amenazas, OWASP, DevSecOps, cumplimiento GDPR/HIPAA/SOC2, respuesta a incidentes).
- **hipaa-compliance**: obligaciones de HIPAA para productos de salud (PHI, entidades cubiertas, BAA, salvaguardas).

## Skills

- **brainstorming**: explorar la intención y el diseño antes de crear una función o componente.
- **grilling**: someter un plan o una idea a preguntas duras.
- **handoff**: resumir la conversación en un documento para que otro agente continúe.
- **systematic-debugging**: encontrar la causa raíz de un fallo antes de proponer arreglos.
- **test-driven-development**: escribir primero los tests y después el código.
- **verification-before-completion**: verificar con comandos antes de dar algo por terminado.

## Comandos

- **/compliance-check**: revisión de cumplimiento normativo (GDPR, HIPAA, SOC2, PCI-DSS…).

## Mod: panel-agentes

Panel que muestra en directo cada paso del agente principal y de cada subagente, y se abre solo al empezar cualquier tarea. Encima del cuadro de texto, una franja con un miquito animado por cada agente que trabaja, cada uno con su nombre y su color (Coco, el naranja, es siempre el agente principal; Kiki, Tito, Lola… los subagentes), y su paso actual; en la conversación, un aviso cuando un subagente arranca y cuando termina. `/agentes` lista qué hace cada agente (los de `.claude/agents/` y los integrados).

Se ve en la terminal, en la app de escritorio y en claude.ai/code. La app del móvil no dibuja lo que añaden los mods; allí, toca "Ejecutando agente" para ver los pasos.

Instalación manual desde una terminal:

```
/plugin install panel-agentes --marketplace rjrm0483-cloud/Proyectos-RJ-.
```

Responde `y` para añadir el marketplace y elige el ámbito. En este repositorio `.claude/settings.json` ya lo deja activado.

## Licencias

Las skills y agentes de la comunidad se usan bajo licencia MIT; los textos están en `.claude/LICENSES/` (Seth Hobson, Matt Pocock, VoltAgent, Jesse Vincent).
