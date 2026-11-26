# Obtener cambios del proyecto desde GitHub
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$branch = git branch --show-current
Write-Host "Trayendo cambios de origin/$branch..." -ForegroundColor Cyan
git pull origin $branch

if (Test-Path "package.json") {
    Write-Host "Instalando/actualizando dependencias..." -ForegroundColor Cyan
    npm install
}

Write-Host "Proyecto actualizado correctamente." -ForegroundColor Green