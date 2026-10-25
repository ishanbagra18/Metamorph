@echo off
title Metamorph Migration Engine
echo ========================================================
echo  🦋 METAMORPH: Autonomous JS to TS Migration Agent
echo ========================================================

if not exist venv\Scripts\python.exe (
    echo [*] Setting up virtual environment...
    python -m venv venv
    venv\Scripts\python.exe -m pip install -r backend\requirements.txt
)

echo [*] Launching Metamorph Server at http://localhost:8000
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
