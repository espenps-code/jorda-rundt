// Jorda rundt – BANKEN.
// Kjører i nettleseren til læreren (lærersiden og tavla). Elevene sender bare forespørsler;
// banken regner ut prisen på nytt, sjekker saldo og regler, og gjennomfører – eller avviser.
import { r, get, update, push, remove, onValue, runTransaction } from './fb.js';
import { flyTilbud, hoteller } from '../data/motor.js';
import { DUELLER } from '../data/dueller.js';
import {
  innst, idag, igaar, erStengt, erLaast, rettJobb, rettQuiz, rettLandquiz, landEtterId, formaterKr,
} from './felles.js';

const iArbeid = new Set();

/** Start banken for ett spill. Returnerer en funksjon som stopper den. */
export function startBank(spillId, { vedBehandlet } = {}) {
  const stopp = onValue(r(`spill/${spillId}/foresporsler`), (snap) => {
    const alle = snap.val() || {};
    for (const [gid, liste] of Object.entries(alle)) {
      for (const [fid, f] of Object.entries(liste || {})) {
        if (f.status === 'venter' && !iArbeid.has(fid)) {
          iArbeid.add(fid);
          behandle(spillId, gid, fid, f).then((res) => vedBehandlet?.(res)).catch(console.error).finally(() => iArbeid.delete(fid));
        } else if (f.status !== 'venter' && f.status !== 'behandles' && Date.now() - (f.tid || 0) > 2 * 86400000) {
          remove(r(`spill/${spillId}/foresporsler/${gid}/${fid}`)); // rydd bort gamle
        }
      }
    }
  });
  return stopp;
}

async function behandle(spillId, gid, fid, f) {
  const fSti = `spill/${spillId}/foresporsler/${gid}/${fid}`;
  // 1) Gjør krav på forespørselen, så to åpne lærerfaner ikke behandler den samtidig
  const krav = await runTransaction(r(`${fSti}/status`), (s) => (s === 'venter' ? 'behandles' : undefined));
  if (!krav.committed) return null;

  const spill = (await get(r(`spill/${spillId}`))).val() || {};
  const i = innst(spill);
  let resultat = { ok: false, melding: 'Ukjent forespørsel.' };

  try {
    if (i.pause) resultat = { ok: false, melding: 'Spillet er satt på pause av læreren.' };
    else if (!spill.grupper?.[gid]) resultat = { ok: false, melding: 'Gruppa finnes ikke.' };
    else if (f.type === 'fly') resultat = await fly(spillId, gid, f.data || {}, i);
    else if (f.type === 'hotell') resultat = await hotell(spillId, gid, f.data || {}, i);
    else if (f.type === 'jobb') resultat = await jobb(spillId, gid, f.data || {}, i);
    else if (f.type === 'quiz') resultat = await quiz(spillId, gid, f.data || {}, i);
    else if (f.type === 'reiselogg') resultat = await reiselogg(spillId, gid, spill);
    else if (f.type === 'landquiz') resultat = await landquiz(spillId, gid, f.data || {}, i, spill);
  } catch (e) {
    console.error(e);
    resultat = { ok: false, melding: 'Noe gikk galt i banken. Prøv igjen.' };
  }

  const oppdatering = {
    [`${fSti}/status`]: resultat.ok ? 'ok' : 'avvist',
    [`${fSti}/svar`]: resultat.melding,
  };
  if (resultat.ok && resultat.logg) {
    oppdatering[`spill/${spillId}/logg/${push(r(`spill/${spillId}/logg`)).key}`] = { tid: Date.now(), gruppe: gid, ...resultat.logg };
  }
  await update(r('/'), oppdatering);
  return { gid, type: f.type, ...resultat };
}

// Kjører en endring på gruppa som en transaksjon. `endre(g)` returnerer {feil} eller {melding, logg}.
async function medGruppe(spillId, gid, endre) {
  let utfall = null;
  const res = await runTransaction(r(`spill/${spillId}/grupper/${gid}`), (g) => {
    if (g === null) return g;               // venter på ekte data fra serveren
    const u = endre(g);
    utfall = u;
    if (u.feil) return;                     // avbryt uten endring
    return g;
  });
  if (!utfall) return { ok: false, melding: 'Fant ikke gruppa.' };
  if (utfall.feil) return { ok: false, melding: utfall.feil };
  if (!res.committed) return { ok: false, melding: 'Banken var opptatt. Prøv igjen.' };
  return { ok: true, melding: utfall.melding, logg: utfall.logg };
}

function harHotellHer(g) { return g.hotell && g.hotell.land === g.posisjon; }

function fly(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    if (!harHotellHer(g)) return { feil: 'Dere må booke hotell (3 netter) der dere er før dere kan reise videre.' };
    if (!landEtterId[d.til]) return { feil: 'Ukjent reisemål.' };
    if (d.til === g.posisjon) return { feil: 'Dere er allerede her!' };
    if (erStengt(d.til, i)) return { feil: `${landEtterId[d.til].navn} er stengt for reiser i spillet.` };
    if (d.dato !== idag() && d.dato !== igaar()) return { feil: 'Prisen er utgått. Søk på nytt.' };
    const tilbud = flyTilbud(g.posisjon, d.til, d.dato, g.personer || 4)[d.valg];
    if (!tilbud) return { feil: 'Fant ikke flyreisen. Søk på nytt.' };
    if (d.pris !== tilbud.totalt) return { feil: 'Prisen har endret seg. Søk på nytt.' };
    if ((g.saldo || 0) < tilbud.totalt) return { feil: `Dere har ikke råd. Billettene koster ${formaterKr(tilbud.totalt)}.` };
    const fra = g.posisjon;
    g.saldo -= tilbud.totalt;
    g.posisjon = d.til;
    g.hotell = null;
    g.reiser = (g.reiser || 0) + 1;
    const til = landEtterId[d.til];
    return {
      melding: `God tur! Dere flyr med ${tilbud.selskap} til ${til.by}, ${til.navn}.`,
      logg: { type: 'fly', belop: -tilbud.totalt, fra, til: d.til, tekst: `flyr til ${til.flagg} ${til.navn}` },
    };
  });
}

function hotell(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    if (harHotellHer(g)) return { feil: 'Dere har allerede hotell her.' };
    const h = hoteller(g.posisjon).find((x) => x.id === d.hotellId);
    if (!h) return { feil: 'Fant ikke hotellet.' };
    const pris = h.prisNatt * 3;
    if ((g.saldo || 0) < pris) return { feil: `Dere har ikke råd. Tre netter koster ${formaterKr(pris)}.` };
    g.saldo -= pris;
    g.hotell = { land: g.posisjon, navn: h.navn, stjerner: h.stjerner, pris };
    g.besokt = g.besokt || {}; g.besokt[g.posisjon] = true;
    const l = landEtterId[g.posisjon];
    return {
      melding: `Velkommen til ${h.navn}! Tre netter er booket.`,
      logg: { type: 'hotell', belop: -pris, land: g.posisjon, tekst: `sjekker inn på ${h.navn} i ${l.by}` },
    };
  });
}

function jobb(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    if (!harHotellHer(g)) return { feil: 'Dere må bo på hotell i landet for å kunne jobbe der.' };
    const dag = idag();
    const antall = g.jobber?.[dag] || 0;
    if (antall >= i.jobberPerDag) return { feil: `Dere har jobbet nok i dag (maks ${i.jobberPerDag} jobber per dag).` };
    if (!d.fro) return { feil: 'Mangler jobb.' };
    if (g.brukteFro?.[d.fro]) return { feil: 'Denne jobben er allerede levert.' };
    const res = rettJobb(g.posisjon, d.fro, d.svar);
    g.jobber = { [dag]: antall + 1 };              // bare dagens teller trengs
    g.brukteFro = { ...(g.brukteFro || {}), [d.fro]: true };
    g.saldo = (g.saldo || 0) + res.utbetaling;
    return {
      melding: `${res.riktige} av ${res.antall} riktige. Dere tjente ${formaterKr(res.utbetaling)}.`,
      logg: { type: 'jobb', belop: res.utbetaling, land: g.posisjon, tekst: `jobbet i ${landEtterId[g.posisjon].navn} (${res.riktige}/${res.antall})` },
    };
  });
}

function quiz(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    const dag = idag();
    const antall = g.quiz?.[dag] || 0;
    if (antall >= i.quizPerDag) return { feil: `Dere har tatt nok quizer i dag (maks ${i.quizPerDag}).` };
    if (!d.fro) return { feil: 'Mangler quiz.' };
    if (g.brukteFro?.[d.fro]) return { feil: 'Denne quizen er allerede levert.' };
    const res = rettQuiz(d.fro, d.svar);
    const belop = res.riktige * i.quizBelop;
    g.quiz = { [dag]: antall + 1 };
    g.brukteFro = { ...(g.brukteFro || {}), [d.fro]: true };
    g.saldo = (g.saldo || 0) + belop;
    return {
      melding: `${res.riktige} av ${res.antall} riktige! Dere fikk ${formaterKr(belop)}.`,
      logg: { type: 'quiz', belop, tekst: `geografiquiz ${res.riktige}/${res.antall}` },
    };
  });
}

async function reiselogg(spillId, gid, spill) {
  const g = spill.grupper[gid];
  if (!harHotellHer(g)) return { ok: false, melding: 'Dere må bo på hotell i landet før dere kan levere reiseloggen.' };
  const status = spill.reiselogger?.[gid]?.[g.posisjon]?.status;
  if (status === 'levert') return { ok: false, melding: 'Reiseloggen er allerede levert. Vent på læreren.' };
  if (status === 'godkjent') return { ok: false, melding: 'Reiseloggen for dette landet er allerede godkjent.' };
  await update(r(`spill/${spillId}/reiselogger/${gid}/${g.posisjon}`), { status: 'levert', tid: Date.now() });
  const l = landEtterId[g.posisjon];
  return { ok: true, melding: 'Reiseloggen er levert! Gi den fysiske reiseloggen til læreren.', logg: { type: 'reiselogg', land: g.posisjon, tekst: `leverte reiselogg for ${l.flagg} ${l.navn}` } };
}

async function landquiz(spillId, gid, d, i, spill) {
  if (!i.landquizKrav) return { ok: false, melding: 'Landquiz er slått av av læreren.' };
  const l = landEtterId[d.land];
  const e = spill.eierskap?.[d.land];
  if (!l || !e || e.gruppe !== gid) return { ok: false, melding: 'Dere kan bare ta landquiz om land dere eier.' };
  if (erLaast(e, i)) return { ok: false, melding: `${l.navn} er allerede låst.` };
  const dag = idag();
  let bestatt = false, res = null;
  const svar = await medGruppe(spillId, gid, (g) => {
    if (g.landquiz?.[dag]?.[d.land]) return { feil: `Dere har allerede prøvd landquizen for ${l.navn} i dag. Prøv igjen i morgen!` };
    if (g.brukteFro?.[d.fro]) return { feil: 'Denne quizen er allerede levert.' };
    res = rettLandquiz(d.land, d.fro, d.svar);
    bestatt = res.riktige >= i.landquizKrav;
    g.landquiz = { [dag]: { ...(g.landquiz?.[dag] || {}), [d.land]: true } };
    g.brukteFro = { ...(g.brukteFro || {}), [d.fro]: true };
    return bestatt
      ? { melding: `${res.riktige} av ${res.antall} riktige! ${l.navn} er nå låst og trygt. 🔒`, logg: { type: 'laas', land: d.land, tekst: `låste ${l.flagg} ${l.navn} med landquiz (${res.riktige}/${res.antall}) 🔒` } }
      : { melding: `${res.riktige} av ${res.antall} riktige. Dere trenger ${i.landquizKrav}. Prøv igjen i morgen!`, logg: { type: 'landquiz', land: d.land, tekst: `prøvde landquiz for ${l.flagg} ${l.navn} (${res.riktige}/${res.antall})` } };
  });
  if (svar.ok && bestatt) await update(r(`spill/${spillId}/eierskap/${d.land}`), { laast: true });
  return svar;
}

// =====================================================================
// Lærerhandlinger (kjøres direkte fra lærersiden)
// =====================================================================

async function logg(spillId, data) {
  await push(r(`spill/${spillId}/logg`), { tid: Date.now(), ...data });
}

/** Læreren godkjenner en reiselogg. Gir landet, eller starter en duell hvis en annen gruppe eier det. */
export async function godkjennReiselogg(spillId, gid, landId) {
  const spill = (await get(r(`spill/${spillId}`))).val() || {};
  const i = innst(spill);
  const e = spill.eierskap?.[landId];
  const l = landEtterId[landId];
  const u = {};
  let tekst;
  if (!e) {
    u[`spill/${spillId}/eierskap/${landId}`] = { gruppe: gid, siden: Date.now() };
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'godkjent', tid: Date.now() };
    tekst = `erobret ${l.flagg} ${l.navn}!`;
  } else if (e.gruppe === gid) {
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'godkjent', tid: Date.now() };
    tekst = `fikk reiselogg for ${l.flagg} ${l.navn} godkjent (eier det allerede)`;
  } else if (erLaast(e, i)) {
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'laast', tid: Date.now() };
    tekst = `besøkte ${l.flagg} ${l.navn}, men landet er låst`;
  } else {
    const duellId = push(r(`spill/${spillId}/dueller`)).key;
    u[`spill/${spillId}/dueller/${duellId}`] = { land: landId, utfordrer: gid, forsvarer: e.gruppe, status: 'venter', tid: Date.now() };
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'duell', tid: Date.now(), duell: duellId };
    tekst = `utfordrer ${spill.grupper[e.gruppe]?.navn || 'en gruppe'} om ${l.flagg} ${l.navn}! ⚔️`;
  }
  u[`spill/${spillId}/logg/${push(r(`spill/${spillId}/logg`)).key}`] = { tid: Date.now(), gruppe: gid, type: 'erobring', land: landId, tekst };
  await update(r('/'), u);
  return tekst;
}

export async function avvisReiselogg(spillId, gid, landId) {
  await update(r(`spill/${spillId}/reiselogger/${gid}/${landId}`), { status: 'avvist', tid: Date.now() });
  await logg(spillId, { gruppe: gid, type: 'reiselogg', land: landId, tekst: `må gjøre reiseloggen for ${landEtterId[landId].navn} på nytt` });
}

/** Avgjør en duell. vinner = gruppe-id. */
export async function avgjorDuell(spillId, duellId, vinner) {
  const spill = (await get(r(`spill/${spillId}`))).val() || {};
  const d = spill.dueller?.[duellId];
  if (!d || d.status !== 'venter') return;
  const i = innst(spill);
  const l = landEtterId[d.land];
  const u = {
    [`spill/${spillId}/dueller/${duellId}/status`]: 'ferdig',
    [`spill/${spillId}/dueller/${duellId}/vinner`]: vinner,
    [`spill/${spillId}/reiselogger/${d.utfordrer}/${d.land}`]: { status: vinner === d.utfordrer ? 'godkjent' : 'tapt', tid: Date.now() },
  };
  if (vinner === d.utfordrer) u[`spill/${spillId}/eierskap/${d.land}`] = { gruppe: d.utfordrer, siden: Date.now() };
  const taper = vinner === d.utfordrer ? d.forsvarer : d.utfordrer;
  u[`spill/${spillId}/logg/${push(r(`spill/${spillId}/logg`)).key}`] = {
    tid: Date.now(), gruppe: vinner, type: 'duell', land: d.land, belop: i.duellPremie,
    tekst: `vant duellen om ${l.flagg} ${l.navn} mot ${spill.grupper[taper]?.navn || ''}! 🏆`,
  };
  await update(r('/'), u);
  if (i.duellPremie) await runTransaction(r(`spill/${spillId}/grupper/${vinner}/saldo`), (s) => (s || 0) + i.duellPremie);
}

export async function justerSaldo(spillId, gid, belop, grunn) {
  await runTransaction(r(`spill/${spillId}/grupper/${gid}/saldo`), (s) => (s || 0) + belop);
  await logg(spillId, { gruppe: gid, type: 'lærer', belop, tekst: `${belop >= 0 ? 'fikk' : 'mistet'} ${formaterKr(Math.abs(belop))} fra læreren${grunn ? ': ' + grunn : ''}` });
}

export async function settLaas(spillId, landId, laast) {
  await update(r(`spill/${spillId}/eierskap/${landId}`), { laast: !!laast });
}
export async function fjernEierskap(spillId, landId) {
  await remove(r(`spill/${spillId}/eierskap/${landId}`));
}

/** Trekk en tilfeldig duelloppgave (unngår de som er brukt nylig). */
export async function trekkDuellOppgave(spillId, duellId) {
  const spill = (await get(r(`spill/${spillId}`))).val() || {};
  const brukt = new Set(Object.values(spill.dueller || {}).map((d) => d.oppgave).filter((x) => x != null));
  let kandidater = DUELLER.map((_, n) => n).filter((n) => !brukt.has(n));
  if (!kandidater.length) kandidater = DUELLER.map((_, n) => n);
  const valgt = kandidater[Math.floor(Math.random() * kandidater.length)];
  await update(r(`spill/${spillId}/dueller/${duellId}`), { oppgave: valgt, trukket: Date.now(), startet: null });
  return DUELLER[valgt];
}
export async function startDuellNedtelling(spillId, duellId) {
  await update(r(`spill/${spillId}/dueller/${duellId}`), { startet: Date.now() });
}
