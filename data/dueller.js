// Jorda rundt – duellbank i Taskmaster-stil.
// Hver gruppe sender én deltaker (eller det som står i oppgaven). Læreren er dommer.
// tid = sekunder på nedtellingen (0 = ingen nedtelling). utstyr = det som trengs.
export const DUELLER = [
  { tittel: 'Papirkula', tekst: 'Kast en papirkule så nær veggen som mulig – uten å treffe den. Ett kast hver.', vinner: 'Nærmest veggen vinner. Treffer du veggen, er du ute.', tid: 0, utstyr: 'Ett ark per deltaker' },
  { tittel: 'Bokstavjakt', tekst: 'Skriv flest mulig ord som begynner på samme bokstav som landet dere kjemper om.', vinner: 'Flest godkjente ord vinner.', tid: 60, utstyr: 'Ark og blyant' },
  { tittel: 'Tårnet', tekst: 'Bygg det høyeste frittstående tårnet av ting dere finner i pennalet.', vinner: 'Høyeste tårn som står i 5 sekunder vinner.', tid: 90, utstyr: 'Pennal' },
  { tittel: 'Blindtegning', tekst: 'Tegn omrisset av landet dere kjemper om – med lukkede øyne.', vinner: 'Klassen stemmer på den som ligner mest.', tid: 45, utstyr: 'Ark og tusj' },
  { tittel: 'Ett minutt', tekst: 'Stå med lukkede øyne og sett deg ned når du tror det har gått nøyaktig ett minutt.', vinner: 'Nærmest 60 sekunder vinner.', tid: 0, utstyr: 'Stoppeklokke' },
  { tittel: 'Hovedstedene', tekst: 'Annenhver gang: si en hovedstad i verden. Den som nøler i mer enn 5 sekunder eller gjentar en, taper.', vinner: 'Siste som står igjen.', tid: 0, utstyr: 'Ingenting' },
  { tittel: 'Lengste papirstrimmel', tekst: 'Riv den lengste sammenhengende strimmelen av ett A4-ark.', vinner: 'Lengste hele strimmel vinner.', tid: 60, utstyr: 'Ett A4-ark hver' },
  { tittel: 'Gjett vekta', tekst: 'Læreren holder opp en ting. Skriv ned hvor mye dere tror den veier i gram.', vinner: 'Nærmest riktig vekt (vei den på kjøkkenvekt).', tid: 30, utstyr: 'En ting + vekt' },
  { tittel: 'Papirflyet', tekst: 'Brett et papirfly og fly det fra streken.', vinner: 'Lengste flytur vinner.', tid: 90, utstyr: 'Ett A4-ark hver' },
  { tittel: 'Ordkjeden', tekst: 'Si et ord som begynner på siste bokstav i forrige ord. Bare stedsnavn er lov!', vinner: 'Den som ikke finner noe innen 5 sekunder, taper.', tid: 0, utstyr: 'Ingenting' },
  { tittel: 'Blyantbalanse', tekst: 'Balanser en blyant på én finger.', vinner: 'Lengst tid vinner.', tid: 0, utstyr: 'Blyant' },
  { tittel: 'Avstandsgjetting', tekst: 'Gjett hvor mange kilometer det er fra Oslo til hovedstaden i landet dere kjemper om.', vinner: 'Nærmest riktig svar (læreren sjekker i spillet).', tid: 20, utstyr: 'Ark' },
  { tittel: 'Stabelen', tekst: 'Stable flest mulig bøker oppå hodet og gå fem skritt.', vinner: 'Flest bøker uten å miste noen.', tid: 0, utstyr: 'Bøker' },
  { tittel: 'Strikk-kastet', tekst: 'Skyt en strikk så den lander så nær en blyant på gulvet som mulig.', vinner: 'Nærmest vinner. To forsøk hver.', tid: 0, utstyr: 'Strikk og blyant' },
  { tittel: 'Koppkastet', tekst: 'Slipp et viskelær fra skulderhøyde ned i en kopp på gulvet.', vinner: 'Flest treff av fem forsøk.', tid: 0, utstyr: 'Kopp og viskelær' },
  { tittel: 'Kompasset', tekst: 'Pek mot nord – med lukkede øyne – etter at læreren har snurret deg rundt tre ganger.', vinner: 'Nærmest nord (sjekk med mobilkompass).', tid: 0, utstyr: 'Kompass' },
  { tittel: 'Spisepinnene', tekst: 'Flytt 10 binders fra pulten og ned i en kopp – med to blyanter som spisepinner.', vinner: 'Raskest ferdig vinner.', tid: 0, utstyr: 'To blyanter, 10 binders og en kopp per deltaker' },
  { tittel: 'Flaskeflippen', tekst: 'Kast en halvfull vannflaske så den lander stående. Fem forsøk hver.', vinner: 'Flest landinger vinner. Likt: omkamp.', tid: 0, utstyr: 'Halvfull vannflaske' },
  { tittel: 'Lengdehoppet', tekst: 'Hopp fra streken uten tilløp. Det måles fra streken til hælen som er nærmest.', vinner: 'Lengst hopp vinner.', tid: 0, utstyr: 'Teip og meterstokk' },
  { tittel: 'Planken', tekst: 'Hold planken (rett kropp på underarmer og tær) så lenge du klarer.', vinner: 'Den som holder lengst vinner.', tid: 0, utstyr: 'Stoppeklokke' },
  { tittel: 'Alfabetet baklengs', tekst: 'Skriv alfabetet baklengs – fra Å til A.', vinner: 'Raskest vinner. Hver feil gir 5 strafsekunder.', tid: 0, utstyr: 'Ark, blyant og stoppeklokke' },
  { tittel: 'Gangestafetten', tekst: 'Skriv 7-gangen fra 7 til 70.', vinner: 'Raskest uten feil vinner. Hver feil gir 5 strafsekunder.', tid: 0, utstyr: 'Ark, blyant og stoppeklokke' },
  { tittel: 'Terningduellen', tekst: 'Kast to terninger tre ganger og legg sammen alle øynene.', vinner: 'Høyest sum vinner. Likt: ett nytt kast hver.', tid: 0, utstyr: 'To terninger' },
  { tittel: 'Reaksjonstesten', tekst: 'Læreren holder en linjal loddrett mellom tommel og pekefinger og slipper den uten forvarsel. Knip den så fort du kan. Tre forsøk hver.', vinner: 'Lavest tall der du knep (best av tre) vinner.', tid: 0, utstyr: 'Linjal (30 cm)' },
];
