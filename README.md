# dsh-locale-es — Español para DeepSeek Harness

> Traducción hecha sobre DeepSeek Harness **0.2.1-rc.5** (runtime de la app de escritorio, perfiles web y desktop).

Paquete de idioma **español (es)** para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
(DSH): convierte la interfaz en español neutro de Latinoamérica y añade **Español** al selector de
idioma de Ajustes → General → Idioma.

- **62 espacios de nombres** (namespaces) de la interfaz web: 2.879 cadenas.
- **165 mensajes del shell nativo** (menús, diálogos de actualización/salida, ventana de bienvenida).
- Traducción con glosario coherente: *sesión, espacio de trabajo, agente, subagente, herramienta,
  habilidad, complemento, objetivo, trayectoria, entorno aislado, clave de API…*
- Se conservan marcadores (`{count}`, `{path}`…), saltos de línea, Markdown y espacios de
  concatenación.

## Contenido

```
data/es/<namespace>.json   diccionarios de la interfaz web (62 archivos)
data/shell-es.json         mensajes nativos del shell (menús, diálogos, bienvenida)
data/namespaces.json       índice: namespace -> paquete de origen y nº de claves
lib/client.js              plugin de cliente generado (no editar a mano)
lib/index.js               mitad de host (sin lógica)
build.mjs                  genera lib/client.js a partir de data/es
tools/validate.mjs         valida JSON, texto chino residual y recuentos
tools/patch-shell.mjs      parchea las cadenas nativas de una instalación
tools/extract-ns.mjs       extrae los diccionarios de una instalación ya parcheada
```

## Instalación

### Opción A — como complemento (sobrevive a desinstalar/actualizar la app)

El paquete vive en tu perfil de DSH (`~/.dsh`), no dentro de la app, así que una actualización de
DeepSeek Harness no lo borra.

```powershell
# 1. Copia el paquete al perfil (o instálalo con pnpm/npm en ~/.dsh/profiles)
Copy-Item -Recurse .\dsh-locale-es "$env:USERPROFILE\.dsh\profiles\node_modules\dsh-locale-es"

# 2. Actívalo en el perfil
Add-Content "$env:USERPROFILE\.dsh\profiles\desktop\cordis.patch.yml" @"

- id: locale-es
  name: dsh-locale-es
"@
```

Reinicia la app y elige **Ajustes → General → Idioma → Español**.

> Tras una actualización de la app, el complemento sigue instalado y el idioma se mantiene; solo
> los textos **nativos** (menús y diálogos del sistema) volverían al inglés. Para recuperarlos:
> `node tools/patch-shell.mjs "C:\...\resources\app"` y reinicia.

### Opción B — solo textos nativos (parche de la app)

Si ya tienes la app parcheada por completo y solo quieres restaurar los menús tras una actualización:

```powershell
node tools/patch-shell.mjs "%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\app"
```

El script es idempotente: si detecta el bloque `const es = {` no hace nada.

## Publicarlo y compartirlo

```powershell
npm publish            # publica en npm (prepublishOnly reconstruye y valida)
```

Para que aparezca en **Complementos → Mercado** de la app, añade la URL de un índice de plugins
(la app acepta índices de terceros: *Complementos → Mercado → Índice URL*). El formato del índice
lo define DSH; consulta la documentación del mercado antes de publicar uno.

## Enviarlo a DeepSeek

El repositorio oficial [`deepseek-ai/deepseek-harness`](https://github.com/deepseek-ai/deepseek-harness)
es público y **MIT**, pero en el momento de escribir esto tiene **issues y pull requests
deshabilitados** y **Discussions habilitado**. Es decir: no se puede abrir un PR con la traducción.

Cauces realistas, en orden de utilidad:

1. **Discussion** en el repo oficial proponiendo el idioma `es` y enlazando este paquete: el
   mantenedor puede integrar los diccionarios en `packages/client/*/src/locales/`.
2. **Publicar el paquete en npm** (`dsh-locale-es`) y anunciarlo en la comunidad; con el plugin
   instalado, cualquier usuario tiene español sin tocar la app.
3. Si algún día se abren PRs, la estructura de `data/es/*.json` ya coincide con los namespaces del
   código, así que portarlo a `src/locales/es.ts` de cada paquete es mecánico.

## Traducir o corregir

1. Edita `data/es/<namespace>.json` (clave → texto). No cambies las claves.
2. `node build.mjs && node tools/validate.mjs`.
3. Vuelve a instalar el complemento y reinicia.

Reglas de estilo (resumen): tuteo neutro, etiquetas breves sin punto final, frases completas con
punto, marcadores `{x}` y `%s` intactos, sin texto chino residual.

## Licencia

MIT. La traducción se distribuye como obra derivada de DeepSeek Harness (MIT).
