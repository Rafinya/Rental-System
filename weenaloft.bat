@echo off
:: Switch to the script's directory dynamically
cd /d "%~dp0"

echo ===================================================
echo   Starting Weena Loft Rental Management Engine...
echo ===================================================

:: Start Uvicorn using the virtual environment python interpreter
venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000
