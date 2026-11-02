// Parchea las cadenas nativas del shell (menús, diálogos, ventana de bienvenida) de una
// instalación de DeepSeek Harness con los mensajes españoles de data/shell-es.json.
//
// Uso: node tools/patch-shell.mjs [ruta-a-resources\app]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(import.meta.url).replace(/[\\\\/]tools[\\\\/][^\\\\/]+$/, "");
const dict = JSON.parse(readFileSync(join(root, "data", "shell-es.json"), "utf8"));
const app = process.argv[2] ?? join(process.env.LOCALAPPDATA ?? "", "Programs", "DeepSeek Harness", "resources", "app");

function locateConstBlock(text, name) {
  const re = new RegExp(`const\\s+${name.replace(/\$/g, "\\$")}\\s*=\\s*\\{`);
  const m = re.exec(text);
  if (!m) return null;
  let i = m.index + m[0].length - 1;
  let depth = 0;
  let inStr = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return { start: m.index, end: i + 1 }; }
  }
  return null;
}

const literal = `{\n${Object.entries(dict).map(([k, v]) => `\t\t\t${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n")}\n\t\t}`;
let changed = 0;
for (const rel of ["lib/main.js", "lib/preload-app.cjs", "lib/preload-welcome.cjs"]) {
  const file = join(app, rel);
  if (!existsSync(file)) { console.log(`omitido ${rel} (no existe)`); continue; }
  let text = readFileSync(file, "utf8");
  if (/\bconst\s+es\s*=\s*\{/.test(text)) { console.log(`${rel}: ya parcheado`); continue; }
  const zh = locateConstBlock(text, "zh");
  if (!zh) { console.log(`${rel}: no se encontró el diccionario zh`); continue; }
  let end = zh.end;
  if (text[end] === ";") end += 1;
  text = text.slice(0, end) + `\n/** Spanish shell messages. */\nconst es = ${literal};` + text.slice(end);
  if (!text.includes('id: "es"')) {
    text = text.replace(
      /return locale\.toLowerCase\(\)\.startsWith\("zh"\) \? \{\s*id: "zh-CN",\s*messages: zh\s*\} : \{\s*id: "en",\s*messages: en\s*\};/,
      'if (locale.toLowerCase().startsWith("zh")) return {\n\t\tid: "zh-CN",\n\t\tmessages: zh\n\t};\n\tif (locale.toLowerCase().startsWith("es")) return {\n\t\tid: "es",\n\t\tmessages: es\n\t};\n\treturn {\n\t\tid: "en",\n\t\tmessages: en\n\t};',
    );
  }
  text = text.replace(/if \(selected === "zh" \|\| selected === "en"\)/g, 'if (selected === "zh" || selected === "en" || selected === "es")');
  text = text.replace(/if \(primary === "zh" \|\| primary === "en"\)/g, 'if (primary === "zh" || primary === "en" || primary === "es")');
  writeFileSync(file, text);
  changed++;
  console.log(`${rel}: parcheado`);
}
console.log(changed === 0 ? "nada que hacer" : `${changed} archivo(s) actualizados`);
