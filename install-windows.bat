@echo off
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python nao foi encontrado.
  echo Instale o Python 3 e depois execute este arquivo novamente.
  echo Site oficial: https://www.python.org/downloads/
  pause
  exit /b 1
)

start "" python -m http.server 8000
start "" http://localhost:8000/

 echo O app foi iniciado.
 echo Abra o navegador e espere a pagina carregar.
 echo Se quiser instalar como app, clique em 'Instalar app' no navegador.
 pause
