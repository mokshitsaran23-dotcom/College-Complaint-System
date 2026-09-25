# PowerShell launcher for CampusCare College Complaint System

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   CampusCare - College Complaint System Launcher       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/2] Launching Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$root\backend`" && npm start"

Write-Host "[2/2] Launching Frontend Web App (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$root\frontend`" && npm run dev"

Start-Sleep -Seconds 3
Write-Host "Opening http://localhost:5173 in default browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"
