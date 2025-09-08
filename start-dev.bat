@echo off
echo Starting FitnessPr Development Environment...
echo.

:: Change to the project root directory
cd /d "%~dp0"

:: Start backend in a new console window
echo Starting Backend (FastAPI)...
start "FitnessPr Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host localhost --port 8000"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new console window
echo Starting Frontend (Next.js)...
start "FitnessPr Frontend" cmd /k "cd fitnesspr && npm run dev"

echo.
echo ================================================
echo   FitnessPr Development Environment Started
echo ================================================
echo.
echo Backend (API):        http://localhost:8000
echo Backend (Docs):       http://localhost:8000/docs
echo Frontend:             http://localhost:3000
echo.
echo Press any key to open the application in your browser...
pause >nul

:: Open the frontend in default browser
start http://localhost:3000

echo.
echo Both services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
