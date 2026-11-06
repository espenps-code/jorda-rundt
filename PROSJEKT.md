
# Jorda rundt-motoren – prosjektnotater

Én felles motor driver flere spill («spillpakker»): **Jorda rundt** (verden) og **Europa rundt** (europa).
En rettelse i motoren gjelder alle spillene med en gang.

## Firebase
- Prosjekt: Jorda rundt (jorda-rundt-147c8), Blaze (betal etter bruk, budsjettvarsel satt)
- Realtime Database: europe-west1 (Belgia)
- Hvert spill har sin egen plass i databasen: Jorda rundt øverst (som før), Europa rundt under /europa
- Innlogging: Anonym (elever, gruppekode + PIN) og Google/e-post (lærer)
- Konsoll: https://console.firebase.google.com/project/jorda-rundt-147c8

## Hvordan et spill velges
- Sidene (elev, lærer, tavle, rapport) er felles. Spillet velges med `?pakke=europa` i adressen.
  Uten `?pakke=` blir det Jorda rundt.
- `js/pakke.js` leser dette og lager et «import map»: `#pakke/…` peker på `pakker/<spill>/`, `#motor/…` på `js/`.
- Lenker mellom sidene beholder spillet automatisk (`lenke()` i js/side.js).
- Gamle Europa-adresser (`europa/elev.html` osv.) sender videre til `elev.html?pakke=europa`.

## Mapper og filer
**Motoren (felles for alle spill)**
- `elev.html`, `laerer.html`, `tavle.html`, `rapport.html` – sidene
- `js/felles.js` – felles spillregler (hotell, jobb, låsing, nedtelling …)
- `js/bank.js` – banken: reglene for elevenes forespørsler (kjøres i skyen) + lærerhandlinger
- `js/fb.js` – Firebase-kobling (legg ?emulator i adressen for lokal testing)
- `js/pakke.js` – velger spillpakke (vanlig script i <head>)
- `js/side.js` – fyller inn spillets navn/ord i fast tekst (`data-p="navn"`), lager lenker
- `js/tilfeldig.js`, `js/ikoner.js`, `js/laererinn.js`, `css/felles.css`
- `data/flyquiz.js` (spørsmål underveis), `data/dueller.js` (36 duelloppgaver) – felles for alle spill

**Spillpakkene** – `pakker/<spill>/`
- `pakke.js` – navn, ikon, plass i databasen, ord («land»/«by»), modell, kart-tekster, lenker
- `land.js` – stedene (+ felles grensesnitt: landKode, landInfo, byerILand)
- `regler.js` – standardinnstillinger, poeng (poengForGruppe), geografiquiz
- `motor.js` – reiser og priser (fly/tog/buss), hoteller, jobblønn, tilfeldig start
- `klode.js` – kartet (3D-klode), `rapportkart.js` – kartet i reisedagbøkene
- `parlor.js` – parlør-diktat

**Egne sider per spill (bare tekst/utskrift)**
- `index.html` / `europa/index.html` – forside og lærerveiledning
- `reiselogg.html` / `europa/reiselogg.html` – reiseloggen til utskrift

## Skybanken (Cloud Functions)
- `functions/kopier.mjs` bygger én kopi av motoren per spillpakke i `functions/src/<spill>/` og lager
  `functions/src/index.js` med én bank per spill: `bank` (Jorda rundt) og `europabank` (Europa rundt).
  Ikke rediger `functions/src/` – den overskrives.
- `functions/lagbank.js` – oppsettet for én bank. `functions/adapter/fb.js` – databasekobling på serveren.
- `functions/test-bank.mjs` – test mot emulatoren.
- Publiser: dobbeltklikk **publiser.bat** (krever Node.js). Den lager databasereglene for alle spill,
  publiserer bankene og reglene. Gjør det hver gang noe i `js/`, `data/` eller `pakker/` endres.
- Ikke last opp `functions/node_modules` eller `functions/src` til GitHub.

## Databaseregler
- `database.rules.json`: reglene til Jorda rundt øverst er malen. `node verktoy/lag-regler.mjs` lager
  en kopi for hver spillpakke som har egen plass i databasen (gjøres automatisk av publiser.bat).

## Ny spillpakke (f.eks. Norge rundt)
1. Lag `pakker/norge/` med de samme filene som de andre pakkene.
2. Gi den en egen `rot` i `pakke.js` (f.eks. `'norge'`).
3. Kjør publiser.bat – banken `norgebank` og databasereglene lages automatisk.
4. Lenke til spillet: `laerer.html?pakke=norge`.

## GitHub Pages
- Repo: espenps-code/jorda-rundt  →  espenps-code.github.io/jorda-rundt/
- espenps-code.github.io er lagt inn som godkjent domene i Firebase Auth
