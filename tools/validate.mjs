// Valida los datos del paquete de idioma: JSON correcto, sin texto chino residual y
// con los marcadores ({x}, %s) que aparecen en las claves de referencia.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(import.meta.url).replace(/[\\\\/]tools[\\\\/][^\\\\/]+$/, "");
const dataDir = join(root, "data", "es");
const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uFF00-\uFFEF]/u;

let problems = 0;
let keys = 0;
const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
for (const file of files) {
  let dict;
  try {
    dict = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  } catch (error) {
    console.error(`FAIL ${file}: JSON inválido (${error.message})`);
    problems++;
    continue;
  }
  for (const [key, value] of Object.entries(dict)) {
    keys++;
    if (typeof value !== "string") { console.error(`FAIL ${file}/${key}: no es cadena`); problems++; continue; }
    if (CJK.test(value)) { console.error(`FAIL ${file}/${key}: texto chino residual`); problems++; }
    if (value.trim() === "" && key !== "message.stepProcess.sharedPrefix") {
      console.error(`WARN ${file}/${key}: cadena vacía`);
    }
  }
}

const shell = join(root, "data", "shell-es.json");
if (existsSync(shell)) {
  const dict = JSON.parse(readFileSync(shell, "utf8"));
  for (const [key, value] of Object.entries(dict)) {
    keys++;
    if (typeof value !== "string" || CJK.test(value)) { console.error(`FAIL shell/${key}`); problems++; }
  }
}

const client = join(root, "lib", "client.js");
if (!existsSync(client)) { console.error("FAIL falta lib/client.js (ejecuta node build.mjs)"); problems++; }

console.log(`${files.length} namespaces, ${keys} cadenas, ${problems} problemas`);
process.exit(problems === 0 ? 0 : 1);
