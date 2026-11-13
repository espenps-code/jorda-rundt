// Across Australia – rules that are special for this game: default settings, points, the Australia quiz,
// bush camping (the rules of the bush), surprises on the road, and the students' guide.
import { LAND, landEtterId, LANDENE, landKode, byerILand } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 3000,  // dollars per student at the start (a group of 4 = $12,000) – Australia is huge, so travel costs more
  quizBelop: 30,            // dollars per correct answer in the Australia quiz
  duellPremie: 500,         // dollars to the winner of a duel
  poengBy: 3,               // points per place the group owns
  poengRegion: 2,         // points for each state or territory where the group owns at least one place (belønner å reise rundt, ikke å ta alt i ett område)
};
export const POENGFELT = [['poengBy', 'Points per place'], ['poengRegion', 'Bonus per state']];

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

// ---------- Australia quiz ----------
const AUS_FAKTA = [
  ['What is the capital of Australia?', 'Canberra', ['Sydney', 'Melbourne', 'Perth']],
  ['Which is the biggest city in Australia?', 'Sydney', ['Canberra', 'Darwin', 'Hobart']],
  ['How many states does Australia have?', 'Six', ['Two', 'Eight', 'Fifty']],
  ['Which Australian state is an island?', 'Tasmania', ['Victoria', 'Queensland', 'South Australia']],
  ['Which is the biggest state in Australia?', 'Western Australia', ['Tasmania', 'Victoria', 'New South Wales']],
  ['What money do people use in Australia?', 'Australian dollars', ['Pounds', 'Euros', 'Kroner']],
  ['When it is winter in Norway, which season is it in Australia?', 'Summer', ['Winter', 'Autumn', 'Spring']],
  ['In which months is it winter in Australia?', 'June, July and August', ['December, January and February', 'March, April and May', 'It is never winter there']],
  ['On which side of the road do people drive in Australia?', 'On the left', ['On the right', 'In the middle', 'It depends on the state']],
  ['What is the big red rock in the middle of Australia called?', 'Uluru', ['Mount Kosciuszko', 'Big Ben', 'The Blue Mountains']],
  ['What is the world\'s biggest coral reef, off the coast of Queensland, called?', 'The Great Barrier Reef', ['The Great Ocean Road', 'The Coral Wall', 'The Gold Coast']],
  ['Which is the highest mountain on the Australian mainland?', 'Mount Kosciuszko', ['Uluru', 'Ben Nevis', 'Mount Everest']],
  ['What are the dry, empty areas in the middle of Australia called?', 'The outback', ['The backyard', 'The highlands', 'The prairie']],
  ['What do Australians often call the wild countryside with trees and bushes?', 'The bush', ['The garden', 'The jungle', 'The moor']],
  ['Which two animals are on the Australian coat of arms?', 'A kangaroo and an emu', ['A koala and a wombat', 'A crocodile and a shark', 'A lion and a unicorn']],
  ['Where does a baby kangaroo live after it is born?', 'In its mother\'s pouch', ['In a nest in a tree', 'In a hole in the ground', 'On its father\'s back']],
  ['What is a baby kangaroo called?', 'A joey', ['A cub', 'A puppy', 'A kid']],
  ['What do koalas eat?', 'Eucalyptus leaves', ['Fish', 'Bamboo', 'Insects']],
  ['Which Australian animal has a beak like a duck and lays eggs?', 'The platypus', ['The koala', 'The dingo', 'The wombat']],
  ['Which Australian bird sounds like it is laughing?', 'The kookaburra', ['The emu', 'The penguin', 'The black swan']],
  ['What is a dingo?', 'A wild dog', ['A small kangaroo', 'A big lizard', 'A kind of bird']],
  ['Who were the first people to live in Australia?', 'Aboriginal and Torres Strait Islander peoples', ['The Vikings', 'The Romans', 'The Maori']],
  ['For about how long have Aboriginal people lived in Australia?', 'More than 60,000 years', ['About 200 years', 'About 1,000 years', 'About 5,000 years']],
  ['What is a boomerang?', 'A curved throwing stick', ['A kind of drum', 'A small boat', 'A warm coat']],
  ['Which famous building in Sydney has a roof that looks like sails?', 'The Sydney Opera House', ['The Sydney Tower', 'Parliament House', 'The Harbour Bridge']],
  ['Which two oceans are on each side of Australia?', 'The Indian Ocean and the Pacific Ocean', ['The Atlantic Ocean and the Arctic Ocean', 'The North Sea and the Baltic Sea', 'The Atlantic Ocean and the Indian Ocean']],
  ['Which country is Australia\'s neighbour to the south-east, across the Tasman Sea?', 'New Zealand', ['Japan', 'South Africa', 'Iceland']],
  ['What colours are on the Australian flag?', 'Blue, red and white', ['Green and gold', 'Red, white and black', 'Yellow and blue']],
  ['Which group of stars is on the Australian flag?', 'The Southern Cross', ['The Big Dipper', 'The North Star', 'The Seven Sisters']],
  ['What do Australians often say instead of "hello"?', 'G\'day', ['Howdy', 'Cheerio', 'Aloha']],
  ['What do Australians call a barbecue?', 'A barbie', ['A billy', 'A brolly', 'A bikkie']],
  ['Australia is a country – and also a …?', 'Continent', ['City', 'Planet', 'Peninsula']],
  ['What is a very long truck with three or four trailers called in the outback?', 'A road train', ['A bush bus', 'A land ship', 'A sand tram']],
  ['Which city is the capital of the island state Tasmania?', 'Hobart', ['Darwin', 'Adelaide', 'Cairns']],
];
const HOVEDBYER = LAND.filter((l) => l.hovedstad);
export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['state', 'capital', 'fact', 'fact', 'north', 'west', 'placein', 'fact']);
  const fakta = stokk(r, AUS_FAKTA);
  let vakt = 0;
  for (let n = 0; n < antall && vakt < 60; n++, vakt++) {
    const type = typer[n % typer.length];
    if (type === 'state') {
      const f = velg(r, LAND);
      const feil = stokk(r, LANDENE.filter((x) => x.id !== f.landId)).slice(0, 3);
      spm.push({ tekst: `In which state or territory is ${f.navn}?`, valg: stokk(r, [f.landNavn, ...feil.map((x) => x.navn)]), svar: f.landNavn });
    } else if (type === 'capital') {
      const f = velg(r, HOVEDBYER.filter((l) => l.landId !== 'ACT'));
      const feil = stokk(r, HOVEDBYER.filter((l) => l.id !== f.id)).slice(0, 3);
      spm.push({ tekst: `What is the capital city of ${f.landId === 'NT' ? 'the ' : ''}${f.landNavn}?`, valg: stokk(r, [f, ...feil].map((l) => l.navn)), svar: f.navn });
    } else if (type === 'placein') {
      const reg = velg(r, LANDENE.filter((x) => x.id !== 'ACT'));
      const riktig = velg(r, byerILand(reg.id));
      const feil = stokk(r, LAND.filter((l) => l.landId !== reg.id)).slice(0, 3);
      spm.push({ tekst: `Which of these places is in ${reg.id === 'NT' ? 'the ' : ''}${reg.navn}?`, valg: stokk(r, [riktig, ...feil].map((l) => l.navn)), svar: riktig.navn });
    } else if (type === 'fact') {
      const [tekst, svar, feil] = fakta[spm.length % fakta.length];
      spm.push({ tekst, valg: stokk(r, [svar, ...feil]), svar });
    } else {
      const tre = stokk(r, LAND).slice(0, 3);
      const nord = type === 'north';
      tre.sort((x, y) => (nord ? y.lat - x.lat : x.lng - y.lng));
      if (Math.abs(nord ? tre[0].lat - tre[1].lat : tre[0].lng - tre[1].lng) < 1.5) { n--; continue; }
      spm.push({ tekst: `Which place is farthest ${nord ? 'north' : 'west'}?`, valg: stokk(r, tre.map((l) => `${l.navn} (${l.landId})`)), svar: `${tre[0].navn} (${tre[0].landId})` });
    }
  }
  return spm;
}

// ---------- bush camping ----------
// In the outback and near the national parks there are simple, free bush camps. The bush is beautiful, but it can be dangerous:
// heat, long distances, bushfires and wild animals. Camping is free in the game, but the group must answer all the questions correctly.
const BUSH_RULES = [
  ['What is the most important thing to bring when you travel in the outback?', 'Plenty of drinking water', ['A big television', 'A warm winter coat', 'A football']],
  ['What do you do with your rubbish when you leave the bush camp?', 'We take all of it with us', ['We bury it', 'We burn it', 'We leave it for the next campers']],
  ['There is a "Total Fire Ban" today. What does that mean?', 'Nobody can light a fire outside', ['Everybody must light a fire', 'Fires are only allowed at night', 'Only small fires are allowed']],
  ['Why should you never feed wild animals like dingoes and kangaroos?', 'It is bad for them, and they can become dangerous', ['They only like pizza', 'They are never hungry', 'It is too expensive']],
  ['You want to swim in a river in the far north of Australia. What must you check first?', 'That there are no crocodile warning signs', ['That the water is blue', 'That you have a camera', 'That it is Tuesday']],
  ['Your car breaks down far out in the outback. What is the safest thing to do?', 'Stay with the car and wait for help', ['Walk away to find a town', 'Run as fast as you can', 'Hide under a bush far from the road']],
  ['What should you do in the morning before you put your shoes on?', 'Shake them, in case a spider or a scorpion is inside', ['Fill them with water', 'Leave them in the sun', 'Paint them red']],
  ['What should you tell somebody before you go into the outback?', 'Where we are going and when we will be back', ['Nothing – it is a secret', 'What we had for breakfast', 'Our favourite colour']],
  ['How do you protect yourself from the strong Australian sun?', 'With a hat, sunscreen and a shirt', ['With a thick scarf', 'By looking straight at the sun', 'By running fast']],
  ['You see a snake near your tent. What do you do?', 'Stay calm, keep away and leave it alone', ['Pick it up', 'Throw stones at it', 'Try to catch it in a bag']],
  ['You come to a place that is sacred to Aboriginal people, and a sign asks you not to go in. What do you do?', 'We respect the sign and stay out', ['We go in anyway', 'We take a stone as a souvenir', 'We move the sign']],
];
export const TELT_ANTALL = 3;
/** Three questions about bush camping (the same seed gives the same questions, so the bank can check them) */
export function teltQuiz(fro) {
  const r = rng('telt-' + fro);
  return stokk(r, BUSH_RULES).slice(0, TELT_ANTALL).map(([tekst, svar, feil]) => ({ tekst, valg: stokk(r, [svar, ...feil]), svar }));
}
export function rettTeltQuiz(fro, svar = []) {
  const q = teltQuiz(fro);
  const riktige = q.filter((s, n) => svar[n] === s.svar).length;
  return { riktige, antall: q.length };
}
/** Surprises in the tent (instead of the hotel surprises). kr = amount in "kroner scale" – the engine turns 100 into about $10. */
export const TELTHENDELSER = [
  { tekst: '🦘 Kangaroos hopped around the tent all night – you slept badly and only have energy for one job less per day.', jobb: -1 },
  { tekst: '🪰 Flies everywhere! You had to buy fly nets for your hats.', kr: -150 },
  { tekst: '🌌 The Milky Way over the tent! You sold a photo of the stars to a tourist.', kr: 500 },
  { tekst: '🐕 A dingo ran away with your bag of food. You had to buy new food.', kr: -300 },
  { tekst: '🌬️ A dust storm filled the tent with red sand – you had to pay for washing.', kr: -200 },
  { tekst: '🤠 A friendly farmer invited you to a barbie and gave you breakfast. You saved money on food.', kr: 200 },
];

// ---------- surprises on the road (weather, animals and other Australian things) ----------
// Used by the bank (js/bank.js → landing). kr is in "kroner scale" and follows the price level of the place.
// The seasons are the opposite of Norway: summer in December–February, winter in June–August.
const ARSTID = (mnd) => (mnd === 12 || mnd <= 2 ? 'summer' : mnd <= 5 ? 'autumn' : mnd <= 8 ? 'winter' : 'spring');
const REISEHENDELSER = [
  { typer: ['buss'], tekst: '🦘 A kangaroo jumped onto the road! The coach had to stop, and you got great photos.', kr: 0 },
  { typer: ['buss'], tekst: '🚛 You were stuck behind a road train with four trailers for two hours. You had to buy extra snacks.', kr: -100 },
  { arstid: ['summer'], tekst: '🥵 A heatwave – 43 degrees! You had to buy lots of cold water and ice cream.', kr: -200 },
  { arstid: ['summer'], stater: ['QLD', 'NT', 'WA'], typer: ['fly'], tekst: '🌀 A cyclone near the coast! The plane was late, and the airline gave you a meal voucher.', kr: 150 },
  { arstid: ['summer', 'autumn'], stater: ['QLD', 'NT'], typer: ['buss', 'tog'], tekst: '🌧️ The wet season! A flooded road meant a long detour, and you had to buy dinner on the way.', kr: -200 },
  { arstid: ['summer', 'spring'], tekst: '🔥 Smoke from a bushfire far away. Everything was late, and you got some money back.', kr: 200 },
  { arstid: ['winter'], stater: ['TAS', 'VIC', 'ACT'], tekst: '🧣 It is winter here in July – and colder than you thought! You had to buy woolly hats.', kr: -150 },
  { typer: ['bat'], tekst: '🌊 Big waves on Bass Strait! The ferry was late, and you had to buy food on board.', kr: -200 },
  { typer: ['bat'], tekst: '🐬 Dolphins swam next to the ferry! You sold a photo to another passenger.', kr: 200 },
  { stater: ['NT', 'SA', 'WA'], typer: ['buss', 'tog'], tekst: '🐪 Wild camels crossed the road in the outback. A tour guide paid you for your photos!', kr: 200 },
  { stater: ['QLD', 'NSW'], arstid: ['summer', 'spring'], tekst: '🏄 A surf school needed help for an hour. You earned a little extra.', kr: 300 },
  { typer: ['tog'], tekst: '☕ Free tea and biscuits on the train today. Lucky you!', kr: 100 },
  { tekst: '🐦 A cheeky seagull stole your chips! You had to buy new ones.', kr: -100 },
  { dato: '01-26', tekst: '🎆 You arrived on Australia Day and watched the fireworks. Somebody gave the whole group free lamingtons!', kr: 200 },
];
export const REISEHENDELSE_SJANSE = 0.35;
/** A random event that fits the trip, or null. tilfeldig = () => a number between 0 and 1 */
export function reisehendelse({ type, til, dato }, tilfeldig = Math.random) {
  if (tilfeldig() >= REISEHENDELSE_SJANSE) return null;
  const mnd = Number(String(dato).slice(5, 7)); const dag = String(dato).slice(5, 10);
  const sted = landEtterId[til]; if (!sted) return null;
  const passer = REISEHENDELSER.filter((h) => (!h.arstid || h.arstid.includes(ARSTID(mnd))) && (!h.typer || h.typer.includes(type))
    && (!h.stater || h.stater.includes(sted.landId)) && (!h.dato || h.dato === dag));
  return passer.length ? passer[Math.floor(tilfeldig() * passer.length)] : null;
}

// ---------- the students' guide (shown the first time they log in, and under "Help") ----------
/** v = { g, l, i, slutt, li, esc, formaterKr, startbelop } from elev.html. Returns the pages of the guide. */
export function veiviser({ g, l, i, slutt, li, esc, formaterKr, startbelop }) {
  return [
    { ikon: '👋', tittel: `G'day, ${esc(g.navn)}!`, tekst: `<p>You are a travel group of <b>${g.personer || 4}</b> with <b>${formaterKr(startbelop)}</b> in your travel fund.</p><p>Your trip starts in <b>${l.flagg} ${esc(l.navn)}, ${esc(l.landNavn)}</b>. The goal is to conquer as many places in Australia as possible – and whole states – before the other groups do!${slutt}</p><p class="dempet">Click through this short guide. It takes two minutes.</p>` },
    { ikon: '🏆', tittel: 'How to get points', tekst: `<div class="liste">${li('📍', `<b>${i.poengBy} points</b> for each place you own`)}${li('🗺️', `<b>${i.poengRegion} bonus points</b> for each state or territory where you own at least one place`)}${li('🇦🇺', 'Australia has 6 states and 2 big territories.')}${li('⚔️', 'Other groups can “steal” a place in a duel.')}</div><p>So it is smart to travel around and spread out across the whole country.</p>` },
    { ikon: '🏨', tittel: 'First: a place to stay', tekst: `<p>In each new place, you must first book a place to stay for <b>three nights</b>. Without it, you cannot do anything there.</p><div class="liste">${li('⛺', '<b>Bush camping is free!</b> But only in the outback and near the national parks – and first you must show that you know the <b>rules of the bush</b>: three questions, and all must be correct.')}${li('⭐', '<b>Cheap hostel</b> = bad sleep: fewer jobs per day and lower pay.')}${li('🌟', '<b>Fine hotel</b> = well rested: more jobs and higher pay.')}${li('🍳', 'Extras give you bonuses: breakfast (+1 job), airport shuttle (−10% on flights), Wi-Fi (50/50 lifeline).')}${li('🎲', 'Surprises can happen in a tent and at the cheapest places – good ones and bad ones!')}</div>` },
    { ikon: '📓', tittel: 'The travel log gives you the place', tekst: `<div class="liste">${li('1️⃣', 'Fill in the paper travel log: facts, sights and a drawing.')}${li('2️⃣', 'Press <b>“We have handed in the travel log”</b> under the tab Travel log.')}${li('3️⃣', 'The teacher approves it – and the place is yours! 🎉')}</div><p>Does another group already own the place? Then there will be a <b>⚔️ duel</b> for it!</p>` },
    { ikon: '🧭', tittel: 'Travel on', tekst: `<p>Press a place on the map, or search under <b>Travel</b>. The price is for the whole group. Australia is <b>huge</b> – from Sydney to Perth is as far as from Oslo to the Sahara!</p><div class="liste">${li('✈️', '<b>Planes</b> are fast: <b>2 correct</b> answers on the way (direct) or <b>4</b> (with a stop). Only between places with an airport.')}${li('🚆', '<b>Trains</b> only run on a few long lines – and they are slow.')}${li('🚌', '<b>Coaches</b> (long-distance buses) are the cheapest – but a trip can take two days, with many questions.')}${li('⛴️', '<b>Tasmania</b> is an island: you must fly, or take the <b>ferry</b> across Bass Strait.')}${li('🌪️', 'On the way, you spin a wheel and answer questions. A wrong answer gives you a new question.')}</div>` },
    { ikon: '💰', tittel: 'Earn money', tekst: `<div class="liste">${li('💼', '<b>Job</b> – solve maths problems with dollars. The pay is higher where everything is expensive.')}${li('🧭', `<b>Australia quiz</b> – ${formaterKr(i.quizBelop)} per correct answer, ${i.quizPerDag} quizzes per day.`)}${li('🦘', '<b>The outback</b> can give you surprises on the road – kangaroos, road trains and heatwaves!')}</div><p>Tip: Sydney is expensive to stay in – but the pay is also higher there.</p>` },
    { ikon: '🔒', tittel: 'Defend your places', tekst: `<div class="liste">${i.laasDager ? li('⏳', `Others can challenge you for a place for <b>${i.laasDager} days</b> – then it is locked and safe.`) : ''}${i.laasDager ? li('🕒', 'Under <b>Our places</b> you see a countdown for each place: that is how long the others have.') : ''}${li('⚔️', `The duels are fun tasks in the classroom. The winner gets the place${i.duellPremie ? ` and ${formaterKr(i.duellPremie)}` : ''}.`)}</div>` },
    { ikon: '🇦🇺', tittel: 'Ready to go!', tekst: `<p>The box <b>“Next step”</b> at the top always tells you what to do now.</p><p>Press <b>❓ Help</b> in the top right corner if you want to see this guide again.</p><p style="font:800 1.3rem var(--font-tittel);color:var(--hav);text-align:center;margin-top:1.2rem">Have a great trip, mate! 🦘✈️🚌</p>` },
  ];
}
