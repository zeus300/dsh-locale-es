/**
 * Mitad de host del paquete de idioma español.
 *
 * Un paquete de idioma es un plugin puramente de cliente: la mitad de host existe
 * únicamente para que el plugin aparezca en el cargador de cordis y su mitad de
 * navegador se descubra mediante `exports["./client"]` y la declaración
 * `dsh.client` de package.json.
 */
export const name = "locale-es";

/** Sin comportamiento en el host. */
export function apply() {}
