// SPILLPAKKE: Europa rundt. Alt motoren trenger å vite om dette spillet som ikke er data.
// (Ingen import her – fila brukes både i nettleseren og i skybanken.)
export const PAKKE = {
  id: 'europa',
  navn: 'Europa rundt',
  ikon: '🇪🇺',
  rot: 'europa',           // alt ligger under /europa i databasen, så det aldri blandes med Jorda rundt
  prefiks: 'eu',
  modell: 'by',            // stedene er byer, og byene hører til land (regioner)
  kart: { navn: 'Europakartet', laster: 'Laster Europakartet …', feil: 'Kartet kunne ikke lastes, men resten av spillet virker.', roterer: false, tavle: 'AVGANGER · EUROPA' },
  startsted: 'en tilfeldig startby i Europa',
  sider: { forside: 'europa/index.html', reiselogg: 'europa/reiselogg.html' },
  ord: {
    sted: 'by', stedet: 'byen', steder: 'byer', stedene: 'byene',
    etSted: 'en by', nyttSted: 'en ny by', detteStedet: 'denne byen', deresSted: 'deres by',
    trygt: 'trygg', laast: 'låst', den: 'den', hver: 'hver', nye: 'ny',
    region: 'land', regionen: 'landet', regioner: 'land',
    sok: 'Søk på by eller land …',
  },
  reisemater: ['fly', 'tog', 'buss'],
};
