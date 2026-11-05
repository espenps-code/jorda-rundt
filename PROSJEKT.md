# Jorda rundt – prosjektnotater

## Firebase
- Prosjekt: Jorda rundt (jorda-rundt-147c8), Spark (gratis)
- Realtime Database: europe-west1 (Belgia). Regler publisert 5. nov 2026 (database.rules.json)
- Innlogging: Anonym (elever, gruppenavn + PIN) og Google (lærer)
- Google Analytics og Gemini: AV
- Konsoll: https://console.firebase.google.com/project/jorda-rundt-147c8

## Byggeplan
1. Landdata + pris-/hotellmotor
2. Lærerside + Firebase-regler
3. Elevside (jordklode, reisebyrå, jobb, geografiquiz)
4. Storskjerm (klode + scoreboard)
5. Utfordringer, landquiz og duellbank
6. Utskrift: reiseloggmal

## Lærerstyrte innstillinger
Startbeløp, varighet, poeng per land/kontinent, låsetid, quiz-grense per dag.

## Filer
- laerer.html – lærerside (Google-innlogging, banken kjører her)
- js/fb.js – Firebase-kobling (legg ?emulator i adressen for lokal testing)
- js/bank.js – banken: behandler elevenes forespørsler + lærerhandlinger
- js/felles.js – spillregler, poeng, jobb- og quizgenerator
- data/land.js, data/motor.js – landdata og prismotor
- css/felles.css – felles utseende
- database.rules.json – sikkerhetsregler (kopi av det som er publisert)
- index.html – elevside (gruppekode + PIN, jordklode, reis, hotell, reiselogg, jobb, quiz, tavle)
- tavle.html – storskjerm (åpnes fra lærersiden; banken kjører også her)
- reiselogg.html – utskrift av reiseloggen (3 sider), ?land=FR&gruppe=Navn
- js/klode.js – 3D-jordkloden
- data/dueller.js – duellbank (36 Taskmaster-oppgaver)

## GitHub Pages
- Repo: espenps-code/jorda-rundt  →  espenps-code.github.io/jorda-rundt/
- espenps-code.github.io er lagt inn som godkjent domene i Firebase Auth

## Sikkerhetsmodell
Elever logger inn anonymt + gruppekode + PIN. De kan bare lese spillet og sende
forespørsler med status «venter». Lærerens nettleser (banken) regner ut alle priser
på nytt og gjennomfører/avviser. 31 regeltester bestått i emulator.
