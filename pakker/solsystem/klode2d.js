// Solsystemet rundt – det FLATE kartet over solsystemet (reserve når 3D-modellen i klode3d.js ikke kan starte,
// f.eks. på en gammel nettleser). Samme grensesnitt som 3D-kartene: oppdater, velg, visReise, fokus, oversikt, autoRoter.
// Stedene er prikker i fargen til mannskapet som eier dem. Et system lyser i mannskapets farge når det eier ALLE stedene.
// Trykk på et system for å zoome inn. Dra for å flytte kartet. Kartet er ikke i riktig målestokk (se kart.js).
import { LAND, landEtterId, byerILand } from './land.js';
import { erLaast, erStengt, innst } from '#motor/felles.js';
import { W, POS, KRETSER, HELE, utsnitt, grunnSvg, KARTSTIL, stedSvg } from './kart.js';

const NS = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STIL = `${KARTSTIL(false)}
  .ss-kart { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; }
  .ss-sone { fill: rgba(255,255,255,.001); stroke: none; cursor: zoom-in; }
  .ss-sone.eid { stroke-width: 2.5; }
  .ss-sted { cursor: pointer; }
  .ss-sted circle.prikk { stroke: #060b1a; stroke-width: 1.2; }
  .ss-sted.valgt circle.prikk { stroke: #F59E0B; stroke-width: 2.6; }
  .ss-sted circle.bane { fill: none; stroke: #fff; stroke-width: 1; stroke-dasharray: 2.5 2.5; opacity: .85; }
  .ss-sted text { font: 700 7.5px 'Atkinson Hyperlegible', system-ui, sans-serif; fill: #fff; paint-order: stroke; stroke: #060b1a; stroke-width: 2.4px; pointer-events: none; }
  .ss-nal rect { stroke: #fff; stroke-width: .8; }
  .ss-nal text { font: 800 7px 'Atkinson Hyperlegible', system-ui, sans-serif; fill: #fff; pointer-events: none; }
  .ss-nal.min rect { stroke: #FDE68A; stroke-width: 1.6; }
  .ss-reise { fill: none; stroke: #F59E0B; stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 8 6; animation: ss-flyt 1.2s linear infinite; }
  @keyframes ss-flyt { to { stroke-dashoffset: -28; } }
  /* helt ute: bare navnene på systemene. Zoomet inn: navnene på stedene. */
  .ss-kart.ute .ss-sted text { display: none; }
  .ss-kart.ute .ss-nal { transform: scale(2.2); transform-box: fill-box; transform-origin: left bottom; }
  .ss-kart.inne .ss-navn { font-size: 11px; stroke-width: 3px; }
  .ss-kart.inne .ss-belte { display: none; }
  .ss-kart.inne .ss-sone { cursor: grab; }
  @media (prefers-reduced-motion: reduce) { .ss-reise { animation: none; } }`;

/**
 * @param {HTMLElement} el
 * @param {{ vedKlikk?: (stedId)=>void, autoRoter?: boolean, kompakt?: boolean }} valg
 */
export async function lagKlode2d(el, valg = {}) {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'ss-kart ute'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Kart over solsystemet');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = `<style>${STIL}</style>${grunnSvg()}<g class="ss-soner"></g><g class="ss-reiser"></g><g class="ss-steder"></g><g class="ss-naler"></g>`;
  const [gSoner, gReise, gSteder, gNaler] = ['ss-soner', 'ss-reiser', 'ss-steder', 'ss-naler'].map((c) => svg.querySelector('.' + c));
  const knapper = document.createElement('div');
  knapper.style.cssText = 'position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px;z-index:2';
  knapper.innerHTML = ['ut|🌌|Vis hele solsystemet', 'inn|＋|Zoom inn', 'mindre|－|Zoom ut'].map((k) => { const [id, t, tittel] = k.split('|'); return `<button type="button" data-zoom="${id}" title="${tittel}" aria-label="${tittel}" style="width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(12,35,64,.85);color:#fff;font:800 20px system-ui;cursor:pointer">${t}</button>`; }).join('');
  const merknad = document.createElement('div');
  merknad.style.cssText = 'position:absolute;left:8px;bottom:6px;font:11px sans-serif;color:rgba(255,255,255,.6);z-index:2;pointer-events:none';
  merknad.textContent = 'Kartet er ikke i riktig målestokk';
  el.append(svg, knapper, merknad);

  let spill = null, minGruppe = null, valgt = null;
  const i = () => innst(spill);
  const eier = (id) => spill?.eierskap?.[id] || null;

  // ---------- utsnitt (zoom og flytting) ----------
  let vb = { ...HELE }, anim = 0;
  function settVb(v) {
    vb = { x: Math.max(0, Math.min(W, v.x)), y: Math.max(0, Math.min(W, v.y)), b: Math.max(110, Math.min(W, v.b)) };
    svg.setAttribute('viewBox', `${(vb.x - vb.b / 2).toFixed(1)} ${(vb.y - vb.b / 2).toFixed(1)} ${vb.b.toFixed(1)} ${vb.b.toFixed(1)}`);
    svg.classList.toggle('ute', vb.b > 700); svg.classList.toggle('inne', vb.b <= 700);
  }
  function gaaTil(maal, ms = 600) {
    cancelAnimationFrame(anim);
    if (!ms || matchMedia('(prefers-reduced-motion: reduce)').matches) return settVb(maal);
    const fra = { ...vb }, t0 = performance.now();
    const steg = (t) => {
      const p = Math.min(1, (t - t0) / ms), e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      settVb({ x: fra.x + (maal.x - fra.x) * e, y: fra.y + (maal.y - fra.y) * e, b: fra.b + (maal.b - fra.b) * e });
      if (p < 1) anim = requestAnimationFrame(steg);
    };
    anim = requestAnimationFrame(steg);
  }
  settVb(HELE);

  // dra for å flytte kartet (et kort trykk uten bevegelse er et vanlig klikk)
  let dra = null, flyttet = false;
  svg.addEventListener('pointerdown', (e) => { dra = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; flyttet = false; });
  svg.addEventListener('pointermove', (e) => {
    if (!dra) return;
    const dx = e.clientX - dra.x, dy = e.clientY - dra.y;
    if (!flyttet && Math.hypot(dx, dy) < 8) return;
    flyttet = true; cancelAnimationFrame(anim);
    const skala = vb.b / Math.min(svg.clientWidth || 1, svg.clientHeight || 1);
    settVb({ x: dra.vx - dx * skala, y: dra.vy - dy * skala, b: vb.b });
  });
  const slipp = () => { dra = null; };
  svg.addEventListener('pointerup', slipp); svg.addEventListener('pointercancel', slipp); svg.addEventListener('pointerleave', slipp);
  svg.addEventListener('wheel', (e) => { e.preventDefault(); settVb({ ...vb, b: vb.b * (e.deltaY > 0 ? 1.15 : 0.87) }); }, { passive: false });
  svg.addEventListener('click', (e) => {
    if (flyttet) { flyttet = false; return; }
    const sted = e.target.closest('[data-sted]');
    // helt ute er prikkene for små til å treffe: da zoomer et trykk inn på systemet i stedet
    if (sted && vb.b <= 700) { valg.vedKlikk?.(sted.dataset.sted); return; }
    const sone = e.target.closest('[data-krets]') || (sted && { dataset: { krets: landEtterId[sted.dataset.sted].krets } });
    if (sone && vb.b > utsnitt(sone.dataset.krets).b * 1.2) gaaTil(utsnitt(sone.dataset.krets));
  });
  knapper.addEventListener('click', (e) => {
    const k = e.target.closest('[data-zoom]')?.dataset.zoom; if (!k) return;
    if (k === 'ut') gaaTil(HELE); else gaaTil({ ...vb, b: vb.b * (k === 'inn' ? 0.6 : 1.6) }, 300);
  });

  // ---------- tegning ----------
  /** gruppe-id hvis ett mannskap eier alle åpne steder i systemet */
  function heltEid(landId) {
    if (!spill) return null;
    const apne = byerILand(landId).filter((b) => !erStengt(b.id, i()));
    if (!apne.length) return null;
    const g = eier(apne[0].id)?.gruppe;
    return g && apne.every((b) => eier(b.id)?.gruppe === g) ? g : null;
  }
  function status(b) {
    const e = eier(b.id); const g = e && spill?.grupper?.[e.gruppe];
    if (g) return `eies av ${g.navn}${erLaast(e, i()) ? ' (låst)' : ''}`;
    return spill && erStengt(b.id, i()) ? 'stengt' : 'ledig';
  }
  function tegn() {
    // sonene: usynlige sirkler man kan trykke på for å zoome – og som lyser når hele systemet er eid
    gSoner.innerHTML = Object.values(KRETSER).map((k) => {
      const g = heltEid(landEtterId[k.steder[0]]?.landId); const farge = g && spill.grupper?.[g]?.farge;
      return `<circle class="ss-sone${farge ? ' eid' : ''}" data-krets="${k.id}" cx="${k.x.toFixed(1)}" cy="${k.y.toFixed(1)}" r="${(k.ytterst + 22).toFixed(1)}"${farge ? ` style="fill:${esc(farge)}40;stroke:${esc(farge)}"` : ''}/>`;
    }).join('');
    gSteder.innerHTML = LAND.map((b) => {
      const e = eier(b.id), stengt = spill && erStengt(b.id, i());
      const farge = e ? (spill.grupper?.[e.gruppe]?.farge || '#888') : stengt ? '#6B7280' : '#FFFFFF';
      return `<g class="ss-sted${b.id === valgt ? ' valgt' : ''}" data-sted="${b.id}"><title>${esc(b.navn)} – ${esc(status(b))}</title>${stedSvg(b, esc(farge))}</g>`;
    }).join('');
    // mannskapenes posisjon
    const perSted = {};
    gNaler.innerHTML = Object.entries(spill?.grupper || {}).map(([gid, g]) => {
      const p = POS[g.posisjon]; if (!p) return '';
      const n = (perSted[g.posisjon] = (perSted[g.posisjon] || 0) + 1) - 1;       // flere mannskap på samme sted: stable dem
      const navn = String(g.navn || ''); const bredde = Math.max(22, navn.length * 4.4 + 8);
      const x = p.x + 8, y = p.y - 16 - n * 12;
      return `<g class="ss-nal${gid === minGruppe ? ' min' : ''}" pointer-events="none"><rect x="${x}" y="${y}" width="${bredde}" height="11" rx="5.5" fill="${esc(g.farge || '#888')}"/><text x="${x + bredde / 2}" y="${y + 8}" text-anchor="middle">${esc(navn)}</text></g>`;
    }).join('');
  }
  tegn();

  return {
    globe: { pointOfView() {} },          // de andre kartene er 3D-kloder – tavla forventer at denne finnes
    oppdater(nyttSpill, gid = null) { spill = nyttSpill; minGruppe = gid; tegn(); },
    velg(stedId) { valgt = stedId; tegn(); },
    visReise(fraId, tilId) {
      const a = POS[fraId], b = POS[tilId];
      if (!a || !b) { gReise.innerHTML = ''; return; }
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.min(80, Math.hypot(b.x - a.x, b.y - a.y) * 0.22);
      gReise.innerHTML = `<path class="ss-reise" d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}"/>`;
    },
    fokus(stedId, _hoyde, ms = 1200) { const l = landEtterId[stedId]; if (l) gaaTil(utsnitt(l.krets), Math.min(ms, 900)); },
    oversikt(ms = 1200) { gaaTil(HELE, Math.min(ms, 900)); },
    autoRoter(paa) { if (paa) gaaTil(HELE, 900); },   // kartet roterer ikke – tavla bruker dette til å gå tilbake til oversikten
  };
}
