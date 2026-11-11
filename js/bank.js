import { T } from './sprak.js';
// MOTOREN – BANKEN (felles for alle spillpakkene). Steder (posisjon, hotell, reiselogg, eierskap) er stedene i
// spillpakken (land i Jorda rundt, byer i Europa rundt). Diktat gjelder per region (landKode).
// Elevforespørslene behandles i SKYEN (functions/index.js kaller behandle() under).
// Elevene sender bare forespørsler; banken regner ut prisen på nytt, sjekker saldo og regler,
// og gjennomfører – eller avviser. Lærerhandlingene nederst kjøres fortsatt fra lærersiden.
// startBank() brukes ikke lenger, men er beholdt i tilfelle man vil teste uten skyen.
import { r, get, update, push, remove, onValue, runTransaction } from './fb.js';
import { flyTilbud, hoteller } from '#pakke/motor.js';
import { rettDiktat, ORD } from '#pakke/parlor.js';
import * as PARLOR from '#pakke/parlor.js';   // harDiktat finnes bare i noen spillpakker
import { rettFlyquiz, kravFor, MAKS_SPORSMAL } from '../data/flyquiz.js';
import { landKode, landInfo } from '#pakke/land.js';
import {
  innst, idag, igaar, erStengt, erLaast, rettJobb, rettQuiz, landEtterId, formaterKr, nyId,
  hotellEffekt, flyPrisMedRabatt, HOTELLHENDELSER, HENDELSE_SJANSE, ORD as O, rettTeltQuiz, TELTHENDELSER, duellPulje, reisehendelse, DIKTATNAVN, rund10, hendelseBelop,
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

export async function behandle(spillId, gid, fid, f) {
  const fSti = `spill/${spillId}/foresporsler/${gid}/${fid}`;
  // 1) Gjør krav på forespørselen, så to åpne lærerfaner ikke behandler den samtidig
  // (null = ingen lokal kopi ennå – da venter vi på ekte data fra serveren i stedet for å gi opp)
  const krav = await runTransaction(r(`${fSti}/status`), (s) => (s === 'venter' ? 'behandles' : s === null ? null : undefined));
  if (krav.snapshot?.val() !== 'behandles') return null;
  if (!krav.committed) return null;

  const spill = (await get(r(`spill/${spillId}`))).val() || {};
  const i = innst(spill);
  let resultat = { ok: false, melding: T('Ukjent forespørsel.') };

  try {
    if (i.pause) resultat = { ok: false, melding: T('Spillet er satt på pause av læreren.') };
    else if (!spill.grupper?.[gid]) resultat = { ok: false, melding: T('Gruppa finnes ikke.') };
    else if (f.type === 'landing') resultat = await landing(spillId, gid, f.data || {});
    else if (spill.grupper[gid].iLufta) resultat = { ok: false, melding: T('Dere er i lufta! Svar på spørsmålene for å lande først. ✈️') };
    else if (f.type === 'fly') resultat = await fly(spillId, gid, f.data || {}, i, spill);
    else if (f.type === 'hotell') resultat = await hotell(spillId, gid, f.data || {}, i);
    else if (f.type === 'jobb') resultat = await jobb(spillId, gid, f.data || {}, i);
    else if (f.type === 'quiz') resultat = await quiz(spillId, gid, f.data || {}, i);
    else if (f.type === 'reiselogg') resultat = await reiselogg(spillId, gid, spill);
    else if (f.type === 'diktat') resultat = await diktat(spillId, gid, f.data || {}, i, spill);
    else if (f.type === 'diktatbe') resultat = await diktatBe(spillId, gid, i, spill);
    else if (f.type === 'landquiz') resultat = { ok: false, melding: T('Landquiz finnes ikke lenger. Land låses automatisk etter noen dager.') };
  } catch (e) {
    console.error(e);
    resultat = { ok: false, melding: T('Noe gikk galt i banken. Prøv igjen.') };
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
  if (!utfall) return { ok: false, melding: T('Fant ikke gruppa.') };
  if (utfall.feil) return { ok: false, melding: utfall.feil };
  if (!res.committed) return { ok: false, melding: T('Banken var opptatt. Prøv igjen.') };
  return { ok: true, melding: utfall.melding, logg: utfall.logg };
}

const gyldigFro = (f) => typeof f === 'string' && /^[A-Za-z0-9_-]{4,40}$/.test(f);
function harHotellHer(g) { return g.hotell && g.hotell.land === g.posisjon; }

// Statuser som betyr at læreren har godkjent reiseloggen (duell/låst/tapt oppstår etter godkjenning)
export const LOGG_GODKJENT = ['godkjent', 'duell', 'laast', 'tapt'];

function fly(spillId, gid, d, i, spill) {
  return medGruppe(spillId, gid, (g) => {
    if (!harHotellHer(g)) return { feil: T('Dere må booke hotell (3 netter) der dere er før dere kan reise videre.') };
    const loggStatus = spill?.reiselogger?.[gid]?.[g.posisjon]?.status;
    if (!LOGG_GODKJENT.includes(loggStatus)) {
      const her = landEtterId[g.posisjon]?.navn || O.stedet;
      return { feil: loggStatus === 'levert' ? T`Læreren må godkjenne reiseloggen for ${her} før dere kan reise videre.` : T`Dere må levere reiseloggen for ${her} og få den godkjent før dere kan reise videre.` };
    }
    if (!landEtterId[d.til]) return { feil: T('Ukjent reisemål.') };
    if (d.til === g.posisjon) return { feil: T('Dere er allerede her!') };
    if (erStengt(d.til, i)) return { feil: T`${landEtterId[d.til].navn} er stengt for reiser i spillet.` };
    if (d.dato !== idag() && d.dato !== igaar()) return { feil: T('Prisen er utgått. Søk på nytt.') };
    const tilbud = flyTilbud(g.posisjon, d.til, d.dato, g.personer || 4)[d.valg];
    if (!tilbud) return { feil: T('Fant ikke flyreisen. Søk på nytt.') };
    const pris = flyPrisMedRabatt(tilbud.totalt, g.hotell, g.posisjon, tilbud.type);
    if (d.pris !== pris) return { feil: T('Prisen har endret seg. Søk på nytt.') };
    if ((g.saldo || 0) < pris) return { feil: T`Dere har ikke råd. Billettene koster ${formaterKr(pris)}.` };
    const fra = g.posisjon;
    const krav = tilbud.krav ?? kravFor(tilbud.stopp);
    const type = tilbud.type || 'fly';
    const livliner = hotellEffekt(g.hotell, i).livliner;
    g.saldo -= pris;
    g.hotell = null;
    g.iLufta = {
      fra, til: d.til, krav, fro: nyId(12), startet: Date.now(), livliner, type,
      selskap: tilbud.selskap, stopp: tilbud.stopp, via: tilbud.via.map((v) => v.by), ...(tilbud.hurtigruta ? { hurtigruta: true } : {}),
      flight: `${tilbud.selskap.split(' ').map((o) => o[0]).join('').slice(0, 2).toUpperCase()}${100 + (parseInt(tilbud.id.replace(/\D/g, '').slice(-3) || '0', 10) % 900)}`,
    };
    const til = landEtterId[d.til];
    const ikon = { fly: '✈️', tog: '🚆', buss: '🚌', bat: '⛴️' }[type];
    return {
      melding: T`God tur! Svar riktig på ${krav} spørsmål underveis for å komme fram til ${til.by}.`,
      logg: { type: 'billett', belop: -pris, fra, til: d.til, reisemate: type, tekst: `${tilbud.hurtigruta ? T('tok Hurtigruta mot') : ({ fly: T('tok av mot'), tog: T('tok toget mot'), buss: T('tok bussen mot'), bat: T('tok båten mot') }[type] || T('reiste mot'))} ${til.flagg} ${til.navn} ${ikon}` },
    };
  });
}

function landing(spillId, gid, d) {
  return medGruppe(spillId, gid, (g) => {
    const f = g.iLufta;
    if (!f) return { feil: T('Dere er ikke i lufta.') };
    const svar = Array.isArray(d.svar) ? d.svar.slice(0, MAKS_SPORSMAL) : [];
    const riktige = rettFlyquiz(f.fro, svar);
    if (riktige < f.krav) return { feil: T`Dere har ${riktige} av ${f.krav} riktige. Fortsett å svare!` };
    const til = landEtterId[f.til];
    g.posisjon = f.til;
    g.iLufta = null;
    g.reiser = (g.reiser || 0) + 1;
    // Natur- og værhendelse underveis (bare spillpakker som har det). kr følger prisnivået på stedet.
    const h = reisehendelse ? reisehendelse({ type: f.type || 'fly', fra: f.fra, til: f.til, dato: idag() }) : null;
    let hKr = 0, hTekst = '';
    if (h) {
      hKr = hendelseBelop(h.kr, til.prisniva || 1);
      if (hKr) g.saldo = Math.max(0, (g.saldo || 0) + hKr);
      hTekst = ` ${h.tekst}${hKr ? ` (${hKr > 0 ? '+' : '−'}${formaterKr(Math.abs(hKr))})` : ''}`;
    }
    return {
      melding: T`${f.type && f.type !== 'fly' ? '🏁' : '🛬'} Velkommen til ${til.by}, ${til.landNavn}! Husk å booke hotell.${hTekst}`,
      logg: { type: 'fly', reisemate: f.type || 'fly', fra: f.fra, til: f.til, turbulens: svar.length - riktige, stopp: f.stopp, ...(hKr ? { belop: hKr } : {}), ...(h ? { hendelse: h.tekst } : {}), tekst: `${f.type && f.type !== 'fly' ? T('kom fram til') : T('landet i')} ${til.flagg} ${til.navn} (${svar.length - riktige} ${f.type && f.type !== 'fly' ? T('feil') : T('turbulens')})${hTekst ? ' –' + hTekst : ''}` },
    };
  });
}

function hotell(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    if (harHotellHer(g)) return { feil: T('Dere har allerede hotell her.') };
    const h = hoteller(g.posisjon).find((x) => x.id === d.hotellId);
    if (!h) return { feil: T('Fant ikke hotellet.') };
    // Telt: gruppa må kunne allemannsretten (alle spørsmålene riktige)
    if (h.telt) {
      if (!rettTeltQuiz || !gyldigFro(d.fro)) return { feil: T('Svar på spørsmålene om allemannsretten først.') };
      const res = rettTeltQuiz(d.fro, d.svar || []);
      if (res.riktige < res.antall) return { feil: T`Dere hadde ${res.riktige} av ${res.antall} riktige om allemannsretten. Les reglene og prøv igjen!` };
    }
    const pris = h.prisNatt * 3;
    if ((g.saldo || 0) < pris) return { feil: T`Dere har ikke råd. Tre netter koster ${formaterKr(pris)}.` };
    g.saldo -= pris;
    g.hotell = { land: g.posisjon, navn: h.navn, stjerner: h.stjerner, pris, fasiliteter: h.fasiliteter, ...(h.telt ? { telt: true } : {}) };
    g.besokt = g.besokt || {}; g.besokt[g.posisjon] = true;
    const l = landEtterId[g.posisjon];
    // overraskelse på billige hoteller (bestemmes én gang per innsjekk)
    let hendelseTekst = '';
    if (!g.hotell.hendelse && Math.random() < (HENDELSE_SJANSE[h.stjerner] || 0)) {
      const liste = h.telt && TELTHENDELSER ? TELTHENDELSER : HOTELLHENDELSER;
      const e = liste[Math.floor(Math.random() * liste.length)];
      const kr = hendelseBelop(e.kr, l.prisniva);
      g.hotell.hendelse = { tekst: e.tekst, kr, jobb: e.jobb || 0 };
      if (kr) g.saldo = Math.max(0, g.saldo + kr);
      hendelseTekst = ` ${e.tekst}${kr ? ` (${kr > 0 ? '+' : '−'}${formaterKr(Math.abs(kr))})` : ''}`;
    }
    return {
      melding: h.telt ? T`⛺ Teltet er slått opp! Husk allemannsretten: maks to netter på samme sted i lavlandet, og ta med all søpla.${hendelseTekst}` : T`Velkommen til ${h.navn}! Tre netter er booket.${hendelseTekst}`,
      logg: { type: 'hotell', belop: -pris + (g.hotell.hendelse?.kr || 0), pris, navn: h.navn, stjerner: h.stjerner, hendelse: g.hotell.hendelse || null, land: g.posisjon, tekst: `${h.telt ? T`slår opp telt ved ${l.by} ⛺` : T`sjekker inn på ${h.navn} i ${l.by}`}${hendelseTekst ? ' –' + hendelseTekst : ''}` },
    };
  });
}

function jobb(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    if (!harHotellHer(g)) return { feil: T`Dere må bo på hotell i ${O.stedet} for å kunne jobbe der.` };
    const dag = idag();
    const antall = g.jobber?.[dag] || 0;
    const eff = hotellEffekt(g.hotell, i);
    if (antall >= eff.jobber) return { feil: T`Dere har jobbet nok i dag (maks ${eff.jobber} ${eff.jobber === 1 ? T('jobb') : T('jobber')} per dag på dette hotellet).` };
    if (!gyldigFro(d.fro)) return { feil: T('Ugyldig jobb. Last inn siden på nytt.') };
    if (g.brukteFro?.[d.fro]) return { feil: T('Denne jobben er allerede levert.') };
    const res = rettJobb(g.posisjon, d.fro, d.svar);
    g.jobber = { [dag]: antall + 1 };              // bare dagens teller trengs
    g.brukteFro = { ...(g.brukteFro || {}), [d.fro]: true };
    const lonn = rund10(res.utbetaling * eff.lonn);
    g.saldo = (g.saldo || 0) + lonn;
    return {
      melding: T`${res.riktige} av ${res.antall} riktige. Dere tjente ${formaterKr(lonn)}${eff.lonn !== 1 ? T` (${eff.lonn > 1 ? '+' : '−'}${Math.round(Math.abs(eff.lonn - 1) * 100)} % fra hotellet)` : ''}.`,
      logg: { type: 'jobb', belop: lonn, land: g.posisjon, tekst: T`jobbet i ${landEtterId[g.posisjon].navn} (${res.riktige}/${res.antall})` },
    };
  });
}

function quiz(spillId, gid, d, i) {
  return medGruppe(spillId, gid, (g) => {
    const dag = idag();
    const antall = g.quiz?.[dag] || 0;
    if (antall >= i.quizPerDag) return { feil: T`Dere har tatt nok quizer i dag (maks ${i.quizPerDag}).` };
    if (!gyldigFro(d.fro)) return { feil: T('Ugyldig quiz. Last inn siden på nytt.') };
    if (g.brukteFro?.[d.fro]) return { feil: T('Denne quizen er allerede levert.') };
    const res = rettQuiz(d.fro, d.svar);
    const belop = res.riktige * i.quizBelop;
    g.quiz = { [dag]: antall + 1 };
    g.brukteFro = { ...(g.brukteFro || {}), [d.fro]: true };
    g.saldo = (g.saldo || 0) + belop;
    return {
      melding: T`${res.riktige} av ${res.antall} riktige! Dere fikk ${formaterKr(belop)}.`,
      logg: { type: 'quiz', belop, tekst: T`geografiquiz ${res.riktige}/${res.antall}` },
    };
  });
}

async function reiselogg(spillId, gid, spill) {
  const g = spill.grupper[gid];
  if (!harHotellHer(g)) return { ok: false, melding: T`Dere må bo på hotell i ${O.stedet} før dere kan levere reiseloggen.` };
  const status = spill.reiselogger?.[gid]?.[g.posisjon]?.status;
  if (status === 'levert') return { ok: false, melding: T('Reiseloggen er allerede levert. Vent på læreren.') };
  if (status === 'godkjent') return { ok: false, melding: T`Reiseloggen for ${O.detteStedet} er allerede godkjent.` };
  await update(r(`spill/${spillId}/reiselogger/${gid}/${g.posisjon}`), { status: 'levert', tid: Date.now() });
  const l = landEtterId[g.posisjon];
  return { ok: true, melding: T('Reiseloggen er levert! Gi den fysiske reiseloggen til læreren.'), logg: { type: 'reiselogg', land: g.posisjon, tekst: T`leverte reiselogg for ${l.flagg} ${l.navn}` } };
}

const LEVERT = ['levert', 'godkjent', 'duell', 'laast', 'tapt'];
// Diktaten tas på et sted (stedId), men pengene gis én gang per LAND (g.diktat[landkode]). I Jorda rundt er sted = land.
function kanTaDiktat(spill, gid, stedId, i) {
  const g = spill.grupper[gid]; const l = landEtterId[stedId]; const lk = landKode(stedId); const ln = landInfo[lk]?.navn || 'landet';
  if (!i.diktatBelopPerElev) return T('Diktat er slått av av læreren.');
  if (!l) return T`Ukjent ${O.sted}.`;
  if (PARLOR.harDiktat && !PARLOR.harDiktat(stedId)) return T`Det er ikke noe ${DIKTATNAVN.toLowerCase()} her.`;
  if (!LEVERT.includes(spill.reiselogger?.[gid]?.[stedId]?.status)) return T`Dere må levere reiseloggen for ${O.stedet} før dere kan ta diktaten.`;
  if (g.diktat?.[lk]) return T`Dere har allerede klart diktaten for ${ln}.`;
  if (g.diktatForsok?.[idag()]?.[lk]) return T`Dere har allerede prøvd diktaten for ${ln} i dag. Prøv igjen i morgen!`;
  return null;
}
async function diktatBe(spillId, gid, i, spill) {
  const land = spill.grupper[gid].posisjon;
  const hindring = kanTaDiktat(spill, gid, land, i);
  if (hindring) return { ok: false, melding: hindring };
  if (spill.diktatKo?.[gid]) return { ok: false, melding: T('Læreren har allerede fått beskjed. Vent litt!') };
  await update(r(`spill/${spillId}/diktatKo/${gid}`), { land, tid: Date.now() });
  return { ok: true, melding: T('Læreren har fått beskjed. Legg bort notatene – diktaten åpnes snart!') };
}
async function diktat(spillId, gid, d, i, spill) {
  const lk = landKode(d.land); const ln = landInfo[lk];
  const hindring = kanTaDiktat(spill, gid, d.land, i);
  if (hindring) return { ok: false, melding: hindring };
  const ko = spill.diktatKo?.[gid];
  if (!ko?.aapnet || ko.land !== d.land) return { ok: false, melding: T('Diktaten er ikke åpnet av læreren.') };
  if (i.diktatMinutter && Date.now() - ko.aapnet > i.diktatMinutter * 60000 + 30000) {
    await update(r(`spill/${spillId}/diktatKo`), { [gid]: null });
    return { ok: false, melding: T('Tiden gikk ut. Be læreren om en ny diktat.') };
  }
  await update(r(`spill/${spillId}/diktatKo`), { [gid]: null });
  const dag = idag();
  return medGruppe(spillId, gid, (g) => {
    if (g.diktat?.[lk]) return { feil: T`Dere har allerede klart diktaten for ${ln.navn}.` };
    if (g.diktatForsok?.[dag]?.[lk]) return { feil: T`Dere har allerede prøvd diktaten for ${ln.navn} i dag. Prøv igjen i morgen!` };
    const res = rettDiktat(d.land, d.svar);
    if (res.riktige === res.antall) {
      const belop = i.diktatBelopPerElev * (g.personer || 4);
      g.diktat = { ...(g.diktat || {}), [lk]: true };
      g.saldo = (g.saldo || 0) + belop;
      return { melding: T`5 av 5 riktige! Dere fikk ${formaterKr(belop)}. 🎉`, logg: { type: 'diktat', belop, land: d.land, tekst: T`klarte ${DIKTATNAVN.toLowerCase()} for ${ln.flagg} ${ln.navn} (5/5) ✍️` } };
    }
    g.diktatForsok = { [dag]: { ...(g.diktatForsok?.[dag] || {}), [lk]: true } };
    const feil = ORD.filter((_, n) => !res.resultat[n]).map((o) => `«${o.norsk}»`).join(', ');
    return { melding: T`${res.riktige} av ${res.antall} riktige. Sjekk ${feil} og prøv igjen i morgen!`, logg: { type: 'diktat', land: d.land, tekst: T`prøvde ${DIKTATNAVN.toLowerCase()} for ${ln.flagg} ${ln.navn} (${res.riktige}/${res.antall})` } };
  });
}

/** Læreren åpner (eller avviser) en diktat gruppa har bedt om. */
export async function aapneDiktat(spillId, gid) {
  await update(r(`spill/${spillId}/diktatKo/${gid}`), { aapnet: Date.now() });
}
export async function lukkDiktat(spillId, gid) {
  await update(r(`spill/${spillId}/diktatKo`), { [gid]: null });
}

/** Læreren godkjenner en diktat manuelt (f.eks. når elevene har funnet en riktig skrivemåte vi ikke har i fasiten). */
export async function godkjennDiktatManuelt(spillId, gid, stedId) {
  const spill = (await get(r(`spill/${spillId}`))).val() || {};
  const i = innst(spill); const g = spill.grupper?.[gid]; const lk = landKode(stedId); const l = landInfo[lk]; const landId = stedId;
  if (!g || !l) return T('Fant ikke gruppa eller landet.');
  if (g.diktat?.[lk]) return T`${g.navn} har allerede fått diktat-pengene for ${l.navn}.`;
  const belop = i.diktatBelopPerElev * (g.personer || 4);
  await update(r(`spill/${spillId}/grupper/${gid}/diktat`), { [lk]: true });
  await runTransaction(r(`spill/${spillId}/grupper/${gid}/saldo`), (s) => (s || 0) + belop);
  await logg(spillId, { gruppe: gid, type: 'diktat', belop, land: landId, tekst: T`fikk ${DIKTATNAVN.toLowerCase()} for ${l.flagg} ${l.navn} godkjent av læreren ✍️` });
  return T`${g.navn} fikk ${formaterKr(belop)} for diktaten i ${l.navn}.`;
}

// =====================================================================
// Lærerhandlinger (kjøres direkte fra lærersiden)
// =====================================================================

async function logg(spillId, data) {
  await push(r(`spill/${spillId}/logg`), { tid: Date.now(), ...data });
}

/** Læreren godkjenner en reiselogg. Gir stedet, eller starter en duell hvis en annen gruppe eier det. */
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
    tekst = T`erobret ${l.flagg} ${l.navn}!`;
  } else if (e.gruppe === gid) {
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'godkjent', tid: Date.now() };
    tekst = T`fikk reiselogg for ${l.flagg} ${l.navn} godkjent (eier ${O.stedet} allerede)`;
  } else if (erLaast(e, i)) {
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'laast', tid: Date.now() };
    tekst = T`besøkte ${l.flagg} ${l.navn}, men ${O.stedet} er låst`;
  } else {
    const duellId = push(r(`spill/${spillId}/dueller`)).key;
    u[`spill/${spillId}/dueller/${duellId}`] = { land: landId, utfordrer: gid, forsvarer: e.gruppe, status: 'venter', tid: Date.now() };
    u[`spill/${spillId}/reiselogger/${gid}/${landId}`] = { status: 'duell', tid: Date.now(), duell: duellId };
    tekst = T`utfordrer ${spill.grupper[e.gruppe]?.navn || T('en gruppe')} om ${l.flagg} ${l.navn}! ⚔️`;
  }
  u[`spill/${spillId}/logg/${push(r(`spill/${spillId}/logg`)).key}`] = { tid: Date.now(), gruppe: gid, type: 'erobring', land: landId, tekst };
  await update(r('/'), u);
  return tekst;
}

export async function avvisReiselogg(spillId, gid, landId) {
  await update(r(`spill/${spillId}/reiselogger/${gid}/${landId}`), { status: 'avvist', tid: Date.now() });
  await logg(spillId, { gruppe: gid, type: 'reiselogg', land: landId, tekst: T`må gjøre reiseloggen for ${landEtterId[landId].navn} på nytt` });
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
    tekst: T`vant duellen om ${l.flagg} ${l.navn} mot ${spill.grupper[taper]?.navn || ''}! 🏆`,
  };
  await update(r('/'), u);
  if (i.duellPremie) await runTransaction(r(`spill/${spillId}/grupper/${vinner}/saldo`), (s) => (s || 0) + i.duellPremie);
}

export async function justerSaldo(spillId, gid, belop, grunn) {
  await runTransaction(r(`spill/${spillId}/grupper/${gid}/saldo`), (s) => (s || 0) + belop);
  await logg(spillId, { gruppe: gid, type: T('lærer'), belop, tekst: T`${belop >= 0 ? T('fikk') : T('mistet')} ${formaterKr(Math.abs(belop))} fra læreren${grunn ? ': ' + grunn : ''}` });
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
  const pulje = duellPulje(spill);
  const brukt = new Set(Object.values(spill.dueller || {}).map((d) => d.okilde).filter(Boolean));
  let kandidater = pulje.filter((x) => !brukt.has(x.nokkel));
  if (!kandidater.length) kandidater = pulje;
  const valgt = kandidater[Math.floor(Math.random() * kandidater.length)];
  await update(r(`spill/${spillId}/dueller/${duellId}`), { o: valgt.o, okilde: valgt.nokkel, oppgave: null, trukket: Date.now(), startet: null });
  return valgt.o;
}
export async function startDuellNedtelling(spillId, duellId) {
  await update(r(`spill/${spillId}/dueller/${duellId}`), { startet: Date.now() });
}
