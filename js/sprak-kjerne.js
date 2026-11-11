// MOTOREN – språklaget, kjernen (ren kode uten avhengigheter – brukes av js/sprak.js og verktoy/sprak-sjekk.mjs).
// Motoren er skrevet på norsk. Spillpakker på andre språk (pakke.js: sprak: 'en') får teksten oversatt
// via en ordbok (js/sprak/en.js) der nøkkelen er den norske teksten.
//
// Slik deles tekst opp: HTML-koder skiller teksten i biter. <b>, <i>, <em>, <strong> o.l. blir værende inne i biten.
// Verdier som settes inn (${…}) blir {0}, {1} … i nøkkelen. Emoji, piler og mellomrom i kantene hører ikke med i nøkkelen.
//   `<h3>Velkommen til ${by}!</h3><p>Husk å <b>booke hotell</b>.</p>`
//   → nøklene «Velkommen til {0}!» og «Husk å <b>booke hotell</b>.»
export const A = '', B = '';          // merker for innsatte verdier: <nr>
const INLINE = /^<\/?(?:b|i|em|strong|u|kbd|sup|sub|mark)(?:\s[^<>]*)?>$/i;
const TAGG = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^<>]*>/g;
const HAR_ORD = /\p{L}{2,}|(?:^|[\s\uE001])\p{L}(?=$|[\s\uE000])/u;   // et ord på minst to bokstaver – eller en enslig bokstav som «i» og «å»
const ATTR = /\b(title|placeholder|aria-label|alt)="([^"]*)"/g;
const PYNT = String.raw`[\p{Extended_Pictographic}️‍⃣←-⇿■-◿☀-➿·•|\s]|[0-9#*]️?⃣`;
const FORAN = new RegExp(`^(?:${PYNT})*`, 'u');
const BAK = new RegExp(`(?:${PYNT})*$`, 'u');
const OMSLAG = /^<(b|i|em|strong)>([^<]*)<\/\1>$/;

/** Lager en oversetter for én ordbok. mangler = Set som fylles med nøkler som ikke finnes i ordboka. */
export function lagOversetter(ordbok, mangler = null) {
  function slaaOpp(kjerne) {
    const kart = [];
    const k = kjerne.replace(/\s+/g, ' ').replace(/(\d+)/g, (_, n) => { let i = kart.indexOf(n); if (i < 0) { kart.push(n); i = kart.length - 1; } return `{${i}}`; });
    let v = Object.hasOwn(ordbok, k) ? ordbok[k] : undefined;
    if (v === undefined) {
      const m = OMSLAG.exec(k);                      // <b>Tekst</b> → slå opp «Tekst»
      if (m) { const inni = run(m[2].replace(/\{(\d+)\}/g, (_, i) => A + kart[i] + B), true); return inni === null ? null : `<${m[1]}>${inni}</${m[1]}>`; }
      mangler?.add(k);
      return null;
    }
    return String(v).replace(/\{(\d+)\}/g, (_, i) => (kart[i] !== undefined ? A + kart[i] + B : ''));
  }
  /** Én tekstbit (kan inneholde <b> o.l.). Gir tilbake samme tekst hvis den ikke finnes i ordboka. */
  function run(tekst, nullVedMiss = false) {
    if (!HAR_ORD.test(tekst.replace(TAGG, '').replace(/\d+/g, ''))) return nullVedMiss ? null : tekst;
    const foran = FORAN.exec(tekst)[0];
    const rest = tekst.slice(foran.length);
    const bak = BAK.exec(rest)[0];
    // Samme ord med ulik betydning? Da kan ordboka ha en egen nøkkel MED emojien: «📺 Tavle» slås opp før «Tavle».
    if (foran.trim() || bak.trim()) { const hel = tekst.trim().replace(/\s+/g, ' '); if (!hel.includes(A) && Object.hasOwn(ordbok, hel)) return tekst.replace(tekst.trim(), ordbok[hel]); }
    const v = slaaOpp(rest.slice(0, rest.length - bak.length));
    return v === null ? (nullVedMiss ? null : tekst) : foran + v + bak;
  }
  const tagg = (t) => t.replace(ATTR, (hele, navn, verdi) => (HAR_ORD.test(verdi) ? `${navn}="${run(verdi)}"` : hele));
  /** En hel tekst som kan inneholde HTML. */
  function html(s) {
    if (!HAR_ORD.test(s)) return s;
    let ut = '', bit = '', sist = 0, raa = false;
    const tom = () => { if (bit) { ut += raa ? bit : run(bit); bit = ''; } };
    for (const m of s.matchAll(TAGG)) {
      bit += s.slice(sist, m.index);
      const t = m[0];
      if (!raa && INLINE.test(t)) bit += t;
      else { tom(); ut += tagg(t); if (/^<(style|script)\b/i.test(t)) raa = true; else if (/^<\/(style|script)/i.test(t)) raa = false; }
      sist = m.index + t.length;
    }
    bit += s.slice(sist); tom();
    return ut;
  }
  return { html, run };
}

/** Gjør om en mal (tekstbitene i en `…${}…`) til én tekst med merker for verdiene. */
export function malTekst(strings) {
  let s = strings[0];
  for (let i = 1; i < strings.length; i++) s += A + (i - 1) + B + strings[i];
  return s;
}

/** Oversetter fast tekst i en side (DOM). Brukes én gang når siden lastes. */
export function oversettDom(rot, o) {
  const HOPP = new Set(['SCRIPT', 'STYLE', 'SVG', 'TEXTAREA', 'CANVAS', 'CODE', 'TEMPLATE']);
  const INL = new Set(['B', 'I', 'EM', 'STRONG', 'U', 'KBD', 'SUP', 'SUB', 'MARK']);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const doc = rot.ownerDocument || rot;
  function gaa(el) {
    for (const a of ['title', 'placeholder', 'aria-label', 'alt']) {
      const v = el.getAttribute(a);
      if (v && HAR_ORD.test(v)) { const n = o.run(v); if (n !== v) el.setAttribute(a, n); }
    }
    let bit = [];
    const tom = () => {
      if (bit.length && bit.some((n) => n.nodeType === 3 ? HAR_ORD.test(n.data) : HAR_ORD.test(n.textContent))) {
        const kilde = bit.map((n) => (n.nodeType === 3 ? esc(n.data) : n.outerHTML)).join('');
        const ny = o.run(kilde);
        if (ny !== kilde) {
          const t = doc.createElement('template'); t.innerHTML = ny;
          bit[0].parentNode.insertBefore(t.content, bit[0]);
          for (const n of bit) n.remove();
        }
      }
      bit = [];
    };
    for (const n of [...el.childNodes]) {
      if (n.nodeType === 3) bit.push(n);
      else if (n.nodeType === 1 && INL.has(n.tagName.toUpperCase()) && !n.id && ![...n.attributes].some((x) => x.name.startsWith('data-'))) bit.push(n);
      else { tom(); if (n.nodeType === 1 && !HOPP.has(n.tagName.toUpperCase()) && !n.hasAttribute('data-p') && !n.hasAttribute('data-ikke-oversett')) gaa(n); }
    }
    tom();
  }
  gaa(rot);
}
