# PowerShell Launcher for Metamorph
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host " 🦋 METAMORPH: Autonomous JS -> TS Migration Agent      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Magenta

$VENV_PYTHON = Join-Path $PSScriptRoot "venv\Scripts\python.exe"

if (-Not (Test-Path $VENV_PYTHON)) {
    Write-Host "[!] Virtual environment not found. Setting up..." -ForegroundColor Yellow
    python -m venv venv
    & ".\venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
}

Write-Host "[*] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Set-Location -Path (Join-Path $PSScriptRoot "backend")
& $VENV_PYTHON -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
