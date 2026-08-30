$ErrorActionPreference = 'Stop'

$appFolder = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectName = 'Adega Medieval Pro'
$shortcutName = 'Adega Medieval Pro.lnk'
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop $shortcutName

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = Join-Path $appFolder 'start-app.bat'
$Shortcut.WorkingDirectory = $appFolder
$Shortcut.IconLocation = Join-Path $appFolder 'icons\icon-192.svg,0'
$Shortcut.Description = 'Abrir Adega Medieval Pro'
$Shortcut.Save()

Write-Host "Atalho criado na area de trabalho: $shortcutPath"
Write-Host "Se o navegador nao abrir, execute start-app.bat manualmente."
