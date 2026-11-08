// Norge rundt – regler som er spesielle for dette spillet: standardinnstillinger, poeng, geografiquiz
// og allemannsrett-quizen som må bestås for å sette opp telt.
import { LAND, landEtterId, LANDENE, landKode, byerILand, LANDSDELER } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 20000, // kr per gruppemedlem ved start (gruppe på 4 = 80 000 kr)
  diktatBelopPerElev: 1000, // samisk språkoppdrag i Troms og Finnmark (én gang per fylke)
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
// Svalbard er ikke et fylke, og «Vårt sted»-stedene er ikke åpne i alle spill – derfor er de ikke med i quizen.
const FYLKENE = LANDENE.filter((f) => f.id !== '21');
const SENTRE = FYLKENE.filter((f) => f.id !== '32');        // Akershus styres fra Oslo – for forvirrende
const QUIZSTEDER = LAND.filter((l) => !l.valgfri && !l.oy);

// Norgesfakta: næringer, natur, kjente steder og samferdsel. [spørsmål, riktig svar, tre feil svar]
export const NORGESFAKTA = [
  ['Hva heter Norges høyeste fjell?', 'Galdhøpiggen', ['Glittertind', 'Snøhetta', 'Store Skagastølstind']],
  ['Hva heter Norges lengste fjord?', 'Sognefjorden', ['Hardangerfjorden', 'Trondheimsfjorden', 'Oslofjorden']],
  ['Hva heter Norges største innsjø?', 'Mjøsa', ['Femunden', 'Tyrifjorden', 'Randsfjorden']],
  ['Hva heter Norges lengste elv?', 'Glomma', ['Lågen', 'Tanaelva', 'Altaelva']],
  ['Hva heter den største isbreen på fastlandet i Norge?', 'Jostedalsbreen', ['Folgefonna', 'Svartisen', 'Hardangerjøkulen']],
  ['Ved hvilken fjord ligger Preikestolen?', 'Lysefjorden', ['Geirangerfjorden', 'Sognefjorden', 'Nærøyfjorden']],
  ['Hvilken fjord står på UNESCOs verdensarvliste sammen med Geirangerfjorden?', 'Nærøyfjorden', ['Lysefjorden', 'Oslofjorden', 'Trondheimsfjorden']],
  ['Hva kalles det når sola er oppe hele døgnet om sommeren i nord?', 'Midnattssol', ['Mørketid', 'Nordlys', 'Jevndøgn']],
  ['Hva kalles tiden om vinteren når sola ikke kommer over horisonten i Nord-Norge?', 'Mørketid', ['Midnattssol', 'Polarnatt-ferie', 'Vintersolverv-uka']],
  ['Hvor må dere være for å kunne se midnattssol?', 'Nord for polarsirkelen', ['Sør for Oslo', 'Bare på Vestlandet', 'Ved ekvator']],
  ['I hvilket fylke krysser toget polarsirkelen på vei nordover?', 'Nordland', ['Trøndelag', 'Troms', 'Finnmark']],
  ['Hvilket oljefelt i Nordsjøen ble funnet i 1969 og startet oljeeventyret?', 'Ekofisk', ['Troll', 'Statfjord', 'Snøhvit']],
  ['Hvilken by kalles ofte Norges oljehovedstad?', 'Stavanger', ['Bergen', 'Kristiansund', 'Hammerfest']],
  ['Hva er Norges største eksportvare?', 'Olje og gass', ['Fisk', 'Tømmer', 'Aluminium']],
  ['Hvilken fisk henges til tørk på hjeller i Lofoten og blir til tørrfisk?', 'Torsk', ['Laks', 'Makrell', 'Sild']],
  ['Hva var det gruvene på Røros hentet opp i over 300 år?', 'Kobber', ['Sølv', 'Gull', 'Kull']],
  ['Hva var det gruvene på Kongsberg hentet opp?', 'Sølv', ['Kobber', 'Jern', 'Kull']],
  ['Hvilket sted er kjent for Vemork og tungtvannsaksjonen under krigen?', 'Rjukan', ['Kongsberg', 'Røros', 'Narvik']],
  ['Hvor ligger Sametinget?', 'Karasjok', ['Tromsø', 'Alta', 'Kautokeino']],
  ['Hvilket språk er offisielt språk sammen med norsk i flere kommuner i nord?', 'Samisk', ['Finsk', 'Svensk', 'Russisk']],
  ['Hvilket dyr gjeter mange samiske familier på vidda?', 'Rein', ['Elg', 'Sau', 'Hjort']],
  ['Hvor ligger Bryggen, som står på UNESCOs verdensarvliste?', 'Bergen', ['Trondheim', 'Ålesund', 'Stavanger']],
  ['I hvilken by ligger Nidarosdomen?', 'Trondheim', ['Bergen', 'Oslo', 'Stavanger']],
  ['Hvilken by arrangerte vinter-OL i 1994?', 'Lillehammer', ['Oslo', 'Trondheim', 'Geilo']],
  ['I hvilket fylke ligger Atlanterhavsveien?', 'Møre og Romsdal', ['Vestland', 'Nordland', 'Rogaland']],
  ['Mellom hvilke to byer går Bergensbanen?', 'Oslo og Bergen', ['Oslo og Trondheim', 'Bergen og Stavanger', 'Trondheim og Bodø']],
  ['Mellom hvilke to steder går Hurtigruta?', 'Bergen og Kirkenes', ['Oslo og Tromsø', 'Stavanger og Bodø', 'Trondheim og Hammerfest']],
  ['Hva heter hovedstedet på Svalbard?', 'Longyearbyen', ['Ny-Ålesund', 'Barentsburg', 'Hammerfest']],
  ['Hvor mange fylker har Norge?', '15', ['11', '19', '23']],
  ['Hvilken dag er Norges nasjonaldag?', '17. mai', ['1. mai', '7. juni', '24. desember']],
  ['I hvilket fylke ligger Nordkapp?', 'Finnmark', ['Troms', 'Nordland', 'Svalbard']],
];

export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['fylke', 'senter', 'landsdel', 'nord', 'fakta', 'senterfylke', 'fakta']);
  const brukteFakta = new Set();
  for (let n = 0; n < antall; n++) {
    const type = typer[n % typer.length];
    if (type === 'fakta') {
      let k = Math.floor(r() * NORGESFAKTA.length);
      while (brukteFakta.has(k)) k = (k + 1) % NORGESFAKTA.length;
      brukteFakta.add(k);
      const [tekst, svar, feil] = NORGESFAKTA[k];
      spm.push({ tekst, valg: stokk(r, [svar, ...feil]), svar });
    } else if (type === 'fylke') {
      const s = velg(r, QUIZSTEDER);
      const feil = stokk(r, FYLKENE.filter((f) => f.id !== s.landId)).slice(0, 3);
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
      const s = velg(r, QUIZSTEDER);
      spm.push({ tekst: `I hvilken landsdel ligger ${s.navn}?`, valg: stokk(r, [s.kontinent, ...stokk(r, LANDSDELER.filter((x) => x !== s.kontinent)).slice(0, 3)]), svar: s.kontinent });
    } else {
      const tre = stokk(r, QUIZSTEDER).slice(0, 3).sort((a, b) => b.lat - a.lat);
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

// ---------- natur- og værhendelser på reisen ----------
// Når en gruppe kommer fram, kan det ha skjedd noe underveis. Hendelsene følger årstiden og reisemåten.
// Brukes av banken (js/bank.js → landing). kr ganges med prisnivået på stedet dere kom til.
const ARSTID = (mnd) => (mnd === 12 || mnd <= 3 ? 'vinter' : mnd <= 5 ? 'var' : mnd <= 8 ? 'sommer' : 'host');
const REISEHENDELSER = [
  { arstid: ['vinter'], typer: ['buss', 'tog'], tekst: '❄️ Fjellovergangen var stengt på grunn av snøstorm. Dere ventet i timevis og måtte kjøpe varm mat.', kr: -300 },
  { arstid: ['vinter'], nord: true, tekst: '🌌 Nordlyset danset over himmelen da dere kom fram! Dere solgte et bilde til lokalavisa.', kr: 500 },
  { arstid: ['vinter'], typer: ['fly'], tekst: '🧊 Flyet måtte avises før avgang og ble forsinket. Dere fikk matkupong av flyselskapet.', kr: 150 },
  { arstid: ['vinter', 'host'], typer: ['bat'], tekst: '🌊 Storm langs kysten! Båten ble forsinket, og dere måtte kjøpe mat om bord.', kr: -250 },
  { arstid: ['host'], tekst: '🍄 Dere plukket blåbær og sopp i en pause underveis og sparte matpenger.', kr: 200 },
  { arstid: ['host', 'var'], typer: ['buss'], tekst: '🌧️ Regnet høljet ned, og et ras stengte veien. Bussen måtte kjøre en lang omvei.', kr: -200 },
  { arstid: ['var'], tekst: '🌊 Snøsmeltingen gjorde elvene flomstore. Dere tok en ekstra tur for å se fossene – og fikk tips om en jobb!', kr: 300 },
  { arstid: ['var'], dato: '05-17', tekst: '🇳🇴 Dere kom fram midt i 17. mai-toget! Noen spanderte is og pølser på hele gruppa.', kr: 300 },
  { arstid: ['sommer'], nord: true, tekst: '☀️ Midnattssol! Dere var så opplagte at dere hjalp til på en kafé hele natta.', kr: 400 },
  { arstid: ['sommer'], typer: ['buss'], tekst: '🐑 En saueflokk sperret veien i en halvtime. Sjåføren ble sur, men dere fikk fine bilder.', kr: 0 },
  { arstid: ['sommer'], tekst: '🦟 Myggen var overalt der dere stoppet. Dere måtte kjøpe myggmiddel.', kr: -150 },
  { arstid: ['sommer'], typer: ['bat'], tekst: '🐋 Hval ved siden av båten! En turist kjøpte videoen deres.', kr: 400 },
];
export const REISEHENDELSE_SJANSE = 0.35;
/** En tilfeldig hendelse som passer reisen, eller null. tilfeldig = () => tall mellom 0 og 1 */
export function reisehendelse({ type, til, dato }, tilfeldig = Math.random) {
  if (tilfeldig() >= REISEHENDELSE_SJANSE) return null;
  const mnd = Number(String(dato).slice(5, 7)); const dag = String(dato).slice(5, 10);
  const sted = landEtterId[til]; if (!sted) return null;
  const nord = sted.lat >= 66.5;                         // nord for polarsirkelen
  const passer = REISEHENDELSER.filter((h) => h.arstid.includes(ARSTID(mnd)) && (!h.typer || h.typer.includes(type))
    && (!h.nord || nord) && (!h.dato || h.dato === dag));
  return passer.length ? passer[Math.floor(tilfeldig() * passer.length)] : null;
}
