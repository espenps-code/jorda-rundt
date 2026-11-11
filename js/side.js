// MOTOREN – hjelpere for sidene: fyller inn spillpakkens navn og ord i fast HTML, og lager lenker
// som beholder spillpakken (?pakke=europa).
//   <span data-p="navn">Jorda rundt</span>          → spillets navn
//   <span data-p="ord.steder" data-stor>Land</span> → «Land» / «Byer» (stor forbokstav)
//   <input data-p-placeholder="ord.sok">            → plassholdertekst
import { PAKKE } from '#pakke/pakke.js';
import { oversettSide } from './sprak.js';

const hent = (sti) => sti.split('.').reduce((o, k) => o?.[k], PAKKE);
const stor = (t) => (t ? t[0].toUpperCase() + t.slice(1) : '');

export function fyllPakkeTekster(rot = document) {
  for (const el of rot.querySelectorAll('[data-p]')) {
    const v = hent(el.dataset.p);
    if (v != null) el.textContent = el.hasAttribute('data-stor') ? stor(String(v)) : String(v);
  }
  for (const el of rot.querySelectorAll('[data-p-placeholder]')) {
    const v = hent(el.dataset.pPlaceholder); if (v != null) el.placeholder = String(v);
  }
  document.documentElement.dataset.spill = PAKKE.id;
  if (rot === document) oversettSide();   // spillpakker på andre språk: oversett den faste teksten i siden (js/sprak.js)
}
/** Lenke til en annen side i spillet, med samme spillpakke. */
export const lenke = (sti) => (window.pakkeLenke ? window.pakkeLenke(sti) : sti);
/** Full adresse (til QR-koder og kopiering) */
export const fullLenke = (sti) => new URL(lenke(sti), location.href).href;
