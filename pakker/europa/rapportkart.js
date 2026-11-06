// Europa rundt – kartet i reisedagbøkene (rapport.html). Tegner ruta og stedene gruppa eier.
import { LAND, landEtterId, LANDENE, landKode } from './land.js';
export const KART_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';

// ---------- kart over Europa (enkel projeksjon med breddegrad-korreksjon) ----------
const W = 1000, H = 780, VEST = -25, OST = 42, TOPP = 71.5, BUNN = 27;
const px = (lng) => ((lng - VEST) / (OST - VEST)) * W;
const py = (lat) => ((TOPP - lat) / (TOPP - BUNN)) * H;
const NUM = Object.fromEntries(LANDENE.map((l) => [l.numerisk, l.id]));
function ringSti(ring) {
  let d = '', forrige = null;
  for (const [lng, lat] of ring) {
    const hopp = forrige !== null && Math.abs(lng - forrige) > 180;
    d += `${d && !hopp ? 'L' : 'M'}${px(lng).toFixed(1)},${py(lat).toFixed(1)}`;
    forrige = lng;
  }
  return d + 'Z';
}
function featureSti(f) {
  const g = f.geometry; if (!g) return '';
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  // bare deler som ligger i nærheten av Europa (sparer plass i utskriften)
  return polys.filter((p) => p[0].some(([lng, lat]) => lng > VEST - 15 && lng < OST + 25 && lat > BUNN - 10)).map((p) => p.map(ringSti).join('')).join('');
}
export function kartSvg(verden, gid, farge, rute, eide, besokt) {
  const eideLand = new Set([...eide].map(landKode));
  const land = verden.map((f) => {
    const id = NUM[f.id] || (f.properties?.name === 'Kosovo' ? 'XK' : null);
    const sti = featureSti(f); if (!sti) return '';
    const fyll = !id ? '#e4e8ea' : eideLand.has(id) ? farge + '33' : '#fbf7ee';
    return `<path d="${sti}" fill="${fyll}" stroke="#b8c7d1" stroke-width=".7"/>`;
  }).join('');
  const byer = LAND.map((l) => eide.has(l.id) ? `<circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="7" fill="${farge}" stroke="#fff" stroke-width="1.6"/>`
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
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kart over reiseruta i Europa">${land}${byer}${linjer}${punkter}</svg>`;
}
