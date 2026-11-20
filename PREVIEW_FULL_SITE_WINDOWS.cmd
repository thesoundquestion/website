@echo off
setlocal
cd /d "%~dp0"
set "PORT=8765"
set "URL=http://127.0.0.1:%PORT%/"
where py >nul 2>nul
if not errorlevel 1 goto use_py
where python >nul 2>nul
if not errorlevel 1 goto use_python
echo [The Sound Question] Python 3 was not found.
echo Install Python 3 or use any static HTTP server in the repository root.
echo Full-site local address: %URL%
pause
exit /b 1

:use_py
start "The Sound Question FULL SITE Preview" cmd /k "py -m http.server %PORT% --bind 127.0.0.1"
goto open_browser

:use_python
start "The Sound Question FULL SITE Preview" cmd /k "python -m http.server %PORT% --bind 127.0.0.1"
goto open_browser

:open_browser
timeout /t 2 /nobreak >nul
start "" "%URL%"
echo.
echo Full preview: %URL%
echo Site branch: draft/magicpath-compact-full-site-20261120
echo Close the newly opened server console to stop the preview.
pause
