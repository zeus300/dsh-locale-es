// Extrae pares (namespace -> diccionario español) desde una instalación ya parcheada
// de DeepSeek Harness y los escribe en data/es/*.json.
//
// Uso: node tools/extract-ns.mjs [ruta-al-directorio-@deepseek-ai]
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(import.meta.url).replace(/[\\/]tools[\\/][^\\/]+$/, "");
const OUT = join(root, "data", "es");
const APP = process.argv[2] ?? join(process.env.LOCALAPPDATA ?? "", "Programs", "DeepSeek Harness", "resources", "app", "dsh", "node_modules", "@deepseek-ai");
if (!existsSync(APP)) throw new Error(`No se encontró el runtime: ${APP}`);
mkdirSync(OUT, { recursive: true });

function balanced(text, openIndex) {
  let depth = 0;
  let inStr = null;
  for (let i = openIndex; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return text.slice(openIndex, i + 1); }
  }
  return null;
}

// Resuelve el primer argumento de register(): literal de cadena o const identificador.
function resolveNs(text, literal) {
  if (literal.startsWith('"') || literal.startsWith("'")) return literal.slice(1, -1);
  const re = new RegExp(`const\\s+${literal.replace(/\$/g, "\\$")}\\s*=\\s*("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`);
  const m = re.exec(text);
  if (m) { try { return new Function(`return ${m[1]};`)(); } catch {} }
  return literal;
}

let count = 0;
const namespaces = [];
for (const pkg of readdirSync(APP)) {
  const file = join(APP, pkg, "lib", "client.js");
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");
  const re = /(\.locale\.register|locale\.register)\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*,\s*\{/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const ns = resolveNs(text, m[2]);
    const objStart = m.index + m[0].length - 1;
    const body = balanced(text, objStart);
    if (!body) continue;
    const esRef = /(?<![\w$])es\s*:\s*([A-Za-z_$][\w$]*)/.exec(body);
    if (!esRef) continue;
    const constName = esRef[1];
    const cre = new RegExp(`const\\s+${constName.replace(/\$/g, "\\$")}\\s*=\\s*\\{`);
    const cm = cre.exec(text);
    if (!cm) continue;
    const lit = balanced(text, cm.index + cm[0].length - 1);
    let dict;
    try { dict = new Function(`return (${lit});`)(); } catch (error) { console.error(`omitido ${pkg}/${constName}: ${error.message}`); continue; }
    const safe = String(ns).replace(/[^a-zA-Z0-9._-]/g, "_");
    writeFileSync(join(OUT, `${safe}.json`), JSON.stringify(dict, null, 2) + "\n");
    namespaces.push({ ns, safe, pkg, keys: Object.keys(dict).length });
    count++;
  }
}
namespaces.sort((a, b) => a.ns.localeCompare(b.ns));
writeFileSync(join(root, "data", "namespaces.json"), JSON.stringify(namespaces, null, 2) + "\n");
console.log(`diccionarios: ${count}, namespaces: ${namespaces.length}, claves: ${namespaces.reduce((n, x) => n + x.keys, 0)}`);
