## Summary

DeepSeek Harness currently ships two interface languages (Simplified Chinese and English). This proposal requests **Spanish (es) as a first-class interface language**, and offers a complete, validated translation that is already packaged and installable.

## Delivered work

A full Spanish language pack for the current desktop and web runtime:

- Repository: https://github.com/zeus300/dsh-locale-es
- Release v0.1.0: https://github.com/zeus300/dsh-locale-es/releases/tag/v0.1.0
- License: MIT

| Surface | Scope |
|---|---|
| Web client | 62 namespaces, 2,879 strings (chat, conversation, settings, workspace, sidebar, models, plugins, market, schedules, trajectory, tools, approvals, voice input) |
| Native shell | 165 messages (application menu, update and quit dialogs, welcome and sign-in window) |
| Language selector | `Español` added to Settings → General → Language, fallback `en` |

## Quality and validation

- Neutral Latin American Spanish with a fixed glossary (session, workspace, agent, subagent, tool, skill, plugin, goal, trajectory, sandbox, API key, and so on).
- Automated checks on every build: one-to-one key parity with the source dictionaries, placeholder parity (`{count}`, `{path}`, `%s`), no residual CJK characters, no empty values.
- All 80 patched client bundles pass `node --check`; the packaged application boots and renders entirely in Spanish.
- Keys and placeholders are preserved, so the translation can be regenerated mechanically for future releases.

## Integration paths

1. **Upstream (preferred):** move `data/es/<namespace>.json` into `packages/client/<package>/src/locales/es.ts` and register it next to `zh` and `en`. Namespaces and keys already match the source.
2. **Plugin distribution:** the package is installable today as a DSH client plugin and survives application updates, because it lives in the user profile rather than inside the application bundle.
3. **Maintenance:** the project can maintain the Spanish locale for future releases (new keys, review, release notes).

## Why Spanish

Spanish is the world's second most spoken native language, with a large developer population across Latin America and Spain. A first-class Spanish interface lowers adoption friction for a substantial user base at no runtime cost: dictionaries load through the existing `ctx.locale.register()` API and the language is registered with `ctx.locale.addLanguage({ id, label, fallback })`, both already present in the client locale runtime.

## Request

Feedback on whether the project would accept Spanish dictionaries as a first-class locale, and which integration path the maintainers prefer.

---

**Resumen en español:** propuesta para incorporar el español (es) como idioma de primera clase en DeepSeek Harness. Ya existe un paquete de idioma completo, validado y con licencia MIT (62 namespaces, 2.879 cadenas de la interfaz y 165 mensajes del shell nativo), listo para integrarse en el repositorio o distribuirse como complemento.
