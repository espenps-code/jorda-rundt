// Across America – rules that are special for this game: default settings, points, the USA quiz,
// camping (Leave No Trace), surprises on the road, and the students' guide.
import { LAND, landEtterId, KONTINENTER } from './land.js';
import { rng, velg, stokk } from '#motor/tilfeldig.js';

export const STANDARD = {
  startbelopPerElev: 5000,  // dollars per student at the start (a group of 4 = $20,000)
  quizBelop: 30,            // dollars per correct answer in the USA quiz
  duellPremie: 500,         // dollars to the winner of a duel
  poengLand: 5,             // points per state the group owns
  poengKontinent: 10,       // points per region where the group owns at least one state
};
/** Settings fields for points on the teacher page: [name, label] */
export const POENGFELT = [['poengLand', 'Points per state'], ['poengKontinent', 'Points per region']];

/** Scoreboard row for one group. eierskap = spill.eierskap, i = settings. */
export function poengForGruppe(gid, eierskap, i) {
  const land = Object.entries(eierskap).filter(([id, e]) => e.gruppe === gid && landEtterId[id]).map(([id]) => id);
  const kontinenter = [...new Set(land.map((id) => landEtterId[id]?.kontinent).filter(Boolean))];
  return { land, byer: land, kontinenter, heleLand: [], bonus: 0, poeng: land.length * i.poengLand + kontinenter.length * i.poengKontinent };
}
export const heltLandBonus = () => 0;

// ---------- USA quiz ----------
// Cities with the same name in two states (Portland, Charleston) are not used in the "which state" questions.
const UNIK_BY = LAND.filter((l) => LAND.filter((x) => x.by === l.by).length === 1);
const USA_FAKTA = [
  ['How many states are there in the USA?', '50', ['48', '51', '52']],
  ['How many stripes are there on the American flag?', '13', ['7', '10', '50']],
  ['How many stars are there on the American flag?', '50', ['13', '48', '52']],
  ['What is the capital of the USA?', 'Washington, D.C.', ['New York City', 'Los Angeles', 'Chicago']],
  ['Who was the first president of the USA?', 'George Washington', ['Abraham Lincoln', 'Thomas Jefferson', 'Benjamin Franklin']],
  ['Which bird is the national bird of the USA?', 'The bald eagle', ['The turkey', 'The owl', 'The blue jay']],
  ['Which state is the biggest?', 'Alaska', ['Texas', 'California', 'Montana']],
  ['Which state is the smallest?', 'Rhode Island', ['Delaware', 'Hawaii', 'Vermont']],
  ['Which state has the most people?', 'California', ['Texas', 'New York', 'Florida']],
  ['On which date is Independence Day?', 'July 4', ['June 4', 'July 14', 'December 4']],
  ['In which year did the USA become independent?', '1776', ['1492', '1814', '1905']],
  ['Where does the president of the USA live?', 'In the White House', ['In the Capitol', 'In the Empire State Building', 'In the Pentagon']],
  ['Which country gave the Statue of Liberty to the USA?', 'France', ['England', 'Spain', 'Canada']],
  ['In which state is the Grand Canyon?', 'Arizona', ['Nevada', 'Utah', 'Colorado']],
  ['In which city is Hollywood?', 'Los Angeles', ['San Francisco', 'Las Vegas', 'Miami']],
  ['In which city is the Golden Gate Bridge?', 'San Francisco', ['New York City', 'Seattle', 'Boston']],
  ['How many presidents are carved into Mount Rushmore?', '4', ['2', '3', '5']],
  ['What was the first national park in the USA (and in the world)?', 'Yellowstone', ['Yosemite', 'Grand Canyon', 'Everglades']],
  ['How many Great Lakes are there?', '5', ['3', '4', '7']],
  ['Which is the highest mountain in the USA?', 'Denali', ['Mount Rainier', 'Mount Whitney', 'Pikes Peak']],
  ['Which state is made up of islands in the Pacific Ocean?', 'Hawaii', ['Alaska', 'Florida', 'Maine']],
  ['Which two countries share a border with the USA?', 'Canada and Mexico', ['Canada and Cuba', 'Mexico and Brazil', 'Canada and Greenland']],
  ['Which ocean is on the east coast of the USA?', 'The Atlantic Ocean', ['The Pacific Ocean', 'The Indian Ocean', 'The Arctic Ocean']],
  ['Which ocean is on the west coast of the USA?', 'The Pacific Ocean', ['The Atlantic Ocean', 'The Indian Ocean', 'The Arctic Ocean']],
  ['Which famous road went from Chicago to California?', 'Route 66', ['Route 1', 'Highway 50', 'Broadway']],
  ['In which month is Thanksgiving?', 'November', ['October', 'December', 'July']],
  ['What do Americans call the game that people in Europe call football?', 'Soccer', ['Rugby', 'Baseball', 'Handball']],
  ['Which sport is played in the Super Bowl?', 'American football', ['Baseball', 'Basketball', 'Ice hockey']],
  ['What money do people use in the USA?', 'Dollars', ['Pounds', 'Euros', 'Pesos']],
  ['How many cents are there in one dollar?', '100', ['10', '50', '1,000']],
  ['Which river is the most famous in the USA and runs from north to south?', 'The Mississippi', ['The Amazon', 'The Nile', 'The Thames']],
  ['In which city is the Statue of Liberty?', 'New York City', ['Washington, D.C.', 'Boston', 'Philadelphia']],
  ['From which state do NASA rockets take off at Cape Canaveral?', 'Florida', ['Texas', 'California', 'Alabama']],
  ['What are the colors of the American flag?', 'Red, white and blue', ['Red, white and green', 'Blue and yellow', 'Red and white']],
];
export function lagQuiz(fro, antall = 5) {
  const r = rng('quiz-' + fro);
  const spm = [];
  const typer = stokk(r, ['capital', 'state', 'region', 'nickname', 'city', 'fact', 'fact', 'north', 'west']);
  const fakta = stokk(r, USA_FAKTA);
  let vakt = 0;
  for (let n = 0; n < antall && vakt < 60; n++, vakt++) {
    const type = typer[n % typer.length];
    const fasit = velg(r, LAND);
    const andre = stokk(r, LAND.filter((l) => l.id !== fasit.id)).slice(0, 3);
    if (type === 'capital') {
      const feil = stokk(r, [...new Set([...andre.map((l) => l.capital), fasit.by])].filter((x) => x !== fasit.capital)).slice(0, 3);
      spm.push({ tekst: `What is the capital of ${fasit.navn}?`, valg: stokk(r, [fasit.capital, ...feil]), svar: fasit.capital });
    } else if (type === 'state') {
      spm.push({ tekst: `${fasit.capital} is the capital of which state?`, valg: stokk(r, [fasit, ...andre].map((l) => l.navn)), svar: fasit.navn });
    } else if (type === 'region') {
      const k = KONTINENTER.filter((x) => x !== fasit.kontinent);
      spm.push({ tekst: `Which region is ${fasit.navn} in?`, valg: stokk(r, [fasit.kontinent, ...stokk(r, k).slice(0, 3)]), svar: fasit.kontinent });
    } else if (type === 'nickname') {
      spm.push({ tekst: `Which state is called “${fasit.nickname}”?`, valg: stokk(r, [fasit, ...andre].map((l) => l.navn)), svar: fasit.navn });
    } else if (type === 'city') {
      const f = velg(r, UNIK_BY); const a = stokk(r, LAND.filter((l) => l.id !== f.id)).slice(0, 3);
      spm.push({ tekst: `In which state is the city of ${f.by}?`, valg: stokk(r, [f, ...a].map((l) => l.navn)), svar: f.navn });
    } else if (type === 'fact') {
      const [tekst, svar, feil] = fakta[spm.length % fakta.length];
      spm.push({ tekst, valg: stokk(r, [svar, ...feil]), svar });
    } else {
      // Which city is farthest north / west? (not Alaska and Hawaii – that would be too easy)
      const tre = stokk(r, UNIK_BY.filter((l) => !l.oy)).slice(0, 3);
      const nord = type === 'north';
      tre.sort((x, y) => (nord ? y.lat - x.lat : x.lng - y.lng));
      if (Math.abs(nord ? tre[0].lat - tre[1].lat : tre[0].lng - tre[1].lng) < 2.5) { n--; continue; }
      spm.push({ tekst: `Which city is farthest ${nord ? 'north' : 'west'}?`, valg: stokk(r, tre.map((l) => `${l.by} (${l.navn})`)), svar: `${tre[0].by} (${tre[0].navn})` });
    }
  }
  return spm;
}

// ---------- camping with Leave No Trace ----------
// Camping on public land is free, but the group must know the Leave No Trace rules (all questions correct).
const LEAVE_NO_TRACE = [
  ['What do you do with your trash when you leave the campsite?', 'We take all of it with us', ['We bury it', 'We burn it in the campfire', 'We leave it for the next campers']],
  ['What should the campsite look like when you leave?', 'Just like when we came – or even nicer', ['It does not matter', 'With a clear mark that we were there', 'Clean enough, with a little trash']],
  ['Where is the best place to set up your tent?', 'On a spot that has been used before, or on hard ground', ['On fresh flowers', 'In the middle of the trail', 'As close to the water as possible']],
  ['How far from lakes and rivers should you camp?', 'About 200 feet (70 big steps)', ['Right at the edge of the water', '5 feet', 'It does not matter']],
  ['You see a deer near your tent. What do you do?', 'Watch it from far away and do not feed it', ['Give it some of our food', 'Try to pet it', 'Chase it away with loud noise']],
  ['Why should you never feed wild animals?', 'It is bad for their health and makes them less afraid of people', ['They do not like food', 'It is too expensive', 'They are never hungry']],
  ['You find a beautiful old arrowhead on the ground. What do you do?', 'Leave it where it is, so others can enjoy it too', ['Take it home', 'Sell it', 'Break it']],
  ['What is the safest way to have a campfire?', 'Use a fire ring that is already there, keep the fire small and put it out completely', ['Make a big fire anywhere', 'Leave the fire burning when we go to sleep', 'Make a fire under a dry tree']],
  ['How do you keep bears and other animals away from your food at night?', 'Store the food in a bear box or hang it high in a tree', ['Keep the food in the tent', 'Leave the food on the ground outside', 'Hide the food under a sleeping bag']],
  ['Other people are camping nearby. What is the right thing to do?', 'Keep our voices and music low and respect them', ['Play loud music all night', 'Walk through their campsite', 'Shine flashlights at their tent']],
  ['Before a camping trip, what is the smart thing to do?', 'Plan ahead: check the weather and the rules for the area', ['Just go and see what happens', 'Bring nothing', 'Tell nobody where we are going']],
  ['Where should you walk when you hike in nature?', 'On the trail', ['Anywhere – shortcuts are fine', 'On the plants next to the trail', 'In the river']],
];
export const TELT_ANTALL = 3;
/** Three questions about Leave No Trace (the same seed gives the same questions, so the bank can check them) */
export function teltQuiz(fro) {
  const r = rng('telt-' + fro);
  return stokk(r, LEAVE_NO_TRACE).slice(0, TELT_ANTALL).map(([tekst, svar, feil]) => ({ tekst, valg: stokk(r, [svar, ...feil]), svar }));
}
export function rettTeltQuiz(fro, svar = []) {
  const q = teltQuiz(fro);
  const riktige = q.filter((s, n) => svar[n] === s.svar).length;
  return { riktige, antall: q.length };
}
/** Surprises in the tent (instead of the hotel surprises). kr = amount in "kroner scale" – the engine turns 100 into about $10. */
export const TELTHENDELSER = [
  { tekst: '🌧️ Rain all night – the tent leaked, and you had to buy dry socks.', kr: -200 },
  { tekst: '🦟 Mosquitoes everywhere! You had to buy bug spray.', kr: -150 },
  { tekst: '🌌 A sky full of stars! You sold a photo to a tourist.', kr: 500 },
  { tekst: '🦝 A raccoon stole your snacks in the night – you slept badly and only have energy for one job less per day.', jobb: -1 },
  { tekst: '⛺ A tent pole broke – a new one cost a little.', kr: -300 },
  { tekst: '🎣 You caught fish for dinner and saved money on food.', kr: 200 },
  { tekst: '🧑‍🌾 A friendly park ranger told you about a job – one extra job per day!', jobb: 1 },
];

// ---------- surprises on the road (weather and nature) ----------
// When a group arrives, something may have happened on the way. The events follow the season, the region and the way of travel.
// Used by the bank (js/bank.js → landing). kr is in "kroner scale" and follows the price level of the state.
const ARSTID = (mnd) => (mnd === 12 || mnd <= 2 ? 'winter' : mnd <= 5 ? 'spring' : mnd <= 8 ? 'summer' : 'fall');
const NORD = ['New England', 'Midwest', 'Rocky Mountains', 'Mid-Atlantic'];
const REISEHENDELSER = [
  { arstid: ['winter'], regioner: NORD, typer: ['buss', 'tog'], tekst: '❄️ A snowstorm closed the road for hours. You had to buy hot food while you waited.', kr: -300 },
  { arstid: ['winter'], regioner: NORD, typer: ['fly'], tekst: '🧊 The plane had to be de-iced and was late. The airline gave you a meal coupon.', kr: 150 },
  { arstid: ['spring'], regioner: ['Midwest', 'Southwest'], tekst: '🌪️ Tornado warning! You waited in a shelter, and a kind family gave you dinner.', kr: 200 },
  { arstid: ['summer'], regioner: ['Southwest', 'Rocky Mountains'], tekst: '🥵 A heat wave! You had to buy a lot of water and sunscreen.', kr: -200 },
  { arstid: ['summer', 'fall'], regioner: ['Southeast'], tekst: '🌀 A hurricane warning delayed your trip. You had to pay for extra food.', kr: -300 },
  { arstid: ['fall'], regioner: ['New England', 'Mid-Atlantic'], tekst: '🍂 The fall colors were amazing! A magazine bought one of your photos.', kr: 400 },
  { arstid: ['fall'], tekst: '🎃 You helped a farmer sell pumpkins during a break and earned a little extra.', kr: 300 },
  { arstid: ['summer'], tekst: '🎆 You arrived in the middle of a town festival. Somebody bought hot dogs and ice cream for the whole group!', kr: 300 },
  { arstid: ['summer'], dato: '07-04', tekst: '🇺🇸 You arrived on the Fourth of July! You watched the fireworks and got free barbecue.', kr: 400 },
  { regioner: ['Rocky Mountains', 'Pacific'], typer: ['buss', 'tog'], tekst: '🦬 A herd of bison blocked the road for half an hour. The driver was grumpy, but you got great photos.', kr: 0 },
  { typer: ['buss'], tekst: '🛞 The bus got a flat tire. You had to buy snacks at a gas station while you waited.', kr: -150 },
  { typer: ['tog'], tekst: '🚂 A long freight train was in the way, and your train was two hours late. You got a free meal on board.', kr: 150 },
];
export const REISEHENDELSE_SJANSE = 0.35;
/** A random event that fits the trip, or null. tilfeldig = () => a number between 0 and 1 */
export function reisehendelse({ type, til, dato }, tilfeldig = Math.random) {
  if (tilfeldig() >= REISEHENDELSE_SJANSE) return null;
  const mnd = Number(String(dato).slice(5, 7)); const dag = String(dato).slice(5, 10);
  const sted = landEtterId[til]; if (!sted) return null;
  const passer = REISEHENDELSER.filter((h) => (!h.arstid || h.arstid.includes(ARSTID(mnd))) && (!h.typer || h.typer.includes(type))
    && (!h.regioner || h.regioner.includes(sted.kontinent)) && (!h.dato || h.dato === dag));
  return passer.length ? passer[Math.floor(tilfeldig() * passer.length)] : null;
}

// ---------- the students' guide (shown the first time they log in, and under "Help") ----------
/** v = { g, l, i, slutt, li, esc, formaterKr, startbelop } from elev.html. Returns the pages of the guide. */
export function veiviser({ g, l, i, slutt, li, esc, formaterKr, startbelop }) {
  return [
    { ikon: '👋', tittel: `Welcome, ${esc(g.navn)}!`, tekst: `<p>You are a travel group of <b>${g.personer || 4}</b> with <b>${formaterKr(startbelop)}</b> in your travel fund.</p><p>Your trip starts in <b>${l.flagg} ${esc(l.by)}, ${esc(l.navn)}</b>. The goal is to conquer as many states as possible – before the other groups do!${slutt}</p><p class="dempet">Click through this short guide. It takes two minutes.</p>` },
    { ikon: '🏆', tittel: 'How to get points', tekst: `<div class="liste">${li('🏳️', `<b>${i.poengLand} points</b> for each state you own`)}${li('🗺️', `<b>${i.poengKontinent} points</b> for each region where you own at least one state`)}${li('🧩', 'There are 7 regions: New England, Mid-Atlantic, Southeast, Midwest, Southwest, Rocky Mountains and Pacific.')}</div><p>So it is smart to spread out across the whole country.</p>` },
    { ikon: '🏨', tittel: 'First: a place to stay', tekst: `<p>In each new state, you must first book a place to stay for <b>three nights</b>. Without it, you cannot do anything there.</p><div class="liste">${li('⛺', '<b>Camping is free!</b> But first you must show that you know the <b>Leave No Trace</b> rules – three questions, and all must be correct. You can only camp in states with a lot of nature.')}${li('⭐', '<b>Cheap motel</b> = bad sleep: fewer jobs per day and lower pay.')}${li('🌟', '<b>Luxury hotel</b> = well rested: more jobs and higher pay.')}${li('🍳', 'Extras give you bonuses: free breakfast (+1 job), airport shuttle (−10% on flights), free Wi-Fi (50/50 lifeline).')}${li('🎲', 'Surprises can happen in a tent and at the cheapest places – good ones and bad ones!')}</div>` },
    { ikon: '📓', tittel: 'The travel log gives you the state', tekst: `<div class="liste">${li('1️⃣', 'Fill in the paper travel log: facts, sights and a drawing.')}${li('2️⃣', 'Press <b>“We have handed in the travel log”</b> under the tab Travel log.')}${li('3️⃣', 'The teacher approves it – and the state is yours! 🎉')}</div><p>Does another group already own the state? Then there will be a <b>⚔️ duel</b> for it!</p>` },
    { ikon: '✈️', tittel: 'Travel on', tekst: `<p>Press a state on the map, or search under <b>Travel</b>. The price is for the whole group.</p><div class="liste">${li('✈️', '<b>Planes</b> are expensive, but fast: <b>2 correct</b> answers on the way (direct), <b>4</b> (1 stop) or <b>6</b> (2 stops).')}${li('🚆', '<b>Trains</b> are cheaper, but slower – and you must answer more questions. There are no trains to South Dakota or Wyoming.')}${li('🚌', '<b>Buses</b> are the cheapest – and give the most questions.')}${li('🏝️', 'To <b>Alaska</b> and <b>Hawaii</b> you can only fly.')}${li('🌪️', 'On the way, you spin a wheel and answer questions. A wrong answer gives you a new question.')}</div>` },
    { ikon: '💰', tittel: 'Earn money', tekst: `<div class="liste">${li('💼', '<b>Job</b> – solve math problems with dollars. The pay is higher where everything is expensive.')}${li('🧭', `<b>USA quiz</b> – ${formaterKr(i.quizBelop)} per correct answer, ${i.quizPerDag} quizzes per day.`)}${li('🌦️', '<b>Weather and nature</b> can give you surprises on the road – snowstorms, tornado warnings and bison!')}</div><p>Tip: Cheap states are cheap to stay in – but the pay is also low. Expensive states pay more!</p>` },
    { ikon: '🔒', tittel: 'Defend your states', tekst: `<div class="liste">${i.laasDager ? li('⏳', `Others can challenge you for a state for <b>${i.laasDager} days</b> – then it is locked and safe.`) : ''}${i.laasDager ? li('🕒', 'Under <b>Our states</b> you see a countdown for each state: that is how long the others have.') : ''}${li('⚔️', `The duels are fun tasks in the classroom. The winner gets the state${i.duellPremie ? ` and ${formaterKr(i.duellPremie)}` : ''}.`)}</div>` },
    { ikon: '🇺🇸', tittel: 'Ready for takeoff!', tekst: `<p>The box <b>“Next step”</b> at the top always tells you what to do now.</p><p>Press <b>❓ Help</b> in the top right corner if you want to see this guide again.</p><p style="font:800 1.3rem var(--font-tittel);color:var(--hav);text-align:center;margin-top:1.2rem">Have a great trip! ✈️🚆🚌</p>` },
  ];
}
