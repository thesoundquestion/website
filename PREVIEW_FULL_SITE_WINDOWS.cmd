@echo off
setlocal
cd /d "%~dp0"

rem Compact Builder full-site preview uses a separate port from older sessions.
set "PORT=8877"
set "URL=http://127.0.0.1:%PORT%/system-builder/"

set "EXPECTED=draft/magicpath-compact-full-site-20261120"
for /f "delims=" %%B in ('git branch --show-current 2^>nul') do set "ACTIVE=%%B"
if /I not "%ACTIVE%"=="%EXPECTED%" (
  echo [TSQ] Wrong preview branch: %ACTIVE%
  echo [TSQ] Expected: %EXPECTED%
  echo Open the correct checkout and update the branch before launching.
  pause
  exit /b 1
)
if not exist "system-builder\shared-gear-adapter.mjs" goto files_missing
if not exist "system-builder\compact-preview.css" goto files_missing
if not exist "equipment\catalog.generated.json" goto files_missing


rem Refuse to open a stale server if this port is already occupied.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object System.Net.Sockets.TcpClient; try { $c.Connect('127.0.0.1',%PORT%); exit 1 } catch { exit 0 } finally { $c.Dispose() }"
if errorlevel 1 goto port_busy

where py >nul 2>nul
if not errorlevel 1 goto use_py
where python >nul 2>nul
if not errorlevel 1 goto use_python
echo [TSQ] Python 3 was not found. Install Python 3 or use another local static server.
pause
exit /b 1

:files_missing
echo [TSQ] Preview is incomplete: the Builder files or equipment catalogue are missing.
echo Run git pull --ff-only from this checkout and retry.
pause
exit /b 1

:port_busy
echo [TSQ] Port %PORT% is already occupied. A previous preview may still be running.
echo Close the old TSQ preview server console before restarting.
echo To inspect the server, run: Get-NetTCPConnection -LocalPort %PORT% -State Listen
pause
exit /b 1

:use_py
start "TSQ COMPACT FULL SITE %PORT%" cmd /k "py -m http.server %PORT% --bind 127.0.0.1"
goto open_browser

:use_python
start "TSQ COMPACT FULL SITE %PORT%" cmd /k "python -m http.server %PORT% --bind 127.0.0.1"
goto open_browser

:open_browser
timeout /t 2 /nobreak >nul
start "" "%URL%"
echo.
echo Compact Builder preview branch: draft/magicpath-compact-full-site-20261120
echo Full site: http://127.0.0.1:%PORT%/
echo Listening Builder: %URL%
echo Close the preview server console when finished.
pause
