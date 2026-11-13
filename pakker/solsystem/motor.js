// Solsystemet rundt – prismotor for reiser, overnatting og forskningsjobb.
// Alle reiser går med romskip (motoren kaller det «fly»): en direkte rute er dyr og rask, en rute med
// stopp underveis er billigere, men tar lengre tid og gir flere spørsmål.
// Samme søk gir samme svar samme dag (rettferdig mellom gruppene), men prisene varierer litt fra dag til dag.
//
// AVSTANDER: planetene flytter seg hele tida, så avstanden mellom dem forandrer seg. Spillet bruker den
// korteste avstanden (når planetene står på samme side av Sola): forskjellen i avstand fra Sola.
import { LAND, landEtterId } from './land.js';
import { AU_KM } from './steder.js';
import { PAKKE } from './pakke.js';

// ---------- hjelpere ----------
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(String(seed)) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const runde9 = (x) => Math.max(9, Math.round(x / 10) * 10 - 1);
const runde10 = (x) => Math.round(x / 10) * 10;
const klokke = (r, fra = 6, spenn = 15) => `${String(fra + Math.floor(r() * spenn)).padStart(2, '0')}:${String([0, 10, 15, 20, 30, 40, 45, 50][Math.floor(r() * 8)]).padStart(2, '0')}`;
/** Pene tall: 3 000 km, 384 000 km, 78 000 000 km */
const pent = (km) => { const p = 10 ** Math.max(0, Math.floor(Math.log10(km)) - 1); return Math.round(km / p) * p; };

/** Avstanden mellom to steder i km (korteste avstand, se toppen av fila). */
export function avstandKm(a, b) {
  if (!a || !b || a.id === b.id) return 0;
  if (a.krets === b.krets) {
    if (a.kropp && a.kropp === b.kropp) return 3000;               // to steder på samme måne eller planet
    return pent(Math.max(1000, Math.abs(a.lok - b.lok)));          // fra planeten til en måne, eller mellom to måner
  }
  return pent(Math.max(1_000_000, Math.abs(a.au - b.au) * AU_KM)); // mellom to systemer
}
export function formaterKr(n) { return Math.round(n).toLocaleString('nb-NO').replace(/,/g, ' ') + ' kr'; }
export function iLokalValuta() { return null; }   // alt er i kroner
/** Reisetid: «14 t 30 min» eller «9 døgn 4 t» */
export function formaterVarighet(min) {
  const d = Math.floor(min / 1440), t = Math.floor((min % 1440) / 60), m = min % 60;
  return d ? `${d} døgn ${t} t` : `${t} t ${m} min`;
}

// ---------- romreiser ----------
export const KRAV_FLY = [2, 4, 6];               // spørsmål for direkte rute / 1 stopp / 2 stopp
const ROMLINJER = ['Solvind Romlinjer', 'Kometekspressen', 'Nordlys Romfart', 'Stjernebrua', 'Banesprett', 'Melkeveien Transport'];
const KNUTEPUNKT = LAND.filter((l) => l.hub);
const mkm = (a, b) => avstandKm(a, b) / 1_000_000;
/** Reisetid i minutter. Framtidens romskip er raske: Jorda–Mars på litt over en uke. */
const reisetidMin = (a, b) => Math.round((0.2 + 6 * Math.log10(1 + mkm(a, b) / 3)) * 1440);
/** Grunnpris per person. Vokser med avstanden, men flater ut (ellers ville Pluto kostet millioner). */
const grunnpris = (a, b) => 500 + 1700 * Math.log10(1 + mkm(a, b) / 3);

/** Beste stoppested på veien (et knutepunkt som nesten ligger i ruta), eller null. */
function besteVia(a, b, unntak = []) {
  const direkte = avstandKm(a, b);
  if (a.krets === b.krets || direkte < 30_000_000) return null;    // korte turer går alltid direkte
  let best = null, bestEkstra = Infinity;
  for (const h of KNUTEPUNKT) {
    if ([a.id, b.id, ...unntak].includes(h.id) || h.krets === a.krets || h.krets === b.krets) continue;
    const ekstra = avstandKm(a, h) + avstandKm(h, b) - direkte;
    if (ekstra > direkte * 0.5) continue;                          // for stor omvei
    if (ekstra < bestEkstra) { bestEkstra = ekstra; best = h; }
  }
  return best;
}

/** Alle reisetilbud fra ett sted til et annet i dag, billigst først. */
export function flyTilbud(fraId, tilId, dato, personer = 4) {
  const a = landEtterId[fraId], b = landEtterId[tilId];
  if (!a || !b || a.id === b.id) return [];
  const km = avstandKm(a, b);
  const r = rng(`rom-${fraId}-${tilId}-${dato}`);
  const dagsFaktor = 0.88 + r() * 0.27;
  const prisniva = (((a.prisniva || 1) + (b.prisniva || 1)) / 2) ** 0.5;
  const ruter = [{ via: [], faktor: 1.2 }];
  const v1 = besteVia(a, b);
  if (v1) ruter.push({ via: [v1], faktor: 0.95 });
  const v2 = v1 && besteVia(a, b, [v1.id]);
  if (v2) ruter.push({ via: [v1, v2].sort((x, y) => Math.abs(x.au - a.au) - Math.abs(y.au - a.au)), faktor: 0.8 });
  const tilbud = ruter.map((rute, i) => {
    const punkter = [a, ...rute.via, b];
    let min = 0; for (let p = 0; p < punkter.length - 1; p++) min += reisetidMin(punkter[p], punkter[p + 1]);
    min += rute.via.length * (600 + Math.floor(r() * 900));        // ventetid på stoppestedet
    const prisPerPerson = runde9(grunnpris(a, b) * rute.faktor * dagsFaktor * prisniva * (0.92 + r() * 0.18));
    return {
      id: `${fraId}-${tilId}-${dato}-${i}`, type: 'fly', selskap: ROMLINJER[hash(fraId + tilId + i + dato) % ROMLINJER.length],
      fra: a.id, til: b.id, stopp: rute.via.length, via: rute.via.map((v) => ({ id: v.id, by: v.by, navn: v.navn })),
      avgang: klokke(r), varighetMin: min, km, krav: KRAV_FLY[Math.min(rute.via.length, 2)],
      prisPerPerson, personer, totalt: prisPerPerson * personer,
    };
  });
  return tilbud.sort((x, y) => x.totalt - y.totalt);
}

// ---------- overnatting ----------
// På overflaten bor gruppa i en base. Der ingen kan lande (gasskjempene og Sola) og på romstasjonen bor de i bane.
const NAVN = {
  flate: {
    lav: ['Sovekapslene {by}', 'Kraterbrakka', 'Gruvebrakka', 'Mannskapskøyene', 'Containerbasen', 'Hulebasen', 'Støvsekken Vandrerhjem', 'Budsjettkapselen'],
    mid: ['{by} Forskningsbase', 'Kuppelhotellet', 'Habitat Nordlys', 'Drivhusbasen', 'Basecamp {by}', 'Regolitt Hotell', 'Tunnelhotellet', 'Stasjon Morgenrøde'],
    hoy: ['Grand Kuppel {by}', 'Hotel Jordblikk', 'Panoramakuppelen', 'Krystallhabitatet', 'The Royal {by}', 'Stjernehimmelen Resort'],
  },
  bane: {
    lav: ['Køyemodulen {by}', 'Lasterommet', 'Sovesekkmodulen', 'Dokkingringen Vandrerhjem', 'Verkstedmodulen', 'Kapselhotellet', 'Luftslusa Herberge', 'Budsjettmodulen'],
    mid: ['Banestasjon {by}', 'Karusellen', 'Ringstasjonen', 'Observatoriet', 'Modul Nordlys', 'Stasjon Utsyn', 'Solseilet Hotell', 'Hjulet'],
    hoy: ['Grand Orbital {by}', 'Kuppelsuiten', 'Hotel Utsikten', 'Stjernehjulet', 'The Royal Orbit', 'Panoramaringen'],
  },
};
// De tre første gir fordeler i spillet (se hotellEffekt i js/felles.js). Resten er bare kos.
const F = PAKKE.fasiliteter;
const FASILITETER = [F.frokost, F.buss, F.wifi, 'Kunstig tyngdekraft', 'Kuppel med utsikt', 'Varm dusj', 'Treningsrom', 'Spillrom', 'Observatorium', 'Eget drivhus'];
const STJERNE_PRIS = [700, 1100, 1650, 2400, 3900];   // kr per natt for hele mannskapet
const STJERNER = [1, 2, 2, 3, 3, 3, 4, 4, 5];
const kortNavn = (l) => l.by.split(' – ').pop().replace(/-krateret$/, '');

/** Overnatting på stedet: 9 baser eller banestasjoner – og romskipet, som er gratis. Pris per natt for hele gruppa. */
export function hoteller(stedId, uke = '') {
  const l = landEtterId[stedId]; if (!l) return [];
  const r = rng('hotell-' + stedId), rUke = rng('hotelluke-' + stedId + uke);
  const kilder = NAVN[l.bane || l.type === 'stasjon' ? 'bane' : 'flate'];
  const brukt = new Set();
  const liste = STJERNER.map((st, i) => {
    const niva = st <= 2 ? 'lav' : st >= 4 ? 'hoy' : 'mid';
    const kilde = kilder[niva].map((m) => m.replace('{by}', kortNavn(l))).filter((m) => !brukt.has(m));
    const navn = kilde[Math.floor(r() * kilde.length)] || `Base ${kortNavn(l)} ${i + 1}`;
    brukt.add(navn);
    const fas = FASILITETER.filter((_, k) => r() < (k < 3 ? 0.02 + st * 0.06 : 0.2 + st * 0.08)).slice(0, 4);
    const pris = Math.max(150, STJERNE_PRIS[st - 1] * Math.pow(l.prisniva, 0.85) * (0.85 + r() * 0.35) * (0.95 + rUke() * 0.1));
    return {
      id: `${stedId}-h${i}`, navn, stjerner: st,
      vurdering: +(Math.min(9.7, 5.8 + st * 0.6 + r() * 1.4)).toFixed(1),
      sentrumKm: +(0.2 + r() * (st >= 4 ? 2 : 6)).toFixed(1),
      fasiliteter: fas.length ? fas : ['Varm dusj'], prisNatt: runde9(pris),
    };
  }).sort((a, b) => a.prisNatt - b.prisNatt);
  // «telt» i motoren = sove i romskipet: gratis, men trangt (1 stjerne) – og mannskapet må kunne reglene for livet om bord
  liste.unshift({
    id: `${stedId}-telt`, navn: 'Sov i romskipet', stjerner: 1, telt: true,
    vurdering: 6.0, sentrumKm: 0, fasiliteter: ['Gratis', 'Trange køyer'], prisNatt: 0,
  });
  return liste;
}

// ---------- jobb ----------
/** Lønn for én jobb på stedet (høyere jo lenger ut og jo farligere det er). */
export function jobbLonn(stedId) {
  const l = landEtterId[stedId]; if (!l) return 0;
  return Math.max(200, runde10(1500 * Math.pow(l.prisniva, 1.1)));
}

// ---------- start ----------
/** Tilfeldig startsted blant stedene som ikke krever spesialutstyr (romstasjonen, Månen og Mars). */
export function tilfeldigStart(opptatt = [], stengteOverstyrt = {}) {
  const o = stengteOverstyrt || {};
  const apen = (l) => !(l.id in o ? o[l.id] : l.landId in o ? o[l.landId] : !!l.stengt);
  const start = LAND.filter((l) => l.start && apen(l));
  let valg = start.filter((l) => !opptatt.includes(l.id));
  if (!valg.length) valg = start;                                   // flere grupper enn startsteder: da deler noen startsted
  if (!valg.length) valg = LAND.filter(apen);                       // læreren har stengt alle startstedene
  return valg[Math.floor(Math.random() * valg.length)];
}
