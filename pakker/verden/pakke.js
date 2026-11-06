// SPILLPAKKE: Jorda rundt. Alt motoren trenger å vite om dette spillet som ikke er data.
// (Ingen import her – fila brukes både i nettleseren og i skybanken.)
export const PAKKE = {
  id: 'verden',
  navn: 'Jorda rundt',
  ikon: '🌍',
  rot: '',                 // hvor spillet ligger i databasen ('' = øverst, slik det alltid har vært)
  prefiks: 'jr',           // forstavelse på ting som lagres i nettleseren (innlogging, valgt spill …)
  modell: 'land',          // hvert sted er et land (ingen regioner med flere steder)
  kart: { navn: 'jordkloden', laster: 'Laster jordkloden …', feil: 'Jordkloden kunne ikke lastes, men resten av spillet virker.', roterer: true, tavle: 'AVGANGER · VERDEN' },
  startsted: 'en tilfeldig startposisjon i verden',
  sider: { forside: 'index.html', reiselogg: 'reiselogg.html' },
  // Ord som skiller spillene. Stor forbokstav lages med stor().
  ord: {
    sted: 'land', stedet: 'landet', steder: 'land', stedene: 'landene',
    etSted: 'et land', nyttSted: 'et nytt land', detteStedet: 'dette landet', deresSted: 'deres land',
    trygt: 'trygt', laast: 'låst', den: 'det', hver: 'hvert', nye: 'nytt',
    region: 'land', regionen: 'landet', regioner: 'land',
    sok: 'Søk på land, by eller kontinent …',
  },
  reisemater: ['fly'],
};
