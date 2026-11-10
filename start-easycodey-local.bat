@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is niet gevonden. Installeer Node.js 18 of nieuwer via https://nodejs.org
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 4173); $c.Close(); exit 0 } catch { exit 1 }"
if not errorlevel 1 (
  echo EasyCodey draait al lokaal. Ik open de browser.
  start "" "http://localhost:4173"
  exit /b 0
)

echo.
echo   Lokale ontwikkelversie starten...
echo   De site opent op http://localhost:4173
echo   Sluit dit venster om de server te stoppen.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:4173"
node server.js
echo.
echo   De server is gestopt.
pause
