// Across the UK – the map in the travel diaries (rapport.html). Draws the regions, the route and the places the group owns.
// Region borders: Office for National Statistics (Open Government Licence v3.0), simplified. Contains OS data © Crown copyright.
import { LAND, landEtterId, landKode } from './land.js';
export const KART_URL = new URL('./regioner.json', import.meta.url).href;
export async function lastKart() { return (await (await fetch(KART_URL)).json()).features; }

// ---------- map of the UK (simple projection) ----------
const W = 640, H = 900, VEST = -8.4, OST = 2.0, TOPP = 61.0, BUNN = 49.7;
const KX = Math.cos(55 * Math.PI / 180);                       // degrees of longitude are shorter this far north
const S = H / (TOPP - BUNN);                                   // pixels per degree of latitude
const X0 = (W - (OST - VEST) * KX * S) / 2;                    // center the map
const px = (lng) => X0 + (lng - VEST) * KX * S;
const py = (lat) => (TOPP - lat) * S;
function ringSti(ring) { return ring.map(([lng, lat], n) => `${n ? 'L' : 'M'}${px(lng).toFixed(1)},${py(lat).toFixed(1)}`).join('') + 'Z'; }
function featureSti(f) {
  const g = f.geometry; if (!g) return '';
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return polys.map((p) => p.map(ringSti).join('')).join('');
}
export function kartSvg(fylker, gid, farge, rute, eide, besokt) {
  const eideFylker = new Set([...eide].map(landKode));
  const land = (fylker || []).map((f) => {
    const sti = featureSti(f); if (!sti) return '';
    const fyll = eideFylker.has(f.id) ? farge + '33' : '#fbf7ee';
    return `<path d="${sti}" fill="${fyll}" stroke="#b8c7d1" stroke-width=".7"/>`;
  }).join('');
  // valgfrie «Vårt sted»-steder og Svalbard tegnes bare hvis gruppa har vært der
  const steder = LAND.filter((l) => !(l.valgfri || l.oy) || eide.has(l.id) || besokt.has(l.id)).map((l) => eide.has(l.id) ? `<circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="7" fill="${farge}" stroke="#fff" stroke-width="1.6"/>`
    : besokt.has(l.id) ? `<circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="5" fill="#fff" stroke="${farge}" stroke-width="2"/>`
    : `<circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="2.2" fill="#9aa8b2"/>`).join('');
  let linjer = '';
  for (let n = 1; n < rute.length; n++) {
    const a = landEtterId[rute[n - 1]], b = landEtterId[rute[n]]; if (!a || !b) continue;
    const x1 = px(a.lng), y1 = py(a.lat), x2 = px(b.lng), y2 = py(b.lat);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.min(60, Math.hypot(x2 - x1, y2 - y1) * 0.2);
    linjer += `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" fill="none" stroke="#0B3A53" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round" opacity=".85"/>`;
  }
  const punkter = rute.map((id, n) => { const l = landEtterId[id]; if (!l) return ''; return `<g><circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="10" fill="${n === 0 ? '#F59E0B' : '#0B3A53'}" stroke="#fff" stroke-width="2"/><text x="${px(l.lng)}" y="${py(l.lat) + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">${n === 0 ? 'S' : n}</text></g>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of the route in the UK">${land}${steder}${linjer}${punkter}<text x="${W - 6}" y="${H - 6}" text-anchor="end" font-size="10" fill="#9aa8b2">Region borders: ONS (OGL v3.0), contains OS data © Crown copyright</text></svg>`;
}
