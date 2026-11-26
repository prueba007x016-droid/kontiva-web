# Guardar cambios del proyecto en GitHub
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Revisando cambios..." -ForegroundColor Cyan
git add -A

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No hay cambios para guardar." -ForegroundColor Yellow
    exit 0
}

# Identidad local (por si se usa en otra PC)
git config user.name "prueba007x016"
git config user.email "prueba007x016@gmail.com"

$msg = Read-Host "Mensaje de commit (Enter para 'Actualizacion KONTIVA')"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "Actualizacion KONTIVA"
}

$branch = git branch --show-current
Write-Host "Commit en rama $branch..." -ForegroundColor Cyan
git commit -m $msg

Write-Host "Subiendo a GitHub..." -ForegroundColor Cyan
git push origin $branch

Write-Host "Cambios guardados correctamente." -ForegroundColor Green