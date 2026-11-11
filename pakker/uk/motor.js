// Across the UK – price engine for travel, places to stay and jobs. All prices are in pounds (£).
// Ways to travel: plane (between airports), train, coach (long-distance bus) and ferry (across the Irish Sea to Northern Ireland).
// Cheaper trips take longer – and give more questions on the way.
// The same search gives the same answer on the same day (fair between the groups), but prices change a little from day to day.
import { LAND, landEtterId } from './land.js';

// ---------- helpers ----------
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(String(seed)) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const pris9 = (x) => Math.max(5, Math.round(x) - (Math.round(x) % 10 === 0 ? 1 : 0));    // £39-style prices
const klokke = (r, fra = 6, spenn = 15) => `${String(fra + Math.floor(r() * spenn)).padStart(2, '0')}:${String([0, 10, 15, 20, 30, 40, 45, 50][Math.floor(r() * 8)]).padStart(2, '0')}`;

/** Distance in km (the engine shows it in miles – see enheter in pakke.js) */
export function avstandKm(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(x)));
}
export function formaterKr(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }
export function iLokalValuta() { return null; }   // everything is in pounds
export function formaterVarighet(min) { const t = Math.floor(min / 60), m = min % 60; return `${t} h ${m} min`; }

// ---------- planes ----------
export const KRAV_FLY = [2, 4, 6];               // questions for a direct flight / 1 stop / 2 stops
const FLYSELSKAP = ['Union Jack Air', 'Highland Airways', 'Red Kite Air', 'Thistle Air', 'Channel Wings', 'Puffin Express'];
const KNUTEPUNKT = LAND.filter((l) => l.hub);
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
const flytidMin = (km) => Math.round(km / 600 * 60 + 35);

/** All trips from one place to another today (plane, train, coach, ferry), cheapest first. */
export function flyTilbud(fraId, tilId, dato, personer = 4) {
  const a = landEtterId[fraId], b = landEtterId[tilId];
  if (!a || !b || a.id === b.id) return [];
  const km = avstandKm(a, b);
  const tilbud = [];
  if (a.fly && b.fly && km > 200) {
    const r = rng(`fly-${fraId}-${tilId}-${dato}`);
    const dagsFaktor = 0.88 + r() * 0.27;
    const grunn = 35 + 0.09 * km;                      // London–Edinburgh direct ≈ £100 per person
    const ruter = [];
    if (a.hub || b.hub || a.irland !== b.irland) ruter.push({ via: [], faktor: 1.25 });
    const v1 = besteVia(a, b);
    if (v1) ruter.push({ via: [v1], faktor: 0.95 });
    ruter.forEach((rute, i) => {
      const punkter = [a, ...rute.via, b];
      let min = 0; for (let p = 0; p < punkter.length - 1; p++) min += flytidMin(avstandKm(punkter[p], punkter[p + 1]));
      min += rute.via.length * (50 + Math.floor(r() * 90));
      const prisPerPerson = pris9(grunn * rute.faktor * dagsFaktor * (0.92 + r() * 0.18));
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

// ---------- train, coach and ferry ----------
// Trains in the UK are fast but expensive. Coaches are slow but cheap. To Northern Ireland you must cross the Irish Sea:
// by plane, or by ferry (the price includes the coach to and from the ferry).
const SELSKAP = {
  tog: ['Great Northern Rail', 'Flying Scotsman Rail', 'West Coast Express', 'Celtic Rail', 'Pennine Railways'],
  buss: ['Royal Coaches', 'Megaroad Coach', 'Britannia Coaches', 'Highland Coach Lines'],
  bat: ['Irish Sea Ferries', 'Emerald Line Ferries'],
};
export const MAKS_KM = { tog: 1400, buss: 1400, bat: 1400 };
const OPPSETT = {
  //       detour  speed km/h  price = a + b·km         questions = c + km/d
  tog: { omvei: 1.25, fart: 135, a: 14, b: 0.13, c: 2, d: 250 },
  buss: { omvei: 1.3, fart: 65, a: 6, b: 0.035, c: 3, d: 150 },
  bat: { omvei: 1.35, fart: 55, a: 38, b: 0.04, c: 4, d: 200 },
};
function bakkeTilbud(a, b, km, dato, personer) {
  const ut = [];
  const sammeOy = a.irland === b.irland;
  const kan = { tog: sammeOy && (!a.irland || (a.id !== 'TLN-enniskillen' && b.id !== 'TLN-enniskillen')), buss: sammeOy, bat: !sammeOy };
  for (const type of ['tog', 'buss', 'bat']) {
    if (!kan[type]) continue;
    const o = OPPSETT[type]; const r = rng(`${type}-${a.id}-${b.id}-${dato}`);
    const veiKm = Math.round(km * o.omvei);
    const prisPerPerson = pris9((o.a + o.b * veiKm) * (0.9 + r() * 0.2));
    ut.push({
      id: `${a.id}-${b.id}-${dato}-${type}`, type, selskap: SELSKAP[type][hash(a.id + b.id + type + dato) % SELSKAP[type].length],
      fra: a.id, til: b.id, stopp: 0, via: [], avgang: klokke(r), varighetMin: Math.round(veiKm / o.fart * 60) + (type === 'bat' ? 150 : 0), km: veiKm,
      krav: o.c + Math.ceil(km / o.d), prisPerPerson, personer, totalt: prisPerPerson * personer,
    });
  }
  return ut;
}

// ---------- places to stay ----------
const NAVN = {
  lav: ['{by} Youth Hostel', '{by} Backpackers', 'The Sleepy Sheep Hostel', 'Budget Rooms {by}', 'Mrs Brown\'s Bed & Breakfast', 'The Old Station Hostel', 'Seagull Guest House', 'Travellers\' Rest'],
  mid: ['The {by} Inn', 'The Red Lion Hotel', 'Rose & Crown Inn', 'The King\'s Arms', 'Bridge Street Hotel', 'The White Hart', 'Station Hotel {by}', 'The Old Mill Hotel'],
  hoy: ['Grand Hotel {by}', 'The Royal {by}', 'The Duke\'s Manor', 'Castle View Hotel', 'The Queen\'s Hotel', 'Thistle & Crown Hotel'],
};
// The first three give bonuses in the game (see fasiliteter in pakke.js). The rest are just nice to have.
const FASILITETER = ['Breakfast included', 'Airport shuttle', 'Free Wi-Fi', 'Tea and biscuits', 'Walk to the city centre', 'Garden', 'Gym', 'Family room', 'Games room', 'Great view'];
const STJERNE_PRIS = [45, 70, 105, 150, 260];        // pounds per night for a family room
const STJERNER = [1, 2, 2, 3, 3, 3, 4, 4, 5];

/** Places to stay: 9 hotels – and wild camping near some places in Scotland. Price per night for the whole group. */
export function hoteller(stedId, uke = '') {
  const l = landEtterId[stedId]; if (!l) return [];
  const r = rng('hotell-' + stedId), rUke = rng('hotelluke-' + stedId + uke);
  const brukt = new Set();
  const kort = l.by.split('/')[0];
  const liste = STJERNER.map((st, i) => {
    const niva = st <= 2 ? 'lav' : st >= 4 ? 'hoy' : 'mid';
    const kilde = NAVN[niva].map((m) => m.replace('{by}', kort)).filter((m) => !brukt.has(m));
    const navn = kilde[Math.floor(r() * kilde.length)] || `Hotel ${kort} ${i + 1}`;
    brukt.add(navn);
    const fas = FASILITETER.filter((_, k) => r() < (k < 3 ? 0.02 + st * 0.06 : 0.2 + st * 0.08)).slice(0, 4);
    const pris = Math.max(12, STJERNE_PRIS[st - 1] * Math.pow(l.prisniva, 0.85) * (0.85 + r() * 0.35) * (0.95 + rUke() * 0.1));
    return {
      id: `${stedId}-h${i}`, navn, stjerner: st,
      vurdering: +(Math.min(9.7, 5.8 + st * 0.6 + r() * 1.4)).toFixed(1),
      sentrumKm: +(0.2 + r() * (st >= 4 ? 2 : 6)).toFixed(1),
      fasiliteter: fas.length ? fas : ['Family room'], prisNatt: pris9(pris),
    };
  }).sort((x, y) => x.prisNatt - y.prisNatt);
  if (l.telt) {
    liste.unshift({
      id: `${stedId}-telt`, navn: 'Wild camping in the Highlands', stjerner: 1, telt: true,
      vurdering: 9.0, sentrumKm: +(4 + r() * 12).toFixed(1), fasiliteter: ['Fresh air', 'Great view'], prisNatt: 0,
    });
  }
  return liste;
}

// ---------- jobs ----------
/** Pay for one job in the place (a little higher where everything is expensive). */
export function jobbLonn(stedId) {
  const l = landEtterId[stedId]; if (!l) return 0;
  return Math.max(15, Math.round(120 * Math.pow(l.prisniva, 1.1) / 5) * 5);
}

// ---------- start ----------
/** Random starting place among the open places. An override can be for the place or for the whole region. */
export function tilfeldigStart(opptatt = [], stengteOverstyrt = {}) {
  const apne = LAND.filter((l) => {
    const o = stengteOverstyrt || {};
    const stengt = l.id in o ? o[l.id] : l.landId in o ? o[l.landId] : !!l.stengt;
    return !stengt && !opptatt.includes(l.id);
  });
  return apne[Math.floor(Math.random() * apne.length)];
}
