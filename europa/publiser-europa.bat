@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo.
echo  === Europa rundt: publiser skybanken + database-reglene ===
echo  (Oppdaterer ogsa skybanken til Jorda rundt - begge ligger i samme oppsett.)
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js mangler. Last ned "LTS" fra https://nodejs.org , installer, og dobbeltklikk denne fila igjen.
  pause
  exit /b 1
)
echo  1/4  Lager Europa-reglene ut fra reglene til Jorda rundt ...
call node europa\lag-regler.mjs
if errorlevel 1 goto feil
echo.
echo  2/4  Henter byggeklossene til banken (tar litt tid forste gang) ...
call npm install --prefix functions --no-audit --no-fund
if errorlevel 1 goto feil
echo.
echo  3/4  Sjekker at du er logget inn i Firebase (et nettleservindu kan apne seg) ...
call npx --yes firebase-tools@latest login
if errorlevel 1 goto feil
echo.
echo  4/4  Publiserer banken og reglene til skyen ...
call npx --yes firebase-tools@latest deploy --only functions,database --project jorda-rundt-147c8
if errorlevel 1 goto feil
echo.
echo  FERDIG! Europa-banken og reglene er publisert.
pause
exit /b 0
:feil
echo.
echo  Noe gikk galt. Ta et skjermbilde av teksten over og vis det til Claude.
pause
exit /b 1
