// MOTOREN – felles spillregler for alle spillpakkene (brukes av elevside, lærerside, tavle og banken).
// Det som er spesielt for hvert spill (steder, poeng, quiz, standardverdier) ligger i pakker/<spill>/.
// «#pakke/» peker på spillpakken som er valgt (se js/pakke.js og functions/kopier.mjs).
import { LAND, landEtterId, KONTINENTER, LANDENE, landInfo, landKode, byerILand } from '#pakke/land.js';
import { jobbLonn } from '#pakke/motor.js';
import { PAKKE } from '#pakke/pakke.js';
import * as REGLER from '#pakke/regler.js';
import { rng, velg, stokk } from './tilfeldig.js';
import { DUELLER } from '../data/dueller.js';

export const STANDARD_INNSTILLINGER = {
  startbelopPerElev: 50000, // kr per gruppemedlem ved start (overstyres av spillpakken)
  laasDager: 5,           // land er åpne for duell så mange dager etter erobring, så blir de låst. 0 = aldri automatisk
  jobberPerDag: 2,        // hvor mange jobber en gruppe kan ta per dag
  quizPerDag: 3,          // hvor mange geografiquizer per dag
  quizBelop: 300,         // kr per riktig svar i geografiquiz
  duellPremie: 5000,      // kr til vinneren av en duell
  diktatMinutter: 3,      // tid elevene har på diktaten etter at læreren har åpnet den. 0 = ingen grense
  diktatBelopPerElev: 2000, // kr per gruppemedlem for 100 % på parlør-diktat (én gang per land). 0 = av
  startdato: '',          // "2026-11-10"
  sluttdato: '',          // "2026-11-28" – vises som nedtelling
  pause: false,           // når true kan ingen kjøpe noe (banken avviser)
  duellUtvalg: 'standard', // hvilke dueller som trekkes: 'standard' | 'begge' (standard + lærerens egne) | 'egne'
  stengte: {},            // overstyring: { "UA": false } åpner Ukraina, { "FR-nice": true } stenger bare Nice
  ...REGLER.STANDARD,     // spillpakkens egne standardverdier (startbeløp, poeng …)
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

export function innst(spill) {
  const i = { ...STANDARD_INNSTILLINGER, ...(spill?.innstillinger || {}) };
  if (PAKKE.diktat === false) i.diktatBelopPerElev = 0; // diktat av – gjelder også spill som er laget før den ble tatt bort
  return i;
}

/** Dato i Norge som "YYYY-MM-DD" */
export function idag(d = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Oslo' }).format(d);
}
export function igaar() { return idag(new Date(Date.now() - 86400000)); }

/** Er et sted stengt? Overstyring kan gjelde stedet («FR-nice») eller hele regionen/landet («FR»). */
export function erStengt(stedId, innstillinger) {
  const l = landEtterId[stedId]; if (!l) return true;
  const o = innstillinger?.stengte || {};
  if (stedId in o) return !!o[stedId];
  if (l.landId in o) return !!o[l.landId];
  return !!l.stengt;
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
/** Nedtelling som tekst: «4 d 13 t», «5 t 12 min», «42 min». */
export function nedtelling(ms) {
  const min = Math.max(0, Math.ceil(ms / 60000));
  const d = Math.floor(min / 1440), t = Math.floor((min % 1440) / 60), m = min % 60;
  if (d) return `${d} d ${t} t`;
  if (t) return `${t} t ${m} min`;
  return `${m} min`;
}
/** Tidspunkt (ms) når et land låses, eller null. Brukes som data-laas-ved for levende nedtelling. */
export function laasesVed(eierskap, innstillinger) {
  const d = innstillinger?.laasDager ?? STANDARD_INNSTILLINGER.laasDager;
  if (!eierskap || eierskap.laast || d <= 0) return null;
  return (eierskap.siden || 0) + d * 86400000;
}
/** Oppdaterer alle [data-laas-ved]-elementer på siden. */
export function oppdaterNedtellinger(rot = document) {
  for (const el of rot.querySelectorAll('[data-laas-ved]')) {
    const ms = Number(el.dataset.laasVed) - Date.now();
    el.textContent = ms > 0 ? (el.dataset.forTekst || '') + nedtelling(ms) : (el.dataset.ferdigTekst || 'Låst');
  }
}

/** Poengtavle: grupper med steder og poeng, sortert. Hvordan poengene regnes ut, bestemmer spillpakken. */
export function poengtavle(spill) {
  const i = innst(spill);
  const grupper = spill?.grupper || {};
  const eierskap = spill?.eierskap || {};
  const rader = Object.entries(grupper).map(([gid, g]) => ({ gid, ...g, ...REGLER.poengForGruppe(gid, eierskap, i, erStengt) }));
  return rader.sort((a, b) => b.poeng - a.poeng || (b.saldo || 0) - (a.saldo || 0));
}
export const heltLandBonus = (n, i) => REGLER.heltLandBonus(n, { ...STANDARD_INNSTILLINGER, ...(i || {}) });
export const POENGFELT = REGLER.POENGFELT;

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

// ---------- geografiquiz (spørsmålene lages av spillpakken) ----------
export const lagQuiz = REGLER.lagQuiz;
// ---------- telt med allemannsretten (bare spillpakker som har det, f.eks. Norge rundt) ----------
export const teltQuiz = REGLER.teltQuiz || null;
export const rettTeltQuiz = REGLER.rettTeltQuiz || null;
export const TELTHENDELSER = REGLER.TELTHENDELSER || null;
export function rettQuiz(fro, svar = []) {
  const q = lagQuiz(fro);
  return { riktige: q.filter((s, i) => svar[i] === s.svar).length, antall: q.length };
}

// ---------- hotelleffekter ----------
// Stjerner: søvn og energi. Fasiliteter: små fordeler. 1–2★: overraskelser ved innsjekk.
export const STJERNE_EFFEKT = {
  1: { jobb: -1, lonn: 0.9, tekst: 'Dere sover dårlig: én jobb mindre per dag og 10 % lavere lønn' },
  2: { jobb: -1, lonn: 1.0, tekst: 'Litt trangt: én jobb mindre per dag' },
  3: { jobb: 0, lonn: 1.0, tekst: 'Vanlig søvn' },
  4: { jobb: 0, lonn: 1.1, tekst: 'Uthvilte: 10 % høyere lønn' },
  5: { jobb: 1, lonn: 1.2, tekst: 'Superuthvilte: én ekstra jobb per dag og 20 % høyere lønn' },
};
export const FASILITET_EFFEKT = {
  'Frokost inkludert': { ikon: '🍳', tekst: '+1 jobb per dag' },
  'Flyplassbuss': { ikon: '🚌', tekst: '−10 % på neste flybillett' },
  'Gratis wifi': { ikon: '📶', tekst: '50/50-livline på neste flytur' },
};
/** Samlet effekt av hotellet gruppa bor på (null = ingen hotell). */
export function hotellEffekt(hotell, innstillinger) {
  const base = (innstillinger?.jobberPerDag ?? STANDARD_INNSTILLINGER.jobberPerDag);
  if (!hotell) return { jobber: base, lonn: 1, rabatt: 0, livliner: 0 };
  const st = STJERNE_EFFEKT[hotell.stjerner] || STJERNE_EFFEKT[3];
  const fas = hotell.fasiliteter || [];
  return {
    jobber: Math.max(base > 0 ? 1 : 0, base + st.jobb + (fas.includes('Frokost inkludert') ? 1 : 0) + (hotell.hendelse?.jobb || 0)),
    lonn: st.lonn,
    rabatt: fas.includes('Flyplassbuss') ? 0.1 : 0,
    livliner: fas.includes('Gratis wifi') ? 1 : 0,
  };
}
/** Flyprisen etter eventuell flyplassbuss-rabatt (lik i elevsiden og banken). Gjelder bare fly, ikke tog/buss. */
export function flyPrisMedRabatt(totalt, hotell, posisjon, type = 'fly') {
  const ok = type === 'fly' && hotell && hotell.land === posisjon && (hotell.fasiliteter || []).includes('Flyplassbuss');
  return ok ? Math.round(totalt * 0.9 / 10) * 10 : totalt;
}
// Overraskelser på billige hoteller. kr ganges med landets prisnivå.
export const HOTELLHENDELSER = [
  { tekst: '🐜 Maur i senga! Dere måtte kjøpe insektspray.', kr: -300 },
  { tekst: '🔊 Bråkete naboer hele natta – dere orker én jobb mindre per dag.', jobb: -1 },
  { tekst: '🧳 Bagasjen kom ikke fram med en gang – dere måtte kjøpe tannbørster og ekstra klær.', kr: -600 },
  { tekst: '🚿 Ikke noe varmtvann – dere kjøpte frokost og dusj på et bad i nærheten.', kr: -250 },
  { tekst: '🎒 Hyggelige romkamerater tipset dere om en jobb – én ekstra jobb per dag!', jobb: 1 },
  { tekst: '🪙 Dere fant en lommebok og leverte den i resepsjonen – og fikk finnerlønn!', kr: 500 },
  { tekst: '🍲 Fellesmiddag på hostellet – gratis mat i kveld!', kr: 300 },
];
export const HENDELSE_SJANSE = { 1: 0.5, 2: 0.3 };

export function formaterKr(n) { return Math.round(n || 0).toLocaleString('nb-NO').replace(/,/g, ' ') + ' kr'; }
export function nyId(lengde = 8) { const t = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const a = crypto.getRandomValues(new Uint8Array(lengde)); for (const x of a) s += t[x % t.length]; return s; }
export { LAND, landEtterId, KONTINENTER, LANDENE, landInfo, landKode, byerILand, PAKKE };

// ---------- dueller ----------
// Lærerens egne dueller lagres på kontoen (mineDueller/<uid>) og kopieres inn i spillet som spill/<id>/egneDueller
// (bare eierens). Når en duell trekkes, kopieres hele oppgaven inn i duellen (d.o), så den ikke endrer seg
// om lista endres senere. d.okilde = 's:<tittel>' (standard) eller 'e:<id>' (egen) – brukes for å unngå gjentakelser.
export function renDuell(o) {
  return { tittel: String(o?.tittel || '').slice(0, 60), tekst: String(o?.tekst || '').slice(0, 400), vinner: String(o?.vinner || '').slice(0, 200), tid: Math.max(0, Math.min(600, Number(o?.tid) || 0)), utstyr: String(o?.utstyr || '').slice(0, 100) || 'Ingenting' };
}
export function egneDuellerI(spill) {
  return Object.entries(spill?.egneDueller || {}).filter(([, o]) => o && o.tittel).map(([id, o]) => ({ nokkel: 'e:' + id, o: renDuell(o) }));
}
/** Duellene som kan trekkes i dette spillet, etter lærerens valg. */
export function duellPulje(spill) {
  const valg = innst(spill).duellUtvalg || 'standard';
  const std = DUELLER.map((o) => ({ nokkel: 's:' + o.tittel, o }));
  const egne = egneDuellerI(spill);
  if (valg === 'egne' && egne.length) return egne;
  if (valg === 'begge') return [...std, ...egne];
  return std;
}
/** Oppgaven i en duell (nye dueller har den kopiert inn; gamle har bare et nummer i standardlista). */
export function duellOppgave(d) { return d?.o || (d?.oppgave != null ? DUELLER[d.oppgave] : null) || null; }

/** «Tokyo, Japan» / «Bergen, Norge» */
export function stedNavn(id) { const l = landEtterId[id]; return l ? `${l.by}, ${l.landNavn}` : ''; }
/** Stor forbokstav: stor('landet') → 'Landet' */
export const stor = (t) => (t ? t[0].toUpperCase() + t.slice(1) : '');
/** Ordene til spillpakken (land/by …), se pakker/<spill>/pakke.js */
export const ORD = PAKKE.ord;
/** Nøkkel for lagring i nettleseren, f.eks. lagringsnokkel('spill') → 'jr-spill' / 'eu-spill' */
export const lagringsnokkel = (navn) => `${PAKKE.prefiks}-${navn}`;
