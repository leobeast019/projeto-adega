@echo off
cd /d "%~dp0"
set PORT=8000

where python >nul 2>nul
if errorlevel 1 (
  echo Python nao foi encontrado. Instale o Python e tente novamente.
  pause
  exit /b 1
)

start "" python -m http.server %PORT%
start "" http://localhost:%PORT%/

echo Adega Medieval Pro foi aberta no navegador.
echo Acesse: http://localhost:%PORT%/

timeout /t 2 >nul
