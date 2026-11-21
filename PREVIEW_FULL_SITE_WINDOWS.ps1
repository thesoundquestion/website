# The Sound Question: verified full-site preview (Windows PowerShell 5.1+)
# Runs a static local server and tests the actual Builder and Checker routes.
# Launch from this exact Git checkout, not C:\Windows\System32.
param(
  [ValidateRange(1024,65535)][int]$Port = 8877,
  [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
$expectedBranch = 'draft/magicpath-compact-full-site-20261120'
if (!(Test-Path (Join-Path $PSScriptRoot '.git'))) {
  throw 'This file must run from a Git checkout of The Sound Question website.'
}
$activeBranch = (& git -C $PSScriptRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $activeBranch -ne $expectedBranch) {
  throw "Wrong Git branch: '$activeBranch'. Expected '$expectedBranch'."
}

$required = @(
  'index.html',
  'system-builder/index.html',
  'system-builder/app.mjs',
  'system-builder/simple-system-summary.mjs',
  'system-builder/tonal-impressions.mjs',
  'system-builder/passive-evidence-readiness.mjs',
  'system-builder/shared-gear-adapter.mjs',
  'system-builder/compact-preview.css',
  'system-check/index.html',
  'system-check/verified-speaker-supplements.js',
  'equipment/catalog.generated.json'
)
foreach ($path in $required) {
  if (!(Test-Path (Join-Path $PSScriptRoot $path))) {
    throw "Missing required preview file: $path. Update the Git branch before launching."
  }
}

$python = Get-Command py.exe -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python.exe -ErrorAction SilentlyContinue }
if (-not $python) {
  throw 'Python 3 was not found. Install Python 3 and enable the Python launcher (py.exe).'
}

$probe = New-Object System.Net.Sockets.TcpClient
try {
  $probe.Connect('127.0.0.1', $Port)
  throw "Port $Port already has a server. Close that preview or run this script with -Port 8899."
}
catch [System.Net.Sockets.SocketException] {
  # Expected: the port is free.
}
finally { $probe.Dispose() }

$arguments = @('-m', 'http.server', [string]$Port, '--bind', '127.0.0.1')
$server = Start-Process -FilePath $python.Source -ArgumentList $arguments -WorkingDirectory $PSScriptRoot -PassThru
if (-not $server -or $server.HasExited) {
  throw 'The Python preview server failed to start.'
}

$base = "http://127.0.0.1:$Port"
$builder = "$base/system-builder/"
$checker = "$base/system-check/"
$pathsToCheck = @('/', '/system-builder/', '/system-check/', '/system-builder/app.mjs', '/equipment/catalog.generated.json')
$opened = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
  Start-Sleep -Milliseconds 300
  if ($server.HasExited) { break }
  try {
    $first = Invoke-WebRequest -Uri $builder -UseBasicParsing -TimeoutSec 2
    if ($first.StatusCode -eq 200 -and $first.Content -match 'sb-preview-build') {
      $opened = $true
      break
    }
  } catch { }
}
if (-not $opened) {
  throw "Preview did not serve the expected Builder after starting. Check the Python server window. Expected: $builder"
}
foreach ($path in $pathsToCheck) {
  $response = Invoke-WebRequest -Uri "$base$path" -UseBasicParsing -TimeoutSec 5
  if ($response.StatusCode -ne 200) { throw "Preview route failed: $base$path" }
}

Write-Host ''
Write-Host 'TSQ preview server is running. All core URLs responded successfully.' -ForegroundColor Green
Write-Host "Branch: $activeBranch"
Write-Host "Full site: $base/"
Write-Host "Builder:   $builder"
Write-Host "Checker:   $checker"
Write-Host "Server process ID: $($server.Id)"
Write-Host 'To stop: Stop-Process -Id' $server.Id
if (-not $NoBrowser) { Start-Process $builder }
