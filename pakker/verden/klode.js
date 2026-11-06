// Jorda rundt – 3D-jordklode (globe.gl). Brukes av elevsiden og tavla.
// Land som eies, fargelegges i gruppas farge. Små land som ikke synes som flater, får en prikk.
import { LAND, landEtterId } from './land.js';
import { erLaast, erStengt, innst } from '#motor/felles.js';

const KART_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
const NUM_TIL_ID = Object.fromEntries(LAND.map((l) => [l.numerisk, l.id]));

const FARGER = {
  hav: '#0E4A68',
  ledig: '#EFE6D2',
  stengt: '#9AA3AD',
  kant: 'rgba(11,58,83,.55)',
};

function hexTilRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * @param {HTMLElement} el
 * @param {{ vedKlikk?: (landId)=>void, autoRoter?: boolean, kompakt?: boolean }} valg
 */
export async function lagKlode(el, valg = {}) {
  if (!window.Globe || !window.topojson) throw new Error('Jordklode-bibliotekene ble ikke lastet.');
  const kart = await (await fetch(KART_URL)).json();
  const former = window.topojson.feature(kart, kart.objects.countries).features
    .map((f) => ({ ...f, landId: NUM_TIL_ID[f.id] || (f.properties?.name === 'Kosovo' ? 'XK' : null) }))
    .filter((f) => f.landId);
  const harForm = new Set(former.map((f) => f.landId));
  const smaa = LAND.filter((l) => !harForm.has(l.id));

  let spill = null, minGruppe = null, valgt = null, hoverId = null, reiseBue = null;

  const globe = window.Globe({ animateIn: true })(el)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true).atmosphereColor('#9fd3ef').atmosphereAltitude(0.18)
    .polygonsData(former)
    .polygonAltitude((f) => (f.landId === valgt ? 0.06 : f.landId === hoverId ? 0.025 : eier(f.landId) ? 0.018 : 0.008))
    .polygonCapColor((f) => fyllfarge(f.landId))
    .polygonSideColor(() => 'rgba(11,58,83,.25)')
    .polygonStrokeColor(() => FARGER.kant)
    .polygonLabel((f) => etikett(f.landId))
    .polygonsTransitionDuration(300)
    .onPolygonHover((f) => { hoverId = f?.landId || null; el.style.cursor = f ? 'pointer' : 'grab'; globe.polygonAltitude(globe.polygonAltitude()); })
    .onPolygonClick((f) => valg.vedKlikk?.(f.landId))
    // små land og gruppenes posisjon som punkter
    .pointsData([])
    .pointLat('lat').pointLng('lng').pointColor('farge').pointAltitude('hoyde').pointRadius('radius')
    .pointLabel((p) => p.etikett)
    .onPointClick((p) => p.landId && valg.vedKlikk?.(p.landId))
    // grupper som "nåler" med navn
    .htmlElementsData([])
    .htmlLat('lat').htmlLng('lng').htmlAltitude(0.03)
    .htmlElement((d) => {
      const n = document.createElement('div');
      n.className = 'klode-nal' + (d.min ? ' min' : '');
      n.innerHTML = `<span style="background:${d.farge}">${d.tekst}</span>`;
      return n;
    })
    .arcsData([])
    .arcStartLat('fraLat').arcStartLng('fraLng').arcEndLat('tilLat').arcEndLng('tilLng')
    .arcColor(() => ['#F59E0B', '#FDE68A']).arcStroke(0.6).arcDashLength(0.4).arcDashGap(0.15).arcDashAnimateTime(2200)
    .arcAltitudeAutoScale(0.35);

  globe.globeMaterial().color.set(FARGER.hav);
  globe.controls().autoRotate = !!valg.autoRoter;
  globe.controls().autoRotateSpeed = 0.35;
  globe.controls().enableZoom = true;

  // hold størrelsen i takt med boksen
  const tilpass = () => globe.width(el.clientWidth).height(el.clientHeight);
  new ResizeObserver(tilpass).observe(el); tilpass();

  function eier(landId) { return spill?.eierskap?.[landId] || null; }
  function fyllfarge(landId) {
    if (landId === valgt) return '#F59E0B';
    const e = eier(landId);
    if (e) {
      const farge = spill.grupper?.[e.gruppe]?.farge || '#888';
      return erLaast(e, innst(spill)) ? farge : hexTilRgba(farge, 0.72);
    }
    if (spill && erStengt(landId, innst(spill))) return FARGER.stengt;
    return FARGER.ledig;
  }
  function etikett(landId) {
    const l = landEtterId[landId]; if (!l) return '';
    const e = eier(landId);
    const g = e && spill.grupper?.[e.gruppe];
    const stengt = spill && erStengt(landId, innst(spill));
    const status = g ? `Eies av <b style="color:${g.farge}">${esc(g.navn)}</b>${erLaast(e, innst(spill)) ? ' 🔒' : ''}` : stengt ? 'Stengt for reiser' : 'Ledig';
    return `<div class="klode-etikett"><div style="font-size:1.4em">${l.flagg} <b>${esc(l.navn)}</b></div><div>${esc(l.by)}</div><div>${status}</div></div>`;
  }

  function tegnPunkter() {
    const pkt = [];
    for (const l of smaa) {
      const e = eier(l.id);
      pkt.push({
        lat: l.lat, lng: l.lng, landId: l.id,
        farge: l.id === valgt ? '#F59E0B' : e ? (spill.grupper?.[e.gruppe]?.farge || '#888') : 'rgba(239,230,210,.9)',
        hoyde: e || l.id === valgt ? 0.03 : 0.01, radius: e || l.id === valgt ? 0.55 : 0.3,
        etikett: etikett(l.id),
      });
    }
    globe.pointsData(pkt);
    // gruppenes posisjon
    const perLand = {};
    const naler = Object.entries(spill?.grupper || {}).map(([gid, g]) => {
      const l = landEtterId[g.posisjon]; if (!l) return null;
      const n = (perLand[l.id] = (perLand[l.id] || 0) + 1) - 1;  // spre nåler i samme land litt
      return { lat: l.lat - n * 3.2, lng: l.lng, farge: g.farge, tekst: esc(g.navn), min: gid === minGruppe };
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
    velg(landId) {
      valgt = landId;
      globe.polygonCapColor(globe.polygonCapColor()).polygonAltitude(globe.polygonAltitude());
      tegnPunkter();
    },
    visReise(fraId, tilId) {
      const a = landEtterId[fraId], b = landEtterId[tilId];
      reiseBue = a && b ? [{ fraLat: a.lat, fraLng: a.lng, tilLat: b.lat, tilLng: b.lng }] : [];
      globe.arcsData(reiseBue);
    },
    fokus(landId, hoyde = 1.8, ms = 1200) {
      const l = landEtterId[landId]; if (l) globe.pointOfView({ lat: l.lat, lng: l.lng, altitude: hoyde }, ms);
    },
    autoRoter(paa) { globe.controls().autoRotate = paa; },
  };
}
