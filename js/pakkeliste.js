// MOTOREN – alle spillpakkene som finnes. Brukes av spillvelgeren i lærerportalen.
// rot = hvor spillet ligger i databasen (samme som i pakker/<spill>/pakke.js). steder = ordet brukt i «Mine spill».
// Ny spillpakke? Legg den til her også (i tillegg til mappa under pakker/).
export const SPILLPAKKER = [
  { id: 'verden', rot: '', steder: 'land', navn: 'Jorda rundt', ikon: '🌍', tekst: 'Reis jorden rundt og erobre land og kontinenter. Fly mellom hovedsteder.' },
  { id: 'europa', rot: 'europa', steder: 'byer', navn: 'Europa rundt', ikon: '🇪🇺', tekst: 'Erobre byer i mange land i Europa. Fly, tog og buss.' },
  { id: 'norge', rot: 'norge', steder: 'steder', navn: 'Norge rundt', ikon: '🇳🇴', tekst: 'Erobre steder i mange fylker i Norge. Buss, tog, båt og fly – og telt med allemannsretten.' },
  { id: 'uk', rot: 'uk', steder: 'steder', navn: 'Across the UK', ikon: '🇬🇧', tekst: 'På engelsk: erobre steder og regioner i England, Skottland, Wales og Nord-Irland. Fly, tog, buss og ferje.' },
  { id: 'australia', rot: 'australia', steder: 'steder', navn: 'Across Australia', ikon: '🇦🇺', tekst: 'På engelsk: erobre steder og delstater i Australia – fra storbyene til outbacken. Fly, tog, buss og ferje.' },
  { id: 'usa', rot: 'usa', steder: 'stater', navn: 'Across America', ikon: '🇺🇸', tekst: 'På engelsk: erobre stater og regioner i USA. Fly, tog og buss – og camping med «Leave No Trace».' },
  { id: 'solsystem', rot: 'solsystem', steder: 'steder', navn: 'Solsystemet rundt', ikon: '🪐', tekst: 'Naturfag: erobre planeter, måner og hele systemer. Kjøp spesialutstyr til romskipet – og finn ut hvor ekstremt det er der ute.' },
];
/** Adressen til en side for en spillpakke: pakkeAdresse('europa', 'laerer.html') → laerer.html?pakke=europa */
export function pakkeAdresse(id, side = 'laerer.html', ekstra = '') {
  const q = new URLSearchParams(ekstra);
  if (id !== 'verden') q.set('pakke', id);
  const s = q.toString();
  return (window.SPILLROT || '') + side + (s ? '?' + s : '');
}
