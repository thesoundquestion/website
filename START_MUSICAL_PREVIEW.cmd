@echo off
setlocal
cd /d "%~dp0"
set "TSQ_PORT=8765"
set "TSQ_URL=http://127.0.0.1:%TSQ_PORT%/experiments/musical-breathers/"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "TSQ Musical Preview Server" cmd /k py -m http.server %TSQ_PORT% --bind 127.0.0.1
  goto :open
)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "TSQ Musical Preview Server" cmd /k python -m http.server %TSQ_PORT% --bind 127.0.0.1
  goto :open
)
echo Python 3 was not found. Install Python 3 or run your preferred static file server from this repository's root directory.
echo Then open: %TSQ_URL%
pause
exit /b 1
:open
timeout /t 2 /nobreak >nul
start "" "%TSQ_URL%"
echo Preview opened at %TSQ_URL%
echo Close the new "TSQ Musical Preview Server" console window to stop the local server.
pause
