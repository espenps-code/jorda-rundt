// Across the UK – PLACES and REGIONS in the format the engine uses (same as the other game packages).
// The regions are the "regions" of the engine: landId = region code (TLM = Scotland).
import { REGIONER, STEDER } from './steder.js';

/** The regions (one object per region) */
export const LANDENE = REGIONER.map((r) => ({
  id: r.id, navn: r.navn, flagg: '🇬🇧', by: STEDER.find((x) => x.fylke === r.id && x.hs)?.navn || '', kontinent: r.land,
  valuta: 'GBP', valutaNavn: 'pounds', kurs: null, prisniva: 1, stengt: null,
}));
export const landInfo = Object.fromEntries(LANDENE.map((l) => [l.id, l]));
/** The four countries of the UK */
export const NASJONER = ['England', 'Scotland', 'Wales', 'Northern Ireland'];

export const LAND = STEDER.map((x) => {
  const r = landInfo[x.fylke];
  return {
    id: x.id, navn: x.navn, by: x.navn, flagg: x.flagg, lat: x.lat, lng: x.lng,
    kontinent: r.kontinent, valuta: 'GBP', valutaNavn: 'pounds', kurs: null,
    prisniva: x.pris, hub: x.knute, liten: false, stengt: null,
    landId: x.fylke, landNavn: r.navn, hovedstad: x.hs,
    fly: x.fly, ferje: x.ferje, telt: x.telt, irland: x.fylke === 'TLN',
  };
});
export const landEtterId = Object.fromEntries(LAND.map((l) => [l.id, l]));
export const KONTINENTER = NASJONER;

/** The region code of a place ("TLM-glasgow" → "TLM"). Also accepts a region code. */
export const landKode = (id) => landEtterId[id]?.landId || String(id || '').split('-')[0];
/** All the places in a region, the main city first */
export const byerILand = (kode) => LAND.filter((l) => l.landId === kode).sort((a, b) => b.hovedstad - a.hovedstad);
