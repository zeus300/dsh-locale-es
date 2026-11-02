# Instala el paquete de idioma español en el perfil de DSH (sobrevive a actualizaciones de la app).
#
#   powershell -ExecutionPolicy Bypass -File scripts\install-plugin.ps1
#
# Después, reinicia DeepSeek Harness y elige Ajustes > General > Idioma > Español.
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$profiles = Join-Path $env:USERPROFILE '.dsh\profiles'
$modules = Join-Path $profiles 'node_modules'
$target = Join-Path $modules 'dsh-locale-es'
$patchFile = Join-Path $profiles 'desktop\cordis.patch.yml'

if (-not (Test-Path $patchFile)) { throw "No se encontró el perfil de escritorio: $patchFile" }
if (-not (Test-Path (Join-Path $repo 'lib\client.js'))) { throw 'Ejecuta primero: node build.mjs' }

Write-Host '[es] copiando paquete al perfil...'
New-Item -ItemType Directory -Force -Path $modules | Out-Null
New-Item -ItemType Directory -Force -Path $target | Out-Null
robocopy $repo $target /E /XD node_modules .git /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy falló con código $LASTEXITCODE" }

$patch = Get-Content $patchFile -Raw
if ($patch -notmatch '(?m)^\s*name:\s*"?dsh-locale-es"?\s*$') {
    Write-Host '[es] activando el complemento en cordis.patch.yml...'
    Add-Content -Path $patchFile -Value "`n- id: locale-es`n  name: dsh-locale-es" -Encoding utf8
} else {
    Write-Host '[es] el complemento ya estaba activado'
}

Write-Host '[es] listo. Reinicia DeepSeek Harness y elige Ajustes > General > Idioma > Español.'
