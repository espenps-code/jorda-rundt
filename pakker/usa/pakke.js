// SPILLPAKKE: Across America (USA) – på ENGELSK, for elever som lærer engelsk.
// Alt motoren trenger å vite om dette spillet som ikke er data.
// (Ingen import her – fila brukes både i nettleseren og i skybanken.)
// Motoren er skrevet på norsk; «sprak: 'en'» gjør at all tekst oversettes med ordboka js/sprak/en.js.
export const PAKKE = {
  id: 'usa',
  navn: 'Across America',
  ikon: '🇺🇸',
  rot: 'usa',              // alt ligger under /usa i databasen, så det aldri blandes med de andre spillene
  prefiks: 'us',
  sprak: 'en',             // språk i motoren (js/sprak.js)
  lokale: 'en-US',         // tall og datoer: 1,000 og «November 10»
  valuta: { symbol: '$', navn: 'dollars', skala: 0.1 },   // skala: 1 dollar ≈ 10 kr (brukes på motorens faste kronebeløp)
  enheter: 'miles',        // avstander vises i miles
  fasiliteter: { frokost: 'Free breakfast', buss: 'Airport shuttle', wifi: 'Free Wi-Fi' },  // navnene motor.js bruker på hotellfordelene
  modell: 'land',          // hvert sted er en stat (regionene fungerer som «kontinenter»)
  kart: { navn: 'the map', laster: 'Loading the map …', feil: 'The map could not load, but the rest of the game works.', roterer: false, tavle: 'DEPARTURES · USA' },
  startsted: 'a random starting state in the USA',
  sider: { forside: 'usa/index.html', reiselogg: 'usa/travel-log.html' },
  ord: {
    sted: 'state', stedet: 'the state', steder: 'states', stedene: 'the states',
    etSted: 'a state', nyttSted: 'a new state', detteStedet: 'this state', deresSted: 'your state',
    trygt: 'safe', laast: 'locked', den: 'it', hver: 'each', nye: 'new',
    region: 'state', regionen: 'the state', regioner: 'states',
    sok: 'Search for a state, city or region …',
  },
  reisemater: ['fly', 'tog', 'buss'],
  regionKort: { 'New England': 'NE', 'Mid-Atlantic': 'MA', Southeast: 'SE', Midwest: 'MW', Southwest: 'SW', 'Rocky Mountains': 'RM', Pacific: 'PA' },   // korte merker på tavla
  telt: true,              // camping på offentlig land – med quiz om «Leave No Trace»
  diktat: false,
  // Ord og setninger som er annerledes i dette spillet enn i den vanlige engelske ordboka (norsk nøkkel → engelsk tekst)
  ordbok: {
    'Land': 'States', 'Kontinenter': 'Regions', 'Kontinent': 'Region', 'kontinent': 'region', 'kontinenter': 'regions',
    '{0} land': '{0} states',
    'Søk etter land …': 'Search for a state …',
    'Poeng per land': 'Points per state', 'Poeng per kontinent': 'Points per region',
    'Ingen land ennå – fullfør en reiselogg!': 'No states yet – finish a travel log!',
    'Våre land ({0})': 'Our states ({0})',
    'Dere får {0} poeng per land og {1} poeng per kontinent dere har et land på.': 'You get {0} points per state and {1} points per region where you have a state.',
    'Landsamlingen': 'The state collection',
    'hovedstad': 'state capital',
    'Hoteller': 'Hotels', 'Overnatting': 'Places to stay',
    // camping (motoren kaller det telt og allemannsretten)
    'Sett opp telt': 'Set up camp', 'Sett opp teltet': 'Set up the tent', 'Telt ved {0}': 'Camping near {0}',
    'Her kan dere telte <b>gratis</b> med allemannsretten – hvis dere kan reglene!': 'You can camp here for <b>free</b> on public land – if you know the Leave No Trace rules!',
    'Med <b>allemannsretten</b> kan alle telte gratis i naturen – hvis man følger reglene. Svar riktig på alle tre spørsmålene for å sette opp teltet.': 'On <b>public land</b>, everyone can camp for free in nature – if they follow the <b>Leave No Trace</b> rules. Answer all three questions correctly to set up your tent.',
    'Dere telter i naturen ved <b>{0}</b>. Det er gratis – takket være allemannsretten!': 'You are camping in nature near <b>{0}</b>. It is free – because it is public land!',
    'Svar på spørsmålene om allemannsretten først.': 'Answer the Leave No Trace questions first.',
    'Dere hadde {0} av {1} riktige om allemannsretten. Les reglene og prøv igjen!': 'You had {0} of {1} correct about Leave No Trace. Read the rules and try again!',
    'Teltet er slått opp! Husk allemannsretten: maks to netter på samme sted i lavlandet, og ta med all søpla.{0}': 'The tent is up! Remember Leave No Trace: take all your trash with you and leave nature the way you found it.{0}',
    'slår opp telt ved {0}': 'sets up camp near {0}',
    'Kanskje teltet er et godt valg?': 'Maybe camping is a good choice?',
  },
};
