@echo off
echo Starting Cyber Alert Platform Services...

:: Start Flask API in a new window
start "Flask ML API" cmd /k "python backend/app.py"

:: Wait a few seconds for Flask to start
timeout /t 5

:: Start Node.js Backend
start "Node.js Backend" cmd /k "cd backend && npm start"

:: Wait a few seconds for Backend to start
timeout /t 5

:: Start Frontend
echo Starting Frontend...
cd frontend
npm start
