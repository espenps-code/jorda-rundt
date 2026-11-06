// Norge rundt – prismotor for reiser, overnatting og jobb.
// Reisemåter: fly (mellom flyplasser), tog (der jernbanen henger sammen), buss (nesten overalt)
// og båt (mellom kyststeder). Billigere reiser tar lengre tid og gir flere spørsmål underveis.
// Samme søk gir samme svar samme dag (rettferdig mellom gruppene), men prisene varierer litt fra dag til dag.
import { LAND, landEtterId } from './land.js';
import { togNett } from './steder.js';

// ---------- hjelpere ----------
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(String(seed)) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const runde9 = (x) => Math.max(9, Math.round(x / 10) * 10 - 1);
const runde10 = (x) => Math.round(x / 10) * 10;
const klokke = (r, fra = 6, spenn = 15) => `${String(fra + Math.floor(r() * spenn)).padStart(2, '0')}:${String([0, 10, 15, 20, 30, 40, 45, 50][Math.floor(r() * 8)]).padStart(2, '0')}`;

export function avstandKm(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(x)));
}
export function formaterKr(n) { return Math.round(n).toLocaleString('nb-NO').replace(/,/g, ' ') + ' kr'; }
export function iLokalValuta() { return null; }   // alt er i norske kroner
export function formaterVarighet(min) { const t = Math.floor(min / 60), m = min % 60; return `${t} t ${m} min`; }

// ---------- fly ----------
export const KRAV_FLY = [2, 4, 6];               // spørsmål for direktefly / 1 stopp / 2 stopp
const FLYSELSKAP = ['Nordvind Air', 'Polarlys Air', 'Fjordfly', 'Kystflyet', 'Lundefugl Air', 'Ørneflyet'];
const KNUTEPUNKT = LAND.filter((l) => l.hub);
const OSLO = '03-oslo';
function kanFlyDirekte(a, b, km) {
  if (a.id === OSLO || b.id === OSLO) return true;     // nesten alle flyplasser har rute til Oslo
  if (a.hub && b.hub) return true;
  if (a.hub || b.hub) return km < 800;
  return km < 300;                                     // korte småflyruter
}
function besteVia(a, b, unntak = []) {
  let best = null, bestEkstra = Infinity;
  for (const h of KNUTEPUNKT) {
    if ([a.id, b.id, ...unntak].includes(h.id)) continue;
    if (avstandKm(a, h) < 120 || avstandKm(h, b) < 120) continue;
    const ekstra = avstandKm(a, h) + avstandKm(h, b) - avstandKm(a, b);
    if (ekstra < bestEkstra) { bestEkstra = ekstra; best = h; }
  }
  return best;
}
const flytidMin = (km) => Math.round(km / 650 * 60 + 30);

/** Alle reisetilbud fra ett sted til et annet i dag (fly, tog, buss, båt), billigst først. */
export function flyTilbud(fraId, tilId, dato, personer = 4) {
  const a = landEtterId[fraId], b = landEtterId[tilId];
  if (!a || !b || a.id === b.id) return [];
  const km = avstandKm(a, b);
  const tilbud = [];
  if (a.fly && b.fly && km > 120) {
    const r = rng(`fly-${fraId}-${tilId}-${dato}`);
    const dagsFaktor = 0.88 + r() * 0.27;
    const grunn = 600 + 0.7 * km;                      // Oslo–Bergen direkte ≈ 1 100 kr per person
    const ruter = [];
    if (kanFlyDirekte(a, b, km)) ruter.push({ via: [], faktor: 1.2 });
    const v1 = besteVia(a, b);
    if (v1) ruter.push({ via: [v1], faktor: 0.95 });
    const v2 = besteVia(a, b, [v1?.id]);
    if (v2 && ruter.length < 3) ruter.push({ via: [v2], faktor: 0.9 });
    ruter.forEach((rute, i) => {
      const punkter = [a, ...rute.via, b];
      let min = 0; for (let p = 0; p < punkter.length - 1; p++) min += flytidMin(avstandKm(punkter[p], punkter[p + 1]));
      min += rute.via.length * (50 + Math.floor(r() * 90));
      const prisPerPerson = runde9(grunn * rute.faktor * dagsFaktor * (0.92 + r() * 0.18));
      tilbud.push({
        id: `${fraId}-${tilId}-${dato}-${i}`, type: 'fly', selskap: FLYSELSKAP[hash(fraId + tilId + i + dato) % FLYSELSKAP.length],
        fra: a.id, til: b.id, stopp: rute.via.length, via: rute.via.map((v) => ({ id: v.id, by: v.by, navn: v.navn })),
        avgang: klokke(r), varighetMin: min, km, krav: KRAV_FLY[Math.min(rute.via.length, 2)],
        prisPerPerson, personer, totalt: prisPerPerson * personer,
      });
    });
  }
  tilbud.push(...bakkeTilbud(a, b, km, dato, personer));
  return tilbud.sort((x, y) => x.totalt - y.totalt);
}

// ---------- tog, buss og båt ----------
// Billigere enn fly, men reisen tar lengre tid – og det blir flere spørsmål underveis.
const SELSKAP = {
  tog: ['Fjordbanen', 'Dovre-ekspressen', 'Nordlandstoget', 'Fjelltoget', 'Sørlandstoget'],
  buss: ['Fjordbussen', 'Ekspressbussen Nord', 'Viddabussen', 'Kystbussen', 'Sørvestbussen'],
  bat: ['Kystruta', 'Fjordbåten', 'Nordlysruta', 'Skjærgårdsbåten', 'Hurtigbåten Vest'],
};
export const MAKS_KM = { tog: 1300, buss: 1000, bat: 1400 };
const OPPSETT = {
  //       omvei  fart km/t  pris = a + b·km           spørsmål = c + km/d
  tog: { omvei: 1.35, fart: 75, a: 200, b: 0.8, c: 2, d: 250 },
  buss: { omvei: 1.4, fart: 60, a: 150, b: 0.55, c: 3, d: 200 },
  bat: { omvei: 1.3, fart: 30, a: 200, b: 0.45, c: 3, d: 250 },
};
/** Kyststrekning: «sor» = Oslofjorden og Skagerrak-kysten (øst for Lindesnes), ellers vestkysten og nordover */
const kystsone = (l) => (l.lng > 7.3 && l.lat < 60.2 ? 'sor' : 'vest');
function bakkeTilbud(a, b, km, dato, personer) {
  const ut = [];
  const kan = { tog: togNett(a) && togNett(b), buss: true, bat: a.kyst && b.kyst };
  const prisniva = (((a.prisniva || 1) + (b.prisniva || 1)) / 2) ** 0.8;
  for (const type of ['tog', 'buss', 'bat']) {
    if (!kan[type] || km > MAKS_KM[type]) continue;
    const o = OPPSETT[type]; const r = rng(`${type}-${a.id}-${b.id}-${dato}`);
    // båt mellom Østlandet/Skagerrak og Vestlandet/nordover må rundt sørspissen av Norge
    const rundt = type === 'bat' && (kystsone(a) === 'sor') !== (kystsone(b) === 'sor');
    const veiKm = Math.round(km * (rundt ? 2.1 : o.omvei));
    const prisPerPerson = runde9((o.a + o.b * veiKm) * prisniva * (0.9 + r() * 0.2));
    ut.push({
      id: `${a.id}-${b.id}-${dato}-${type}`, type, selskap: SELSKAP[type][hash(a.id + b.id + type + dato) % SELSKAP[type].length],
      fra: a.id, til: b.id, stopp: 0, via: [], avgang: klokke(r), varighetMin: Math.round(veiKm / o.fart * 60), km: veiKm,
      krav: o.c + Math.ceil(veiKm / o.omvei / o.d), prisPerPerson, personer, totalt: prisPerPerson * personer,
    });
  }
  return ut;
}

// ---------- overnatting ----------
const NAVN = {
  lav: ['{by} Vandrerhjem', '{by} Gjestehus', 'Rorbu-utleie', 'Turisthytta', 'Sjøbua Overnatting', 'Fjellstua', 'Campinghytta {by}', 'Budget Rooms {by}'],
  mid: ['Hotel {by}', 'Kysthotellet', 'Brygga Hotell', 'Sjøhuset', 'Fjordstua Hotell', 'Stasjonshotellet', 'Nordlys Hotell', 'Hotel Fjellrose'],
  hoy: ['Grand Hotel {by}', 'Fjordhotellet', 'Hotel Panorama', 'Høyfjellshotellet', 'The Royal {by}', 'Havblikk Hotell'],
};
// De tre første gir fordeler i spillet (se hotellEffekt i js/felles.js). Resten er bare kos.
const FASILITETER = ['Frokost inkludert', 'Flyplassbuss', 'Gratis wifi', 'Badstue', 'Gangavstand til sentrum', 'Takterrasse', 'Treningsrom', 'Familierom', 'Spillrom', 'Utsikt'];
const STJERNE_PRIS = [700, 1100, 1650, 2400, 3900];   // kr per natt for et familierom
const STJERNER = [1, 2, 2, 3, 3, 3, 4, 4, 5];

/** Overnatting på stedet: 9 hoteller – og telt der allemannsretten gir gode muligheter. Pris per natt for hele gruppa. */
export function hoteller(stedId, uke = '') {
  const l = landEtterId[stedId]; if (!l) return [];
  const r = rng('hotell-' + stedId), rUke = rng('hotelluke-' + stedId + uke);
  const brukt = new Set();
  const liste = STJERNER.map((st, i) => {
    const niva = st <= 2 ? 'lav' : st >= 4 ? 'hoy' : 'mid';
    const kilde = NAVN[niva].map((m) => m.replace('{by}', l.by.split(' (')[0])).filter((m) => !brukt.has(m));
    const navn = kilde[Math.floor(r() * kilde.length)] || `Hotell ${l.by} ${i + 1}`;
    brukt.add(navn);
    const fas = FASILITETER.filter((_, k) => r() < (k < 3 ? 0.02 + st * 0.06 : 0.2 + st * 0.08)).slice(0, 4);
    const pris = Math.max(150, STJERNE_PRIS[st - 1] * Math.pow(l.prisniva, 0.85) * (0.85 + r() * 0.35) * (0.95 + rUke() * 0.1));
    return {
      id: `${stedId}-h${i}`, navn, stjerner: st,
      vurdering: +(Math.min(9.7, 5.8 + st * 0.6 + r() * 1.4)).toFixed(1),
      sentrumKm: +(0.2 + r() * (st >= 4 ? 2 : 6)).toFixed(1),
      fasiliteter: fas.length ? fas : ['Familierom'], prisNatt: runde9(pris),
    };
  }).sort((a, b) => a.prisNatt - b.prisNatt);
  if (l.telt) {
    liste.unshift({
      id: `${stedId}-telt`, navn: 'Telt i utmark (allemannsretten)', stjerner: 1, telt: true,
      vurdering: 9.0, sentrumKm: +(2 + r() * 5).toFixed(1), fasiliteter: ['Frisk luft', 'Utsikt'], prisNatt: 0,
    });
  }
  return liste;
}

// ---------- jobb ----------
/** Lønn for én jobb på stedet (litt høyere der prisnivået er høyt). */
export function jobbLonn(stedId) {
  const l = landEtterId[stedId]; if (!l) return 0;
  return Math.max(200, runde10(1500 * Math.pow(l.prisniva, 1.1)));
}

// ---------- start ----------
/** Tilfeldig startsted blant åpne steder. Overstyring kan gjelde stedet eller hele fylket. */
export function tilfeldigStart(opptatt = [], stengteOverstyrt = {}) {
  const apne = LAND.filter((l) => {
    const o = stengteOverstyrt || {};
    const stengt = l.id in o ? o[l.id] : l.landId in o ? o[l.landId] : !!l.stengt;
    return !stengt && !opptatt.includes(l.id);
  });
  return apne[Math.floor(Math.random() * apne.length)];
}
