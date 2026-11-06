@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Jorda rundt-motoren: publiser skybanken + databasereglene for ALLE spillene ===
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js mangler. Last ned "LTS" fra https://nodejs.org , installer, og dobbeltklikk denne fila igjen.
  pause
  exit /b 1
)
echo  1/4  Lager databasereglene for alle spillpakkene ...
call node verktoy\lag-regler.mjs
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
echo  4/4  Publiserer bankene og reglene til skyen ...
call npx --yes firebase-tools@latest deploy --only functions,database --project jorda-rundt-147c8
if errorlevel 1 goto feil
echo.
echo  FERDIG! Bankene og reglene er publisert for alle spillene.
pause
exit /b 0
:feil
echo.
echo  Noe gikk galt. Ta et skjermbilde av teksten over og vis det til Claude.
pause
exit /b 1
