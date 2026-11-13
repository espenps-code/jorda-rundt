// Solsystemet rundt – regler som er spesielle for dette spillet: standardinnstillinger, poeng, romquiz,
// elevenes veiviser (med rammefortellingen) og hendelser på reisen.
import { LAND, landEtterId, LANDENE, landKode, byerILand } from './land.js';
import { UTSTYR as ALT_UTSTYR } from './steder.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 30000, // kr per gruppemedlem ved start (gruppe på 4 = 120 000 kr)
  poengBy: 3,             // poeng per sted gruppa eier
  heltLand1: 5,           // bonus for å eie ALLE stedene i et system med 1 sted
  heltLand2: 10,          //   … med 2 steder (Neptun-systemet)
  heltLand3: 20,          //   … med 3 steder (Jorda-systemet)
  heltLand4: 30,          //   … med 4 steder (asteroidene, Uranus-systemet)
  heltLand5: 40,          //   … med 5 eller flere steder
};
export const POENGFELT = [['poengBy', 'Poeng per sted'], ['heltLand', 'Bonus for hele systemet']];

export function heltLandBonus(antall, i) {
  const n = Math.max(1, Math.min(5, antall));
  return Number(i?.[`heltLand${n}`] ?? STANDARD[`heltLand${n}`]) || 0;
}
/** byer = steder gruppa eier · land = systemer gruppa har minst ett sted i · heleLand = systemer der gruppa eier alle (åpne) steder */
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

// ---------- utstyr til romskipet ----------
/** Utstyret som kan kjøpes (landingsmodulen følger med alle skip og er ikke med her). Motoren bruker denne lista. */
export const UTSTYR = Object.fromEntries(Object.entries(ALT_UTSTYR).filter(([, u]) => !u.standard));
/** Hvilket utstyr mangler mannskapet for å reise til stedet? Gir en liste med id-er (tom = klar til å reise). */
export function utstyrMangler(gruppe, stedId) {
  return (landEtterId[stedId]?.krav || []).filter((id) => UTSTYR[id] && !gruppe?.utstyr?.[id]);
}

// ---------- sove i romskipet («telt» i motoren) ----------
// For å sove gratis i romskipet må mannskapet svare riktig på tre spørsmål om livet om bord.
const LIVET_OM_BORD = [
  ['Hvorfor må astronauter feste soveposen til veggen?', 'Ellers svever de rundt mens de sover', ['For at det skal bli varmere', 'For å høre vekkerklokka', 'Det er bare en gammel tradisjon']],
  ['Hvorfor må astronauter trene hver dag i rommet?', 'Muskler og skjelett blir svake uten tyngdekraft', ['For å holde varmen', 'For at tida skal gå fortere', 'For å lage strøm til skipet']],
  ['Hva gjøres med svette og urin på en romstasjon?', 'Det renses og blir til drikkevann', ['Det slippes ut i rommet', 'Det fryses ned og sendes til Jorda', 'Det brukes som drivstoff']],
  ['Hvorfor spiser astronauter helst ikke vanlig brød?', 'Smulene svever rundt og kan havne i utstyr og øyne', ['Brød blir giftig i rommet', 'Det er for tungt å ta med', 'Brød smaker ingenting i rommet']],
  ['Hvorfor må lufta i et romskip renses hele tida?', 'For å fjerne karbondioksidet mannskapet puster ut', ['For å fjerne tyngdekraften', 'For at det skal lukte godt', 'For å lage vind i kabinen']],
  ['Hva er farlig for mannskapet under en solstorm?', 'Strålingen', ['Bråket', 'Regnet', 'Vinden']],
  ['Hvorfor er brann ekstra farlig i et romskip?', 'Røyken kan ikke luftes ut, og ingen kan rømme ut', ['Flammer er kaldere i rommet', 'Brannslukkere virker ikke i rommet', 'Det finnes ikke vann om bord']],
  ['Hvordan vasker astronauter håret i vektløs tilstand?', 'Med sjampo som ikke trenger å skylles ut', ['I en vanlig dusj', 'De vasker det aldri', 'Med støvsuger']],
  ['Hvorfor må alle løse ting festes med borrelås eller stropper?', 'Ellers svever de bort og kan skade folk og utstyr', ['Ellers faller de i gulvet og knuser', 'For at det skal se ryddig ut på bilder', 'Fordi de blir tyngre i rommet']],
  ['Hvorfor må et mannskap langt ute i solsystemet klare seg selv?', 'Meldinger til Jorda bruker lang tid, og hjelp kan ikke komme fort', ['Det er forbudt å ringe hjem', 'Jorda er alltid skjult bak Sola', 'Radioer virker ikke i rommet']],
];
export const TELT_ANTALL = 3;
/** Tre spørsmål om livet om bord (samme frø gir samme spørsmål, så banken kan rette dem) */
export function teltQuiz(fro) {
  const r = rng('telt-' + fro);
  return stokk(r, LIVET_OM_BORD).slice(0, TELT_ANTALL).map(([tekst, svar, feil]) => ({ tekst, valg: stokk(r, [svar, ...feil]), svar }));
}
export function rettTeltQuiz(fro, svar = []) {
  const q = teltQuiz(fro);
  return { riktige: q.filter((s, n) => svar[n] === s.svar).length, antall: q.length };
}
/** Overraskelser når mannskapet sover i romskipet (i stedet for hotellhendelsene) */
export const TELTHENDELSER = [
  { tekst: '🚨 En alarm pep halve natta. Dere fant feilen, men måtte kjøpe en ny sensor.', kr: -200 },
  { tekst: '😴 Noen snorket i vektløs tilstand – dere orker én jobb mindre per dag.', jobb: -1 },
  { tekst: '🌠 Dere så et sjeldent stjerneskudd-regn fra køya og solgte filmen til et observatorium.', kr: 500 },
  { tekst: '🧦 En sokk svevde inn i lufteanlegget. Reparasjonen kostet litt.', kr: -250 },
  { tekst: '🔧 Dere brukte kvelden på å fikse en lekkasje – og fant en glemt kasse med forsyninger.', kr: 300 },
  { tekst: '🥫 Dere spiste av nødrasjonene og sparte matpenger.', kr: 200 },
];

// ---------- romquiz ----------
// [spørsmål, riktig svar, tre feil svar]
export const ROMFAKTA = [
  ['Hvilken planet er den største i solsystemet?', 'Jupiter', ['Saturn', 'Neptun', 'Jorda']],
  ['Hvilken planet er den minste i solsystemet?', 'Merkur', ['Mars', 'Venus', 'Pluto']],
  ['Hvilken planet ligger nærmest Sola?', 'Merkur', ['Venus', 'Jorda', 'Mars']],
  ['Hvilken planet er den varmeste?', 'Venus', ['Merkur', 'Mars', 'Jupiter']],
  ['Hvor mange planeter er det i solsystemet?', '8', ['7', '9', '12']],
  ['Hva kalles Mars ofte?', 'Den røde planeten', ['Den blå planeten', 'Morgenstjerna', 'Ringplaneten']],
  ['Hva er Sola?', 'En stjerne', ['En planet', 'En komet', 'En måne']],
  ['Hvilken planet har de største og tydeligste ringene?', 'Saturn', ['Jupiter', 'Mars', 'Venus']],
  ['Hva heter den høyeste vulkanen i solsystemet?', 'Olympus Mons', ['Mount Everest', 'Vesuv', 'Galdhøpiggen']],
  ['På hvilken planet ligger Olympus Mons?', 'Mars', ['Venus', 'Jorda', 'Merkur']],
  ['Hva heter den største månen i solsystemet?', 'Ganymedes', ['Titan', 'Månen vår', 'Io']],
  ['Hvilken måne har tykk atmosfære og innsjøer av flytende metan?', 'Titan', ['Europa', 'Triton', 'Phobos']],
  ['Hvilken måne har flest aktive vulkaner?', 'Io', ['Callisto', 'Mimas', 'Charon']],
  ['Hva tror forskerne ligger under isen på Jupiters måne Europa?', 'Et hav av flytende vann', ['En kjerne av gull', 'Et hav av lava', 'Ingenting – månen er hul']],
  ['Hva er Pluto?', 'En dvergplanet', ['En planet', 'En komet', 'En måne']],
  ['Hvilket år bestemte astronomene at Pluto er en dvergplanet?', '2006', ['1969', '1986', '2019']],
  ['Omtrent hvor lang tid bruker lyset fra Sola til Jorda?', '8 minutter', ['8 sekunder', '8 timer', '8 døgn']],
  ['Hva er Den store røde flekken på Jupiter?', 'En kjempestorm', ['En vulkan', 'Et hav', 'Et krater']],
  ['Hvilken planet ligger på siden og «ruller» rundt Sola?', 'Uranus', ['Neptun', 'Saturn', 'Mars']],
  ['Hvor ligger asteroidebeltet?', 'Mellom Mars og Jupiter', ['Mellom Jorda og Mars', 'Mellom Saturn og Uranus', 'Utenfor Neptun']],
  ['Hva er det største objektet i asteroidebeltet?', 'Ceres', ['Vesta', 'Pluto', 'Phobos']],
  ['Hvilket år landet de første menneskene på Månen?', '1969', ['1957', '1986', '2001']],
  ['Hvem var det første mennesket som gikk på Månen?', 'Neil Armstrong', ['Jurij Gagarin', 'Buzz Aldrin', 'Galileo Galilei']],
  ['Hva er en komet for det meste laget av?', 'Is og støv', ['Jern', 'Glødende lava', 'Gass fra Sola']],
  ['Omtrent hvor ofte kan Halleys komet ses fra Jorda?', 'Hvert 76. år', ['Hvert år', 'Hvert 10. år', 'Hvert 1000. år']],
  ['På hvilken planet er ett døgn lengre enn ett år?', 'Venus', ['Jorda', 'Jupiter', 'Neptun']],
  ['Hvilke to planeter kalles gasskjemper?', 'Jupiter og Saturn', ['Mars og Venus', 'Merkur og Jorda', 'Pluto og Eris']],
  ['Hvilke to planeter kalles iskjemper?', 'Uranus og Neptun', ['Jupiter og Saturn', 'Mars og Merkur', 'Venus og Jorda']],
  ['Hva heter de to månene til Mars?', 'Phobos og Deimos', ['Io og Europa', 'Titan og Mimas', 'Charon og Triton']],
  ['Hvilken av Saturns måner spruter vann og is ut i rommet?', 'Enceladus', ['Iapetus', 'Mimas', 'Titan']],
  ['Hvilken romsonde fløy forbi Pluto i 2015?', 'New Horizons', ['Apollo 11', 'Curiosity', 'Sputnik']],
  ['Hvor sterk er tyngdekraften på Månen sammenlignet med på Jorda?', 'Omtrent en sjettedel', ['Dobbelt så sterk', 'Akkurat like sterk', 'Det finnes ingen tyngdekraft der']],
  ['Hvilken planet har de sterkeste vindene?', 'Neptun', ['Jorda', 'Mars', 'Merkur']],
  ['Hvorfor har vi årstider på Jorda?', 'Fordi jordaksen heller', ['Fordi Jorda er nærmere Sola om sommeren', 'Fordi Månen skygger for Sola', 'Fordi Sola skrur seg av og på']],
  ['Hva heter galaksen vår?', 'Melkeveien', ['Andromeda', 'Solsystemet', 'Karlsvogna']],
  ['Hvor lang tid bruker Jorda på én runde rundt Sola?', 'Ett år', ['Ett døgn', 'Én måned', 'Ti år']],
  ['Hvor lang tid bruker Jorda på å snurre én gang rundt seg selv?', 'Ett døgn', ['Én time', 'Én uke', 'Ett år']],
  ['Hvor mange mennesker har gått på Månen?', '12', ['2', '50', '100']],
  ['Hva heter den største månen til Pluto?', 'Charon', ['Triton', 'Titania', 'Deimos']],
  ['Hvilken måne går «feil vei» rundt planeten sin?', 'Triton', ['Månen vår', 'Io', 'Titan']],
  ['Hvorfor kan ingen lande på Jupiter?', 'Planeten har ingen fast overflate', ['Den er for liten', 'Den er dekket av hav', 'Den er for langt unna Sola']],
  ['Hva kalles en stein fra rommet som har falt ned på Jorda?', 'En meteoritt', ['En komet', 'En satellitt', 'En romsonde']],
];
const TYPENAVN = { stasjon: 'En romstasjon', måne: 'En måne', planet: 'En planet', stjerne: 'En stjerne', dvergplanet: 'En dvergplanet', asteroide: 'En asteroide', komet: 'En komet' };
const QUIZSTEDER = LAND.filter((l) => !l.kropp && l.type !== 'stasjon');     // hele himmellegemer (ikke enkeltsteder på Mars og Månen)
const MAANER = QUIZSTEDER.filter((l) => l.type === 'måne');
const PLANETNAVN = { mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptun: 'Neptun', pluto: 'Pluto' };

export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['fakta', 'bane', 'fakta', 'lengst', 'fakta', 'type', 'fakta']);
  const brukteFakta = new Set();
  for (let n = 0; n < antall; n++) {
    const type = typer[n % typer.length];
    if (type === 'bane') {
      const m = velg(r, MAANER); const svar = PLANETNAVN[m.krets];
      const feil = stokk(r, Object.values(PLANETNAVN).filter((x) => x !== svar)).slice(0, 3);
      spm.push({ tekst: `Hvilken planet eller dvergplanet går ${m.navn} i bane rundt?`, valg: stokk(r, [svar, ...feil]), svar });
    } else if (type === 'lengst') {
      const tre = stokk(r, QUIZSTEDER.filter((l) => l.type !== 'måne' && l.type !== 'komet')).slice(0, 3).sort((a, b) => b.au - a.au);
      if (tre[0].au - tre[1].au < 1) { typer[n % typer.length] = 'fakta'; n--; continue; }
      spm.push({ tekst: 'Hvilken av disse ligger lengst fra Sola?', valg: stokk(r, tre.map((l) => l.navn)), svar: tre[0].navn });
    } else if (type === 'type') {
      const s = velg(r, QUIZSTEDER.filter((l) => l.type !== 'stjerne'));
      const svar = TYPENAVN[s.type];
      const feil = stokk(r, Object.values(TYPENAVN).filter((x) => x !== svar && x !== 'En romstasjon')).slice(0, 3);
      spm.push({ tekst: `Hva er ${s.navn}?`, valg: stokk(r, [svar, ...feil]), svar });
    } else {
      let k = Math.floor(r() * ROMFAKTA.length);
      while (brukteFakta.has(k)) k = (k + 1) % ROMFAKTA.length;
      brukteFakta.add(k);
      const [tekst, svar, feil] = ROMFAKTA[k];
      spm.push({ tekst, valg: stokk(r, [svar, ...feil]), svar });
    }
  }
  return spm;
}

// ---------- elevenes veiviser (med rammefortellingen) ----------
export function veiviser({ g, l, i, slutt, li, esc, formaterKr, startbelop }) {
  return [
    { ikon: '🚀', tittel: 'År 2247', tekst: `<p>Menneskene har bygd baser på Månen og Mars. Nå sender <b>Romakademiet</b> ut unge mannskap for å utforske resten av solsystemet – helt ut til kometene og de iskalde dvergplanetene.</p><p>Dere er ett av mannskapene.</p><p class="dempet">Romskipene og basene er en fortelling om framtida. Men alt dere lærer om planetene og månene, er ekte!</p>` },
    { ikon: '👋', tittel: `Velkommen, ${esc(g.navn)}!`, tekst: `<p>Dere er et mannskap på <b>${g.personer || 4}</b> med <b>${formaterKr(startbelop)}</b> i ekspedisjonskassa.</p><p>Ekspedisjonen starter her: <b>${l.flagg} ${esc(l.navn)}</b> (${esc(l.landNavn)}). Målet er å erobre flest mulig steder i solsystemet – og helst hele systemer – før de andre mannskapene gjør det!${slutt}</p><p class="dempet">Bla deg gjennom denne korte guiden. Den tar to minutter.</p>` },
    { ikon: '🏆', tittel: 'Slik får dere poeng', tekst: `<div class="liste">${li('📍', `<b>${i.poengBy} poeng</b> for hvert sted dere eier – måner, planeter, dvergplaneter, asteroider og kometer`)}${li('🪐', `<b>Bonus</b> når dere eier <b>alle</b> stedene i et system: ${[1, 2, 3, 4, 5].map((n) => `${n} ${n === 1 ? 'sted' : 'steder'} = ${heltLandBonus(n, i)}`).join(' · ')}`)}${li('⚔️', 'Andre mannskap kan «stjele» et sted i duell – og da ryker bonusen for hele systemet.')}</div><p>Et system er for eksempel Jupiter med månene sine. Små systemer er raske å fullføre. Store gir mest – men er vanskeligere å holde på.</p>` },
    { ikon: '🛏️', tittel: 'Først: et sted å bo', tekst: `<p>På hvert nytt sted må dere først ordne overnatting for <b>tre netter</b>. Uten det kan dere ikke gjøre noe der.</p><div class="liste">${li('🏕️', 'På måner og steinplaneter bor dere i en <b>base</b> på overflaten.')}${li('🛰️', 'På <b>gasskjempene</b> og <b>Sola</b> finnes det ingen bakke å lande på. Der går dere i bane og bor på en <b>banestasjon</b>.')}${li('🚀', '<b>Romskipet er gratis!</b> Men det er trangt – og først må dere svare riktig på tre spørsmål om livet om bord.')}${li('⭐', '<b>Billig sovekapsel</b> = dårlig søvn: færre jobber per dag og lavere lønn.')}${li('🌟', '<b>Fin kuppel</b> = uthvilte: flere jobber og høyere lønn.')}${li('🎲', 'På de billigste stedene kan det skje overraskelser – gode og dårlige!')}</div>` },
    { ikon: '📓', tittel: 'Loggboka gir dere stedet', tekst: `<div class="liste">${li('1️⃣', 'Fordel rollene: <b>navigatør</b>, <b>forsker</b> og <b>reporter</b> (og <b>kaptein</b> hvis dere er fire). Bytt roller på hvert nytt sted.')}${li('2️⃣', 'Alle fyller ut sin side i loggboka. Finn ut hvordan det <b>egentlig</b> er her: temperatur, luft, tyngdekraft og farer.')}${li('3️⃣', 'Trykk <b>«Vi har levert loggboka»</b> under fanen Loggbok.')}${li('4️⃣', 'Læreren godkjenner – og stedet blir deres! 🎉')}</div><p>Eier et annet mannskap stedet allerede? Da blir det <b>⚔️ duell</b> om det!</p>` },
    { ikon: '🧭', tittel: 'Reis videre', tekst: `<p>Trykk på et system på kartet for å zoome inn, og så på et sted – eller søk under <b>Reis</b>. Prisen gjelder for hele mannskapet.</p><div class="liste">${li('🚀', '<b>Direkte rute</b> er dyr, men rask: <b>2 riktige</b> svar underveis.')}${li('🪙', '<b>Rute med stopp</b> er billigere, men tar lengre tid: <b>4</b> riktige svar (1 stopp) eller <b>6</b> (2 stopp).')}${li('☄️', 'Underveis spinner dere et hjul og svarer på spørsmål. Feil svar gir et nytt spørsmål.')}${li('📏', 'Avstandene i rommet er enorme. Spillet viser avstanden når planetene står nærmest hverandre.')}</div>` },
    { ikon: '🧰', tittel: 'Spesialutstyr', tekst: `<p>Noen steder er så ekstreme at romskipet må ha <b>spesialutstyr</b> før dere kan reise dit. Dere kjøper det under <b>Reis</b> og beholder det resten av spillet.</p><div class="liste">${Object.values(UTSTYR).map((u) => li(u.ikon, `<b>${esc(u.navn)}</b> (${formaterKr(u.pris)}) – ${esc(u.hvorfor)}`)).join('')}</div><p>Tenk dere om: Skal dere spare til dyrt utstyr, eller ta flere steder i nærheten først?</p>` },
    { ikon: '💰', tittel: 'Tjen penger', tekst: `<div class="liste">${li('💼', '<b>Jobb</b> – løs regnestykker. Lønna er høyere jo lenger ut og jo farligere stedet er.')}${li('🔭', `<b>Romquiz</b> – ${formaterKr(i.quizBelop)} per riktig svar, ${i.quizPerDag} quizer per dag.`)}${li('🌠', 'På reisen kan det skje ting: solstormer, mikrometeoritter – og gode overraskelser.')}</div><p>Tips: Nær Jorda er alt billig, men lønna er lav. Langt ute er alt dyrt – men der betaler de godt!</p>` },
    { ikon: '🔒', tittel: 'Forsvar stedene deres', tekst: `<div class="liste">${i.laasDager ? li('⏳', `Et sted kan utfordres av andre i <b>${i.laasDager} dager</b> – så blir det låst og trygt.`) : ''}${i.laasDager ? li('🕒', 'Under <b>Våre steder</b> ser dere en nedtelling for hvert sted: så lenge har andre på seg.') : ''}${li('⚔️', `Duellene er morsomme oppgaver i klasserommet. Vinneren får stedet${i.duellPremie ? ` og ${formaterKr(i.duellPremie)}` : ''}.`)}</div>` },
    { ikon: '🪐', tittel: 'Klar for avreise!', tekst: `<p>Boksen <b>«Neste steg»</b> øverst forteller dere alltid hva dere skal gjøre nå.</p><p>Trykk <b>❓ Hjelp</b> oppe til høyre hvis dere vil se denne guiden igjen.</p><p style="font:800 1.3rem var(--font-tittel);color:var(--hav);text-align:center;margin-top:1.2rem">God tur, mannskap! 🚀</p>` },
  ];
}

// ---------- hendelser på reisen ----------
// Når et mannskap kommer fram, kan det ha skjedd noe underveis. Brukes av banken (js/bank.js → landing).
// kr ganges med prisnivået på stedet dere kom til. ytre = bare utenfor asteroidebeltet · indre = bare innenfor.
const REISEHENDELSER = [
  { tekst: '🌞 Solstorm! Mannskapet måtte gjemme seg i skjermingsrommet i mange timer, og elektronikken må repareres.', kr: -300 },
  { tekst: '☄️ En mikrometeoritt slo hull i en solcelle. Reservedelen kostet litt.', kr: -250 },
  { tekst: '📡 Dere fanget opp et sjeldent radiosignal fra en fjern stjerne og solgte målingene til et observatorium.', kr: 500 },
  { tekst: '🥔 Potetene i drivhuset om bord ga rekordavling. Dere sparte matpenger.', kr: 200 },
  { tekst: '📸 Dere tok et fantastisk bilde av Jorda som en liten blå prikk. Et museum kjøpte det!', kr: 400 },
  { tekst: '🚽 Toalettet om bord gikk i stykker. I vektløs tilstand er det en dyr krise.', kr: -200 },
  { tekst: '🧊 Dere passerte en liten isklump og fylte vanntankene gratis.', kr: 300, ytre: true },
  { tekst: '🪨 Skipet måtte ta en omvei rundt en sverm av småstein. Det kostet ekstra drivstoff.', kr: -300, ytre: true },
  { tekst: '🌌 Dere hjalp et annet mannskap med å reparere antenna og fikk takk i form av forsyninger.', kr: 300 },
  { tekst: '🔥 Kjølesystemet slet med varmen så nær Sola. Dere måtte bytte et filter.', kr: -250, indre: true },
  { tekst: '🎂 Noen om bord hadde bursdag! Kaka fløt rundt i kabinen, men stemningen var på topp.', kr: 0 },
];
export const REISEHENDELSE_SJANSE = 0.35;
/** En tilfeldig hendelse som passer reisen, eller null. tilfeldig = () => tall mellom 0 og 1 */
export function reisehendelse({ til }, tilfeldig = Math.random) {
  if (tilfeldig() >= REISEHENDELSE_SJANSE) return null;
  const sted = landEtterId[til]; if (!sted) return null;
  const ytre = sted.au > 3.5;
  const passer = REISEHENDELSER.filter((h) => (!h.ytre || ytre) && (!h.indre || sted.au < 1));
  return passer.length ? passer[Math.floor(tilfeldig() * passer.length)] : null;
}
