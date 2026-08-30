@echo off
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python nao foi encontrado.
  echo Instale o Python 3 e depois execute este arquivo novamente.
  echo https://www.python.org/downloads/
  pause
  exit /b 1
)

if not exist "%~dp0start-app.bat" (
  echo Arquivo start-app.bat nao encontrado.
  pause
  exit /b 1
)

set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Adega Medieval Pro.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%~dp0start-app.bat'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = '%~dp0icons\icon-192.svg,0'; $Shortcut.Description = 'Abrir Adega Medieval Pro'; $Shortcut.Save();"

echo.
echo Atalho criado na area de trabalho.
echo Clique no atalho 'Adega Medieval Pro' para abrir o app.
echo Se quiser, o navegador tambem pode abrir automaticamente ao iniciar.
pause
