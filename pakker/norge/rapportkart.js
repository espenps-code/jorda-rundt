// Norge rundt – kartet i reisedagbøkene (rapport.html). Tegner fylkene, ruta og stedene gruppa eier.
// Fylkesgrenser: Kartverket (CC BY 4.0), via github.com/robhop/fylker-og-kommuner.
import { LAND, landEtterId, landKode } from './land.js';
// Forenklet utgave av Fylker-S.geojson (færre kystpunkter, uten de minste holmene)
export const KART_URL = new URL('./fylker.json', import.meta.url).href;
export async function lastKart() { return (await (await fetch(KART_URL)).json()).features; }

// ---------- kart over Norge (enkel projeksjon med breddegrad-korreksjon) ----------
const W = 760, H = 900, VEST = 4, OST = 31.5, TOPP = 71.4, BUNN = 57.8;
const KX = Math.cos(65 * Math.PI / 180);                       // lengdegrader er kortere så langt nord
const px = (lng) => ((lng - VEST) * KX / ((OST - VEST) * KX)) * W;
const py = (lat) => ((TOPP - lat) / (TOPP - BUNN)) * H;
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
    const fyll = eideFylker.has(f.properties?.fylkesnummer) ? farge + '33' : '#fbf7ee';
    return `<path d="${sti}" fill="${fyll}" stroke="#b8c7d1" stroke-width=".7"/>`;
  }).join('');
  const steder = LAND.map((l) => eide.has(l.id) ? `<circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="7" fill="${farge}" stroke="#fff" stroke-width="1.6"/>`
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
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kart over reiseruta i Norge">${land}${steder}${linjer}${punkter}<text x="${W - 6}" y="${H - 6}" text-anchor="end" font-size="10" fill="#9aa8b2">Fylkesgrenser © Kartverket (CC BY 4.0), forenklet</text></svg>`;
}
