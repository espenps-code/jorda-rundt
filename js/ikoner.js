// Jorda rundt – eget ikonsett.
// Bytter ut emojier på siden med spillets egne ikoner (mappa ikoner/).
// Virker automatisk på alt som tegnes, også meldinger og logg fra databasen.
// Flagg (🇳🇴 osv.) røres ikke.

const MAPPE = new URL('../ikoner/', import.meta.url).href;

// emoji → ikonfil (uten .webp)
const BILDE = {
  '✈': 'fly', '🛫': 'fly', '🛬': 'landing', '🎫': 'billett', '🌪': 'turbulens',
  '🔒': 'laas', '🔓': 'laas', '⛔': 'laas', '⚔': 'duell',
  '🌍': 'klode', '🌎': 'klode', '🌏': 'klode', '🗺': 'kart', '🧭': 'kompass', '📍': 'pin', '🏳': 'pin',
  '✍': 'skriv', '✏': 'skriv', '📓': 'pass', '📔': 'pass', '🛂': 'stempel',
  '🏆': 'pokal', '🏅': 'medalje', '👑': 'krone', '🏁': 'maalflagg',
  '🏨': 'hotell', '😴': 'seng', '🍳': 'frokost', '🍲': 'frokost', '🚌': 'buss', '📶': 'wifi',
  '🧳': 'koffert', '🎒': 'ryggsekk',
  '💼': 'jobb', '💪': 'jobb', '💰': 'penger', '💸': 'penger', '🪙': 'penger',
  '🎲': 'terning', '🎰': 'terning', '🧠': 'hjerne', '💡': 'lyspare',
  '⏳': 'timeglass', '⏰': 'vekkerklokke', '⏱': 'vekkerklokke', '📅': 'kalender',
  '⭐': 'stjerne', '🌟': 'stjerne', '✨': 'stjerne', '🎉': 'fest', '🍀': 'klover',
  '🐧': 'pingvin', '🐾': 'pote', '🎬': 'film', '🍕': 'pizza', '🚀': 'rakett', '🏛': 'museum',
  '👋': 'vinke', '🙋': 'vinke',
  '📺': 'tv', '🖨': 'printer', '📣': 'megafon', '🔊': 'megafon', '🔑': 'nokkel', '📋': 'liste', '🔍': 'lupe',
};

// Ikoner for steder, vær, dyr og resten (laget i samme stil som de over, november 2026). Filnavn = u + emojiens kodepunkt.
// Ny emoji i en spillpakke? Lag et ikon, legg fila i ikoner/ og en linje her – ellers vises emojien som vanlig tegn.
Object.assign(BILDE, {
  '🃏': 'u1f0cf', '🌀': 'u1f300', '🌉': 'u1f309', '🌊': 'u1f30a', '🌋': 'u1f30b', '🌌': 'u1f30c', '🌙': 'u1f319', '🌞': 'u1f31e',
  '🌦': 'u1f326', '🌧': 'u1f327', '🌫': 'u1f32b', '🌬': 'u1f32c', '🌲': 'u1f332', '🌴': 'u1f334', '🌵': 'u1f335', '🌺': 'u1f33a',
  '🌻': 'u1f33b', '🌼': 'u1f33c', '🌽': 'u1f33d', '🌾': 'u1f33e', '🍁': 'u1f341', '🍂': 'u1f342', '🍄': 'u1f344', '🍇': 'u1f347',
  '🍊': 'u1f34a', '🍌': 'u1f34c', '🍑': 'u1f351', '🍫': 'u1f36b', '🍴': 'u1f374', '🍽': 'u1f37d', '🎃': 'u1f383', '🎆': 'u1f386',
  '🎈': 'u1f388', '🎓': 'u1f393', '🎠': 'u1f3a0', '🎡': 'u1f3a1', '🎢': 'u1f3a2', '🎣': 'u1f3a3', '🎨': 'u1f3a8', '🎪': 'u1f3aa',
  '🎭': 'u1f3ad', '🎮': 'u1f3ae', '🎯': 'u1f3af', '🎵': 'u1f3b5', '🎷': 'u1f3b7', '🎸': 'u1f3b8', '🏄': 'u1f3c4', '🏈': 'u1f3c8',
  '🏎': 'u1f3ce', '🏔': 'u1f3d4', '🏖': 'u1f3d6', '🏙': 'u1f3d9', '🏜': 'u1f3dc', '🏝': 'u1f3dd', '🏞': 'u1f3de', '🏠': 'u1f3e0',
  '🏭': 'u1f3ed', '🏯': 'u1f3ef', '🏰': 'u1f3f0', '🏴‍☠': 'u1f3f4-200d-2620', '🏷': 'u1f3f7', '🏹': 'u1f3f9', '🏺': 'u1f3fa', '🐄': 'u1f404',
  '🐉': 'u1f409', '🐊': 'u1f40a', '🐋': 'u1f40b', '🐎': 'u1f40e', '🐑': 'u1f411', '🐔': 'u1f414', '🐕': 'u1f415', '🐟': 'u1f41f',
  '🐠': 'u1f420', '🐢': 'u1f422', '🐦': 'u1f426', '🐪': 'u1f42a', '🐬': 'u1f42c', '🐮': 'u1f42e', '🐻': 'u1f43b', '👥': 'u1f465',
  '💌': 'u1f48c', '💎': 'u1f48e', '💱': 'u1f4b1', '💾': 'u1f4be', '📐': 'u1f4d0', '📖': 'u1f4d6', '📜': 'u1f4dc', '📦': 'u1f4e6',
  '📮': 'u1f4ee', '📲': 'u1f4f2', '📸': 'u1f4f8', '🔄': 'u1f504', '🔔': 'u1f514', '🔥': 'u1f525', '🔦': 'u1f526', '🕍': 'u1f54d',
  '🕒': 'u1f552', '🕵': 'u1f575', '🖌': 'u1f58c', '🖍': 'u1f58d', '🖼': 'u1f5bc', '🗣': 'u1f5e3', '🗳': 'u1f5f3', '🗽': 'u1f5fd',
  '🗿': 'u1f5ff', '🚂': 'u1f682', '🚆': 'u1f686', '🚗': 'u1f697', '🚛': 'u1f69b', '🚠': 'u1f6a0', '🚢': 'u1f6a2', '🚧': 'u1f6a7',
  '🚩': 'u1f6a9', '🚲': 'u1f6b2', '🛁': 'u1f6c1', '🛐': 'u1f6d0', '🛞': 'u1f6de', '🛡': 'u1f6e1', '🛢': 'u1f6e2', '🛩': 'u1f6e9',
  '🛳': 'u1f6f3', '🛶': 'u1f6f6', '🤖': 'u1f916', '🤠': 'u1f920', '🥄': 'u1f944', '🥇': 'u1f947', '🥔': 'u1f954', '🥞': 'u1f95e',
  '🥵': 'u1f975', '🥾': 'u1f97e', '🦀': 'u1f980', '🦆': 'u1f986', '🦈': 'u1f988', '🦉': 'u1f989', '🦊': 'u1f98a', '🦏': 'u1f98f',
  '🦕': 'u1f995', '🦘': 'u1f998', '🦜': 'u1f99c', '🦝': 'u1f99d', '🦞': 'u1f99e', '🦟': 'u1f99f', '🦢': 'u1f9a2', '🦬': 'u1f9ac',
  '🧀': 'u1f9c0', '🧊': 'u1f9ca', '🧑‍🌾': 'u1f9d1-200d-1f33e', '🧑‍🏫': 'u1f9d1-200d-1f3eb', '🧙': 'u1f9d9', '🧣': 'u1f9e3', '🧩': 'u1f9e9', '🧱': 'u1f9f1',
  '🧽': 'u1f9fd', '🪨': 'u1faa8', '☀': 'u2600', '☕': 'u2615', '⚒': 'u2692', '⚓': 'u2693', '⚽': 'u26bd', '⛏': 'u26cf',
  '⛓': 'u26d3', '⛪': 'u26ea', '⛰': 'u26f0', '⛴': 'u26f4', '⛵': 'u26f5', '⛷': 'u26f7', '⛺': 'u26fa', '✉': 'u2709',
  '✋': 'u270b', '❄': 'u2744',
  '🔎': 'lupe', '🛏': 'seng', '🪰': 'u1f99f', '🪄': 'stjerne', '📷': 'u1f4f8',
});

// Romikoner til Solsystemet rundt (tegnet som SVG i samme stil, november 2026).
Object.assign(BILDE, {
  '🪐': 'u1fa90', '☄': 'u2604', '🌠': 'u1f320', '📏': 'u1f4cf', '💙': 'u1f499', '🛰': 'u1f6f0', '🎱': 'u1f3b1', '🚨': 'u1f6a8',
  '🧦': 'u1f9e6', '🔧': 'u1f527', '🥫': 'u1f96b', '🏕': 'u1f3d5', '🧰': 'u1f9f0', '🔭': 'u1f52d', '📡': 'u1f4e1', '🚽': 'u1f6bd',
  '🎂': 'u1f382', '👣': 'u1f463', '🌗': 'u1f317', '⚪': 'u26aa', '🔩': 'u1f529', '🧪': 'u1f9ea', '🧲': 'u1f9f2', '🕳': 'u1f573',
  '⛲': 'u26f2', '☯': 'u262f', '🍎': 'u1f34e', '⛄': 'u26c4', '🪂': 'u1fa82', '🥶': 'u1f976', '☢': 'u2622', '⚛': 'u269b',
});

// Spillpakken kan bytte ikon for enkelte emojier: pakke.js → ikoner: { '✈': 'rakett' } (emoji → ikonfil uten .webp).
// Slik blir flyet til et romskip i Solsystemet rundt uten at teksten i motoren må endres.
try { const { PAKKE } = await import('#pakke/pakke.js'); Object.assign(BILDE, PAKKE.ikoner || {}); } catch { /* siden har ingen spillpakke */ }

// små knappesymboler som strektegninger (følger tekstfargen)
const sti = (d) => `<svg class="ik-sym" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const SYMBOL = {
  '✅': sti('<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>'),
  '❌': sti('<path d="M6 6l12 12M18 6L6 18"/>'),
  '↩': sti('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>'),
  '❓': sti('<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 015.4 1c0 1.9-2.7 2.4-2.7 4"/><path d="M12 17.6h.01"/>'),
  '🗑': sti('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  '⏸': sti('<path d="M9 5v14M15 5v14"/>'),
  '▶': sti('<path d="M7 5l12 7-12 7z"/>'),
  '⛶': sti('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>'),
  '➖': sti('<path d="M5 12h14"/>'),
  '➕': sti('<path d="M5 12h14M12 5v14"/>'),
  '⬇': sti('<path d="M12 4v15M6 13l6 6 6-6"/>'),
  '⚠': sti('<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.4h.01"/>'),
};

// pynt vi bare fjerner
const FJERN = ['🐜', '🚿', '⚡', '👍', '📚'];

const alle = [...Object.keys(BILDE), ...Object.keys(SYMBOL), ...FJERN].sort((a, b) => b.length - a.length);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE = new RegExp(`(${alle.map(esc).join('|')})️?`, 'gu');
const HOPP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'TITLE', 'OPTION', 'INPUT', 'SELECT', 'CODE', 'svg']);

function lagNode(tegn) {
  if (BILDE[tegn]) {
    const img = document.createElement('img');
    img.className = 'ik'; img.alt = ''; img.draggable = false; img.decoding = 'async';
    img.src = MAPPE + BILDE[tegn] + '.webp';
    return img;
  }
  if (SYMBOL[tegn]) { const t = document.createElement('template'); t.innerHTML = SYMBOL[tegn]; return t.content.firstChild; }
  return null;
}

function behandleTekst(node) {
  const s = node.nodeValue; RE.lastIndex = 0;
  if (!s || !RE.test(s)) return;
  const p = node.parentNode; if (!p || HOPP.has(p.nodeName) || p.closest?.('[data-ingen-ikoner]')) return;
  const frag = document.createDocumentFragment(); let sist = 0; RE.lastIndex = 0; let m;
  while ((m = RE.exec(s))) {
    if (m.index > sist) frag.append(s.slice(sist, m.index));
    const ny = lagNode(m[1]);
    if (ny) frag.append(ny);
    sist = RE.lastIndex;
    // fjernet pynt: ta med mellomrommet etter, så det ikke blir doble mellomrom
    if (!ny && s[sist] === ' ' && (m.index === 0 || s[m.index - 1] === ' ')) sist++;
  }
  if (sist < s.length) frag.append(s.slice(sist));
  p.replaceChild(frag, node);
}

function gjennomga(rot) {
  if (rot.nodeType === 3) return behandleTekst(rot);
  if (rot.nodeType !== 1 || HOPP.has(rot.nodeName)) return;
  const w = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT);
  const liste = []; while (w.nextNode()) liste.push(w.currentNode);
  liste.forEach(behandleTekst);
}

// Spillpakker på andre språk: vent til den faste teksten er oversatt (js/sprak.js fjerner «sprak-venter»),
// så ordboka ser teksten med emojiene på plass. På norske sider finnes ikke klassen, og ingenting venter.
if (document.documentElement.classList.contains('sprak-venter')) {
  await new Promise((ferdig) => { const t = setInterval(() => { if (!document.documentElement.classList.contains('sprak-venter')) { clearInterval(t); ferdig(); } }, 20); });
}

// stripp emojier fra fanetittel
document.title = document.title.replace(RE, '').trim();
gjennomga(document.body);
new MutationObserver((endringer) => {
  for (const e of endringer) {
    if (e.type === 'characterData') behandleTekst(e.target);
    else e.addedNodes.forEach(gjennomga);
  }
}).observe(document.body, { childList: true, subtree: true, characterData: true });
