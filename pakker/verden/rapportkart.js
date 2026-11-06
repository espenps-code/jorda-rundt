// Jorda rundt – kartet i reisedagbøkene (rapport.html). Tegner ruta og stedene gruppa eier.
import { LAND, landEtterId } from './land.js';
export const KART_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

// ---------- kart (enkel ekvirektangulær projeksjon, uten Antarktis-stripa) ----------
const W = 1000, H = 470, TOPP = 84, BUNN = -58;
const px = (lng) => ((lng + 180) / 360) * W;
const py = (lat) => ((TOPP - Math.max(BUNN, Math.min(TOPP, lat))) / (TOPP - BUNN)) * H;
const NUM = Object.fromEntries(LAND.map((l) => [l.numerisk, l.id]));
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
  return polys.map((p) => p.map(ringSti).join('')).join('');
}
export function kartSvg(verden, gid, farge, rute, eide, besokt) {
  const land = verden.map((f) => {
    const id = NUM[f.id] || (f.properties?.name === 'Kosovo' ? 'XK' : null);
    const fyll = eide.has(id) ? farge : besokt.has(id) ? farge + '55' : '#fbf7ee';
    return `<path d="${featureSti(f)}" fill="${fyll}" stroke="#b8c7d1" stroke-width=".5"/>`;
  }).join('');
  const smaa = [...eide].filter((id) => !verden.some((f) => NUM[f.id] === id)).map((id) => { const l = landEtterId[id]; return `<circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="4" fill="${farge}" stroke="#fff" stroke-width="1.2"/>`; }).join('');
  let linjer = '';
  for (let n = 1; n < rute.length; n++) {
    const a = landEtterId[rute[n - 1]], b = landEtterId[rute[n]]; if (!a || !b) continue;
    const x1 = px(a.lng), y1 = py(a.lat), x2 = px(b.lng), y2 = py(b.lat);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.min(80, Math.hypot(x2 - x1, y2 - y1) * 0.25);
    linjer += `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" fill="none" stroke="#0B3A53" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" opacity=".85"/>`;
  }
  const punkter = rute.map((id, n) => { const l = landEtterId[id]; if (!l) return ''; return `<g><circle cx="${px(l.lng)}" cy="${py(l.lat)}" r="8.5" fill="${n === 0 ? '#F59E0B' : '#0B3A53'}" stroke="#fff" stroke-width="2"/><text x="${px(l.lng)}" y="${py(l.lat) + 3.4}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">${n === 0 ? 'S' : n}</text></g>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kart over reiseruta">${land}${smaa}${linjer}${punkter}</svg>`;
}
