# Desinstala el paquete de idioma español del perfil de DSH.
$ErrorActionPreference = 'Stop'

$profiles = Join-Path $env:USERPROFILE '.dsh\profiles'
$target = Join-Path $profiles 'node_modules\dsh-locale-es'
$patchFile = Join-Path $profiles 'desktop\cordis.patch.yml'

if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
    Write-Host '[es] paquete eliminado del perfil'
}

if (Test-Path $patchFile) {
    $lines = Get-Content $patchFile
    $out = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^\s*-\s*id:\s*locale-es\s*$') {
            # salta esta entrada de dos líneas
            if ($i + 1 -lt $lines.Count -and $lines[$i + 1] -match '^\s*name:\s*"?dsh-locale-es"?\s*$') { $i++ }
            continue
        }
        $out.Add($lines[$i])
    }
    Set-Content -Path $patchFile -Value $out -Encoding utf8
    Write-Host '[es] entrada eliminada de cordis.patch.yml'
}

Write-Host '[es] reinicia DeepSeek Harness para aplicar el cambio.'
