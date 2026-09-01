# Build admin SPA and zip dist/ for FileZilla upload (Day 6).
# Usage (repo root):
#   powershell -ExecutionPolicy Bypass -File scripts/package-admin-dist.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$admin = Join-Path $root 'Frontend\admin-panel'
$dist = Join-Path $admin 'dist'
$outDir = Join-Path $root 'deploy\artifacts'
$zip = Join-Path $outDir 'admin-dist.zip'

if (-not (Test-Path (Join-Path $admin 'package.json'))) {
  throw "Admin panel not found at $admin"
}

Push-Location $admin
try {
  Write-Host 'Building admin panel...'
  npm run build
} finally {
  Pop-Location
}

if (-not (Test-Path (Join-Path $dist 'index.html'))) {
  throw 'Build failed — dist/index.html missing'
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }

Write-Host "Zipping $dist → $zip"
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zip -Force

Write-Host ''
Write-Host 'Done. Upload zip contents (or extract then upload) to /var/www/admin on EC2.'
Write-Host "Zip: $zip"
