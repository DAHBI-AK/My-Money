@echo off
cd /d "%~dp0"
where python >nul 2>&1
if %errorlevel%==0 (
  start "" "http://127.0.0.1:8080/"
  python -m http.server 8080 --bind 127.0.0.1
) else (
  start "" "%~dp0index.html"
)
