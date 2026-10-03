@echo off
cd /d "%~dp0"
echo ========================================
echo LocalExpress Marketplace
echo ========================================
echo.
if not exist package.json (
  echo ERROR: package.json was not found in this folder.
  pause
  exit /b 1
)
if not exist backend\.env (
  copy backend\.env.example backend\.env >nul
  echo Created backend\.env from example. Edit JWT_SECRET before using outside local development.
)
if not exist frontend\.env (
  copy frontend\.env.example frontend\.env >nul
)
echo Installing dependencies...
call npm run install:all
if errorlevel 1 (
  echo INSTALL FAILED. Check Node.js, npm, and your internet connection.
  pause
  exit /b 1
)
echo Starting LocalExpress...
call npm run dev
pause
