// Norge rundt – regler som er spesielle for dette spillet: standardinnstillinger, poeng, geografiquiz
// og allemannsrett-quizen som må bestås for å sette opp telt.
import { LAND, landEtterId, LANDENE, landKode, byerILand, LANDSDELER } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 20000, // kr per gruppemedlem ved start (gruppe på 4 = 80 000 kr)
  diktatBelopPerElev: 0,  // ingen parlør-diktat i Norge rundt
  poengBy: 3,             // poeng per sted gruppa eier
  heltLand1: 5,           // bonus for å eie ALLE stedene i et fylke med 1 sted
  heltLand2: 10,          //   … med 2 steder
  heltLand3: 20,          //   … med 3 steder
  heltLand4: 30,          //   … med 4 steder
  heltLand5: 40,          //   … med 5 eller flere steder
};
export const POENGFELT = [['poengBy', 'Poeng per sted'], ['heltLand', 'Bonus for hele fylket']];

export function heltLandBonus(antall, i) {
  const n = Math.max(1, Math.min(5, antall));
  return Number(i?.[`heltLand${n}`] ?? STANDARD[`heltLand${n}`]) || 0;
}
/** byer = steder gruppa eier · land = fylker gruppa har minst ett sted i · heleLand = fylker der gruppa eier alle (åpne) steder */
export function poengForGruppe(gid, eierskap, i, erStengt) {
  const byer = Object.entries(eierskap).filter(([id, e]) => e.gruppe === gid && landEtterId[id]).map(([id]) => id);
  const land = [...new Set(byer.map(landKode))];
  const heleLand = land.filter((k) => {
    const apne = byerILand(k).filter((b) => !erStengt(b.id, i));
    return apne.length > 0 && apne.every((b) => eierskap[b.id]?.gruppe === gid);
  });
  const bonus = heleLand.reduce((sum, k) => sum + heltLandBonus(byerILand(k).filter((b) => !erStengt(b.id, i)).length, i), 0);
  return { byer, land, kontinenter: [], heleLand, bonus, poeng: byer.length * i.poengBy + bonus };
}

// ---------- geografiquiz (Norge) ----------
const SENTRE = LANDENE.filter((f) => f.id !== '32');        // Akershus styres fra Oslo – for forvirrende
export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['fylke', 'senter', 'landsdel', 'nord', 'fylke', 'senterfylke', 'nord']);
  for (let n = 0; n < antall; n++) {
    const type = typer[n % typer.length];
    if (type === 'fylke') {
      const s = velg(r, LAND);
      const feil = stokk(r, LANDENE.filter((f) => f.id !== s.landId)).slice(0, 3);
      spm.push({ tekst: `I hvilket fylke ligger ${s.navn}?`, valg: stokk(r, [s.landNavn, ...feil.map((f) => f.navn)]), svar: s.landNavn });
    } else if (type === 'senter') {
      const f = velg(r, SENTRE);
      const feil = stokk(r, SENTRE.filter((x) => x.by !== f.by)).slice(0, 3).map((x) => x.by);
      spm.push({ tekst: `Hvilken by er administrasjonssenter i ${f.navn}?`, valg: stokk(r, [f.by, ...feil]), svar: f.by });
    } else if (type === 'senterfylke') {
      const f = velg(r, SENTRE);
      const feil = stokk(r, SENTRE.filter((x) => x.id !== f.id)).slice(0, 3).map((x) => x.navn);
      spm.push({ tekst: `${f.by} er administrasjonssenter i hvilket fylke?`, valg: stokk(r, [f.navn, ...feil]), svar: f.navn });
    } else if (type === 'landsdel') {
      const s = velg(r, LAND);
      spm.push({ tekst: `I hvilken landsdel ligger ${s.navn}?`, valg: stokk(r, [s.kontinent, ...stokk(r, LANDSDELER.filter((x) => x !== s.kontinent)).slice(0, 3)]), svar: s.kontinent });
    } else {
      const tre = stokk(r, LAND).slice(0, 3).sort((a, b) => b.lat - a.lat);
      if (tre[0].lat - tre[1].lat < 1) { n--; continue; }
      spm.push({ tekst: `Hvilket sted ligger lengst nord?`, valg: stokk(r, tre.map((l) => l.navn)), svar: tre[0].navn });
    }
  }
  return spm;
}

// ---------- telt og allemannsretten ----------
// For å sette opp telt må gruppa svare riktig på tre spørsmål om allemannsretten.
const ALLEMANNSRETT = [
  ['Hvor langt unna et hus eller en hytte der folk bor, må teltet stå?', 'Minst 150 meter', ['Minst 10 meter', 'Minst 50 meter', 'Det finnes ingen regel']],
  ['Hvor mange netter kan dere telte på samme sted i lavlandet uten å spørre grunneieren?', 'To netter', ['Én uke', 'Så lenge dere vil', 'Ingen – dere må alltid spørre']],
  ['Hvor kan dere sette opp telt etter allemannsretten?', 'I utmark, for eksempel skog, fjell og myr', ['I hager', 'På dyrket åker og eng', 'Midt i byen']],
  ['Når er det forbudt å gjøre opp bål i eller nær skogen?', 'Fra 15. april til 15. september', ['Bare om vinteren', 'Bare i juli', 'Det er alltid lov']],
  ['Hva gjør dere med søpla når dere drar fra teltplassen?', 'Tar den med oss', ['Graver den ned', 'Brenner den i bålet', 'Lar den ligge til neste turist']],
  ['Hvordan skal teltplassen se ut når dere drar?', 'Som da dere kom – eller enda finere', ['Det spiller ingen rolle', 'Med et tydelig merke etter oss', 'Ryddig nok med litt søppel']],
  ['Hvorfor må hunder være i bånd fra 1. april til 20. august?', 'For å beskytte fugler, sauer og andre dyr som får unger', ['Fordi det er sommerferie', 'For at hunden ikke skal bli sliten', 'Det er bare en anbefaling']],
  ['Kan dere plukke bær og sopp i skogen?', 'Ja, i utmark kan alle plukke bær og sopp', ['Nei, aldri', 'Bare med tillatelse fra kommunen', 'Bare hvis dere betaler']],
  ['Hvor lenge kan dere telte på samme sted på fjellet, langt unna hus og hytter?', 'Lenger enn to netter', ['Bare én natt', 'Ikke i det hele tatt', 'Bare om vinteren']],
  ['Hva sier allemannsretten om hvordan dere skal oppføre dere i naturen?', 'Vis hensyn til natur, dyr og andre folk', ['Gjør som dere vil', 'Bare voksne må vise hensyn', 'Lag så mye lyd dere vil']],
];
export const TELT_ANTALL = 3;
/** Tre spørsmål om allemannsretten (samme frø gir samme spørsmål, så banken kan rette dem) */
export function teltQuiz(fro) {
  const r = rng('telt-' + fro);
  return stokk(r, ALLEMANNSRETT).slice(0, TELT_ANTALL).map(([tekst, svar, feil]) => ({ tekst, valg: stokk(r, [svar, ...feil]), svar }));
}
export function rettTeltQuiz(fro, svar = []) {
  const q = teltQuiz(fro);
  const riktige = q.filter((s, n) => svar[n] === s.svar).length;
  return { riktige, antall: q.length };
}
/** Overraskelser i teltet (i stedet for hotellhendelsene) */
export const TELTHENDELSER = [
  { tekst: '🌧️ Regn hele natta – teltet lakk, og dere måtte kjøpe tørre sokker.', kr: -200 },
  { tekst: '🦟 Mygg overalt! Dere måtte kjøpe myggmiddel.', kr: -150 },
  { tekst: '🌌 Nordlys over teltet! Dere solgte et bilde til en turist.', kr: 500 },
  { tekst: '🐑 Sauer rundt teltet hele morgenen – dere sov dårlig og orker én jobb mindre per dag.', jobb: -1 },
  { tekst: '⛺ Teltstanga knakk – ny stang kostet litt.', kr: -300 },
  { tekst: '🎣 Dere fikk fisk til middag og sparte matpenger.', kr: 200 },
];
