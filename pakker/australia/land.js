// Across Australia – PLACES and REGIONS in the format the engine uses (same as the other game packages).
// The states and territories are the "regions" of the engine: landId = state code (QLD = Queensland).
import { REGIONER, STEDER } from './steder.js';

/** The regions (one object per region) */
export const LANDENE = REGIONER.map((r) => ({
  id: r.id, navn: r.navn, flagg: '🇦🇺', by: STEDER.find((x) => x.fylke === r.id && x.hs)?.navn || '', kontinent: r.type === 'state' ? 'State' : 'Territory',
  valuta: 'AUD', valutaNavn: 'Australian dollars', kurs: null, prisniva: 1, stengt: null,
}));
export const landInfo = Object.fromEntries(LANDENE.map((l) => [l.id, l]));
/** States and territories */
export const NASJONER = ['State', 'Territory'];

export const LAND = STEDER.map((x) => {
  const r = landInfo[x.fylke];
  return {
    id: x.id, navn: x.navn, by: x.navn, flagg: x.flagg, lat: x.lat, lng: x.lng,
    kontinent: r.kontinent, valuta: 'AUD', valutaNavn: 'Australian dollars', kurs: null,
    prisniva: x.pris, hub: x.knute, liten: false, stengt: null,
    landId: x.fylke, landNavn: r.navn, hovedstad: x.hs,
    fly: x.fly, tog: x.tog, telt: x.telt, tasmania: x.fylke === 'TAS',
  };
});
export const landEtterId = Object.fromEntries(LAND.map((l) => [l.id, l]));
export const KONTINENTER = NASJONER;

/** The region code of a place ("QLD-cairns" → "QLD"). Also accepts a region code. */
export const landKode = (id) => landEtterId[id]?.landId || String(id || '').split('-')[0];
/** All the places in a region, the main city first */
export const byerILand = (kode) => LAND.filter((l) => l.landId === kode).sort((a, b) => b.hovedstad - a.hovedstad);
