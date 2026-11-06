// Europa rundt – 3D-kart over Europa (globe.gl). Brukes av elevsiden og tavla.
// Byene er prikker i gruppefargen til eieren. Et land fargelegges når én gruppe eier ALLE byene der.
// Land utenfor Europa vises grått og kan ikke klikkes.
import { LAND, landEtterId, LANDENE, byerILand } from './land.js';
import { erLaast, erStengt, innst } from '#motor/felles.js';

const KART_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
const NUM_TIL_ID = Object.fromEntries(LANDENE.map((l) => [l.numerisk, l.id]));
const HOVEDSTAD = Object.fromEntries(LANDENE.map((l) => [l.id, byerILand(l.id).find((b) => b.hovedstad)?.id || byerILand(l.id)[0]?.id]));
const SENTRUM = { lat: 51, lng: 13, altitude: 0.95 };   // utsikt over Europa
const HOYDE = 0.38;                                      // gjør om «verdens-høyder» til Europa-zoom

const FARGER = {
  hav: '#0E4A68',
  ledig: '#EFE6D2',
  utenfor: '#B9C3C9',
  stengt: '#9AA3AD',
  kant: 'rgba(11,58,83,.55)',
};

function hexTilRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * @param {HTMLElement} el
 * @param {{ vedKlikk?: (byId)=>void, autoRoter?: boolean, kompakt?: boolean }} valg
 */
export async function lagKlode(el, valg = {}) {
  if (!window.Globe || !window.topojson) throw new Error('Kart-bibliotekene ble ikke lastet.');
  const kart = await (await fetch(KART_URL)).json();
  const former = window.topojson.feature(kart, kart.objects.countries).features
    .map((f) => ({ ...f, landId: NUM_TIL_ID[f.id] || (f.properties?.name === 'Kosovo' ? 'XK' : null) }));

  let spill = null, minGruppe = null, valgt = null, hoverId = null;

  const globe = window.Globe({ animateIn: false })(el)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true).atmosphereColor('#9fd3ef').atmosphereAltitude(0.12)
    .polygonsData(former)
    .polygonAltitude((f) => (!f.landId ? 0.001 : f.landId === hoverId ? 0.006 : heltEid(f.landId) ? 0.004 : 0.002))
    .polygonCapColor((f) => fyllfarge(f.landId))
    .polygonSideColor(() => 'rgba(11,58,83,.25)')
    .polygonStrokeColor(() => FARGER.kant)
    .polygonLabel((f) => (f.landId ? landEtikett(f.landId) : ''))
    .polygonsTransitionDuration(300)
    .onPolygonHover((f) => { hoverId = f?.landId || null; el.style.cursor = f?.landId ? 'pointer' : 'grab'; globe.polygonAltitude(globe.polygonAltitude()); })
    .onPolygonClick((f) => f?.landId && valg.vedKlikk?.(HOVEDSTAD[f.landId]))
    // byene som punkter
    .pointsData([])
    .pointLat('lat').pointLng('lng').pointColor('farge').pointAltitude('hoyde').pointRadius('radius')
    .pointLabel((p) => p.etikett)
    .onPointClick((p) => p.byId && valg.vedKlikk?.(p.byId))
    // grupper som "nåler" med navn
    .htmlElementsData([])
    .htmlLat('lat').htmlLng('lng').htmlAltitude(0.02)
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
  globe.controls().autoRotate = false;          // Europa skal bli liggende i midten
  globe.controls().enableZoom = true;
  globe.controls().minDistance = 115;           // ikke zoome helt ned i bakken
  globe.pointOfView(SENTRUM, 0);

  const tilpass = () => globe.width(el.clientWidth).height(el.clientHeight);
  new ResizeObserver(tilpass).observe(el); tilpass();

  const i = () => innst(spill);
  function eier(byId) { return spill?.eierskap?.[byId] || null; }
  /** gruppe-id hvis én gruppe eier alle åpne byer i landet */
  function heltEid(landId) {
    if (!spill) return null;
    const apne = byerILand(landId).filter((b) => !erStengt(b.id, i()));
    if (!apne.length) return null;
    const g = eier(apne[0].id)?.gruppe;
    return g && apne.every((b) => eier(b.id)?.gruppe === g) ? g : null;
  }
  function fyllfarge(landId) {
    if (!landId) return FARGER.utenfor;
    const g = heltEid(landId);
    if (g) return hexTilRgba(spill.grupper?.[g]?.farge || '#888888', 0.8);
    if (spill && byerILand(landId).every((b) => erStengt(b.id, i()))) return FARGER.stengt;
    return FARGER.ledig;
  }
  function byStatus(b) {
    const e = eier(b.id); const g = e && spill?.grupper?.[e.gruppe];
    if (g) return `<b style="color:${g.farge}">${esc(g.navn)}</b>${erLaast(e, i()) ? ' 🔒' : ''}`;
    return spill && erStengt(b.id, i()) ? 'stengt' : 'ledig';
  }
  function landEtikett(landId) {
    const l = LANDENE.find((x) => x.id === landId); if (!l) return '';
    const g = heltEid(landId);
    return `<div class="klode-etikett"><div style="font-size:1.4em">${l.flagg} <b>${esc(l.navn)}</b></div>
      ${byerILand(landId).map((b) => `<div>${b.hovedstad ? '★ ' : ''}${esc(b.navn)} – ${byStatus(b)}</div>`).join('')}
      ${g ? `<div>🏆 Hele landet eies av <b style="color:${spill.grupper[g].farge}">${esc(spill.grupper[g].navn)}</b></div>` : ''}</div>`;
  }
  function byEtikett(b) {
    return `<div class="klode-etikett"><div style="font-size:1.3em">${b.flagg} <b>${esc(b.navn)}</b></div><div>${esc(b.landNavn)}${b.hovedstad ? ' · hovedstad' : ''}</div><div>${byStatus(b)}</div></div>`;
  }

  function tegnPunkter() {
    const pkt = LAND.map((b) => {
      const e = eier(b.id);
      const stengt = spill && erStengt(b.id, i());
      const farge = b.id === valgt ? '#F59E0B' : e ? (spill.grupper?.[e.gruppe]?.farge || '#888') : stengt ? '#6B7280' : '#FFFFFF';
      return {
        lat: b.lat, lng: b.lng, byId: b.id, farge,
        hoyde: e || b.id === valgt ? 0.010 : 0.008,  // lave søyler: litt over fylkene/landene (maks 0.006), men ikke så høye at de skygger for naboene
        radius: (b.id === valgt ? 0.24 : e ? 0.20 : 0.16) * (b.hovedstad ? 1.15 : 1),
        etikett: byEtikett(b),
      };
    });
    globe.pointsData(pkt);
    // gruppenes posisjon
    const perBy = {};
    const naler = Object.entries(spill?.grupper || {}).map(([gid, g]) => {
      const l = landEtterId[g.posisjon]; if (!l) return null;
      const n = (perBy[l.id] = (perBy[l.id] || 0) + 1) - 1;  // spre nåler i samme by litt
      return { lat: l.lat - n * 0.7, lng: l.lng, farge: g.farge, tekst: esc(g.navn), min: gid === minGruppe };
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
    velg(byId) { valgt = byId; tegnPunkter(); },
    visReise(fraId, tilId) {
      const a = landEtterId[fraId], b = landEtterId[tilId];
      globe.arcsData(a && b ? [{ fraLat: a.lat, fraLng: a.lng, tilLat: b.lat, tilLng: b.lng }] : []);
    },
    fokus(byId, hoyde = 1.8, ms = 1200) {
      const l = landEtterId[byId]; if (l) globe.pointOfView({ lat: l.lat, lng: l.lng, altitude: Math.max(0.3, hoyde * HOYDE) }, ms);
    },
    oversikt(ms = 1200) { globe.pointOfView(SENTRUM, ms); },
    autoRoter() { /* Europa-kartet roterer ikke */ },
  };
}
