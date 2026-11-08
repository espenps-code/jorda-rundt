// SPILLPAKKE: Norge rundt. Alt motoren trenger å vite om dette spillet som ikke er data.
// (Ingen import her – fila brukes både i nettleseren og i skybanken.)
export const PAKKE = {
  id: 'norge',
  navn: 'Norge rundt',
  ikon: '🇳🇴',
  rot: 'norge',            // alt ligger under /norge i databasen, så det aldri blandes med de andre spillene
  prefiks: 'no',
  modell: 'by',            // stedene hører til fylker (regioner)
  kart: { navn: 'Norgeskartet', laster: 'Laster Norgeskartet …', feil: 'Kartet kunne ikke lastes, men resten av spillet virker.', roterer: false, tavle: 'AVGANGER · NORGE' },
  startsted: 'et tilfeldig startsted i Norge',
  sider: { forside: 'norge/index.html', reiselogg: 'norge/reiselogg.html' },
  ord: {
    sted: 'sted', stedet: 'stedet', steder: 'steder', stedene: 'stedene',
    etSted: 'et sted', nyttSted: 'et nytt sted', detteStedet: 'dette stedet', deresSted: 'deres sted',
    trygt: 'trygt', laast: 'låst', den: 'det', hver: 'hvert', nye: 'nytt',
    region: 'fylke', regionen: 'fylket', regioner: 'fylker',
    sok: 'Søk på sted, fylke eller landsdel …',
  },
  reisemater: ['fly', 'tog', 'buss', 'bat'],
  telt: true,
  diktat: true,            // samisk språkoppdrag – bare i Troms og Finnmark (se parlor.js → harDiktat)
  diktatNavn: 'Samisk språkoppdrag',
};
