// Solsystemet rundt – STEDER og SYSTEMER i det formatet motoren bruker (samme som de andre spillpakkene).
// Systemene er «regionene»: landId = systemkoden (JU = Jupiter-systemet).
import { SYSTEMER, STEDER, SONER } from './steder.js';

/** Systemene (ett objekt per system) */
export const LANDENE = SYSTEMER.map((r) => ({
  id: r.id, navn: r.navn, flagg: r.ikon, by: STEDER.find((x) => x.system === r.id && x.hs)?.navn || '', kontinent: r.sone,
  valuta: 'NOK', valutaNavn: 'kroner', kurs: 1, prisniva: 1, stengt: null,
}));
export const landInfo = Object.fromEntries(LANDENE.map((l) => [l.id, l]));

export const LAND = STEDER.map((x) => {
  const r = landInfo[x.system];
  return {
    id: x.id, navn: x.navn, by: x.navn, flagg: x.flagg, lat: 0, lng: 0,
    kontinent: r.kontinent, valuta: 'NOK', valutaNavn: 'kroner', kurs: 1,
    prisniva: x.pris, hub: x.knute, liten: false, stengt: null,
    landId: x.system, landNavn: r.navn, hovedstad: x.hs,
    type: x.type, au: x.au, krets: x.krets, kropp: x.kropp, lok: x.lok, kart: x.kart, tekst: x.tekst,
    bane: x.bane, start: x.start, krav: x.krav,
    telt: true,              // «telt» i motoren = sove gratis i romskipet (går overalt)
  };
});
export const landEtterId = Object.fromEntries(LAND.map((l) => [l.id, l]));
export const KONTINENTER = SONER;

/** Systemkoden for et sted ("JU-europa" → "JU"). Godtar også en systemkode. */
export const landKode = (id) => landEtterId[id]?.landId || String(id || '').split('-')[0];
/** Alle stedene i et system, hovedstedet først */
export const byerILand = (kode) => LAND.filter((l) => l.landId === kode).sort((a, b) => b.hovedstad - a.hovedstad);
