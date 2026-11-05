// Jorda rundt – felles spillregler (brukes av elevside, lærerside, tavle og banken)
import { LAND, landEtterId, KONTINENTER } from '../data/land.js';
import { jobbLonn } from '../data/motor.js';

export const STANDARD_INNSTILLINGER = {
  startbelopPerElev: 50000, // kr per gruppemedlem ved start (gruppe på 4 = 200 000 kr)
  poengLand: 5,           // poeng per land gruppa eier
  poengKontinent: 10,     // poeng per kontinent gruppa har minst ett land på
  laasDager: 5,           // land blir låst (kan ikke utfordres) så mange dager etter erobring. 0 = aldri automatisk
  jobberPerDag: 2,        // hvor mange jobber en gruppe kan ta per dag
  quizPerDag: 3,          // hvor mange geografiquizer per dag
  quizBelop: 300,         // kr per riktig svar i geografiquiz
  duellPremie: 5000,      // kr til vinneren av en duell
  diktatMinutter: 3,      // tid elevene har på diktaten etter at læreren har åpnet den. 0 = ingen grense
  diktatBelopPerElev: 2000, // kr per gruppemedlem for 100 % på parlør-diktat (én gang per land). 0 = av
  landquizKrav: 4,        // riktige av 5 i landquiz for å låse eget land. 0 = av
  startdato: '',          // "2026-11-10"
  sluttdato: '',          // "2026-11-28" – vises som nedtelling
  pause: false,           // når true kan ingen kjøpe noe (banken avviser)
  stengte: {},            // overstyring: { "UA": false } åpner Ukraina, { "FR": true } stenger Frankrike
};

export const GRUPPEFARGER = [
  { navn: 'Rød', hex: '#E5484D' }, { navn: 'Blå', hex: '#3E63DD' }, { navn: 'Grønn', hex: '#30A46C' },
  { navn: 'Oransje', hex: '#F76B15' }, { navn: 'Lilla', hex: '#8E4EC6' }, { navn: 'Turkis', hex: '#12A594' },
  { navn: 'Rosa', hex: '#D6409F' }, { navn: 'Gul', hex: '#E2A336' }, { navn: 'Brun', hex: '#A07553' },
  { navn: 'Marine', hex: '#1E3A8A' },
  { navn: 'Himmelblå', hex: '#0090FF' }, { navn: 'Lime', hex: '#7CB518' }, { navn: 'Mørkerød', hex: '#9B1C1C' },
  { navn: 'Skogsgrønn', hex: '#166534' }, { navn: 'Fersken', hex: '#F4A261' }, { navn: 'Indigo', hex: '#4338CA' },
  { navn: 'Magenta', hex: '#A21CAF' }, { navn: 'Oliven', hex: '#6B7A1F' }, { navn: 'Petrol', hex: '#0E7490' },
  { navn: 'Korall', hex: '#FF7F6E' }, { navn: 'Lavendel', hex: '#A78BFA' }, { navn: 'Sennep', hex: '#B8860B' },
  { navn: 'Kirsebær', hex: '#BE185D' }, { navn: 'Skifer', hex: '#475569' }, { navn: 'Mint', hex: '#34D399' },
];

/** Reisenavn til automatisk opprettelse av grupper (25 stk.) */
export const GRUPPENAVN = ['Globetrotterne', 'Backpackerne', 'Oppdagerne', 'Pilotene', 'Kapteinene', 'Kartleserne', 'Navigatørene', 'Eventyrerne', 'Seilerne', 'Polfarerne',
  'Jordomseilerne', 'Interrailerne', 'Nomadene', 'Ballongfarerne', 'Vandrerne', 'Fjellklatrerne', 'Dykkerne', 'Kompassene', 'Koffertene', 'Passtemplene',
  'Boardingkortene', 'Karavanen', 'Safarigjengen', 'Ekspedisjonen', 'Jetsetterne'];

/** Startbudsjett for en gruppe = beløp per elev × antall elever */
export function startbelopFor(innstillinger, personer) { return Math.round((innstillinger.startbelopPerElev || 0) * Math.max(1, personer || 1)); }

export function innst(spill) { return { ...STANDARD_INNSTILLINGER, ...(spill?.innstillinger || {}) }; }

/** Dato i Norge som "YYYY-MM-DD" */
export function idag(d = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Oslo' }).format(d);
}
export function igaar() { return idag(new Date(Date.now() - 86400000)); }

export function erStengt(landId, innstillinger) {
  const l = landEtterId[landId]; if (!l) return true;
  const o = innstillinger?.stengte || {};
  return landId in o ? !!o[landId] : !!l.stengt;
}

/** Er et eid land låst (kan ikke lenger utfordres)? */
export function erLaast(eierskap, innstillinger, naa = Date.now()) {
  if (!eierskap) return false;
  if (eierskap.laast) return true;
  const d = innstillinger?.laasDager ?? STANDARD_INNSTILLINGER.laasDager;
  return d > 0 && naa - (eierskap.siden || 0) > d * 86400000;
}
export function laasesOm(eierskap, innstillinger, naa = Date.now()) {
  const d = innstillinger?.laasDager ?? STANDARD_INNSTILLINGER.laasDager;
  if (!eierskap || eierskap.laast || d <= 0) return null;
  return Math.max(0, (eierskap.siden || 0) + d * 86400000 - naa);
}

/** Poengtavle: liste over grupper med land, kontinenter og poeng, sortert. */
export function poengtavle(spill) {
  const i = innst(spill);
  const grupper = spill?.grupper || {};
  const eierskap = spill?.eierskap || {};
  const rader = Object.entries(grupper).map(([gid, g]) => {
    const land = Object.entries(eierskap).filter(([, e]) => e.gruppe === gid).map(([id]) => id);
    const kont = [...new Set(land.map((id) => landEtterId[id]?.kontinent).filter(Boolean))];
    return {
      gid, ...g, land, kontinenter: kont,
      poeng: land.length * i.poengLand + kont.length * i.poengKontinent,
    };
  });
  return rader.sort((a, b) => b.poeng - a.poeng || (b.saldo || 0) - (a.saldo || 0));
}

// ---------- tilfeldighet med frø (lik på elevside og i banken) ----------
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(String(seed)) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const velg = (r, liste) => liste[Math.floor(r() * liste.length)];
function stokk(r, liste) { const a = [...liste]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- jobb ----------
const JOBBER = [
  { tittel: 'Selger suvenirer på markedet', ting: 'nøkkelringer', ting2: 'postkort' },
  { tittel: 'Servitør på en kafé', ting: 'kaffe', ting2: 'kaker' },
  { tittel: 'Guide for turister', ting: 'billetter til byvandring', ting2: 'kart' },
  { tittel: 'Fruktplukker på en gård', ting: 'kurver med frukt', ting2: 'flasker juice' },
  { tittel: 'Hjelper i en bokhandel', ting: 'bøker', ting2: 'blader' },
  { tittel: 'Assistent på et museum', ting: 'inngangsbilletter', ting2: 'plakater' },
  { tittel: 'Iskremselger på stranda', ting: 'iskremer', ting2: 'brus' },
  { tittel: 'Hjelper på et sykkelutleie', ting: 'sykkelturer', ting2: 'hjelmer' },
];

/**
 * Lager en jobb med 3 regneoppgaver i lokal valuta. Samme frø gir samme jobb (banken sjekker svarene).
 * Lønna utbetales etter hvor mange som er riktige.
 */
export function lagJobb(landId, fro) {
  const l = landEtterId[landId];
  const r = rng(`jobb-${landId}-${fro}`);
  const j = velg(r, JOBBER);
  const kurs = l.kurs && l.valuta !== 'NOK' ? l.kurs : 1;
  const valuta = kurs === 1 ? 'kr' : l.valuta;
  // en "pen" pris i lokal valuta, tilsvarende 20–90 kr
  const pen = (kr) => { const v = kr / kurs; const steg = v > 5000 ? 1000 : v > 500 ? 50 : v > 50 ? 5 : 1; return Math.max(steg, Math.round(v / steg) * steg); };
  const p1 = pen(20 + r() * 70), p2 = pen(20 + r() * 70);
  const a1 = 3 + Math.floor(r() * 7), a2 = 2 + Math.floor(r() * 5);
  const betalt = Math.ceil((p1 * a2) / (p1 >= 1000 ? 10000 : p1 >= 100 ? 1000 : 100)) * (p1 >= 1000 ? 10000 : p1 >= 100 ? 1000 : 100);
  const fmt = (n) => n.toLocaleString('nb-NO');
  return {
    tittel: j.tittel,
    lonn: jobbLonn(landId),
    oppgaver: [
      { tekst: `Du selger ${a1} ${j.ting}. Én koster ${fmt(p1)} ${valuta}. Hvor mye får du til sammen?`, svar: a1 * p1, enhet: valuta },
      { tekst: `En kunde kjøper ${a2} ${j.ting} til ${fmt(p1)} ${valuta} stykket og betaler med ${fmt(betalt)} ${valuta}. Hvor mye skal kunden få tilbake?`, svar: betalt - a2 * p1, enhet: valuta },
      { tekst: `Du selger ${a1} ${j.ting} til ${fmt(p1)} ${valuta} og ${a2} ${j.ting2} til ${fmt(p2)} ${valuta}. Hvor mye tjente butikken i alt?`, svar: a1 * p1 + a2 * p2, enhet: valuta },
    ],
  };
}
export function rettJobb(landId, fro, svar = []) {
  const jobb = lagJobb(landId, fro);
  const riktige = jobb.oppgaver.filter((o, i) => Number(String(svar[i] ?? '').replace(/\s/g, '').replace(',', '.')) === o.svar).length;
  return { riktige, antall: jobb.oppgaver.length, utbetaling: Math.round(jobb.lonn * riktige / jobb.oppgaver.length / 10) * 10 };
}

// ---------- geografiquiz ----------
const QUIZLAND = LAND.filter((l) => l.spesial !== 'antarktis');
export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['hovedstad', 'flagg', 'kontinent', 'nord', 'hovedstad', 'flagg', 'land']);
  for (let n = 0; n < antall; n++) {
    const type = typer[n % typer.length];
    const fasit = velg(r, QUIZLAND);
    const andre = stokk(r, QUIZLAND.filter((l) => l.id !== fasit.id)).slice(0, 3);
    if (type === 'hovedstad') {
      spm.push({ tekst: `Hva er hovedstaden i ${fasit.navn}?`, valg: stokk(r, [fasit, ...andre].map((l) => l.by)), svar: fasit.by });
    } else if (type === 'land') {
      spm.push({ tekst: `${fasit.by} er hovedstaden i hvilket land?`, valg: stokk(r, [fasit, ...andre].map((l) => l.navn)), svar: fasit.navn });
    } else if (type === 'flagg') {
      spm.push({ tekst: `Hvilket land har dette flagget?`, stort: fasit.flagg, valg: stokk(r, [fasit, ...andre].map((l) => l.navn)), svar: fasit.navn });
    } else if (type === 'kontinent') {
      const k = KONTINENTER.filter((x) => x !== 'Antarktis' && x !== fasit.kontinent);
      spm.push({ tekst: `Hvilket kontinent ligger ${fasit.navn} i?`, valg: stokk(r, [fasit.kontinent, ...stokk(r, k).slice(0, 3)]), svar: fasit.kontinent });
    } else {
      const tre = [fasit, ...andre.slice(0, 2)].sort((a, b) => b.lat - a.lat);
      if (tre[0].lat - tre[1].lat < 3) { n--; continue; }
      spm.push({ tekst: `Hvilken hovedstad ligger lengst nord?`, valg: stokk(r, tre.map((l) => `${l.by} (${l.navn})`)), svar: `${tre[0].by} (${tre[0].navn})` });
    }
  }
  return spm;
}
export function rettQuiz(fro, svar = []) {
  const q = lagQuiz(fro);
  return { riktige: q.filter((s, i) => svar[i] === s.svar).length, antall: q.length };
}

// ---------- landquiz (låser et land gruppa eier) ----------
function avstand(a, b) { const r = Math.PI / 180; const x = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); }
export function lagLandquiz(landId, fro) {
  const l = landEtterId[landId];
  const r = rng(`landquiz-${landId}-${fro}`);
  const andre = QUIZLAND.filter((x) => x.id !== landId);
  const samme = stokk(r, andre.filter((x) => x.kontinent === l.kontinent));
  const tre = (liste) => stokk(r, liste.length >= 3 ? liste : [...liste, ...stokk(r, andre)]).slice(0, 3);
  const spm = [];
  if (l.spesial === 'antarktis') {
    spm.push({ tekst: 'Hvilket dyr lever IKKE naturlig i Antarktis?', valg: stokk(r, ['Isbjørn', 'Keiserpingvin', 'Leopardsel', 'Blåhval']), svar: 'Isbjørn' });
    spm.push({ tekst: 'Hva er det meste av Antarktis dekket av?', valg: stokk(r, ['Is', 'Sand', 'Skog', 'Gress']), svar: 'Is' });
    spm.push({ tekst: 'Hvem kom først til Sørpolen i 1911?', valg: stokk(r, ['Roald Amundsen', 'Fridtjof Nansen', 'Thor Heyerdahl', 'Christopher Columbus']), svar: 'Roald Amundsen' });
  } else {
  spm.push({ tekst: `Hva er hovedstaden i ${l.navn}?`, valg: stokk(r, [l.by, ...tre(samme).map((x) => x.by)]), svar: l.by });
  spm.push({ tekst: `Hvilket flagg er flagget til ${l.navn}?`, flagg: true, valg: stokk(r, [l.flagg, ...tre(samme).map((x) => x.flagg)]), svar: l.flagg });
  const k = KONTINENTER.filter((x) => x !== 'Antarktis' && x !== l.kontinent);
  if (l.spesial !== 'antarktis') spm.push({ tekst: `Hvilket kontinent ligger ${l.navn} i?`, valg: stokk(r, [l.kontinent, ...stokk(r, k).slice(0, 3)]), svar: l.kontinent });
  if (l.valutaNavn && l.valutaNavn !== l.valuta) {
    const valutaer = [...new Set(QUIZLAND.filter((x) => x.valutaNavn && x.valutaNavn !== x.valuta && x.valutaNavn !== l.valutaNavn).map((x) => x.valutaNavn))];
    spm.push({ tekst: `Hvilken valuta bruker de i ${l.navn}?`, valg: stokk(r, [l.valutaNavn, ...stokk(r, valutaer).slice(0, 3)]), svar: l.valutaNavn });
  }
  }
  const sortert = andre.map((x) => ({ x, d: avstand(l, x) })).sort((a, b) => a.d - b.d);
  const naer = sortert[Math.floor(r() * 3)].x;
  const fjerne = stokk(r, sortert.slice(15, 80)).slice(0, 3).map((o) => o.x);
  spm.push({ tekst: `Hvilket av disse landene ligger nærmest ${l.navn}?`, valg: stokk(r, [naer, ...fjerne].map((x) => x.navn)), svar: naer.navn });
  const oslo = landEtterId.NO;
  if (spm.length < 5 && landId !== 'NO') {
    const km = Math.round(avstand(oslo, l) / 500) * 500;
    const alt = [km, km + 1500, Math.max(500, km - 1500), km + 3500].map((v) => `ca. ${v.toLocaleString('nb-NO')} km`);
    spm.push({ tekst: `Omtrent hvor langt er det i luftlinje fra Oslo til ${l.by}?`, valg: stokk(r, [...new Set(alt)]), svar: alt[0] });
  }
  return spm.slice(0, 5);
}
export function rettLandquiz(landId, fro, svar = []) {
  const q = lagLandquiz(landId, fro);
  return { riktige: q.filter((s, i) => svar[i] === s.svar).length, antall: q.length };
}

export function formaterKr(n) { return Math.round(n || 0).toLocaleString('nb-NO').replace(/,/g, ' ') + ' kr'; }
export function nyId(lengde = 8) { const t = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const a = crypto.getRandomValues(new Uint8Array(lengde)); for (const x of a) s += t[x % t.length]; return s; }
export { LAND, landEtterId, KONTINENTER };
