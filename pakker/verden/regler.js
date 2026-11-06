// Jorda rundt – regler som er spesielle for dette spillet: standardinnstillinger, poeng og geografiquiz.
import { LAND, landEtterId, KONTINENTER } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 50000, // kr per gruppemedlem ved start (gruppe på 4 = 200 000 kr)
  poengLand: 5,           // poeng per land gruppa eier
  poengKontinent: 10,     // poeng per kontinent gruppa har minst ett land på
};
/** Innstillingsfelt for poeng på lærersiden: [navn, etikett] */
export const POENGFELT = [['poengLand', 'Poeng per land'], ['poengKontinent', 'Poeng per kontinent']];

/** Poengtavle-rad for én gruppe. eierskap = spill.eierskap, i = innstillinger. */
export function poengForGruppe(gid, eierskap, i) {
  const land = Object.entries(eierskap).filter(([id, e]) => e.gruppe === gid && landEtterId[id]).map(([id]) => id);
  const kontinenter = [...new Set(land.map((id) => landEtterId[id]?.kontinent).filter(Boolean))];
  // «byer» og «heleLand» finnes for at motoren skal kunne behandle alle spill likt
  return { land, byer: land, kontinenter, heleLand: [], bonus: 0, poeng: land.length * i.poengLand + kontinenter.length * i.poengKontinent };
}
export const heltLandBonus = () => 0;

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
