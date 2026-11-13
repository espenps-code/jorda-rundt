// Solsystemet rundt – kartet i reisedagbøkene (rapport.html). Tegner solsystemet, ruta og stedene gruppa eier.
import { LAND, landEtterId } from './land.js';
import { W, POS, grunnSvg, KARTSTIL } from './kart.js';

export const KART_URL = '';                         // kartet tegnes av koden – ingen kartfil å laste
export async function lastKart() { return []; }

export function kartSvg(_kart, gid, farge, rute, eide, besokt) {
  const steder = LAND.map((l) => {
    const p = POS[l.id];
    return eide.has(l.id) ? `<circle cx="${p.x}" cy="${p.y}" r="7" fill="${farge}" stroke="#fff" stroke-width="1.6"/>`
      : besokt.has(l.id) ? `<circle cx="${p.x}" cy="${p.y}" r="5.5" fill="#fff" stroke="${farge}" stroke-width="2"/>`
      : `<circle cx="${p.x}" cy="${p.y}" r="2.6" fill="#fff" stroke="#6b7785" stroke-width="1"/>`;
  }).join('');
  let linjer = '';
  for (let n = 1; n < rute.length; n++) {
    const a = POS[rute[n - 1]], b = POS[rute[n]]; if (!a || !b) continue;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.min(70, Math.hypot(b.x - a.x, b.y - a.y) * 0.2);
    linjer += `<path d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}" fill="none" stroke="#0B3A53" stroke-width="2.4" stroke-dasharray="7 5" stroke-linecap="round" opacity=".85"/>`;
  }
  const punkter = rute.map((id, n) => { const p = POS[id]; if (!p || !landEtterId[id]) return ''; return `<g><circle cx="${p.x}" cy="${p.y}" r="12" fill="${n === 0 ? '#F59E0B' : '#0B3A53'}" stroke="#fff" stroke-width="2"/><text x="${p.x}" y="${p.y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">${n === 0 ? 'S' : n}</text></g>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Kart over reiseruta i solsystemet"><style>${KARTSTIL(true)}</style>${grunnSvg({ lys: true })}${steder}${linjer}${punkter}<text x="${W - 10}" y="${W - 10}" text-anchor="end" font-size="13" fill="#6b7785">Kartet er ikke i riktig målestokk</text></svg>`;
}
