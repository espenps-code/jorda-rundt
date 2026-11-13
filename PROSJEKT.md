
# Jorda rundt-motoren – prosjektnotater

Én felles motor driver flere spill («spillpakker»): **Jorda rundt** (verden), **Europa rundt** (europa), **Norge rundt** (norge)
– og to spill på ENGELSK for elever som lærer engelsk: **Across America** (usa) og **Across the UK** (uk).
En rettelse i motoren gjelder alle spillene med en gang.

## Firebase
- Prosjekt: Jorda rundt (jorda-rundt-147c8), Blaze (betal etter bruk, budsjettvarsel satt)
- Realtime Database: europe-west1 (Belgia)
- Hvert spill har sin egen plass i databasen: Jorda rundt øverst (som før), Europa rundt under /europa
- Innlogging: Anonym (elever, gruppekode + PIN) og Google/e-post (lærer)
- Konsoll: https://console.firebase.google.com/project/jorda-rundt-147c8

## Hvordan et spill velges
- Sidene (elev, lærer, tavle, rapport) er felles. Spillet velges med `?pakke=europa` (eller `norge`, `usa`) i adressen.
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
- `data/flyquiz.js` (spørsmål underveis), `data/dueller.js` (24 duelloppgaver) – felles for alle spill

**Spillpakkene** – `pakker/<spill>/`
- `pakke.js` – navn, ikon, plass i databasen, ord («land»/«by»), modell, kart-tekster, lenker
- `land.js` – stedene (+ felles grensesnitt: landKode, landInfo, byerILand)
- `regler.js` – standardinnstillinger, poeng (poengForGruppe), geografiquiz
- `motor.js` – reiser og priser (fly/tog/buss), hoteller, jobblønn, tilfeldig start
- `klode.js` – kartet (3D-klode), `rapportkart.js` – kartet i reisedagbøkene
- `parlor.js` – parlør-diktat (AV i alle spill: `diktat: false` i pakke.js. Koden ligger igjen – fjern linja for å slå den på igjen)

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

## Norge rundt (pakker/norge)
- 54 steder i 15 fylker (steder.js). Fylkene er «regionene»: landId = fylkesnummer (f.eks. 46 = Vestland).
- Poeng per sted + bonus for hele fylker. Geografiquiz om fylker, administrasjonssentre og landsdeler.
- Reiser: fly (flyplasser), tog (bare der jernbanen henger sammen – Narvik er utenfor), buss, båt (kyststeder).
- **Utvidet 8. november 2026** (kopi av originalene i `_backups/foer-norge-forbedringer-20261108`):
  - 72 steder (18 nye, flest i nord) + Svalbard (`21-longyearbyen`, region «Svalbard», bare fly fra Oslo/Tromsø – `oy`).
  - **Vårt sted:** 69 valgfrie steder (`valgfri` i steder.js) er stengt fra start og skjult på kart/lister. Læreren åpner hjemstedet under Steder → «Vårt sted» (bruker `innstillinger/stengte/<id> = false`, så banken trenger ingen ny logikk).
  - **Hurtigruta:** fast rute Bergen–Kirkenes (`HURTIGRUTA` i steder.js). Tilbys som `type: 'bat'` med `hurtigruta: true`.
  - **Samisk språkoppdrag:** diktaten er slått på igjen, men bare i Troms og Finnmark på nordsamisk (`harDiktat` i parlor.js). Motoren spør `PARLOR.harDiktat` hvis pakken har den. (Bevisst valg – de andre spillene har diktat av.)
  - **Quiz:** ny type «fakta» med 31 norgesspørsmål (NORGESFAKTA i regler.js). Svalbard og valgfrie steder er ikke med i quizen.
  - **Natur- og værhendelser** ved ankomst etter årstid og reisemåte (`reisehendelse` i regler.js, brukt i bank.js → landing).

- Telt med allemannsretten: gratis, men tre riktige svar om allemannsretten kreves (regler.js). Egne telt-overraskelser.
- Diktat: av (som i de andre spillene). Ordlista i parlor.js er nynorsk / nordsamisk i Troms og Finnmark.
- Kart: fylker.json er en forenklet utgave av Kartverkets fylkesgrenser (CC BY 4.0, via github.com/robhop/fylker-og-kommuner).
  Ytterkantene går med klokka (det krever globe.gl).

## Spillvelger
- `js/pakkeliste.js` lister spillene. Lærersiden har en meny øverst og spillvalg-kort når man lager nytt spill.

## Ny spillpakke
1. Lag `pakker/norge/` med de samme filene som de andre pakkene.
2. Gi den en egen `rot` i `pakke.js` (f.eks. `'norge'`).
3. Kjør publiser.bat – banken `norgebank` og databasereglene lages automatisk.
4. Lenke til spillet: `laerer.html?pakke=norge`.

## GitHub Pages
- Repo: espenps-code/jorda-rundt  →  espenps-code.github.io/jorda-rundt/
- espenps-code.github.io er lagt inn som godkjent domene i Firebase Auth

## Velkomst-slideshow (ved ankomst til nytt sted)
- `js/velkommen.js` – slideshowet (motor). Vises én gang per ankomst, før gruppa har overnatting:
  «Velkommen til …» → 2 «Visste dere at …»-sider med bilder → «Nå må dere finne et sted å overnatte!».
  Knappen «Finn overnatting» åpner hotellfanen. «🎬 Se velkomsten igjen» ligger på hotellfanen.
- Innhold per spill: `pakker/<spill>/velkommen.js` (f = fakta, b = «engelsk Wikipedia-tittel|bildetekst»).
  Rekkefølgen i b betyr noe: [velkomstbilde, bilde til fakta 1, bilde til fakta 2]. «-» = siden vises uten bilde.
  Faktaene er bevisst UTEN svar på reiseloggen (folketall, språk, valuta, høyeste fjell osv.).
- Bildene: `pakker/<spill>/velkommen-bilder.js` er GENERERT. Frie bilder fra Wikimedia Commons, med fotograf + lisens
  som vises nederst på hvert bilde. Endrer du bildetitler: kjør `node verktoy/hent-velkomstbilder.mjs` (eller `… norge`).
- Bildene lastes rett fra upload.wikimedia.org når slideshowet vises (ingen lagring i prosjektet).
- Pakker uten velkommen.js får en enkel velkomst uten fakta/bilder.

## Egne dueller (lærerens egne)
- Fanen «Dueller» på lærersiden: velg hva som trekkes (`innstillinger/duellUtvalg`: standard / begge / egne) og lag egne dueller.
- Egne dueller lagres på kontoen: `mineDueller/<uid>` – ØVERST i databasen (ikke under spillets rot), så de gjelder i alle spillvariantene.
  (lag-regler.mjs lager også en ubrukt kopi av regelen under /europa og /norge – det er ufarlig.)
- Eierens dueller kopieres automatisk inn i spillet som `spill/<id>/egneDueller`, så medlærere og tavla ser dem.
- Når en duell trekkes, kopieres hele oppgaven inn i duellen (`dueller/<id>/o`) + `okilde` ('s:<tittel>' eller 'e:<id>').
  Derfor kan standardlista endres og egne dueller slettes uten at pågående dueller påvirkes.
- Felles funksjoner i js/felles.js: duellPulje(), duellOppgave(), egneDuellerI(), renDuell().

## Språklaget – spillpakker på engelsk (10. november 2026)
Motoren er skrevet på norsk. En spillpakke med `sprak: 'en'` i pakke.js vises på engelsk. Norsk er standard, og for de norske
spillene gjør språklaget ingenting (teksten kommer ut akkurat som den står i koden).
- `js/sprak.js` – `T` og `oversettSide()`. `js/sprak-kjerne.js` – selve oppdelingen av tekst (ren kode, brukes også av sjekkeverktøyet).
- `js/sprak/en.js` – den engelske ordboka: norsk tekst → engelsk tekst. `{0}`, `{1}` … er verdier som settes inn.
- All tekst i motoren som skal kunne oversettes, står i `T`…`` eller `T('…')`:
  `T`Velkommen til ${by}!`` slår opp «Velkommen til {0}!». HTML-koder deler teksten i biter; `<b>`, `<i>` o.l. blir med i biten.
  Emoji, piler og mellomrom i kantene er ikke med i nøkkelen («🏨 Hotell» slås opp som «Hotell»).
- Den faste teksten i HTML-en (overskrifter, knapper, title/placeholder) oversettes automatisk når siden lastes
  (`fyllPakkeTekster()` i js/side.js kaller `oversettSide()`).
- Mangler en tekst i ordboka, vises den norske. **Sjekk:** `node verktoy/sprak-sjekk.mjs` (første gang: `npm install --prefix verktoy`).
  Den viser hva som mangler og hva som ikke lenger brukes. `verktoy/sprak-venter.json` er tekster vi med vilje ikke har oversatt
  ennå (veiviserne til de norske spillene, parlør-diktaten, Antarktis, «Vårt sted» …) – ingen engelsk pakke bruker dem.
- **Ny tekst i motoren?** Skriv den på norsk i `T`…`` og legg den engelske i js/sprak/en.js. Kjør sprak-sjekk.
- Samme norske ord, to betydninger? Lag en nøkkel MED emojien: «📺 Tavle» → «📺 Board» slås opp før «Tavle» → «Scores».
- Ord som bare gjelder ett spill (f.eks. «stat» i stedet for «land»): `ordbok: { … }` i spillpakkens pakke.js overstyrer en.js.
- Innhold som er for stort for ordboka, har egne engelske filer: `data/flyquiz-en.js` (spørsmålene underveis) og
  `data/dueller-en.js` (duellene). Elevenes veiviser kan pakken lage selv: `export function veiviser()` i regler.js.
- `js/pakke.js` har en liten liste `SPRAK = { usa: 'en', uk: 'en', australia: 'en' }` som skjuler siden et øyeblikk til teksten er oversatt
  (så norsk tekst ikke blinker forbi). Ny pakke på et annet språk må inn der. Sider som allerede er skrevet på språket
  (forside, reiselogg) har `data-oversatt` på `<html>`.
- Andre felt en pakke kan ha i pakke.js: `lokale: 'en-US'` (tall og datoer), `valuta: { symbol: '$', navn: 'dollars', skala: 0.1 }`
  (skala = hvor mye én pengeenhet er verdt mot kronebeløpene i motoren), `enheter: 'miles'`,
  `fasiliteter: { frokost, buss, wifi }` (pakkens navn på de tre hotellfordelene), `regionKort` (korte merker på tavla).
- Rettet i samme slengen: tre tekster på norsk viste «${ORD.sted}» som ren tekst (lærersiden «ledig …», «låst – gir ikke …»
  og rapporten «Ingen … ennå»). De bruker nå riktig ord.

## Across America (pakker/usa) – på engelsk
- 50 stater (land.js). Hver stat er ett sted (`modell: 'land'`, som Jorda rundt), og de 7 regionene fungerer som «kontinenter»:
  New England, Mid-Atlantic, Southeast, Midwest, Southwest, Rocky Mountains, Pacific. 5 poeng per stat + 10 per region.
- Gruppene reiser til en stor, kjent by i hver stat (`by`). Delstatshovedstaden (`capital`) og kallenavnet (`nickname`) brukes i quizen.
  `flagg` er et symbol for staten (🤠 Texas, 🗽 New York …), siden delstatsflagg ikke finnes som emoji.
- Alt er i dollar (startbeløp 5 000 per elev), avstander i miles, klokkeslett med AM/PM.
- Reiser: fly, tog (ikke til South Dakota og Wyoming) og buss. Til Alaska og Hawaii går det bare fly (`oy`). Selskapene er oppdiktede.
- Camping på offentlig land er gratis i stater med mye natur (`telt`), men krever tre riktige svar om «Leave No Trace»
  (tilsvarer telt og allemannsretten i Norge rundt). Egne telt- og reisehendelser (snøstorm, tornadovarsel, bison på veien …).
- USA-quiz: hovedsteder, regioner, kallenavn, byer og 34 USA-fakta (regler.js).
- Kart: `stater.json` er en forenklet utgave av delstatsgrensene fra US Census Bureau (fritt, via us-atlas). Nabolandene er grå.
  Rapportkartet tegner Alaska og Hawaii i egne ruter nede til venstre.
- Velkomst-slideshow: `velkommen.js` (to fakta per stat) + `velkommen-bilder.js` (generert: `node verktoy/hent-velkomstbilder.mjs usa`).
- Egne sider: `usa/index.html` (forside og lærerveiledning) og `usa/travel-log.html` (reiseloggen, to sider per stat + collage).
- Database: /usa. Skybank: `usabank` (lages automatisk av publiser.bat). Lenke: `laerer.html?pakke=usa`.
- Flere engelske spill senere (Storbritannia, Australia, «Around the World»): lag en ny pakke med `sprak: 'en'` – motoren er klar.

## Teste uten å publisere
- `functions/test-bank.mjs` tester banken for alle spillene (`node functions/test-bank.mjs usa` = bare ett spill).
- `functions/bankrunner.mjs` kjører bankene mot database-emulatoren uten Functions-emulatoren (samme bank-kode som i skyen).
  Start database- og auth-emulatoren, kjør `node functions/kopier.mjs`, så bankrunner, og åpne sidene med `&emulator` i adressen.

## Across the UK (pakker/uk) – på engelsk, med britisk stavemåte (10. november 2026)
- 40 steder i 12 regioner (steder.js): de 9 regionene i England + Scotland, Wales og Northern Ireland. `modell: 'by'`
  (som Europa rundt og Norge rundt): 3 poeng per sted + bonus for å eie alle stedene i en region.
- Alt er i pund (startbeløp 2 000 per elev), avstander i miles. `flagg` er et symbol for stedet (🎡 London, 🐉 Cardiff …).
- Reiser: fly (mellom steder med flyplass), tog (raskt, men dyrt), «coach» (buss – billig og tregt) og ferje.
  Nord-Irland ligger over Irskesjøen: dit går det bare fly eller ferje (ferjeprisen inkluderer buss til og fra).
- Wild camping er gratis ved Inverness og Fort William (`telt`), men krever tre riktige svar om «Scottish Outdoor Access Code»
  (Skottlands allemannsrett). Egne telt- og reisehendelser (regn, «leaves on the line», høylandsku på veien …).
- UK-quiz: de fire landene, regionene og 34 fakta om Storbritannia (regler.js).
- Britisk stavemåte: `staving` i pakke.js bytter ord i hele den engelske ordboka (color → colour, traveled → travelled …),
  og `ordbok` gir britiske ord (buss = coach). js/sprak/en.js er skrevet med amerikansk stavemåte.
  Spørsmålene underveis (data/flyquiz-en.js) og duellene er felles for de engelske spillene.
- Kart: `regioner.json` er en forenklet utgave av ITL1-regionene fra Office for National Statistics (Open Government Licence v3.0,
  «Contains OS data © Crown copyright») – krediteres nederst på kartet. NB: like nabopunkter i en kartfil får 3D-kartet til å
  krasje – fjern dem når en ny kartfil lages (gjort for regioner.json og stater.json).
- Egne sider: `uk/index.html` og `uk/travel-log.html` (regionside + stedsside + collage, som i Norge rundt).
- Database: /uk. Skybank: `ukbank`. Lenke: `laerer.html?pakke=uk`.
- Forsiden (index.html) har et eget felt «Reis på engelsk» med kortene til de engelske spillene.

## Across Australia (pakker/australia) – på engelsk (10. november 2026)
- 44 steder i 8 regioner (steder.js): de 6 delstatene + Northern Territory og Australian Capital Territory. `modell: 'by'`:
  3 poeng per sted + bonus for å eie alle stedene i en delstat. I spillet heter regionene «states».
- Alt er i australske dollar (startbeløp 3 000 per elev – reisene er lange og dyre), avstander i kilometer.
- Reiser: fly (knutepunkt i Sydney, Melbourne, Brisbane, Adelaide og Perth), tog (bare mellom steder med `tog` – få, lange linjer),
  «coach» (buss – billig, men kan ta to døgn; aldri mer enn 10 spørsmål) og ferje. Tasmania er en øy: dit går det bare fly eller
  ferje over Bass Strait (ferjeprisen inkluderer buss til og fra).
- Bush camping er gratis på steder med `telt` (outback og nasjonalparker), men krever tre riktige svar om reglene i bushen
  (vann, brannforbud, krokodilleskilt, ikke mate dyr …). Egne telt- og reisehendelser (kenguru på veien, road train, hetebølge …).
- Årstidene er snudd: sommer i desember–februar (ARSTID i regler.js).
- Australia-quiz: delstater, hovedsteder og 34 fakta om Australia (regler.js).
- Stavemåte som i Storbritannia (`staving` i pakke.js), og `ordbok` gir «coach», «ferry» og bush camping-tekstene.
- Kart: `stater.json` er en forenklet utgave av delstatsgrensene fra Australian Bureau of Statistics (ASGS Edition 3, CC BY 4.0) –
  krediteres nederst på kartet. Like nabopunkter er fjernet (se NB over).
- Egne sider: `australia/index.html` og `australia/travel-log.html`.
- Database: /australia. Skybank: `australiabank`. Lenke: `laerer.html?pakke=australia`.

## Solsystemet rundt (pakker/solsystem) – påbegynt 13. november 2026
Rammefortelling: år 2247, gruppene er mannskap fra Romakademiet. Sci-fi-innpakning, men ekte fakta om forholdene på stedene.
- 37 steder i 8 systemer (steder.js): Jorda-systemet, de indre planetene, asteroidene, Jupiter-, Saturn-, Uranus- og Neptun-systemet,
  Kuiperbeltet og kometene. `modell: 'by'`: 3 poeng per sted + bonus for å eie alle stedene i et system.
- `bane: true` = ingen kan lande der (Sola, Jupiter, Saturn, Uranus, Neptun). Stedet erobres som alle andre, men overnattingen er en banestasjon.
- Tilfeldig start bare blant steder med `start: true` (romstasjonen, Månen, Mars). Er alle opptatt, deler noen startsted.
- Reiser: alt er `type: 'fly'` (romskip). Direkte = 2 spørsmål, 1 stopp = 4, 2 stopp = 6. Stoppestedene er `knute`-steder som ligger i ruta.
  Avstand = korteste avstand (forskjellen i avstand fra Sola), vist i ekte km. Pris og reisetid vokser med logaritmen av avstanden.
- Kart: `klode.js` velger kart. Vanligvis 3D-modellen `klode3d.js` (three.js): dra for å snu, knip for å zoome, trykk på et system
  for å fly dit, og trykk så på stedene. Planetene snurrer, men står stille i banen. Kan ikke 3D starte, brukes det flate kartet
  `klode2d.js` (SVG) i stedet. `?flatt` i adressen tvinger fram det flate kartet.
  `kart.js` har plasseringen (ikke i målestokk) og brukes av begge kartene, `rapportkart.js` og forsiden.
- 3D-filene ligger i `solsystem/3d/` (ikke i pakken, så de ikke blir med opp i skybanken): three.js 0.160 (MIT) og planetbilder
  i `tekstur/` fra Solar System Scope (CC BY 4.0, via Wikimedia Commons) – krediteres nederst på kartet. Ceres, Eris og Makemake
  har bevisst ikke bilde (de som finnes, er oppdiktede). Ikke testet på en ekte iPad ennå.
- Velkomst: `velkommen.js` har to fakta per sted om hvor ekstremt det er der. Bilder mangler ennå (`velkommen-bilder.js` er tom) –
  verktoy/hent-velkomstbilder.mjs hopper over NASA-/satellittbilder og må tilpasses for denne pakken.
- Romquiz (42 fakta + bane/type/lengst-spørsmål), egen veiviser med rammefortellingen og romhendelser på reisen (regler.js).
- Egne sider: `solsystem/index.html` (forside og lærerveiledning) og `solsystem/loggbok.html` (rollesider: navigatør, forsker, reporter,
  kaptein + systemside + collage).
- Database: /solsystem. Skybank: `solsystembank` (lages av publiser.bat). Lenke: `laerer.html?pakke=solsystem`.
- **Utstyr (14. november-runden, kode 13. november 2026):** `UTSTYR` i steder.js (navn, ikon, pris, hvorfor). Hvert sted har `krav`.
  Landingsmodulen er `standard` (følger med alle skip). De fem andre kjøpes under Reis og beholdes: fallskjerm 6 000, kuldeutstyr 10 000,
  varmeskjold 12 000, strålingsskjold 14 000, kraftigere motor 18 000 kr. regler.js eksporterer `UTSTYR` (det som kan kjøpes) og
  `utstyrMangler(gruppe, stedId)`.
- **Romord:** `ordbok` i pakke.js bytter motorens ord (norsk → norsk): hotell → overnatting, fly → romskip, turbulens → solstorm,
  reiselogg → loggbok, jobbene, hotell-overraskelsene og telt-tekstene.
- **Romikoner:** `ikoner` i pakke.js bytter ikonfil for emojier motoren skriver (✈ 🛫 🛬 ⛺ 🚌 → rakett, 🏨 → seng, 🌪 → sol).
  js/ikoner.js leser dette for alle spillpakker; pakker uten `ikoner` er uendret.
- **Sove i romskipet:** motorens telt-mekanikk (`telt: true`): gratis, 1 stjerne, tre riktige svar om livet om bord (regler.js).
- Pakken står i `js/pakkeliste.js` og har eget felt «Reis ut i rommet» på forsiden (index.html, under de engelske spillene).
- **Velkomstbilder:** 100 frie bilder (NASA, ESA m.fl.) via `node verktoy/hent-velkomstbilder.mjs solsystem`. velkommen.js har
  `BILDEVALG = { rombilder: true }`, som lar verktøyet bruke bilder fra romsonder (i de andre spillene hoppes satellittbilder over).
  Bildetekstene sier «(modell)» eller «(tegning)» der bildet ikke er et ekte foto. NB: hovedbildet i en Wikipedia-artikkel kan være
  noe annet enn tittelen tilsier (f.eks. «Moons of Mars» ga et bilde av Phobos) – se over lista når du kjører verktøyet på nytt.
- **Fotostudio:** `solsystem/fotostudio/` er en kopi av fotostudioet i Mykje Ting med bare romtemaet og plakatene
  (rammene Stjerner, Romskip, Oppdrag og Planeter; bakgrunnene På månen, På Mars og Stjernetåke) og mørkt romdesign
  (blokka «ROMTEMA» nederst i stilene – resten av fila er som i Mykje Ting). KI-utklippet hentes fra nettet
  som i Jorda rundt-fotostudioet, og siden lagres ikke for bruk uten nett. Elevsiden lenker dit via `sider.fotostudio` i pakke.js.
  Endres fotostudioet i Mykje Ting, må kopien oppdateres for hånd.
- **IKKE PUBLISERT ENNÅ:** kjør publiser.bat (lager `solsystembank` og databasereglene for /solsystem) FØR endringene pushes til GitHub –
  ellers ser lærere et spill der banken ikke svarer. Ikke testet på ekte iPad.

## Endringer i motoren for Solsystemet rundt (13. november 2026) – kopi av originalene i `_backups/foer-solsystem-motor-20261113`
- `js/sprak.js`: også NORSKE spillpakker kan ha `ordbok` i pakke.js (norsk → norsk). Uten ordbok skjer ingenting (som før).
- `js/felles.js`: `UTSTYR` og `utstyrMangler` hentes fra spillpakkens regler.js hvis de finnes (ellers null / tom liste).
- `js/bank.js`: ny forespørsel `utstyr` ({ id }) – trekker prisen og setter `grupper/<gid>/utstyr/<id> = true`, logg-type `utstyr`.
  Reiser avvises hvis `utstyrMangler` gir noe. Spill uten utstyr merker ingenting.
- `elev.html`: utstyrsboks øverst under Reis, «mangler»-merke i stedslista, kjøp av manglende utstyr på reisemålet, egen linje i regnskapet.
- `laerer.html`: nullstilling fjerner også utstyret. `rapport.html`: utstyr er med i utgiftene.
- De nye utstyrstekstene finnes bare på norsk (ingen engelsk pakke har utstyr). Kjører du `node verktoy/sprak-sjekk.mjs`,
  listes de som manglende – legg dem i `verktoy/sprak-venter.json`.
- Testet med en liksom-database: hele løpet (utstyr, reise, framkomst, romskip/telt, jobb, quiz, loggbok) for solsystem,
  og at Norge rundt, Jorda rundt og Across the UK gir samme tekster og resultater som før.
