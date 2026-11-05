// Jorda rundt – prismotor for fly, hotell og jobb.
// Alle priser beregnes ut fra ekte avstander og landets prisnivå (Norge = 1.00),
// kalibrert mot typiske billettpriser fra Norge. Samme søk gir samme svar samme dag
// (rettferdig mellom gruppene), men prisene varierer litt fra dag til dag.
import { LAND, landEtterId } from './land.js';

// ---------- hjelpere ----------
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(String(seed)) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const runde9 = (x) => Math.max(9, Math.round(x / 10) * 10 - 1);           // 2849-stil
const runde10 = (x) => Math.round(x / 10) * 10;

export function avstandKm(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(x)));
}
export function formaterKr(n) { return Math.round(n).toLocaleString('nb-NO').replace(/,/g, ' ') + ' kr'; }
export function iLokalValuta(kr, land) {
  if (!land.kurs || land.valuta === 'NOK') return null;
  const v = kr / land.kurs;
  const avrundet = v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v);
  return avrundet.toLocaleString('nb-NO') + ' ' + land.valuta;
}

// ---------- fly ----------
const SELSKAP = ['Nordvind Air', 'Globetrotter Airways', 'Albatross Airlines', 'Passat Air', 'Monsun Airways',
  'Kompass Air', 'Sirocco Air', 'Polarlys Air', 'Kolibri Express', 'Skyline Sør'];
// Knutepunkt-flyplasser (ofte en annen by enn hovedstaden). mega = store interkontinentale knutepunkt.
const HUBBY = {
  US:['New York',40.64,-73.78,1], CA:['Toronto',43.68,-79.63,0], AU:['Sydney',-33.94,151.18,0], TR:['Istanbul',41.26,28.74,1],
  AE:['Dubai',25.25,55.36,1], QA:['Doha',25.27,51.61,1], CH:['Zürich',47.46,8.55,0], BR:['São Paulo',-23.43,-46.47,0],
  ZA:['Johannesburg',-26.13,28.24,0], NZ:['Auckland',-37.01,174.79,0], VN:['Ho Chi Minh-byen',10.82,106.66,0], NG:['Lagos',6.58,3.32,0],
  MA:['Casablanca',33.37,-7.59,0], DE:['Frankfurt',50.04,8.56,1], CN:['Shanghai',31.14,121.81,1], IN:['Delhi',28.56,77.1,0],
  GB:['London',51.47,-0.45,1], FR:['Paris',49.01,2.55,1], NL:['Amsterdam',52.31,4.76,1], SG:['Singapore',1.36,103.99,1],
  HK:['Hongkong',22.31,113.91,1], JP:['Tokyo',35.55,139.78,1], KR:['Seoul',37.46,126.44,1], FI:['Helsingfors',60.32,24.96,1],
  TH:['Bangkok',13.69,100.75,1], ET:['Addis Abeba',8.98,38.8,1], EG:['Kairo',30.12,31.41,0], ES:['Madrid',40.47,-3.56,0],
  IT:['Roma',41.8,12.25,0], PA:['Panama by',9.07,-79.38,0], MX:['Mexico by',19.44,-99.07,0], SA:['Riyadh',24.96,46.7,0],
  KE:['Nairobi',-1.32,36.93,0], IS:['Reykjavík',63.99,-22.62,0], DK:['København',55.62,12.65,0], SE:['Stockholm',59.65,17.92,0],
  NO:['Oslo',60.19,11.1,0], AT:['Wien',48.11,16.57,0], PL:['Warszawa',52.17,20.97,0], IE:['Dublin',53.42,-6.27,0],
  PT:['Lisboa',38.77,-9.13,0], GR:['Athen',37.94,23.94,0], CO:['Bogotá',4.7,-74.15,0], PE:['Lima',-12.02,-77.11,0],
  CL:['Santiago',-33.39,-70.79,0], AR:['Buenos Aires',-34.82,-58.54,0], MY:['Kuala Lumpur',2.74,101.71,0], ID:['Jakarta',-6.13,106.66,0],
  PH:['Manila',14.51,121.02,0], TW:['Taipei',25.08,121.23,0],
};
const HUBS = LAND.filter((l) => HUBBY[l.id]).map((l) => {
  const [by, lat, lng, mega] = HUBBY[l.id];
  return { id: l.id, navn: l.navn, by, lat, lng, mega: !!mega };
});
const erMega = (l) => !!(HUBBY[l.id] && HUBBY[l.id][3]);

function besteVia(a, b, unntak = [], kunMega = false) {
  let best = null, bestEkstra = Infinity;
  for (const h of HUBS) {
    if (h.id === a.id || h.id === b.id || unntak.includes(h.id)) continue;
    if (kunMega && !h.mega) continue;
    if (avstandKm(a, h) < 300 || avstandKm(h, b) < 300) continue;   // ingen meningsløse småhopp
    if (avstandKm(a, h) > 14500 || avstandKm(h, b) > 14500) continue; // ingen fly kan fly så langt
    const ekstra = avstandKm(a, h) + avstandKm(h, b) - avstandKm(a, b);
    if (ekstra < bestEkstra) { bestEkstra = ekstra; best = h; }
  }
  return best;
}
function kanFlyDirekte(a, b, km) {
  if (erMega(a) && erMega(b)) return km < 14000;   // f.eks. London–Singapore
  if (erMega(a) || erMega(b)) return km < 7000;     // f.eks. Dubai–Nairobi
  if (a.hub || b.hub) return km < 4000;             // f.eks. Oslo–Madrid
  return km < 1500;
}
const flytidMin = (km) => Math.round(km / 820 * 60 + 35);

/**
 * Flytilbud fra ett land til et annet.
 * @param {string} fraId  landkode (f.eks. "NO")
 * @param {string} tilId  landkode
 * @param {string} dato   "2026-11-05" – prisene endrer seg litt fra dag til dag
 * @param {number} personer antall i gruppa
 * @returns liste med 3–5 tilbud, billigst først
 */
export function flyTilbud(fraId, tilId, dato, personer = 4) {
  const a = landEtterId[fraId], b = landEtterId[tilId];
  if (!a || !b || a.id === b.id) return [];
  const km = avstandKm(a, b);
  const r = rng(`${fraId}-${tilId}-${dato}`);
  const dagsFaktor = 0.88 + r() * 0.27;                     // 0.88–1.15
  let grunn = 450 + 0.45 * km;                              // kalibrert: Oslo–London ≈ 1000, Oslo–Bangkok ≈ 4300
  if (b.liten && !b.hub) grunn *= 1.35;                      // små øynasjoner er dyrere å fly til
  if (a.liten && !a.hub) grunn *= 1.15;

  const ruter = [];
  if (b.spesial === 'antarktis' || a.spesial === 'antarktis') {
    // Til Antarktis flyr man bare fra Punta Arenas i Chile
    if (a.id !== 'CL' && b.id !== 'CL') return [];
  }
  const langt = km > 6000;
  const antarktis = b.spesial === 'antarktis' || a.spesial === 'antarktis';
  if (antarktis || kanFlyDirekte(a, b, km)) ruter.push({ stopp: 0, via: [], faktor: 1.25 });
  if (!antarktis) {
    const v1 = besteVia(a, b, [], langt);
    if (v1) ruter.push({ stopp: 1, via: [v1], faktor: 1.0 });
    const v1b = besteVia(a, b, [v1 && v1.id], langt);
    if (v1b) ruter.push({ stopp: 1, via: [v1b], faktor: 0.95 });
    if (km > 2500 && v1) {
      // Billig variant: først et knutepunkt nær avreise, så et nær målet
      const naerMal = HUBS.filter((h) => ![a.id, b.id, v1.id].includes(h.id) && avstandKm(v1, h) > 1500 && avstandKm(v1, h) < 13500 && avstandKm(h, b) > 300)
        .sort((x, y) => avstandKm(x, b) - avstandKm(y, b))[0];
      if (naerMal && avstandKm(naerMal, b) < km * 0.6) ruter.push({ stopp: 2, via: [v1, naerMal], faktor: 0.82 });
    }
  } else if (ruter.length) {
    ruter.push({ stopp: 0, via: [], faktor: 1.0, ekstra: true });
  }

  const tilbud = ruter.map((rute, i) => {
    const sel = SELSKAP[hash(fraId + tilId + i + dato) % SELSKAP.length];
    const selFaktor = 0.92 + r() * 0.18;
    // Faktisk reisevei (med omveier via knutepunkt)
    const punkter = [a, ...rute.via, b];
    let flyMin = 0, ventMin = 0;
    for (let p = 0; p < punkter.length - 1; p++) flyMin += flytidMin(avstandKm(punkter[p], punkter[p + 1]));
    for (let s = 0; s < rute.stopp; s++) ventMin += 70 + Math.floor(r() * 170);
    const avgangTime = 6 + Math.floor(r() * 16), avgangMin = [0, 15, 30, 45][Math.floor(r() * 4)];
    const prisPerPerson = b.spesial === 'antarktis'
      ? runde9((14000 + km * 0.5) * dagsFaktor * rute.faktor * selFaktor)
      : runde9(grunn * rute.faktor * dagsFaktor * selFaktor);
    return {
      id: `${fraId}-${tilId}-${dato}-${i}`,
      selskap: sel,
      fra: a.id, til: b.id,
      stopp: rute.stopp,
      via: rute.via.map((v) => ({ id: v.id, by: v.by, navn: v.navn })),
      avgang: `${String(avgangTime).padStart(2, '0')}:${String(avgangMin).padStart(2, '0')}`,
      varighetMin: flyMin + ventMin,
      km,
      prisPerPerson,
      personer,
      totalt: prisPerPerson * personer,
    };
  });
  return tilbud.sort((x, y) => x.totalt - y.totalt);
}
export function formaterVarighet(min) { const t = Math.floor(min / 60), m = min % 60; return `${t} t ${m} min`; }

// ---------- hotell ----------
const NAVNEMAL = {
  standard: ['Hotel {by} Sentrum', '{by} Backpackers', 'Grand Hotel {by}', 'Hotel Panorama', 'City Inn {by}', 'Hotel Atlas', 'The Royal {by}', 'Budget Rooms {by}', 'Hotel Bellevue', 'Comfort Stay {by}', 'Hotel Meridian', 'Sunrise Hotel', 'Old Town Lodge', 'Hotel Kompass', 'The Globe Hotel'],
  Afrika: ['{by} Safari Lodge', 'Baobab Hotel', 'Savanna Inn', 'Hotel Kilimanjaro', 'Sunset Lodge {by}'],
  Nordafrika: ['Hotel Oasis', 'Hotel Sahara', 'Kasbah Inn', 'Palm Garden Hotel', 'Medina Lodge'],
  Asia: ['Lotus Hotel {by}', 'Bamboo Garden Inn', 'Jade Palace Hotel', 'Golden Dragon Hotel', 'Orchid Residence'],
  'Sør-Amerika': ['Pousada {by}', 'Hotel Cóndor', 'Casa Colonial', 'Hostal del Sol', 'Hotel Andes'],
  'Nord-Amerika': ['{by} Downtown Hotel', 'Maple Inn', 'Liberty Suites', 'Hotel Casa Azul', 'Harbor View Inn'],
  Europa: ['Gasthaus Zentral', 'Hotel Metropol', 'Pension Rosa', 'Hotel Europa', 'Residence Opera'],
  Oseania: ['Coral Reef Resort', 'Palm Beach Lodge', 'Lagoon Hotel', 'Reef & Rainforest Inn', 'Island Breeze Hotel'],
  Antarktis: ['Union Glacier Camp – telt', 'Polar Dome Camp', 'Pingvin Base', 'Forskningsstasjonens gjesterom', 'Iskanten Ekspedisjonsleir', 'Snøstorm Hytte', 'Sørpolen Ekspedisjonstelt', 'Isbreen Lodge', 'Keiserpingvin Camp', 'Polarnatt Kuppeltelt'],
};
const SPESIAL = { JP: ['Ryokan Sakura', 'Capsule Hotel {by}'], MA: ['Riad Jasmin', 'Riad Dar Zitoun'], TR: ['Sultan Konak Hotel'], IS: ['Nordlys Guesthouse'], MX: ['Hacienda {by}'], KE: ['Masai Mara Gate Lodge'], MV: ['Overwater Villas'], GR: ['Hotel Akropolis View'], EG: ['Pyramid View Hotel'], IN: ['Maharaja Palace Inn'], PE: ['Inka Trail Hostal'], AU: ['Outback Motel {by}'], NO: ['Fjordhotellet', 'Hytta Inn'] };
const LAV = /Backpackers|Budget|Hostal|Pension|Rooms|Guesthouse|Capsule|telt|Motel|Gasthaus|Hytta|Kasbah Inn|Hostal|Comfort Stay|City Inn|Inka Trail|Savanna Inn|Snøstorm|Forskningsstasjonens/;
const HOY = /Grand|Royal|Palace|Resort|Villas|Suites|Metropol|Sultan|Maharaja|Hacienda|Ryokan|Riad Dar|Residence|Overwater|Polar Dome|Pingvin Base|Keiserpingvin|Isbreen Lodge|Fjordhotellet|Opera|Jade|Golden Dragon|Lagoon|Bellevue|Panorama/;
function nivaa(navn) { return LAV.test(navn) ? 'lav' : HOY.test(navn) ? 'hoy' : 'mid'; }
const FASILITETER = ['Frokost inkludert', 'Basseng', 'Gratis wifi', 'Gangavstand til sentrum', 'Takterrasse', 'Treningsrom', 'Familierom', 'Flyplassbuss', 'Spillrom', 'Utsikt'];
const STJERNE_PRIS = [550, 850, 1250, 1850, 3100];   // kr per natt for et familierom i Norge
const STJERNER = [1, 2, 2, 3, 3, 3, 4, 4, 5, 5];

/** 10 hoteller i hovedstaden. Prisen er per natt for hele gruppa (familierom). */
export function hoteller(landId, uke = '') {
  const l = landEtterId[landId]; if (!l) return [];
  const r = rng('hotell-' + landId);
  const rUke = rng('hotelluke-' + landId + uke);
  const mal = l.spesial === 'antarktis' ? NAVNEMAL.Antarktis : [...(SPESIAL[landId] || []), ...(NAVNEMAL[['MA','DZ','TN','LY','EG','SD','MR'].includes(landId) ? 'Nordafrika' : l.kontinent] || []), ...NAVNEMAL.standard];
  const brukt = new Set();
  return STJERNER.map((st, i) => {
    const niva = st <= 2 ? 'lav' : st >= 4 ? 'hoy' : 'mid';
    const passer = mal.filter((m) => nivaa(m) === niva && !brukt.has(m.replace('{by}', l.by.split(' (')[0])));
    const kilde = passer.length ? passer : mal.filter((m) => !brukt.has(m.replace('{by}', l.by.split(' (')[0])));
    const navn = (kilde.length ? kilde : mal)[Math.floor(r() * (kilde.length || mal.length))].replace('{by}', l.by.split(' (')[0]);
    brukt.add(navn);
    const fas = FASILITETER.filter(() => r() < 0.2 + st * 0.08).slice(0, 4);
    const pris = Math.max(150, STJERNE_PRIS[st - 1] * Math.pow(l.prisniva, 0.85) * (0.85 + r() * 0.35) * (0.95 + rUke() * 0.1));
    return {
      id: `${landId}-h${i}`,
      navn, stjerner: st,
      vurdering: +(Math.min(9.7, 5.8 + st * 0.6 + r() * 1.4)).toFixed(1),
      sentrumKm: +(0.2 + r() * (st >= 4 ? 2 : 6)).toFixed(1),
      fasiliteter: fas.length ? fas : ['Gratis wifi'],
      prisNatt: runde9(pris),
    };
  }).sort((a, b) => a.prisNatt - b.prisNatt);
}

// ---------- jobb ----------
/** Lønn for én jobb i landet (lokalt lønnsnivå, regnet om til kroner). */
export function jobbLonn(landId) {
  const l = landEtterId[landId]; if (!l) return 0;
  return Math.max(200, runde10(1500 * Math.pow(l.prisniva, 1.1)));
}

// ---------- start ----------
/** Tilfeldig startland blant åpne land, gjerne spredt over kontinentene. */
export function tilfeldigStart(opptatt = [], stengteOverstyrt = {}) {
  const apne = LAND.filter((l) => {
    const stengt = l.id in stengteOverstyrt ? stengteOverstyrt[l.id] : !!l.stengt;
    return !stengt && !opptatt.includes(l.id) && l.spesial !== 'antarktis' && l.id !== 'NO';
  });
  return apne[Math.floor(Math.random() * apne.length)];
}
