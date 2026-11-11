// Across America – the map in the travel diaries (rapport.html). Draws the route and the states the group owns.
// Alaska and Hawaii are drawn as small boxes in the lower left corner (as on most maps of the USA).
import { LAND, landEtterId } from './land.js';
export const KART_URL = new URL('./stater.json', import.meta.url).href;
/** rapport.html loads the map with this (stater.json is GeoJSON, not TopoJSON like the world map) */
export async function lastKart() { return (await (await fetch(KART_URL)).json()).features; }

const W = 1000, H = 560;
const K = Math.cos(38 * Math.PI / 180);
// the 48 states: lng −125…−66.5, lat 24…49.6
const S = Math.min((W - 40) / (58.5 * K), (H - 40) / 25.6);
const fast = ([lng, lat]) => [20 + (lng + 125) * K * S, 20 + (49.6 - lat) * S];
// Alaska (small) and Hawaii in boxes at the bottom left
const alaska = ([lng, lat]) => [25 + (lng + 180) * 0.38 * S * 0.35, H - 150 + (72 - lat) * S * 0.35];
const hawaii = ([lng, lat]) => [215 + (lng + 161) * K * S * 0.9, H - 75 + (22.6 - lat) * S * 0.9];
const proj = (id) => (id === 'AK' ? alaska : id === 'HI' ? hawaii : fast);
const FIPS = Object.fromEntries(LAND.map((l) => [l.numerisk, l.id]));
const pos = (l) => proj(l.id)([l.lng, l.lat]);

function featureSti(f, p) {
  const g = f.geometry; if (!g) return '';
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return polys.map((poly) => poly.map((ring) => ring.map((c, n) => { const [x, y] = p(c); return `${n ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('') + 'Z').join('')).join('');
}
export function kartSvg(stater, gid, farge, rute, eide, besokt) {
  const land = stater.map((f) => {
    const id = FIPS[f.id]; if (!id) return '';
    const fyll = eide.has(id) ? farge : besokt.has(id) ? farge + '55' : '#fbf7ee';
    return `<path d="${featureSti(f, proj(id))}" fill="${fyll}" stroke="#b8c7d1" stroke-width=".8"/>`;
  }).join('');
  const bokser = `<rect x="14" y="${H - 162}" width="190" height="150" rx="8" fill="none" stroke="#b8c7d1" stroke-dasharray="4 4"/><rect x="210" y="${H - 92}" width="150" height="80" rx="8" fill="none" stroke="#b8c7d1" stroke-dasharray="4 4"/>`;
  let linjer = '';
  for (let n = 1; n < rute.length; n++) {
    const a = landEtterId[rute[n - 1]], b = landEtterId[rute[n]]; if (!a || !b) continue;
    const [x1, y1] = pos(a), [x2, y2] = pos(b);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.min(70, Math.hypot(x2 - x1, y2 - y1) * 0.22);
    linjer += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="#0B3A53" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" opacity=".85"/>`;
  }
  const punkter = rute.map((id, n) => { const l = landEtterId[id]; if (!l) return ''; const [x, y] = pos(l); return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${n === 0 ? '#F59E0B' : '#0B3A53'}" stroke="#fff" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">${n === 0 ? 'S' : n}</text></g>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of the route">${bokser}${land}${linjer}${punkter}</svg>`;
}
