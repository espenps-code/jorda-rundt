// Europa rundt – STEDER. Hver by er et «sted» med de samme feltene som et land hadde i Jorda rundt
// (id, navn, by, flagg, lat/lng, valuta, kurs, prisniva, stengt …), så resten av spillet virker uendret.
// Ekstra felter: landId (landkode), landNavn, hovedstad, oy (ingen tog/buss dit).
import { ALLE_LAND } from './landene.js';
import { BYER } from './byer.js';

/** De europeiske landene (ett objekt per land) */
export const LANDENE = ALLE_LAND.filter((l) => l.kontinent === 'Europa');
export const landInfo = Object.fromEntries(LANDENE.map((l) => [l.id, l]));

// Knutepunkt-flyplasser. 1 = store (kan fly langt direkte), 0 = vanlige knutepunkt
export const KNUTEPUNKT = {
  'GB-london': 1, 'FR-paris': 1, 'NL-amsterdam': 1, 'DE-frankfurt': 1,
  'DE-munchen': 0, 'DK-kobenhavn': 0, 'NO-oslo': 0, 'SE-stockholm': 0, 'FI-helsingfors': 0, 'ES-madrid': 0,
  'ES-barcelona': 0, 'IT-roma': 0, 'IT-milano': 0, 'CH-zurich': 0, 'AT-wien': 0, 'PL-warszawa': 0,
  'PT-lisboa': 0, 'GR-athen': 0, 'IE-dublin': 0, 'BE-brussel': 0, 'IS-reykjavik': 0,
};
// Byer man ikke kommer til med tog eller buss (øyer)
const OYLAND = ['IS', 'MT', 'CY', 'IE'];
const OYBYER = ['ES-palma', 'ES-las-palmas', 'PT-funchal', 'GR-iraklion', 'GR-rhodos'];

export const LAND = BYER.map((b) => {
  const l = landInfo[b.land];
  return {
    ...l,
    id: b.id, navn: b.navn, by: b.navn, lat: b.lat, lng: b.lng,
    landId: l.id, landNavn: l.navn, hovedstad: b.hovedstad,
    hub: b.id in KNUTEPUNKT,
    oy: OYLAND.includes(l.id) || OYBYER.includes(b.id),
  };
});
export const landEtterId = Object.fromEntries(LAND.map((l) => [l.id, l]));
export const KONTINENTER = ['Europa'];

/** Landkoden for et sted ("NO-bergen" → "NO"). Godtar også en landkode. */
export const landKode = (id) => landEtterId[id]?.landId || String(id || '').split('-')[0];
/** Alle stedene (byene) i et land, hovedstaden først */
export const byerILand = (kode) => LAND.filter((l) => l.landId === kode);
