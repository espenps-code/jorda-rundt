// Solsystemet rundt – STEDER og SYSTEMER (data).
// De 8 systemene er «regionene» i motoren (som fylkene i Norge rundt). sone = hvilken del av solsystemet systemet ligger i.
//
// Feltene på hvert sted:
//   type   = stasjon · måne · planet · stjerne · dvergplanet · asteroide · komet
//   au     = avstand fra Sola i astronomiske enheter (1 AU = avstanden Jorda–Sola, ca. 149,6 millioner km). Måner har planetens avstand.
//   krets  = hvilken «klynge» på kartet stedet tegnes i (se kart.js). Steder i samme krets går rundt samme planet.
//   kropp  = himmellegemet stedet ligger PÅ (bare der flere steder ligger på samme kropp: Månen og Mars)
//   lok    = avstand fra planeten i kretsen, i km (0 = på eller i bane tett rundt planeten)
//   kart   = [avstand, vinkel] fra midten av kretsen på kartet (+ eventuelt [.., .., dx, dy] for finjustering)
//   tekst  = hvor navnet står på kartet: u = under (vanlig) · o = over · v = til venstre · h = til høyre
//   pris   = prisnivå (alt blir dyrere jo lenger fra Jorda dere kommer)
//   hs     = hovedstedet i systemet · knute = stoppested for billige reiser («gravitasjonsslynge»)
//   bane   = her kan ingen lande (gasskjemper og Sola) – gruppa går i bane og bor på en banestasjon
//   start  = gruppene kan trekke dette som startsted (krever ikke spesialutstyr)
//   krav   = utstyret romskipet trenger for å komme hit (se UTSTYR nederst – landingsmodulen følger med alle skip):
//            lander = landingsmodul · varme = varmeskjold · straling = strålingsskjold · motor = kraftigere motor
//            fallskjerm = fallskjerm for tykk atmosfære · kulde = kuldeutstyr
export const SYSTEMER = [
  { id: 'JO', navn: 'Jorda-systemet', sone: 'Indre solsystem', ikon: '🌍' },
  { id: 'IN', navn: 'De indre planetene', sone: 'Indre solsystem', ikon: '☀️' },
  { id: 'AS', navn: 'Asteroidene', sone: 'Indre solsystem', ikon: '🪨' },
  { id: 'JU', navn: 'Jupiter-systemet', sone: 'Gasskjempene', ikon: '🌪️' },
  { id: 'SA', navn: 'Saturn-systemet', sone: 'Gasskjempene', ikon: '🪐' },
  { id: 'UR', navn: 'Uranus-systemet', sone: 'Iskjempene og utkanten', ikon: '🎱' },
  { id: 'NE', navn: 'Neptun-systemet', sone: 'Iskjempene og utkanten', ikon: '🌊' },
  { id: 'KU', navn: 'Kuiperbeltet og kometene', sone: 'Iskjempene og utkanten', ikon: '☄️' },
];
export const SONER = ['Indre solsystem', 'Gasskjempene', 'Iskjempene og utkanten'];
export const AU_KM = 149_600_000;

const s = (id, navn, flagg, type, au, krets, kart, pris, x = {}) => ({
  id, navn, flagg, type, au, krets, kart, pris, system: id.split('-')[0],
  kropp: null, lok: 0, tekst: 'u', hs: false, knute: false, bane: false, start: false, krav: [], ...x,
});
export const STEDER = [
  // ---------- Jorda-systemet ----------
  s('JO-romstasjonen', 'Romstasjonen', '🛰️', 'stasjon', 1.0, 'jorda', [24, 200], 1.1, { tekst: 'v', lok: 400, hs: true, knute: true, start: true }),
  s('JO-stillhetenshav', 'Månen – Stillhetens hav', '👣', 'måne', 1.0, 'jorda', [58, 330, 0, -8], 1.0, { tekst: 'h', kropp: 'Månen', lok: 384400, start: true, krav: ['lander'] }),
  s('JO-shackleton', 'Månen – Shackleton-krateret', '🔦', 'måne', 1.0, 'jorda', [58, 330, 0, 8], 1.05, { tekst: 'h', kropp: 'Månen', lok: 384400, start: true, krav: ['lander'] }),
  // ---------- De indre planetene ----------
  s('IN-sola', 'Sola', '☀️', 'stjerne', 0, 'sola', [0, 0], 1.5, { bane: true, krav: ['varme'] }),
  s('IN-merkur', 'Merkur', '🌗', 'planet', 0.39, 'merkur', [0, 0], 1.3, { krav: ['lander', 'varme'] }),
  s('IN-venus', 'Venus', '🌫️', 'planet', 0.72, 'venus', [0, 0], 1.4, { krav: ['lander', 'varme', 'fallskjerm'] }),
  s('IN-olympus', 'Mars – Olympus Mons', '🌋', 'planet', 1.52, 'mars', [12, 200], 1.1, { tekst: 'v', kropp: 'Mars', start: true, krav: ['lander'] }),
  s('IN-marineris', 'Mars – Valles Marineris', '🏜️', 'planet', 1.52, 'mars', [12, 340], 1.1, { tekst: 'h', kropp: 'Mars', start: true, krav: ['lander'] }),
  s('IN-gale', 'Mars – Gale-krateret', '🤖', 'planet', 1.52, 'mars', [12, 90], 1.15, { kropp: 'Mars', hs: true, knute: true, start: true, krav: ['lander'] }),
  s('IN-phobos', 'Phobos', '🥔', 'måne', 1.52, 'mars', [38, 235], 1.15, { tekst: 'o', lok: 9400, krav: ['lander'] }),
  s('IN-deimos', 'Deimos', '🪨', 'måne', 1.52, 'mars', [48, 25], 1.15, { lok: 23500, krav: ['lander'] }),
  // ---------- Asteroidene ----------
  s('AS-ceres', 'Ceres', '⚪', 'dvergplanet', 2.77, 'ceres', [0, 0], 1.2, { hs: true, knute: true, krav: ['lander'] }),
  s('AS-vesta', 'Vesta', '💎', 'asteroide', 2.36, 'vesta', [0, 0], 1.2, { krav: ['lander'] }),
  s('AS-psyche', 'Psyche', '🔩', 'asteroide', 2.92, 'psyche', [0, 0], 1.25, { krav: ['lander'] }),
  s('AS-bennu', 'Bennu', '🧪', 'asteroide', 1.13, 'bennu', [0, 0], 1.15, { krav: ['lander'] }),
  // ---------- Jupiter-systemet ----------
  s('JU-jupiter', 'Jupiter', '🌪️', 'planet', 5.2, 'jupiter', [0, 0], 1.3, { hs: true, knute: true, bane: true, krav: ['straling'] }),
  s('JU-io', 'Io', '🔥', 'måne', 5.2, 'jupiter', [34, 200], 1.4, { lok: 422000, krav: ['lander', 'straling'] }),
  s('JU-europa', 'Europa', '🧊', 'måne', 5.2, 'jupiter', [41, 290], 1.35, { lok: 671000, krav: ['lander', 'straling'] }),
  s('JU-ganymedes', 'Ganymedes', '🧲', 'måne', 5.2, 'jupiter', [48, 30], 1.3, { lok: 1070000, krav: ['lander', 'straling'] }),
  s('JU-callisto', 'Callisto', '🕳️', 'måne', 5.2, 'jupiter', [56, 120], 1.3, { lok: 1883000, krav: ['lander', 'straling'] }),
  // ---------- Saturn-systemet ----------
  s('SA-saturn', 'Saturn', '🪐', 'planet', 9.58, 'saturn', [0, 0], 1.4, { hs: true, knute: true, bane: true, krav: ['motor'] }),
  s('SA-mimas', 'Mimas', '🎯', 'måne', 9.58, 'saturn', [36, 250], 1.4, { lok: 186000, krav: ['lander', 'motor'] }),
  s('SA-enceladus', 'Enceladus', '⛲', 'måne', 9.58, 'saturn', [42, 320], 1.4, { lok: 238000, krav: ['lander', 'motor'] }),
  s('SA-titan', 'Titan', '🌧️', 'måne', 9.58, 'saturn', [50, 60], 1.45, { lok: 1222000, krav: ['lander', 'motor', 'fallskjerm'] }),
  s('SA-iapetus', 'Iapetus', '☯️', 'måne', 9.58, 'saturn', [60, 150], 1.4, { lok: 3561000, krav: ['lander', 'motor'] }),
  // ---------- Uranus-systemet ----------
  s('UR-uranus', 'Uranus', '🎱', 'planet', 19.2, 'uranus', [0, 0], 1.5, { hs: true, bane: true, krav: ['motor'] }),
  s('UR-miranda', 'Miranda', '🧩', 'måne', 19.2, 'uranus', [28, 210], 1.5, { lok: 129000, krav: ['lander', 'motor'] }),
  s('UR-titania', 'Titania', '👑', 'måne', 19.2, 'uranus', [36, 330], 1.5, { lok: 436000, krav: ['lander', 'motor'] }),
  s('UR-oberon', 'Oberon', '🏰', 'måne', 19.2, 'uranus', [44, 80], 1.5, { lok: 584000, krav: ['lander', 'motor'] }),
  // ---------- Neptun-systemet ----------
  s('NE-neptun', 'Neptun', '🌊', 'planet', 30.1, 'neptun', [0, 0], 1.6, { hs: true, bane: true, krav: ['motor'] }),
  s('NE-triton', 'Triton', '❄️', 'måne', 30.1, 'neptun', [30, 300], 1.6, { lok: 355000, krav: ['lander', 'motor', 'kulde'] }),
  // ---------- Kuiperbeltet og kometene ----------
  s('KU-pluto', 'Pluto', '💙', 'dvergplanet', 39.5, 'pluto', [0, 0], 1.7, { hs: true, krav: ['lander', 'motor', 'kulde'] }),
  s('KU-charon', 'Charon', '⛵', 'måne', 39.5, 'pluto', [22, 30], 1.7, { lok: 19600, krav: ['lander', 'motor', 'kulde'] }),
  s('KU-eris', 'Eris', '🍎', 'dvergplanet', 67.8, 'eris', [0, 0], 1.7, { krav: ['lander', 'motor', 'kulde'] }),
  s('KU-makemake', 'Makemake', '🗿', 'dvergplanet', 45.4, 'makemake', [0, 0], 1.7, { krav: ['lander', 'motor', 'kulde'] }),
  s('KU-halley', 'Halleys komet', '☄️', 'komet', 17.8, 'halley', [0, 0], 1.6, { krav: ['lander', 'motor'] }),
  s('KU-arrokoth', 'Arrokoth', '⛄', 'asteroide', 44.6, 'arrokoth', [0, 0], 1.7, { krav: ['lander', 'motor', 'kulde'] }),
];

/**
 * Utstyret til romskipet. Gruppa kjøper det én gang og beholder det resten av spillet (se regler.js → utstyrMangler).
 * standard = følger med alle skip fra start (landingsmodulen) – kan ikke kjøpes og sjekkes ikke.
 * pris = kroner for hele mannskapet.
 */
export const UTSTYR = {
  lander: { navn: 'Landingsmodul', ikon: '🛬', standard: true, hvorfor: 'For å komme ned på overflaten – og opp igjen. Følger med alle skip.' },
  fallskjerm: { navn: 'Fallskjerm', ikon: '🪂', pris: 6000, hvorfor: 'For å bremse gjennom tykk atmosfære. Trengs på Venus og Titan.' },
  kulde: { navn: 'Kuldeutstyr', ikon: '🥶', pris: 10000, hvorfor: 'For å tåle under −200 °C. Trengs i Kuiperbeltet og på Triton.' },
  varme: { navn: 'Varmeskjold', ikon: '🔥', pris: 12000, hvorfor: 'For å tåle varmen nær Sola. Trengs ved Sola, Merkur og Venus.' },
  straling: { navn: 'Strålingsskjold', ikon: '☢️', pris: 14000, hvorfor: 'For å tåle den livsfarlige strålingen rundt Jupiter. Trengs i hele Jupiter-systemet.' },
  motor: { navn: 'Kraftigere motor', ikon: '⚛️', pris: 18000, hvorfor: 'For å rekke fram før maten tar slutt. Trengs til alt utenfor Jupiter.' },
};
