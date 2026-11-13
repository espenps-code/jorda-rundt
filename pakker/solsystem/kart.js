// Solsystemet rundt – KARTET (ren tegning som tekst, uten avhengigheter).
// Brukes av klode.js (elevsiden og tavla), rapportkart.js (reisedagbøkene) og forsiden.
//
// NB: Kartet er IKKE i riktig målestokk. I virkeligheten er avstandene så enorme at alt ville blitt usynlige
// prikker – Neptun ligger 30 ganger lenger fra Sola enn Jorda. Her er banene presset sammen og planetene
// forstørret. Planetene er også spredt rundt Sola slik at systemene ikke dekker hverandre.
import { LAND } from './land.js';

export const W = 1280, C = W / 2;
const rad = (v) => v * Math.PI / 180;
const polar = (x, y, d, v) => [x + d * Math.cos(rad(v)), y + d * Math.sin(rad(v))];

/** Klyngene på kartet: r = avstand fra Sola på kartet, v = vinkel, R = størrelsen på kula. bane = tegn banen som en ring. */
export const KRETSER = {
  sola: { navn: 'Sola', r: 0, v: 0, R: 34, farge: '#FDB813' },
  merkur: { navn: 'Merkur', r: 80, v: 205, R: 8, farge: '#A8A39D', bane: true },
  venus: { navn: 'Venus', r: 125, v: 325, R: 11, farge: '#E8C27A', bane: true },
  jorda: { navn: 'Jorda', r: 185, v: 55, R: 12, farge: '#3E8EDE', bane: true },
  mars: { navn: 'Mars', r: 250, v: 150, R: 22, farge: '#C8553D', bane: true },
  bennu: { navn: 'Bennu', r: 215, v: 15, R: 6, farge: '#77736E' },
  vesta: { navn: 'Vesta', r: 305, v: 205, R: 7, farge: '#B5AFA6' },
  ceres: { navn: 'Ceres', r: 305, v: 300, R: 8, farge: '#9E9A94' },
  psyche: { navn: 'Psyche', r: 305, v: 100, R: 7, farge: '#B9A27C' },
  jupiter: { navn: 'Jupiter', r: 370, v: 250, R: 22, farge: '#D9A066', bane: true },
  saturn: { navn: 'Saturn', r: 435, v: 20, R: 18, farge: '#E3C98B', bane: true, ringer: true },
  uranus: { navn: 'Uranus', r: 490, v: 112, R: 14, farge: '#9AD9E0', bane: true },
  neptun: { navn: 'Neptun', r: 535, v: 188, R: 14, farge: '#4B70DD', bane: true },
  halley: { navn: 'Halleys komet', r: 330, v: 322, R: 6, farge: '#D8ECF5', hale: true },
  pluto: { navn: 'Pluto', r: 585, v: 300, R: 9, farge: '#D9B79A' },
  eris: { navn: 'Eris', r: 600, v: 350, R: 7, farge: '#E6E2DC' },
  makemake: { navn: 'Makemake', r: 590, v: 238, R: 7, farge: '#C98B6B' },
  arrokoth: { navn: 'Arrokoth', r: 600, v: 140, R: 6, farge: '#B5694A' },
};
for (const k of Object.values(KRETSER)) [k.x, k.y] = polar(C, C, k.r, k.v);
/** Kuler som bare er pynt (ikke egne steder): Månen, som har to steder på seg. */
const MAANEN = (() => { const [x, y] = polar(KRETSER.jorda.x, KRETSER.jorda.y, 58, 330); return { x, y, R: 18, farge: '#CFCFCF' }; })();

/** Hvor hvert sted står på kartet: POS[id] = { x, y } */
export const POS = Object.fromEntries(LAND.map((l) => {
  const k = KRETSER[l.krets]; const [x, y] = polar(k.x, k.y, l.kart[0], l.kart[1]);
  return [l.id, { x: +(x + (l.kart[2] || 0)).toFixed(1), y: +(y + (l.kart[3] || 0)).toFixed(1) }];
}));
/** Stedene i hver krets, og hvor langt ut fra midten kretsen strekker seg */
for (const [id, k] of Object.entries(KRETSER)) {
  k.id = id; k.steder = LAND.filter((l) => l.krets === id).map((l) => l.id);
  k.ytterst = Math.max(k.R, ...LAND.filter((l) => l.krets === id).map((l) => l.kart[0] + (l.kropp === 'Månen' ? 22 : 6)));
}
/** Utsnittet kartet zoomer til for en krets: { x, y, b } (midtpunkt og bredde). De innerste planetene vises samlet. */
export function utsnitt(kretsId) {
  const k = KRETSER[kretsId]; if (!k) return { x: C, y: C, b: W };
  if (['sola', 'merkur', 'venus'].includes(kretsId)) return { x: C, y: C, b: 400 };
  return { x: k.x, y: k.y, b: Math.max(170, k.ytterst * 2 + 110) };
}
export const HELE = { x: C, y: C, b: W };

// ---------- bakgrunnen: stjerner, baner og kuler ----------
function stjerner() {
  let s = 7, ut = '';
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let n = 0; n < 170; n++) ut += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * W).toFixed(0)}" r="${(0.5 + r() * 1.3).toFixed(1)}" fill="#fff" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
  return ut;
}
/**
 * Bakgrunnen som SVG-tekst (uten <svg>-taggen rundt).
 * @param {{ lys?: boolean, navn?: boolean }} valg  lys = for utskrift (hvit bakgrunn) · navn = skriv navnet på kretsene
 */
export function grunnSvg({ lys = false, navn = true } = {}) {
  const strek = lys ? '#b8c2cc' : 'rgba(255,255,255,.2)';
  let ut = lys ? `<rect width="${W}" height="${W}" fill="#fbfaf6"/>` : `<rect width="${W}" height="${W}" fill="#060b1a"/><circle cx="${C}" cy="${C}" r="${C}" fill="url(#ss-glod)"/>${stjerner()}`;
  ut = `<defs><radialGradient id="ss-glod"><stop offset="0" stop-color="#3a2a12" stop-opacity=".9"/><stop offset=".35" stop-color="#101a36" stop-opacity=".7"/><stop offset="1" stop-color="#060b1a" stop-opacity="0"/></radialGradient></defs>` + ut;
  // banene til planetene
  for (const k of Object.values(KRETSER)) if (k.bane) ut += `<circle cx="${C}" cy="${C}" r="${k.r}" fill="none" stroke="${strek}" stroke-width="1.2"/>`;
  // asteroidebeltet og Kuiperbeltet som prikkete bånd
  ut += `<circle cx="${C}" cy="${C}" r="305" fill="none" stroke="${strek}" stroke-width="16" stroke-dasharray="2 9" opacity=".7"/>`;
  ut += `<circle cx="${C}" cy="${C}" r="592" fill="none" stroke="${strek}" stroke-width="30" stroke-dasharray="2 13" opacity=".6"/>`;
  if (navn) {
    ut += `<text class="ss-belte" x="${(C + 322 * Math.cos(rad(62))).toFixed(0)}" y="${(C + 322 * Math.sin(rad(62))).toFixed(0)}" text-anchor="middle">Asteroidebeltet</text>`;
    ut += `<text class="ss-belte" x="${C + 560 * Math.cos(rad(70))}" y="${C + 560 * Math.sin(rad(70))}" text-anchor="middle">Kuiperbeltet</text>`;
  }
  // kulene
  for (const k of Object.values(KRETSER)) {
    if (k.id === 'sola') ut += `<circle cx="${k.x}" cy="${k.y}" r="${k.R + 14}" fill="#FDB813" opacity=".25"/>`;
    if (k.hale) ut += `<path d="M${k.x},${k.y} l46,-34 l-38,40 z" fill="${lys ? '#9fb6c4' : '#D8ECF5'}" opacity=".55"/>`;
    if (k.ringer) ut += `<ellipse cx="${k.x}" cy="${k.y}" rx="${k.R * 1.75}" ry="${k.R * 0.55}" fill="none" stroke="#CDB88A" stroke-width="4" transform="rotate(-18 ${k.x} ${k.y})"/>`;
    ut += `<circle cx="${k.x.toFixed(1)}" cy="${k.y.toFixed(1)}" r="${k.R}" fill="${k.farge}" stroke="${lys ? '#4a5560' : 'rgba(0,0,0,.35)'}" stroke-width="1"/>`;
    if (k.id === 'jorda') ut += `<circle cx="${MAANEN.x.toFixed(1)}" cy="${MAANEN.y.toFixed(1)}" r="${MAANEN.R}" fill="${MAANEN.farge}" stroke="${lys ? '#4a5560' : 'rgba(0,0,0,.35)'}"/>`;
    if (navn) ut += `<text class="ss-navn" x="${k.x.toFixed(1)}" y="${(k.y - k.ytterst - 9).toFixed(1)}" text-anchor="middle">${k.navn}</text>`;
  }
  return ut;
}
/** Stilene til kartet (settes inn i <style> i svg-en) */
export const KARTSTIL = (lys = false) => `
  .ss-navn { font: 800 21px 'Bricolage Grotesque', system-ui, sans-serif; fill: ${lys ? '#0C2340' : '#fff'}; paint-order: stroke; stroke: ${lys ? '#fbfaf6' : '#060b1a'}; stroke-width: 4px; }
  .ss-belte { font: 700 13px 'Atkinson Hyperlegible', system-ui, sans-serif; fill: ${lys ? '#6b7785' : 'rgba(255,255,255,.55)'}; letter-spacing: .12em; text-transform: uppercase; }`;

/** Prikken og navnet til ett sted som SVG-tekst. farge = fyllfargen på prikken. Navnet vises ikke når stedet heter det samme som kretsen (Jupiter, Ceres …). */
export function stedSvg(b, farge = '#FFFFFF') {
  const p = POS[b.id], r = b.kropp ? 4.2 : 5.5, kort = b.navn.split(' – ').pop();
  const t = { u: [0, r + 9, 'middle'], o: [0, -r - 4, 'middle'], v: [-r - 4, 2.7, 'end'], h: [r + 4, 2.7, 'start'] }[b.tekst] || [0, r + 9, 'middle'];
  return `<circle cx="${p.x}" cy="${p.y}" r="13" fill="rgba(0,0,0,.001)"/>`
    + (b.bane ? `<circle class="bane" cx="${p.x}" cy="${p.y}" r="${r + 4}"/>` : '')
    + `<circle class="prikk" cx="${p.x}" cy="${p.y}" r="${r}" fill="${farge}"/>`
    + (b.navn !== KRETSER[b.krets].navn ? `<text x="${(p.x + t[0]).toFixed(1)}" y="${(p.y + t[1]).toFixed(1)}" text-anchor="${t[2]}">${kort.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>` : '');
}
