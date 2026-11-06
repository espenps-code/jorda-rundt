// Jorda rundt – eget ikonsett.
// Bytter ut emojier på siden med spillets egne ikoner (mappa ikoner/).
// Virker automatisk på alt som tegnes, også meldinger og logg fra databasen.
// Flagg (🇳🇴 osv.) røres ikke.

const MAPPE = new URL('../../ikoner/', import.meta.url).href;

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

// stripp emojier fra fanetittel
document.title = document.title.replace(RE, '').trim();
gjennomga(document.body);
new MutationObserver((endringer) => {
  for (const e of endringer) {
    if (e.type === 'characterData') behandleTekst(e.target);
    else e.addedNodes.forEach(gjennomga);
  }
}).observe(document.body, { childList: true, subtree: true, characterData: true });
