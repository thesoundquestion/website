@echo off
setlocal
cd /d "%~dp0"
rem Delegate to the PowerShell-native launcher. It verifies paths, port and URLs.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0PREVIEW_FULL_SITE_WINDOWS.ps1" %*
if errorlevel 1 (
  echo.
  echo [TSQ] Preview did not launch. Read the error above.
  pause
  exit /b 1
)
endlocal
