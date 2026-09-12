@echo off
title CampusCare Launcher
echo ========================================================
echo   CampusCare - College Complaint System Launcher
echo ========================================================
echo.

echo [1/2] Starting Backend API Server (Port 5000)...
start "CampusCare Backend API" cmd /k "cd /d %~dp0backend && npm start"

echo [2/2] Starting Frontend Web App (Port 5173)...
start "CampusCare Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Launching browser to http://localhost:5173 in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo System is running! Keep the two terminal windows open while using the app.
pause
