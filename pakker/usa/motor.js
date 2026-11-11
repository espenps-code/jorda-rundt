// Across America – price engine for travel, places to stay and jobs. All prices are in US dollars.
// Ways to travel: plane (fast, expensive), train (only where there are passenger trains) and bus (cheap, slow).
// Cheaper trips take longer – and give more questions on the way.
// The same search gives the same answer on the same day (fair between the groups), but prices change a little from day to day.
import { LAND, landEtterId } from './land.js';

// ---------- helpers ----------
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(String(seed)) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const pris9 = (x) => Math.max(9, Math.round(x / 10) * 10 - 1);            // $149-style prices
const klokke = (r, fra = 6, spenn = 15) => { const t = fra + Math.floor(r() * spenn), m = [0, 10, 15, 20, 30, 40, 45, 50][Math.floor(r() * 8)]; return `${((t + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${t < 12 ? 'AM' : 'PM'}`; };

/** Distance in km (the engine shows it in miles – see enheter in pakke.js) */
export function avstandKm(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(x)));
}
export function formaterKr(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
export function iLokalValuta() { return null; }   // everything is in dollars
export function formaterVarighet(min) { const t = Math.floor(min / 60), m = min % 60; return `${t} h ${m} min`; }

// ---------- planes ----------
export const KRAV_FLY = [2, 4, 6];               // questions for a direct flight / 1 stop / 2 stops
const FLYSELSKAP = ['Liberty Air', 'Bald Eagle Airways', 'Stars & Stripes Air', 'Route 66 Airlines', 'Canyon Air', 'Great Lakes Airways', 'Sunbelt Express', 'Redwood Air'];
const KNUTEPUNKT = LAND.filter((l) => l.hub);
function kanFlyDirekte(a, b, km) {
  if (a.oy || b.oy) return (a.oy ? b : a).hub && ['CA', 'WA', 'OR', 'NV', 'AZ', 'UT', 'CO', 'IL', 'TX'].includes((a.oy ? b : a).id);  // Alaska and Hawaii: direct only from big airports in the west (and Chicago/Houston)
  if (a.mega && b.mega) return true;               // e.g. New York – Los Angeles
  if (a.mega || b.mega) return km < 3200;
  if (a.hub && b.hub) return km < 2600;
  if (a.hub || b.hub) return km < 1500;
  return km < 650;                                 // short hops between small airports
}
function besteVia(a, b, unntak = []) {
  let best = null, bestEkstra = Infinity;
  const tilOy = a.oy || b.oy;
  for (const h of KNUTEPUNKT) {
    if ([a.id, b.id, ...unntak].includes(h.id)) continue;
    if (tilOy && !['CA', 'WA'].includes(h.id)) continue;       // to Alaska and Hawaii you change planes on the west coast
    if (avstandKm(a, h) < 250 || avstandKm(h, b) < 250) continue;
    const ekstra = avstandKm(a, h) + avstandKm(h, b) - avstandKm(a, b);
    if (ekstra < bestEkstra) { bestEkstra = ekstra; best = h; }
  }
  return best;
}
const flytidMin = (km) => Math.round(km / 800 * 60 + 35);

/** All trips from one state to another today (plane, train, bus), cheapest first. */
export function flyTilbud(fraId, tilId, dato, personer = 4) {
  const a = landEtterId[fraId], b = landEtterId[tilId];
  if (!a || !b || a.id === b.id) return [];
  const km = avstandKm(a, b);
  const tilbud = [];
  if (km > 150) {
    const r = rng(`fly-${fraId}-${tilId}-${dato}`);
    const dagsFaktor = 0.88 + r() * 0.27;                     // 0.88–1.15
    let grunn = 70 + 0.075 * km;                              // New York–Chicago ≈ $155, New York–Los Angeles ≈ $365 per person (with one stop)
    if (a.oy || b.oy) grunn *= 1.2;
    if (!a.hub && !b.hub) grunn *= 1.1;                       // small airports are a bit more expensive
    const ruter = [];
    if (kanFlyDirekte(a, b, km)) ruter.push({ via: [], faktor: 1.25 });
    const v1 = besteVia(a, b);
    if (v1) ruter.push({ via: [v1], faktor: 1.0 });
    const v2 = besteVia(a, b, [v1?.id]);
    if (v2 && ruter.length < 3) ruter.push({ via: [v2], faktor: 0.93 });
    if (km > 2800 && v1 && !(a.oy || b.oy)) {
      // cheapest: first a hub near the start, then one near the destination
      const naerMal = KNUTEPUNKT.filter((h) => ![a.id, b.id, v1.id].includes(h.id) && avstandKm(v1, h) > 600 && avstandKm(h, b) > 250).sort((x, y) => avstandKm(x, b) - avstandKm(y, b))[0];
      if (naerMal && avstandKm(naerMal, b) < km * 0.5) ruter.push({ via: [v1, naerMal], faktor: 0.82 });
    }
    ruter.forEach((rute, i) => {
      const punkter = [a, ...rute.via, b];
      let min = 0; for (let p = 0; p < punkter.length - 1; p++) min += flytidMin(avstandKm(punkter[p], punkter[p + 1]));
      min += rute.via.length * (50 + Math.floor(r() * 110));
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

// ---------- train and bus ----------
// Cheaper than flying, but the trip takes longer – and there are more questions on the way.
const SELSKAP = {
  tog: ['Coast Starlight Rail', 'Prairie Express', 'Lakeshore Rail', 'Sunset Rail', 'Empire Rail', 'Mountain Zephyr'],
  buss: ['Silver Hound Bus', 'Highway Express', 'Roadrunner Bus', 'Freeway Lines', 'Blue Ridge Coaches'],
};
export const MAKS_KM = { tog: 2600, buss: 2000 };
const OPPSETT = {
  //       detour  speed km/h  price = a + b·km          questions = c + km/d
  tog: { omvei: 1.3, fart: 85, a: 25, b: 0.055, c: 2, d: 450 },
  buss: { omvei: 1.25, fart: 75, a: 15, b: 0.04, c: 3, d: 350 },
};
function bakkeTilbud(a, b, km, dato, personer) {
  const ut = [];
  const kan = { tog: a.tog && b.tog, buss: !a.oy && !b.oy };
  for (const type of ['tog', 'buss']) {
    if (!kan[type] || km > MAKS_KM[type]) continue;
    const o = OPPSETT[type]; const r = rng(`${type}-${a.id}-${b.id}-${dato}`);
    const veiKm = Math.round(km * o.omvei);
    const prisPerPerson = pris9((o.a + o.b * veiKm) * (0.9 + r() * 0.2));
    ut.push({
      id: `${a.id}-${b.id}-${dato}-${type}`, type, selskap: SELSKAP[type][hash(a.id + b.id + type + dato) % SELSKAP[type].length],
      fra: a.id, til: b.id, stopp: 0, via: [], avgang: klokke(r), varighetMin: Math.round(veiKm / o.fart * 60), km: veiKm,
      krav: o.c + Math.ceil(km / o.d), prisPerPerson, personer, totalt: prisPerPerson * personer,
    });
  }
  return ut;
}

// ---------- places to stay ----------
const NAVN = {
  lav: ['{by} Motel', 'Budget Inn {by}', 'Roadside Motel', 'Route 66 Motel', 'Backpackers Hostel {by}', 'Sleep Easy Inn', 'Starlight Motel', 'Trailside Cabins'],
  mid: ['{by} Downtown Hotel', 'Maple Inn', 'Harbor View Inn', 'Main Street Hotel', 'Lakeside Lodge', 'Prairie Inn', 'Hotel Liberty', 'Riverwalk Hotel'],
  hoy: ['Grand Hotel {by}', 'The {by} Plaza', 'Liberty Suites', 'Skyline Tower Hotel', 'The Presidential', 'Golden Eagle Resort'],
};
// The first three give bonuses in the game (see fasiliteter in pakke.js). The rest are just nice to have.
const FASILITETER = ['Free breakfast', 'Airport shuttle', 'Free Wi-Fi', 'Pool', 'Walk to downtown', 'Rooftop terrace', 'Gym', 'Family room', 'Game room', 'Great view'];
const STJERNE_PRIS = [55, 85, 130, 190, 320];        // dollars per night for a family room (US average)
const STJERNER = [1, 2, 2, 3, 3, 3, 4, 4, 5];

/** Places to stay in the city: 9 hotels – and camping where there is public land nearby. Price per night for the whole group. */
export function hoteller(stedId, uke = '') {
  const l = landEtterId[stedId]; if (!l) return [];
  const r = rng('hotell-' + stedId), rUke = rng('hotelluke-' + stedId + uke);
  const brukt = new Set();
  const liste = STJERNER.map((st, i) => {
    const niva = st <= 2 ? 'lav' : st >= 4 ? 'hoy' : 'mid';
    const kilde = NAVN[niva].map((m) => m.replace('{by}', l.by)).filter((m) => !brukt.has(m));
    const navn = kilde[Math.floor(r() * kilde.length)] || `Hotel ${l.by} ${i + 1}`;
    brukt.add(navn);
    const fas = FASILITETER.filter((_, k) => r() < (k < 3 ? 0.02 + st * 0.06 : 0.2 + st * 0.08)).slice(0, 4);
    const pris = Math.max(15, STJERNE_PRIS[st - 1] * Math.pow(l.prisniva, 0.85) * (0.85 + r() * 0.35) * (0.95 + rUke() * 0.1));
    return {
      id: `${stedId}-h${i}`, navn, stjerner: st,
      vurdering: +(Math.min(9.7, 5.8 + st * 0.6 + r() * 1.4)).toFixed(1),
      sentrumKm: +(0.3 + r() * (st >= 4 ? 3 : 9)).toFixed(1),
      fasiliteter: fas.length ? fas : ['Family room'], prisNatt: Math.round(pris) - (Math.round(pris) % 10 === 0 ? 1 : 0),
    };
  }).sort((x, y) => x.prisNatt - y.prisNatt);
  if (l.telt) {
    liste.unshift({
      id: `${stedId}-telt`, navn: 'Tent on public land (Leave No Trace)', stjerner: 1, telt: true,
      vurdering: 9.0, sentrumKm: +(8 + r() * 30).toFixed(1), fasiliteter: ['Fresh air', 'Great view'], prisNatt: 0,
    });
  }
  return liste;
}

// ---------- jobs ----------
/** Pay for one job in the state (a little higher where everything is expensive). */
export function jobbLonn(stedId) {
  const l = landEtterId[stedId]; if (!l) return 0;
  return Math.max(20, Math.round(150 * Math.pow(l.prisniva, 1.1) / 5) * 5);
}

// ---------- start ----------
/** Random starting state among the open states (not Alaska or Hawaii – they are hard to leave). */
export function tilfeldigStart(opptatt = [], stengteOverstyrt = {}) {
  const apne = LAND.filter((l) => {
    const o = stengteOverstyrt || {};
    const stengt = l.id in o ? o[l.id] : !!l.stengt;
    return !stengt && !opptatt.includes(l.id) && !l.oy;
  });
  return apne[Math.floor(Math.random() * apne.length)];
}
