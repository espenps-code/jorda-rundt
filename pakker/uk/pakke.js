// SPILLPAKKE: Across the UK (Storbritannia og Nord-Irland) – på ENGELSK, med britisk stavemåte.
// Alt motoren trenger å vite om dette spillet som ikke er data.
// (Ingen import her – fila brukes både i nettleseren og i skybanken.)
export const PAKKE = {
  id: 'uk',
  navn: 'Across the UK',
  ikon: '🇬🇧',
  rot: 'uk',               // alt ligger under /uk i databasen
  prefiks: 'uk',
  sprak: 'en',             // språk i motoren (js/sprak.js)
  lokale: 'en-GB',         // tall og datoer: 1,000 og «10 November»
  valuta: { symbol: '£', navn: 'pounds', skala: 0.1 },   // skala: 1 pund ≈ 10 kr (brukes på motorens faste kronebeløp)
  enheter: 'miles',        // britene måler også avstand i miles
  fasiliteter: { frokost: 'Breakfast included', buss: 'Airport shuttle', wifi: 'Free Wi-Fi' },
  modell: 'by',            // stedene hører til regioner (som i Europa rundt og Norge rundt)
  kart: { navn: 'the map', laster: 'Loading the map …', feil: 'The map could not load, but the rest of the game works.', roterer: false, tavle: 'DEPARTURES · UK' },
  startsted: 'a random starting place in the UK',
  sider: { forside: 'uk/index.html', reiselogg: 'uk/travel-log.html' },
  ord: {
    sted: 'place', stedet: 'the place', steder: 'places', stedene: 'the places',
    etSted: 'a place', nyttSted: 'a new place', detteStedet: 'this place', deresSted: 'your place',
    trygt: 'safe', laast: 'locked', den: 'it', hver: 'each', nye: 'new',
    region: 'region', regionen: 'the region', regioner: 'regions',
    sok: 'Search for a place, region or country …',
  },
  reisemater: ['fly', 'tog', 'buss', 'bat'],
  telt: true,              // wild camping i Skottland – med quiz om Scottish Outdoor Access Code
  diktat: false,
  // Britisk stavemåte: byttes i hele den engelske ordboka (js/sprak/en.js er skrevet med amerikansk stavemåte)
  staving: [['colors', 'colours'], ['color', 'colour'], ['Color', 'Colour'], ['traveled', 'travelled'], ['travelers', 'travellers'], ['neighbors', 'neighbours'],
    ['from downtown', 'from the city centre'], ['bookstore', 'bookshop'], ['sodas', 'fizzy drinks'], ['front desk', 'reception'], ['fall 2026', 'autumn 2026'], ['key chains', 'key rings'],
    ['bug spray', 'insect spray'], ['Geography quiz', 'UK quiz'], ['math', 'maths']],
  // Ord og setninger som er annerledes i dette spillet (norsk nøkkel → engelsk tekst)
  ordbok: {
    'hovedstad': 'main city', 'Landsamlingen': 'The collection',
    // long-distance buses are called coaches in the UK
    'Buss': 'Coach', 'Bussen': 'The coach', 'buss': 'coach', 'Buss · {0} spørsmål underveis': 'Coach · {0} questions on the way', 'tok bussen mot': 'took the coach to',
    'Båt': 'Ferry', 'båt': 'ferry', 'Båt · {0} spørsmål underveis': 'Ferry and coach · {0} questions on the way', 'tok båten mot': 'took the ferry to',
    'Det går ikke tog eller buss hit – bare fly.': 'There is no train or coach to this place – only flights.',
    'Hoteller': 'Hotels', 'Overnatting': 'Places to stay',
    // wild camping (the engine calls it telt and allemannsretten)
    'Sett opp telt': 'Set up camp', 'Sett opp teltet': 'Set up the tent', 'Telt ved {0}': 'Wild camping near {0}',
    'Her kan dere telte <b>gratis</b> med allemannsretten – hvis dere kan reglene!': 'In Scotland you can go wild camping for <b>free</b> – if you know the rules!',
    'Med <b>allemannsretten</b> kan alle telte gratis i naturen – hvis man følger reglene. Svar riktig på alle tre spørsmålene for å sette opp teltet.': 'In Scotland, everyone can camp for free in nature – if they follow the <b>Scottish Outdoor Access Code</b>. Answer all three questions correctly to set up your tent.',
    'Dere telter i naturen ved <b>{0}</b>. Det er gratis – takket være allemannsretten!': 'You are wild camping in nature near <b>{0}</b>. It is free – thanks to the right to roam in Scotland!',
    'Svar på spørsmålene om allemannsretten først.': 'Answer the questions about the Outdoor Access Code first.',
    'Dere hadde {0} av {1} riktige om allemannsretten. Les reglene og prøv igjen!': 'You had {0} of {1} correct about the Outdoor Access Code. Read the rules and try again!',
    'Teltet er slått opp! Husk allemannsretten: maks to netter på samme sted i lavlandet, og ta med all søpla.{0}': 'The tent is up! Remember the Outdoor Access Code: stay only two or three nights in one place, and take all your litter with you.{0}',
    'slår opp telt ved {0}': 'sets up camp near {0}',
    'Kanskje teltet er et godt valg?': 'Maybe wild camping is a good choice?',
  },
};
