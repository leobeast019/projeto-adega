Set WshShell = CreateObject("WScript.Shell")
appFolder = WScript.Arguments(0)
shortcutPath = WshShell.SpecialFolders("Desktop") & "\Adega Medieval Pro.lnk"
Set shortcut = WshShell.CreateShortcut(shortcutPath)
shortcut.TargetPath = appFolder & "\start-app.bat"
shortcut.WorkingDirectory = appFolder
shortcut.IconLocation = appFolder & "\icons\icon-192.svg, 0"
shortcut.Description = "Abrir Adega Medieval Pro"
shortcut.Save
WScript.Echo "Atalho criado na area de trabalho."
