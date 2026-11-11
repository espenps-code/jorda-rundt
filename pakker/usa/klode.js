// Across America – 3D map of the USA with the 50 states (globe.gl). Used by the student page and the board.
// States that are owned get the color of the group. Every state also has a dot at its city.
// The neighboring countries are gray and cannot be clicked.
// State borders: US Census Bureau (public domain), via the us-atlas project – simplified (stater.json).
import { LAND, landEtterId } from './land.js';
import { erLaast, erStengt, innst } from '#motor/felles.js';

const KART_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
const STAT_URL = new URL('./stater.json', import.meta.url).href;
const FIPS_TIL_ID = Object.fromEntries(LAND.map((l) => [l.numerisk, l.id]));
const SENTRUM = { lat: 38.5, lng: -97, altitude: 0.95 };   // a view of the 48 states (drag the map to see Alaska and Hawaii)
const HOYDE = 0.4;                                         // turns "world heights" into USA zoom

const FARGER = { hav: '#0E4A68', ledig: '#EFE6D2', utenfor: '#B9C3C9', stengt: '#9AA3AD', kant: 'rgba(11,58,83,.55)' };

function hexTilRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * @param {HTMLElement} el
 * @param {{ vedKlikk?: (stateId)=>void, autoRoter?: boolean, kompakt?: boolean }} valg
 */
export async function lagKlode(el, valg = {}) {
  if (!window.Globe || !window.topojson) throw new Error('The map libraries did not load.');
  const [kart, stater] = await Promise.all([fetch(KART_URL).then((r) => r.json()), fetch(STAT_URL).then((r) => r.json())]);
  const naboer = window.topojson.feature(kart, kart.objects.countries).features
    .filter((f) => f.id !== '840').map((f) => ({ ...f, landId: null }));        // the USA is drawn with the states instead
  const former = [...naboer, ...stater.features.map((f) => ({ ...f, landId: FIPS_TIL_ID[f.id] })).filter((f) => f.landId)];

  let spill = null, minGruppe = null, valgt = null, hoverId = null;

  const globe = window.Globe({ animateIn: false })(el)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true).atmosphereColor('#9fd3ef').atmosphereAltitude(0.12)
    .polygonsData(former)
    .polygonAltitude((f) => (!f.landId ? 0.003 : f.landId === valgt ? 0.02 : eier(f.landId) ? 0.009 : 0.006))
    .polygonCapColor((f) => (f.landId && f.landId === hoverId && f.landId !== valgt ? 'rgba(255,226,140,.95)' : fyllfarge(f.landId)))  // hover = light yellow
    .polygonSideColor(() => 'rgba(11,58,83,.25)')
    .polygonStrokeColor(() => FARGER.kant)
    .polygonLabel((f) => (f.landId ? etikett(f.landId) : ''))
    .polygonsTransitionDuration(300)
    .onPolygonHover((f) => { hoverId = f?.landId || null; el.style.cursor = f?.landId ? 'pointer' : 'grab'; globe.polygonCapColor(globe.polygonCapColor()); })
    .onPolygonClick((f) => f?.landId && valg.vedKlikk?.(f.landId))
    // the cities as dots
    .pointsData([])
    .pointLat('lat').pointLng('lng').pointColor('farge').pointAltitude('hoyde').pointRadius('radius')
    .pointLabel((p) => p.etikett)
    .onPointClick((p) => p.landId && valg.vedKlikk?.(p.landId))
    // the groups as "pins" with names
    .htmlElementsData([])
    .htmlLat('lat').htmlLng('lng').htmlAltitude(0.025)
    .htmlElement((d) => {
      const n = document.createElement('div');
      n.className = 'klode-nal' + (d.min ? ' min' : '');
      n.innerHTML = `<span style="background:${d.farge}">${d.tekst}</span>`;
      return n;
    })
    .arcsData([])
    .arcStartLat('fraLat').arcStartLng('fraLng').arcEndLat('tilLat').arcEndLng('tilLng')
    .arcColor(() => ['#F59E0B', '#FDE68A']).arcStroke(0.5).arcDashLength(0.4).arcDashGap(0.15).arcDashAnimateTime(2200)
    .arcAltitudeAutoScale(0.3);

  globe.globeMaterial().color.set(FARGER.hav);
  globe.controls().autoRotate = false;          // the USA stays in the middle
  globe.controls().enableZoom = true;
  globe.controls().minDistance = 112;
  globe.pointOfView(SENTRUM, 0);

  const tilpass = () => globe.width(el.clientWidth).height(el.clientHeight);
  new ResizeObserver(tilpass).observe(el); tilpass();

  const i = () => innst(spill);
  function eier(id) { return spill?.eierskap?.[id] || null; }
  function fyllfarge(id) {
    if (!id) return FARGER.utenfor;
    if (id === valgt) return '#F59E0B';
    const e = eier(id);
    if (e) {
      const farge = spill.grupper?.[e.gruppe]?.farge || '#888888';
      return erLaast(e, i()) ? farge : hexTilRgba(farge, 0.72);
    }
    if (spill && erStengt(id, i())) return FARGER.stengt;
    return FARGER.ledig;
  }
  function etikett(id) {
    const l = landEtterId[id]; if (!l) return '';
    const e = eier(id);
    const g = e && spill.grupper?.[e.gruppe];
    const stengt = spill && erStengt(id, i());
    const status = g ? `Owned by <b style="color:${g.farge}">${esc(g.navn)}</b>${erLaast(e, i()) ? ' 🔒' : ''}` : stengt ? 'Closed for travel' : 'Free';
    return `<div class="klode-etikett"><div style="font-size:1.4em">${l.flagg} <b>${esc(l.navn)}</b></div><div>${esc(l.by)} · ${esc(l.kontinent)}</div><div>${status}</div></div>`;
  }

  function tegnPunkter() {
    const pkt = LAND.map((l) => {
      const e = eier(l.id);
      const stengt = spill && erStengt(l.id, i());
      return {
        lat: l.lat, lng: l.lng, landId: l.id,
        farge: l.id === valgt ? '#B45309' : e ? '#FFFFFF' : stengt ? '#6B7280' : '#0B3A53',
        hoyde: l.id === valgt ? 0.024 : e ? 0.013 : 0.01, radius: l.id === valgt ? 0.22 : 0.15,
        etikett: etikett(l.id),
      };
    });
    globe.pointsData(pkt);
    // where the groups are
    const perStat = {};
    const naler = Object.entries(spill?.grupper || {}).map(([gid, g]) => {
      const l = landEtterId[g.posisjon]; if (!l) return null;
      const n = (perStat[l.id] = (perStat[l.id] || 0) + 1) - 1;  // spread pins in the same state a little
      return { lat: l.lat - n * 0.9, lng: l.lng, farge: g.farge, tekst: esc(g.navn), min: gid === minGruppe };
    }).filter(Boolean);
    globe.htmlElementsData(naler);
  }

  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  return {
    globe,
    oppdater(nyttSpill, gid = null) {
      spill = nyttSpill; minGruppe = gid;
      globe.polygonCapColor(globe.polygonCapColor()).polygonAltitude(globe.polygonAltitude()).polygonLabel(globe.polygonLabel());
      tegnPunkter();
    },
    velg(id) {
      valgt = id;
      globe.polygonCapColor(globe.polygonCapColor()).polygonAltitude(globe.polygonAltitude());
      tegnPunkter();
    },
    visReise(fraId, tilId) {
      const a = landEtterId[fraId], b = landEtterId[tilId];
      globe.arcsData(a && b ? [{ fraLat: a.lat, fraLng: a.lng, tilLat: b.lat, tilLng: b.lng }] : []);
    },
    fokus(id, hoyde = 1.8, ms = 1200) {
      const l = landEtterId[id]; if (l) globe.pointOfView({ lat: l.lat, lng: l.lng, altitude: Math.max(0.4, hoyde * HOYDE) }, ms);
    },
    oversikt(ms = 1200) { globe.pointOfView(SENTRUM, ms); },
    autoRoter() { /* the USA map does not rotate */ },
  };
}
