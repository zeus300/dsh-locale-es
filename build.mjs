// Genera lib/client.js a partir de data/es/*.json (namespace -> diccionario español).
// Ejecuta: node build.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, "data", "es");

const files = readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();
const dicts = {};
let totalKeys = 0;
for (const file of files) {
  const ns = file.replace(/\.json$/, "");
  const dict = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  dicts[ns] = dict;
  totalKeys += Object.keys(dict).length;
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const banner = `/* dsh-locale-es v${pkg.version} — ${files.length} namespaces, ${totalKeys} cadenas. Generado por build.mjs; no editar a mano. */`;

const body = `window.__ModuleLoader__.load({
	id: ${JSON.stringify(pkg.name)},
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/** Diccionarios por namespace. */
		const DICTIONARIES = ${JSON.stringify(dicts)};
		/** La bandera es un idioma opcional: solo necesita el servicio de idioma. */
		const inject = ["locale"];
		/**
		 * Registra el español como idioma seleccionable y sus diccionarios.
		 * Si la aplicación ya trae «es» de fábrica (parche nativo), se ignora el alta.
		 * @param ctx - contexto de cliente del plugin.
		 */
		function apply(ctx) {
			try {
				ctx.effect(() => ctx.locale.addLanguage({ id: "es", label: "Español", fallback: "en" }), "locale-es: language");
			} catch {
				/* ya registrado por la aplicación; los diccionarios siguen siendo válidos */
			}
			for (const [ns, dict] of Object.entries(DICTIONARIES)) {
				try {
					ctx.effect(() => ctx.locale.register(ns, { es: dict }), "locale-es: " + ns);
				} catch {
					/* namespace ya traducido por la aplicación */
				}
			}
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
`;

writeFileSync(join(root, "lib", "client.js"), `${banner}\n${body}`);
console.log(`lib/client.js generado: ${files.length} namespaces, ${totalKeys} claves`);
