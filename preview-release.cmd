@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js is required to run the website tests and local preview.
 echo Install Node.js LTS, then run this launcher again.
 pause
 exit /b 1
)
echo THE SOUND QUESTION - FULL RELEASE CANDIDATE
echo Running all tests and static build before preview.
echo This does NOT deploy the website or enable paid AI.
node scripts\preview-release-candidate.mjs
if errorlevel 1 (
 echo.
 echo Preview blocked because a test or build step failed.
 pause
 exit /b 1
)
pause
