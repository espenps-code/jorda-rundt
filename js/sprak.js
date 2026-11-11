// MOTOREN – språklaget. Motoren er skrevet på norsk; spillpakker med `sprak: 'en'` i pakke.js vises på engelsk.
//   T`Velkommen til ${by}!`      → slår opp «Velkommen til {0}!» i ordboka (js/sprak/en.js)
//   T('Lagre')                   → slår opp «Lagre»
//   oversettSide()               → oversetter den faste teksten i HTML-en (kalles fra js/side.js)
// På norsk gjør T ingenting (teksten kommer ut akkurat som den står). Mangler en tekst i ordboka, vises den norske.
// Spillpakken kan overstyre enkeltord med `ordbok: { 'Kontinent': 'Region' }` i pakke.js.
// Sjekk at ordboka er komplett:  node verktoy/sprak-sjekk.mjs
import { PAKKE } from '#pakke/pakke.js';
import { lagOversetter, malTekst, oversettDom } from './sprak-kjerne.js';

export const SPRAK = PAKKE.sprak || 'no';
/** Tallformat og datoer: 'nb-NO' → 1 000, 'en-US' → 1,000 */
export const LOKALE = PAKKE.lokale || 'nb-NO';
export const MANGLER = new Set();
let o = null;
if (SPRAK !== 'no') {
  const m = await import(`./sprak/${SPRAK}.js`);
  const ordbok = { ...m.default };
  // Spillpakken kan bytte stavemåte i hele ordboka (pakke.js → staving: [['color', 'colour'], …]) – hele ord, ikke CSS («color:»)
  for (const [fra, til] of PAKKE.staving || []) {
    const re = new RegExp(`\\b${fra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?!:)`, 'g');
    for (const k of Object.keys(ordbok)) if (ordbok[k].includes(fra)) ordbok[k] = ordbok[k].replace(re, til);
  }
  o = lagOversetter({ ...ordbok, ...(PAKKE.ordbok || {}) }, MANGLER);
  if (typeof window !== 'undefined') window.__sprakMangler = MANGLER;
}

const maler = new WeakMap(), tekster = new Map();
export function T(strings, ...verdier) {
  if (typeof strings === 'string') {
    if (!o) return strings;
    let v = tekster.get(strings);
    if (v === undefined) { v = o.html(strings); tekster.set(strings, v); }
    return v;
  }
  if (!o) { let s = strings[0]; for (let i = 0; i < verdier.length; i++) s += `${verdier[i]}` + strings[i + 1]; return s; }
  let plan = maler.get(strings);
  if (!plan) { plan = o.html(malTekst(strings)).split(/(\d+)/); maler.set(strings, plan); }
  let ut = plan[0];
  for (let i = 1; i < plan.length; i += 2) ut += `${verdier[plan[i]]}` + plan[i + 1];
  return ut;
}
/** Tall med riktig tusenskille for språket */
export const tall = (n) => Number(n).toLocaleString(LOKALE);

/** Oversetter den faste teksten i siden og viser den (pakke.js skjuler siden til dette er gjort). */
export function oversettSide(rot = document.body) {
  if (o) {
    oversettDom(rot, o);
    if (document.title) document.title = o.run(document.title);
    document.documentElement.lang = SPRAK;
  }
  document.documentElement.classList.remove('sprak-venter');
}
