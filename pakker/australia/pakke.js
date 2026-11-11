// SPILLPAKKE: Across Australia – på ENGELSK (australsk/britisk stavemåte).
// Alt motoren trenger å vite om dette spillet som ikke er data.
// (Ingen import her – fila brukes både i nettleseren og i skybanken.)
export const PAKKE = {
  id: 'australia',
  navn: 'Across Australia',
  ikon: '🇦🇺',
  rot: 'australia',        // alt ligger under /australia i databasen
  prefiks: 'au',
  sprak: 'en',             // språk i motoren (js/sprak.js)
  lokale: 'en-AU',         // tall og datoer: 1,000 og «10 November»
  valuta: { symbol: '$', navn: 'dollars', skala: 0.1 },   // australske dollar. skala: 1 dollar ≈ 10 kr i motorens faste beløp
  // enheter: kilometer (Australia bruker meter og kilometer, som Norge)
  fasiliteter: { frokost: 'Breakfast included', buss: 'Airport shuttle', wifi: 'Free Wi-Fi' },
  modell: 'by',            // stedene hører til delstater og territorier (regionene)
  kart: { navn: 'the map', laster: 'Loading the map …', feil: 'The map could not load, but the rest of the game works.', roterer: false, tavle: 'DEPARTURES · AUSTRALIA' },
  startsted: 'a random starting place in Australia',
  sider: { forside: 'australia/index.html', reiselogg: 'australia/travel-log.html' },
  ord: {
    sted: 'place', stedet: 'the place', steder: 'places', stedene: 'the places',
    etSted: 'a place', nyttSted: 'a new place', detteStedet: 'this place', deresSted: 'your place',
    trygt: 'safe', laast: 'locked', den: 'it', hver: 'each', nye: 'new',
    region: 'state', regionen: 'the state', regioner: 'states',
    sok: 'Search for a place or a state …',
  },
  reisemater: ['fly', 'tog', 'buss', 'bat'],
  telt: true,              // bush camping i outbacken og nasjonalparkene – med quiz om reglene i bushen
  diktat: false,
  // Australsk stavemåte er som britisk: byttes i hele den engelske ordboka (js/sprak/en.js er skrevet med amerikansk stavemåte)
  staving: [['colors', 'colours'], ['color', 'colour'], ['Color', 'Colour'], ['traveled', 'travelled'], ['travelers', 'travellers'], ['neighbors', 'neighbours'],
    ['from downtown', 'from the city centre'], ['bookstore', 'bookshop'], ['sodas', 'soft drinks'], ['front desk', 'reception'], ['fall 2026', 'term 4, 2026'], ['key chains', 'key rings'],
    ['bug spray', 'insect spray'], ['Geography quiz', 'Australia quiz'], ['math', 'maths']],
  // Ord og setninger som er annerledes i dette spillet (norsk nøkkel → engelsk tekst)
  ordbok: {
    'hovedstad': 'capital city', 'Landsamlingen': 'The collection',
    'Buss': 'Coach', 'Bussen': 'The coach', 'buss': 'coach', 'Buss · {0} spørsmål underveis': 'Coach · {0} questions on the way', 'tok bussen mot': 'took the coach to',
    'Båt': 'Ferry', 'båt': 'ferry', 'Båt · {0} spørsmål underveis': 'Ferry and coach · {0} questions on the way', 'tok båten mot': 'took the ferry to',
    'Det går ikke tog eller buss hit – bare fly.': 'There is no train or coach to this place – only flights.',
    'Hoteller': 'Hotels', 'Overnatting': 'Places to stay',
    // bush camping (the engine calls it telt and allemannsretten)
    'Sett opp telt': 'Set up camp', 'Sett opp teltet': 'Set up the tent', 'Telt ved {0}': 'Bush camping near {0}',
    'Her kan dere telte <b>gratis</b> med allemannsretten – hvis dere kan reglene!': 'Here you can go bush camping for <b>free</b> – if you know the rules of the bush!',
    'Med <b>allemannsretten</b> kan alle telte gratis i naturen – hvis man følger reglene. Svar riktig på alle tre spørsmålene for å sette opp teltet.': 'In the outback and the national parks there are free bush camps. But the bush can be <b>dangerous</b>, so you must know the rules. Answer all three questions correctly to set up your tent.',
    'Dere telter i naturen ved <b>{0}</b>. Det er gratis – takket være allemannsretten!': 'You are bush camping near <b>{0}</b>. It is free – and the stars are amazing!',
    'Svar på spørsmålene om allemannsretten først.': 'Answer the questions about bush camping first.',
    'Dere hadde {0} av {1} riktige om allemannsretten. Les reglene og prøv igjen!': 'You had {0} of {1} correct about bush camping. Read the rules and try again!',
    'Teltet er slått opp! Husk allemannsretten: maks to netter på samme sted i lavlandet, og ta med all søpla.{0}': 'The tent is up! Remember the rules of the bush: carry plenty of water, never feed the animals, and take all your rubbish with you.{0}',
    'slår opp telt ved {0}': 'sets up camp near {0}',
    'Kanskje teltet er et godt valg?': 'Maybe bush camping is a good choice?',
  },
};
