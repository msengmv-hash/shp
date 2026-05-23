$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$python = Join-Path $root ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
  throw "Virtualenv not found. Run: python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt"
}

Push-Location $backend
$env:USE_SQLITE = "True"
& $python manage.py migrate --noinput | Out-Host
& $python manage.py bootstrap_catalog --products 420 | Out-Host
Pop-Location

Start-Process -FilePath "powershell" `
  -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `$env:USE_SQLITE='True'; & '$python' manage.py runserver 127.0.0.1:8000" `
  -WorkingDirectory $backend `
  -RedirectStandardOutput (Join-Path $backend "backend.log") `
  -RedirectStandardError (Join-Path $backend "backend.err.log") `
  -WindowStyle Hidden

Start-Process -FilePath "powershell" `
  -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `$env:VITE_API_URL='http://127.0.0.1:8000/api'; npm run dev -- --host 127.0.0.1 --port 5173" `
  -WorkingDirectory $frontend `
  -RedirectStandardOutput (Join-Path $frontend "frontend.log") `
  -RedirectStandardError (Join-Path $frontend "frontend.err.log") `
  -WindowStyle Hidden

Write-Host "Backend:  http://127.0.0.1:8000/api/"
Write-Host "Swagger:  http://127.0.0.1:8000/api/docs/"
Write-Host "Frontend: http://127.0.0.1:5173/"
