@echo off
cd /d "%~dp0"

if not exist "%~dp0start-app.bat" (
  echo Arquivo start-app.bat nao encontrado.
  pause
  exit /b 1
)

cscript //nologo "%~dp0create-desktop-shortcut.vbs" "%~dp0"

echo.
echo Atalho da Adega Medieval Pro foi criado no Desktop.
echo Clique no atalho para abrir o app.
pause
