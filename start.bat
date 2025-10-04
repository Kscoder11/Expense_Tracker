@echo off
echo 🚀 Starting Expense Tracker...
echo.

REM Start Backend
start "Backend" cmd /k "cd backend && set PATH=C:\Program Files\nodejs;%%PATH%% && node src/server.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
start "Frontend" cmd /k "cd frontend && set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev"

echo ✅ Expense Tracker is starting...
echo 📧 Demo Accounts:
echo    Employee: employee@demo.com / employee123
echo    Manager:  manager@demo.com  / manager123
echo    Admin:    admin@demo.com    / admin123
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🌐 Backend:  http://localhost:5000
echo.
pause