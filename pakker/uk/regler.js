// Across the UK – rules that are special for this game: default settings, points, the UK quiz,
// wild camping (Scottish Outdoor Access Code), surprises on the road, and the students' guide.
import { LAND, landEtterId, LANDENE, landKode, byerILand, NASJONER } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 2000,  // pounds per student at the start (a group of 4 = £8,000)
  quizBelop: 25,            // pounds per correct answer in the UK quiz
  duellPremie: 400,         // pounds to the winner of a duel
  poengBy: 3,               // points per place the group owns
  poengRegion: 2,         // points for each region where the group owns at least one place (belønner å reise rundt, ikke å ta alt i ett område)
};
export const POENGFELT = [['poengBy', 'Points per place'], ['poengRegion', 'Bonus per region']];

// Gammel regel (til november 2026): bonus for å eie ALLE stedene i en region. Den fikk gruppene til å bli i ett område,
// så nå gis en liten bonus for hver region gruppa har minst ett sted i. Funksjonen finnes fortsatt fordi motoren spør etter den.
export const heltLandBonus = () => 0;
/** byer = places the group owns · land = regions where the group has a place · heleLand = regions where the group owns all (open) places */
export function poengForGruppe(gid, eierskap, i, erStengt) {
  const byer = Object.entries(eierskap).filter(([id, e]) => e.gruppe === gid && landEtterId[id]).map(([id]) => id);
  const land = [...new Set(byer.map(landKode))];
  const heleLand = land.filter((k) => {
    const apne = byerILand(k).filter((b) => !erStengt(b.id, i));
    return apne.length > 0 && apne.every((b) => eierskap[b.id]?.gruppe === gid);
  });
  const bonus = land.length * (Number(i.poengRegion) || 0);     // heleLand gir ikke poeng lenger – bare en farge på kartet
  return { byer, land, kontinenter: [], heleLand, bonus, poeng: byer.length * i.poengBy + bonus };
}

// ---------- UK quiz ----------
const UK_FAKTA = [
  ['Which four countries make up the United Kingdom?', 'England, Scotland, Wales and Northern Ireland', ['England, Scotland, Wales and Ireland', 'England, Scotland, Ireland and France', 'England, Wales, Norway and Scotland']],
  ['What is the capital of the United Kingdom?', 'London', ['Edinburgh', 'Manchester', 'Dublin']],
  ['What is the capital of Scotland?', 'Edinburgh', ['Glasgow', 'Aberdeen', 'Inverness']],
  ['What is the capital of Wales?', 'Cardiff', ['Swansea', 'Bangor', 'Bristol']],
  ['What is the capital of Northern Ireland?', 'Belfast', ['Dublin', 'Derry/Londonderry', 'Liverpool']],
  ['What is the flag of the United Kingdom called?', 'The Union Jack', ['The Stars and Stripes', 'The Red Dragon', 'The Tricolour']],
  ['Which animal is on the flag of Wales?', 'A red dragon', ['A white horse', 'A golden lion', 'A black sheep']],
  ['What money do people use in the UK?', 'Pounds', ['Euros', 'Dollars', 'Kroner']],
  ['How many pence are there in one pound?', '100', ['10', '50', '12']],
  ['Which river runs through London?', 'The Thames', ['The Severn', 'The Mersey', 'The Tyne']],
  ['What is the name of the famous clock tower in London?', 'Big Ben', ['Tall Tom', 'The Shard', 'The London Eye']],
  ['Where does the King live when he is in London?', 'In Buckingham Palace', ['In the Tower of London', 'At 10 Downing Street', 'In Windsor Bridge']],
  ['Who lives at 10 Downing Street?', 'The Prime Minister', ['The King', 'The Mayor of London', 'Sherlock Holmes']],
  ['Which is the highest mountain in the UK?', 'Ben Nevis', ['Snowdon', 'Scafell Pike', 'Mount Everest']],
  ['In which country is the highest mountain in the UK, Ben Nevis?', 'Scotland', ['England', 'Wales', 'Northern Ireland']],
  ['Which lake in Scotland is famous for a monster?', 'Loch Ness', ['Loch Lomond', 'Lake Windermere', 'Lough Neagh']],
  ['On which side of the road do people drive in the UK?', 'On the left', ['On the right', 'In the middle', 'It depends on the day']],
  ['Which sea is between Great Britain and Ireland?', 'The Irish Sea', ['The North Sea', 'The Baltic Sea', 'The Black Sea']],
  ['Which sea is between the UK and Norway?', 'The North Sea', ['The Irish Sea', 'The Mediterranean Sea', 'The Red Sea']],
  ['What is the name of the tunnel under the sea between England and France?', 'The Channel Tunnel', ['The London Tunnel', 'The Dover Bridge', 'The Atlantic Tunnel']],
  ['Which famous writer was born in Stratford-upon-Avon?', 'William Shakespeare', ['Charles Dickens', 'J.K. Rowling', 'Roald Dahl']],
  ['Which famous band came from Liverpool?', 'The Beatles', ['ABBA', 'Queen', 'The Rolling Stones']],
  ['Which old stone circle stands in the south of England?', 'Stonehenge', ['The Colosseum', 'Hadrian\'s Wall', 'The Giant\'s Causeway']],
  ['Who built a long wall across the north of England almost 2,000 years ago?', 'The Romans', ['The Vikings', 'The Normans', 'The Victorians']],
  ['Which famous ship was built in Belfast?', 'The Titanic', ['The Mayflower', 'The Fram', 'The Cutty Sark']],
  ['What are the two official languages of Wales?', 'Welsh and English', ['Gaelic and English', 'English and French', 'Welsh and Irish']],
  ['What is the national flower of England?', 'The rose', ['The thistle', 'The daffodil', 'The tulip']],
  ['What is the national flower of Scotland?', 'The thistle', ['The rose', 'The daffodil', 'The sunflower']],
  ['What is the underground train system in London often called?', 'The Tube', ['The Pipe', 'The Metro Line', 'The Snake']],
  ['Which typical British meal is fried fish with fried potatoes?', 'Fish and chips', ['Bangers and mash', 'Sunday roast', 'Shepherd\'s pie']],
  ['What do many British people drink with milk every day?', 'Tea', ['Coffee', 'Cola', 'Lemonade']],
  ['In which city can you see the Angel of the North nearby?', 'Newcastle', ['Brighton', 'Cardiff', 'Plymouth']],
  ['Which two old university cities have a famous boat race against each other?', 'Oxford and Cambridge', ['London and York', 'Leeds and Bath', 'Glasgow and Edinburgh']],
  ['In the UK, what is the school subject "mathematics" called for short?', 'Maths', ['Math', 'Matte', 'Numbers']],
];
const HOVEDBYER = LAND.filter((l) => l.hovedstad);
export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['nation', 'region', 'fact', 'fact', 'north', 'west', 'placein', 'fact']);
  const fakta = stokk(r, UK_FAKTA);
  let vakt = 0;
  for (let n = 0; n < antall && vakt < 60; n++, vakt++) {
    const type = typer[n % typer.length];
    const fasit = velg(r, LAND);
    if (type === 'nation') {
      spm.push({ tekst: `In which country of the UK is ${fasit.navn}?`, valg: stokk(r, NASJONER), svar: fasit.kontinent });
    } else if (type === 'region') {
      const f = velg(r, LAND.filter((l) => l.kontinent === 'England' && l.landId !== 'TLI'));
      const feil = stokk(r, LANDENE.filter((x) => x.kontinent === 'England' && x.id !== f.landId && x.id !== 'TLI')).slice(0, 3);
      spm.push({ tekst: `In which region of England is ${f.navn}?`, valg: stokk(r, [f.landNavn, ...feil.map((x) => x.navn)]), svar: f.landNavn });
    } else if (type === 'placein') {
      const reg = velg(r, LANDENE.filter((x) => x.id !== 'TLI'));
      const riktig = velg(r, byerILand(reg.id));
      const feil = stokk(r, LAND.filter((l) => l.landId !== reg.id)).slice(0, 3);
      spm.push({ tekst: `Which of these places is in ${/Midlands|East of England/.test(reg.navn) ? 'the ' : ''}${reg.navn}?`, valg: stokk(r, [riktig, ...feil].map((l) => l.navn)), svar: riktig.navn });
    } else if (type === 'fact') {
      const [tekst, svar, feil] = fakta[spm.length % fakta.length];
      spm.push({ tekst, valg: stokk(r, [svar, ...feil]), svar });
    } else {
      const tre = stokk(r, LAND).slice(0, 3);
      const nord = type === 'north';
      tre.sort((x, y) => (nord ? y.lat - x.lat : x.lng - y.lng));
      if (Math.abs(nord ? tre[0].lat - tre[1].lat : tre[0].lng - tre[1].lng) < 0.8) { n--; continue; }
      spm.push({ tekst: `Which place is farthest ${nord ? 'north' : 'west'}?`, valg: stokk(r, tre.map((l) => `${l.navn} (${l.kontinent})`)), svar: `${tre[0].navn} (${tre[0].kontinent})` });
    }
  }
  return spm;
}

// ---------- wild camping with the Scottish Outdoor Access Code ----------
// In Scotland, everyone has the right to camp in nature – if they follow the Outdoor Access Code. (It is very much like
// "allemannsretten" in Norway.) Camping is free in the game, but the group must answer all the questions correctly.
const ACCESS_CODE = [
  ['What do you do with your litter when you leave the campsite?', 'We take all of it with us', ['We bury it', 'We burn it', 'We leave it for the next campers']],
  ['How long should you camp in the same place?', 'Only two or three nights', ['A whole month', 'As long as we want', 'One hour']],
  ['Where can you go wild camping in Scotland?', 'On open land, away from houses and roads', ['In somebody\'s garden', 'In a field with crops', 'In the middle of a town']],
  ['Where should you NOT put up your tent?', 'In a field with farm animals or crops', ['On open hills', 'Far away from buildings', 'On a quiet beach']],
  ['What is the safest way to cook when you camp?', 'On a camping stove', ['On a big open fire in the forest', 'On a fire made on dry grass', 'With fireworks']],
  ['What should the place look like when you leave?', 'Just like when we came – no trace of us', ['It does not matter', 'With a clear mark that we were there', 'Clean enough, with a little litter']],
  ['You have a dog with you, and there are sheep nearby. What do you do?', 'Keep the dog on a short lead', ['Let the dog run free', 'Let the dog chase the sheep', 'Leave the dog alone at the tent']],
  ['How many tents should camp together when you go wild camping?', 'Only a few – a small group', ['As many as possible', 'At least twenty', 'A whole school']],
  ['Somebody lives in a house near the place where you want to camp. What do you do?', 'Camp far away, so we do not disturb them', ['Put the tent next to their door', 'Make a lot of noise', 'Walk through their garden']],
  ['What does the Outdoor Access Code say about nature and other people?', 'Respect people, care for nature and take responsibility for what you do', ['Do what you want', 'Only adults must be careful', 'Be as loud as you like']],
];
export const TELT_ANTALL = 3;
/** Three questions about the Outdoor Access Code (the same seed gives the same questions, so the bank can check them) */
export function teltQuiz(fro) {
  const r = rng('telt-' + fro);
  return stokk(r, ACCESS_CODE).slice(0, TELT_ANTALL).map(([tekst, svar, feil]) => ({ tekst, valg: stokk(r, [svar, ...feil]), svar }));
}
export function rettTeltQuiz(fro, svar = []) {
  const q = teltQuiz(fro);
  const riktige = q.filter((s, n) => svar[n] === s.svar).length;
  return { riktige, antall: q.length };
}
/** Surprises in the tent (instead of the hotel surprises). kr = amount in "kroner scale" – the engine turns 100 into about £10. */
export const TELTHENDELSER = [
  { tekst: '🌧️ Rain all night – the tent leaked, and you had to buy dry socks.', kr: -200 },
  { tekst: '🦟 Midges everywhere! You had to buy insect spray.', kr: -150 },
  { tekst: '🌌 The northern lights over the tent! You sold a photo to a tourist.', kr: 500 },
  { tekst: '🐑 Sheep around the tent all morning – you slept badly and only have energy for one job less per day.', jobb: -1 },
  { tekst: '⛺ A tent pole broke in the wind – a new one cost a little.', kr: -300 },
  { tekst: '🎣 You caught fish for dinner and saved money on food.', kr: 200 },
];

// ---------- surprises on the road (weather and other British things) ----------
// Used by the bank (js/bank.js → landing). kr is in "kroner scale" and follows the price level of the place.
const ARSTID = (mnd) => (mnd === 12 || mnd <= 2 ? 'winter' : mnd <= 5 ? 'spring' : mnd <= 8 ? 'summer' : 'autumn');
const REISEHENDELSER = [
  { tekst: '🌧️ It rained all the way. You had to buy umbrellas.', kr: -150 },
  { arstid: ['autumn'], typer: ['tog'], tekst: '🍂 Leaves on the line! The train was an hour late, and the railway gave you some money back.', kr: 200 },
  { arstid: ['winter'], typer: ['tog', 'buss'], tekst: '❄️ A little snow – and everything stopped. You had to buy hot chocolate while you waited.', kr: -200 },
  { arstid: ['winter', 'autumn'], typer: ['fly'], tekst: '🌫️ Thick fog! The plane was late, and the airline gave you a meal voucher.', kr: 150 },
  { arstid: ['winter', 'autumn'], typer: ['bat'], tekst: '🌊 Big waves on the Irish Sea! The ferry was late, and you had to buy food on board.', kr: -200 },
  { nasjoner: ['Scotland'], typer: ['buss'], tekst: '🐮 A Highland cow stood in the middle of the road for twenty minutes. Great photos!', kr: 0 },
  { nasjoner: ['Wales'], typer: ['buss', 'tog'], tekst: '🐑 Sheep on the road in Wales! A farmer thanked you for helping and gave you a little money.', kr: 200 },
  { arstid: ['summer'], tekst: '🐦 A seagull stole your chips! You had to buy new ones.', kr: -100 },
  { arstid: ['summer'], tekst: '☀️ A sunny day! You helped at an ice cream van and earned a little extra.', kr: 300 },
  { arstid: ['spring', 'summer'], tekst: '🎪 You arrived in the middle of a village fête. Somebody gave the whole group tea and cake!', kr: 200 },
  { typer: ['tog'], tekst: '☕ The tea trolley on the train was free today. Lucky you!', kr: 100 },
  { arstid: ['autumn'], dato: '11-05', tekst: '🎆 You arrived on Bonfire Night! You watched the fireworks and got free toffee apples.', kr: 200 },
];
export const REISEHENDELSE_SJANSE = 0.35;
/** A random event that fits the trip, or null. tilfeldig = () => a number between 0 and 1 */
export function reisehendelse({ type, til, dato }, tilfeldig = Math.random) {
  if (tilfeldig() >= REISEHENDELSE_SJANSE) return null;
  const mnd = Number(String(dato).slice(5, 7)); const dag = String(dato).slice(5, 10);
  const sted = landEtterId[til]; if (!sted) return null;
  const passer = REISEHENDELSER.filter((h) => (!h.arstid || h.arstid.includes(ARSTID(mnd))) && (!h.typer || h.typer.includes(type))
    && (!h.nasjoner || h.nasjoner.includes(sted.kontinent)) && (!h.dato || h.dato === dag));
  return passer.length ? passer[Math.floor(tilfeldig() * passer.length)] : null;
}

// ---------- the students' guide (shown the first time they log in, and under "Help") ----------
/** v = { g, l, i, slutt, li, esc, formaterKr, startbelop } from elev.html. Returns the pages of the guide. */
export function veiviser({ g, l, i, slutt, li, esc, formaterKr, startbelop }) {
  return [
    { ikon: '👋', tittel: `Welcome, ${esc(g.navn)}!`, tekst: `<p>You are a travel group of <b>${g.personer || 4}</b> with <b>${formaterKr(startbelop)}</b> in your travel fund.</p><p>Your trip starts in <b>${l.flagg} ${esc(l.navn)}, ${esc(l.landNavn)}</b>. The goal is to conquer as many places in the UK as possible – and whole regions – before the other groups do!${slutt}</p><p class="dempet">Click through this short guide. It takes two minutes.</p>` },
    { ikon: '🏆', tittel: 'How to get points', tekst: `<div class="liste">${li('📍', `<b>${i.poengBy} points</b> for each place you own`)}${li('🗺️', `<b>${i.poengRegion} bonus points</b> for each region where you own at least one place`)}${li('🇬🇧', 'There are 12 regions: 9 in England, plus Scotland, Wales and Northern Ireland.')}${li('⚔️', 'Other groups can “steal” a place in a duel.')}</div><p>So it is smart to travel around and spread out across the whole UK.</p>` },
    { ikon: '🏨', tittel: 'First: a place to stay', tekst: `<p>In each new place, you must first book a place to stay for <b>three nights</b>. Without it, you cannot do anything there.</p><div class="liste">${li('⛺', '<b>Wild camping is free!</b> But only in the Scottish Highlands – and first you must show that you know the <b>Outdoor Access Code</b>: three questions, and all must be correct.')}${li('⭐', '<b>Cheap hostel</b> = bad sleep: fewer jobs per day and lower pay.')}${li('🌟', '<b>Fine hotel</b> = well rested: more jobs and higher pay.')}${li('🍳', 'Extras give you bonuses: breakfast (+1 job), airport shuttle (−10% on flights), Wi-Fi (50/50 lifeline).')}${li('🎲', 'Surprises can happen in a tent and at the cheapest places – good ones and bad ones!')}</div>` },
    { ikon: '📓', tittel: 'The travel log gives you the place', tekst: `<div class="liste">${li('1️⃣', 'Fill in the paper travel log: facts, sights and a drawing.')}${li('2️⃣', 'Press <b>“We have handed in the travel log”</b> under the tab Travel log.')}${li('3️⃣', 'The teacher approves it – and the place is yours! 🎉')}</div><p>Does another group already own the place? Then there will be a <b>⚔️ duel</b> for it!</p>` },
    { ikon: '🧭', tittel: 'Travel on', tekst: `<p>Press a place on the map, or search under <b>Travel</b>. The price is for the whole group.</p><div class="liste">${li('✈️', '<b>Planes</b> are fast: <b>2 correct</b> answers on the way (direct) or <b>4</b> (with a stop). Only between places with an airport.')}${li('🚆', '<b>Trains</b> are quick, but expensive in the UK.')}${li('🚌', '<b>Coaches</b> (long-distance buses) are the cheapest – but slow, with many questions.')}${li('⛴️', 'To <b>Northern Ireland</b> you must cross the Irish Sea: by plane or by <b>ferry</b>.')}${li('🌪️', 'On the way, you spin a wheel and answer questions. A wrong answer gives you a new question.')}</div>` },
    { ikon: '💰', tittel: 'Earn money', tekst: `<div class="liste">${li('💼', '<b>Job</b> – solve maths problems with pounds. The pay is higher where everything is expensive.')}${li('🧭', `<b>UK quiz</b> – ${formaterKr(i.quizBelop)} per correct answer, ${i.quizPerDag} quizzes per day.`)}${li('🌦️', '<b>The British weather</b> can give you surprises on the road – rain, fog and leaves on the line!')}</div><p>Tip: London is expensive to stay in – but the pay is also higher there.</p>` },
    { ikon: '🔒', tittel: 'Defend your places', tekst: `<div class="liste">${i.laasDager ? li('⏳', `Others can challenge you for a place for <b>${i.laasDager} days</b> – then it is locked and safe.`) : ''}${i.laasDager ? li('🕒', 'Under <b>Our places</b> you see a countdown for each place: that is how long the others have.') : ''}${li('⚔️', `The duels are fun tasks in the classroom. The winner gets the place${i.duellPremie ? ` and ${formaterKr(i.duellPremie)}` : ''}.`)}</div>` },
    { ikon: '🇬🇧', tittel: 'Ready to go!', tekst: `<p>The box <b>“Next step”</b> at the top always tells you what to do now.</p><p>Press <b>❓ Help</b> in the top right corner if you want to see this guide again.</p><p style="font:800 1.3rem var(--font-tittel);color:var(--hav);text-align:center;margin-top:1.2rem">Have a great trip! 🚆✈️⛴️</p>` },
  ];
}
