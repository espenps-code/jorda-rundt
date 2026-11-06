// Europa rundt – regler som er spesielle for dette spillet: standardinnstillinger, poeng og geografiquiz.
import { LAND, landEtterId, LANDENE, landKode, byerILand } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 25000, // kr per gruppemedlem ved start (gruppe på 4 = 100 000 kr). Reiser i Europa er billigere enn jorda rundt.
  poengBy: 3,             // poeng per by gruppa eier
  heltLand1: 5,           // bonus for å eie ALLE byene i et land med 1 by
  heltLand2: 10,          //   … med 2 byer
  heltLand3: 20,          //   … med 3 byer
  heltLand4: 30,          //   … med 4 byer
  heltLand5: 40,          //   … med 5 byer
};
export const POENGFELT = [['poengBy', 'Poeng per by'], ['heltLand', 'Bonus for hele landet']];

/** Bonus for å eie hele landet, etter hvor mange byer landet har (maks 5). */
export function heltLandBonus(antallByer, i) {
  const n = Math.max(1, Math.min(5, antallByer));
  return Number(i?.[`heltLand${n}`] ?? STANDARD[`heltLand${n}`]) || 0;
}
/** byer = by-id-er gruppa eier · land = landkoder gruppa har minst én by i · heleLand = land der gruppa eier alle (åpne) byer */
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

// ---------- geografiquiz (Europa) ----------
const QUIZLAND = LANDENE.filter((l) => l.id !== 'VA');
const QUIZBYER = LAND.filter((l) => !l.hovedstad);
export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['hovedstad', 'flagg', 'byland', 'nord', 'land', 'byland', 'flagg']);
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
    } else if (type === 'byland') {
      const by = velg(r, QUIZBYER);
      const feil = stokk(r, QUIZLAND.filter((l) => l.id !== by.landId)).slice(0, 3);
      spm.push({ tekst: `I hvilket land ligger ${by.navn}?`, valg: stokk(r, [by.landNavn, ...feil.map((l) => l.navn)]), svar: by.landNavn });
    } else {
      const tre = stokk(r, LAND).slice(0, 3).sort((a, b) => b.lat - a.lat);
      if (tre[0].lat - tre[1].lat < 2) { n--; continue; }
      spm.push({ tekst: `Hvilken by ligger lengst nord?`, valg: stokk(r, tre.map((l) => `${l.navn} (${l.landNavn})`)), svar: `${tre[0].navn} (${tre[0].landNavn})` });
    }
  }
  return spm;
}
