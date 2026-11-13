import { T, LOKALE, SPRAK } from './sprak.js';
// MOTOREN – felles spillregler for alle spillpakkene (brukes av elevside, lærerside, tavle og banken).
// Det som er spesielt for hvert spill (steder, poeng, quiz, standardverdier) ligger i pakker/<spill>/.
// «#pakke/» peker på spillpakken som er valgt (se js/pakke.js og functions/kopier.mjs).
import { LAND, landEtterId, KONTINENTER, LANDENE, landInfo, landKode, byerILand } from '#pakke/land.js';
import { jobbLonn } from '#pakke/motor.js';
import { PAKKE } from '#pakke/pakke.js';
import * as REGLER from '#pakke/regler.js';
import { rng, velg, stokk } from './tilfeldig.js';
import { DUELLER } from '../data/dueller.js';

// ---------- penger og avstand (spillpakken kan ha egen valuta: pakke.js → valuta: { symbol: '$', navn: 'dollars', skala: 0.1 }) ----------
/** Spillpakkens valuta, eller null = norske kroner */
export const VALUTA = PAKKE.valuta || null;
/** Hvor mye én pengeenhet er verdt målt mot kroner-beløpene i motoren (1 = kroner, 0.1 = dollar). Brukes på faste beløp som overraskelser. */
export const SKALA = VALUTA?.skala || 1;
/** Runder til nærmeste «tier» i kroner – eller nærmeste hele dollar når skalaen er 0.1 */
export const rund10 = (x) => { const s = 10 * SKALA; return Math.round(Math.round(x / s) * s); };
/** Fast beløp i motoren (kroner) × prisnivå → pent beløp i spillets valuta, minst 50 kr / 5 dollar. Beholder fortegnet. */
export const hendelseBelop = (kr, prisniva = 1) => (kr ? Math.max(50 * SKALA, rund10(Math.abs(kr) * SKALA * Math.pow(prisniva || 1, 0.8))) * Math.sign(kr) : 0);
/** Avstand som tekst: «1 250 km» – eller «777 mi» i spillpakker med enheter: 'miles' */
export const AVSTAND = PAKKE.enheter === 'miles' ? { faktor: 0.621371, kort: 'mi', lang: 'miles' } : { faktor: 1, kort: 'km', lang: 'km' };
export const avstandTall = (km) => { const v = km * AVSTAND.faktor; return (AVSTAND.faktor === 1 ? Number(km) : v < 10 ? Math.round(v * 10) / 10 : Math.round(v)).toLocaleString(LOKALE); };
export const avstandTekst = (km) => `${avstandTall(km)} ${AVSTAND.kort}`;

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
  { navn: T('Rød'), hex: '#E5484D' }, { navn: T('Blå'), hex: '#3E63DD' }, { navn: T('Grønn'), hex: '#30A46C' },
  { navn: T('Oransje'), hex: '#F76B15' }, { navn: T('Lilla'), hex: '#8E4EC6' }, { navn: T('Turkis'), hex: '#12A594' },
  { navn: T('Rosa'), hex: '#D6409F' }, { navn: T('Gul'), hex: '#E2A336' }, { navn: T('Brun'), hex: '#A07553' },
  { navn: T('Marine'), hex: '#1E3A8A' },
  { navn: T('Himmelblå'), hex: '#0090FF' }, { navn: T('Lime'), hex: '#7CB518' }, { navn: T('Mørkerød'), hex: '#9B1C1C' },
  { navn: T('Skogsgrønn'), hex: '#166534' }, { navn: T('Fersken'), hex: '#F4A261' }, { navn: T('Indigo'), hex: '#4338CA' },
  { navn: T('Magenta'), hex: '#A21CAF' }, { navn: T('Oliven'), hex: '#6B7A1F' }, { navn: T('Petrol'), hex: '#0E7490' },
  { navn: T('Korall'), hex: '#FF7F6E' }, { navn: T('Lavendel'), hex: '#A78BFA' }, { navn: T('Sennep'), hex: '#B8860B' },
  { navn: T('Kirsebær'), hex: '#BE185D' }, { navn: T('Skifer'), hex: '#475569' }, { navn: T('Mint'), hex: '#34D399' },
];

/** Reisenavn til automatisk opprettelse av grupper (25 stk.) */
export const GRUPPENAVN = [T('Globetrotterne'), T('Backpackerne'), T('Oppdagerne'), T('Pilotene'), T('Kapteinene'), T('Kartleserne'), T('Navigatørene'), T('Eventyrerne'), T('Seilerne'), T('Polfarerne'),
  T('Jordomseilerne'), T('Interrailerne'), T('Nomadene'), T('Ballongfarerne'), T('Vandrerne'), T('Fjellklatrerne'), T('Dykkerne'), T('Kompassene'), T('Koffertene'), T('Passtemplene'),
  T('Boardingkortene'), T('Karavanen'), T('Safarigjengen'), T('Ekspedisjonen'), T('Jetsetterne')];

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

/** Skal stedet vises på kart og i lister? Valgfrie «Vårt sted»-steder er skjult til læreren åpner dem. */
export function erSynlig(stedId, innstillinger) {
  const l = landEtterId[stedId]; if (!l) return false;
  return !l.valgfri || !erStengt(stedId, innstillinger);
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
  const tk = SPRAK === 'no' ? 't' : 'h';   // «t» for timer – «h» for hours på engelsk
  if (d) return `${d} d ${t} ${tk}`;
  if (t) return `${t} ${tk} ${m} min`;
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
    el.textContent = ms > 0 ? (el.dataset.forTekst || '') + nedtelling(ms) : (el.dataset.ferdigTekst || T('Låst'));
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
  { tittel: T('Selger suvenirer på markedet'), ting: T('nøkkelringer'), ting2: T('postkort') },
  { tittel: T('Servitør på en kafé'), ting: T('kaffe'), ting2: T('kaker') },
  { tittel: T('Guide for turister'), ting: T('billetter til byvandring'), ting2: T('kart') },
  { tittel: T('Fruktplukker på en gård'), ting: T('kurver med frukt'), ting2: T('flasker juice') },
  { tittel: T('Hjelper i en bokhandel'), ting: T('bøker'), ting2: T('blader') },
  { tittel: T('Assistent på et museum'), ting: T('inngangsbilletter'), ting2: T('plakater') },
  { tittel: T('Iskremselger på stranda'), ting: T('iskremer'), ting2: T('brus') },
  { tittel: T('Hjelper på et sykkelutleie'), ting: T('sykkelturer'), ting2: T('hjelmer') },
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
  const valuta = kurs === 1 ? (VALUTA?.navn || 'kr') : l.valuta;
  // en "pen" pris i lokal valuta, tilsvarende 20–90 kr
  const pen = (kr) => { const v = kr * SKALA / kurs; const steg = v > 5000 ? 1000 : v > 500 ? 50 : v > 50 ? 5 : 1; return Math.max(steg, Math.round(v / steg) * steg); };
  const p1 = pen(20 + r() * 70), p2 = pen(20 + r() * 70);
  const a1 = 3 + Math.floor(r() * 7), a2 = 2 + Math.floor(r() * 5);
  const betalt = Math.ceil((p1 * a2) / (p1 >= 1000 ? 10000 : p1 >= 100 ? 1000 : 100)) * (p1 >= 1000 ? 10000 : p1 >= 100 ? 1000 : 100);
  const fmt = (n) => n.toLocaleString(LOKALE);
  return {
    tittel: j.tittel,
    lonn: jobbLonn(landId),
    oppgaver: [
      { tekst: T`Du selger ${a1} ${j.ting}. Én koster ${fmt(p1)} ${valuta}. Hvor mye får du til sammen?`, svar: a1 * p1, enhet: valuta },
      { tekst: T`En kunde kjøper ${a2} ${j.ting} til ${fmt(p1)} ${valuta} stykket og betaler med ${fmt(betalt)} ${valuta}. Hvor mye skal kunden få tilbake?`, svar: betalt - a2 * p1, enhet: valuta },
      { tekst: T`Du selger ${a1} ${j.ting} til ${fmt(p1)} ${valuta} og ${a2} ${j.ting2} til ${fmt(p2)} ${valuta}. Hvor mye tjente butikken i alt?`, svar: a1 * p1 + a2 * p2, enhet: valuta },
    ],
  };
}
export function rettJobb(landId, fro, svar = []) {
  const jobb = lagJobb(landId, fro);
  const riktige = jobb.oppgaver.filter((o, i) => Number(String(svar[i] ?? '').replace(/\s/g, '').replace(',', '.')) === o.svar).length;
  return { riktige, antall: jobb.oppgaver.length, utbetaling: rund10(jobb.lonn * riktige / jobb.oppgaver.length) };
}

// ---------- geografiquiz (spørsmålene lages av spillpakken) ----------
export const lagQuiz = REGLER.lagQuiz;
// ---------- telt med allemannsretten (bare spillpakker som har det, f.eks. Norge rundt) ----------
export const teltQuiz = REGLER.teltQuiz || null;
export const rettTeltQuiz = REGLER.rettTeltQuiz || null;
export const TELTHENDELSER = REGLER.TELTHENDELSER || null;
// ---------- utstyr gruppa må ha for å reise til enkelte steder (bare spillpakker som har det, f.eks. Solsystemet rundt) ----------
// UTSTYR = { id: { navn, ikon, pris, hvorfor } } · utstyrMangler(gruppe, stedId) → id-ene gruppa mangler for å reise dit
export const UTSTYR = REGLER.UTSTYR || null;
export const utstyrMangler = REGLER.utstyrMangler || (() => []);
// ---------- natur- og værhendelser på reisen (bare spillpakker som har det, f.eks. Norge rundt) ----------
export const reisehendelse = REGLER.reisehendelse || null;
// ---------- elevenes veiviser: spillpakken kan ha sin egen (f.eks. Across America, som er på engelsk) ----------
export const veiviserPakke = REGLER.veiviser || null;
export function rettQuiz(fro, svar = []) {
  const q = lagQuiz(fro);
  return { riktige: q.filter((s, i) => svar[i] === s.svar).length, antall: q.length };
}

// ---------- hotelleffekter ----------
// Stjerner: søvn og energi. Fasiliteter: små fordeler. 1–2★: overraskelser ved innsjekk.
export const STJERNE_EFFEKT = {
  1: { jobb: -1, lonn: 0.9, tekst: T('Dere sover dårlig: én jobb mindre per dag og 10 % lavere lønn') },
  2: { jobb: -1, lonn: 1.0, tekst: T('Litt trangt: én jobb mindre per dag') },
  3: { jobb: 0, lonn: 1.0, tekst: T('Vanlig søvn') },
  4: { jobb: 0, lonn: 1.1, tekst: T('Uthvilte: 10 % høyere lønn') },
  5: { jobb: 1, lonn: 1.2, tekst: T('Superuthvilte: én ekstra jobb per dag og 20 % høyere lønn') },
};
// Navnene kommer fra spillpakkens motor.js. Pakker på andre språk oppgir sine navn i pakke.js → fasiliteter: { frokost, buss, wifi }.
export const FAS = { frokost: 'Frokost inkludert', buss: 'Flyplassbuss', wifi: 'Gratis wifi', ...(PAKKE.fasiliteter || {}) };
export const FASILITET_EFFEKT = {
  [FAS.frokost]: { ikon: '🍳', tekst: T('+1 jobb per dag') },
  [FAS.buss]: { ikon: '🚌', tekst: T('−10 % på neste flybillett') },
  [FAS.wifi]: { ikon: '📶', tekst: T('50/50-livline på neste flytur') },
};
/** Samlet effekt av hotellet gruppa bor på (null = ingen hotell). */
export function hotellEffekt(hotell, innstillinger) {
  const base = (innstillinger?.jobberPerDag ?? STANDARD_INNSTILLINGER.jobberPerDag);
  if (!hotell) return { jobber: base, lonn: 1, rabatt: 0, livliner: 0 };
  const st = STJERNE_EFFEKT[hotell.stjerner] || STJERNE_EFFEKT[3];
  const fas = hotell.fasiliteter || [];
  return {
    jobber: Math.max(base > 0 ? 1 : 0, base + st.jobb + (fas.includes(FAS.frokost) ? 1 : 0) + (hotell.hendelse?.jobb || 0)),
    lonn: st.lonn,
    rabatt: fas.includes(FAS.buss) ? 0.1 : 0,
    livliner: fas.includes(FAS.wifi) ? 1 : 0,
  };
}
/** Flyprisen etter eventuell flyplassbuss-rabatt (lik i elevsiden og banken). Gjelder bare fly, ikke tog/buss. */
export function flyPrisMedRabatt(totalt, hotell, posisjon, type = 'fly') {
  const ok = type === 'fly' && hotell && hotell.land === posisjon && (hotell.fasiliteter || []).includes(FAS.buss);
  return ok ? rund10(totalt * 0.9) : totalt;
}
// Overraskelser på billige hoteller. kr ganges med landets prisnivå.
export const HOTELLHENDELSER = [
  { tekst: T('🐜 Maur i senga! Dere måtte kjøpe insektspray.'), kr: -300 },
  { tekst: T('🔊 Bråkete naboer hele natta – dere orker én jobb mindre per dag.'), jobb: -1 },
  { tekst: T('🧳 Bagasjen kom ikke fram med en gang – dere måtte kjøpe tannbørster og ekstra klær.'), kr: -600 },
  { tekst: T('🚿 Ikke noe varmtvann – dere kjøpte frokost og dusj på et bad i nærheten.'), kr: -250 },
  { tekst: T('🎒 Hyggelige romkamerater tipset dere om en jobb – én ekstra jobb per dag!'), jobb: 1 },
  { tekst: T('🪙 Dere fant en lommebok og leverte den i resepsjonen – og fikk finnerlønn!'), kr: 500 },
  { tekst: T('🍲 Fellesmiddag på hostellet – gratis mat i kveld!'), kr: 300 },
];
export const HENDELSE_SJANSE = { 1: 0.5, 2: 0.3 };

export function formaterKr(n) {
  if (VALUTA) return (n < 0 ? '−' : '') + VALUTA.symbol + Math.abs(Math.round(n || 0)).toLocaleString(LOKALE);
  return Math.round(n || 0).toLocaleString('nb-NO').replace(/,/g, ' ') + ' kr';
}
export function nyId(lengde = 8) { const t = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const a = crypto.getRandomValues(new Uint8Array(lengde)); for (const x of a) s += t[x % t.length]; return s; }
export { LAND, landEtterId, KONTINENTER, LANDENE, landInfo, landKode, byerILand, PAKKE };

// ---------- dueller ----------
// Lærerens egne dueller lagres på kontoen (mineDueller/<uid>) og kopieres inn i spillet som spill/<id>/egneDueller
// (bare eierens). Når en duell trekkes, kopieres hele oppgaven inn i duellen (d.o), så den ikke endrer seg
// om lista endres senere. d.okilde = 's:<tittel>' (standard) eller 'e:<id>' (egen) – brukes for å unngå gjentakelser.
export function renDuell(o) {
  return { tittel: String(o?.tittel || '').slice(0, 60), tekst: String(o?.tekst || '').slice(0, 400), vinner: String(o?.vinner || '').slice(0, 200), tid: Math.max(0, Math.min(600, Number(o?.tid) || 0)), utstyr: String(o?.utstyr || '').slice(0, 100) || T('Ingenting') };
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
/** Navnet på diktaten i dette spillet («Parlør-diktat», eller «Samisk språkoppdrag» i Norge rundt) */
export const DIKTATNAVN = PAKKE.diktatNavn || T('Parlør-diktat');
/** Nøkkel for lagring i nettleseren, f.eks. lagringsnokkel('spill') → 'jr-spill' / 'eu-spill' */
export const lagringsnokkel = (navn) => `${PAKKE.prefiks}-${navn}`;
