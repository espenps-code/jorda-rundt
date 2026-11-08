// Norge rundt – STEDER og FYLKER i det formatet motoren bruker.
// Hvert sted har de samme feltene som et land hadde i Jorda rundt (id, navn, by, flagg, lat/lng, valuta,
// kurs, prisniva, stengt …). Fylkene er «regionene» (som landene i Europa rundt): landId = fylkesnummer.
import { FYLKER, STEDER } from './steder.js';

/** Fylkene (ett objekt per fylke) */
export const LANDENE = FYLKER.map((f) => ({
  id: f.nr, navn: f.navn, flagg: '🇳🇴', by: f.senter, kontinent: f.landsdel,
  valuta: 'NOK', valutaNavn: 'norske kroner', kurs: 1, prisniva: 1, stengt: null,
}));
export const landInfo = Object.fromEntries(LANDENE.map((l) => [l.id, l]));
export const LANDSDELER = ['Nord-Norge', 'Trøndelag', 'Vestlandet', 'Sørlandet', 'Østlandet'];

export const LAND = STEDER.map((s) => {
  const f = landInfo[s.fylke];
  return {
    id: s.id, navn: s.navn, by: s.navn, flagg: '🇳🇴', lat: s.lat, lng: s.lng,
    kontinent: f.kontinent, valuta: 'NOK', valutaNavn: 'norske kroner', kurs: 1,
    prisniva: s.pris, hub: s.knute, liten: false,
    stengt: s.valgfri ? 'kan åpnes som «Vårt sted» under Steder' : null,   // valgfrie steder er stengt til læreren åpner dem
    landId: s.fylke, landNavn: f.navn, hovedstad: s.hs,
    tog: s.tog, kyst: s.kyst, fly: s.fly, telt: s.telt, oy: s.oy, valgfri: s.valgfri,
  };
});
export const landEtterId = Object.fromEntries(LAND.map((l) => [l.id, l]));
export const KONTINENTER = LANDSDELER;

/** Fylkesnummeret for et sted ("46-bergen" → "46"). Godtar også et fylkesnummer. */
export const landKode = (id) => landEtterId[id]?.landId || String(id || '').split('-')[0];
/** Alle stedene i et fylke, administrasjonssenteret først */
export const byerILand = (kode) => LAND.filter((l) => l.landId === kode).sort((a, b) => b.hovedstad - a.hovedstad);

/** Skal stedet vises? Valgfrie «Vårt sted»-steder er skjult til læreren har åpnet dem. erStengt = (id) => bool */
export const synlig = (l, erStengt) => !l.valgfri || !erStengt(l.id);
