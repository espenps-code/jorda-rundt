// MOTOREN – alle spillpakkene som finnes. Brukes av spillvelgeren i lærerportalen.
// Ny spillpakke? Legg den til her også (i tillegg til mappa under pakker/).
export const SPILLPAKKER = [
  { id: 'verden', navn: 'Jorda rundt', ikon: '🌍', tekst: 'Reis jorden rundt og erobre land og kontinenter. Fly mellom hovedsteder.' },
  { id: 'europa', navn: 'Europa rundt', ikon: '🇪🇺', tekst: 'Erobre byer i Europa – og hele land. Fly, tog og buss.' },
  { id: 'norge', navn: 'Norge rundt', ikon: '🇳🇴', tekst: 'Erobre steder og hele fylker i Norge. Buss, tog, båt og fly – og telt med allemannsretten.' },
];
/** Adressen til en side for en spillpakke: pakkeAdresse('europa', 'laerer.html') → laerer.html?pakke=europa */
export function pakkeAdresse(id, side = 'laerer.html', ekstra = '') {
  const q = new URLSearchParams(ekstra);
  if (id !== 'verden') q.set('pakke', id);
  const s = q.toString();
  return (window.SPILLROT || '') + side + (s ? '?' + s : '');
}
