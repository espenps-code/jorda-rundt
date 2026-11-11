// Across the UK – 3D map of the United Kingdom with the 12 regions (globe.gl). Used by the student page and the board.
// The places are dots in the color of the owner. A region gets the color of a group when it owns ALL the places there.
// The neighboring countries are gray and cannot be clicked.
// Region borders: Office for National Statistics (Open Government Licence v3.0), simplified. Contains OS data © Crown copyright.
import { LAND, landEtterId, LANDENE, byerILand } from './land.js';
import { erLaast, erStengt, innst } from '#motor/felles.js';
// (valgfri is not used in this game, but the map code is shared with Norge rundt)
const vises = (b, spill, i) => !b.valgfri || (spill && !erStengt(b.id, i));

const KART_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
// Simplified version of the ONS regions (fewer coast points, without the smallest islands) – much faster to draw
const FYLKE_URL = new URL('./regioner.json', import.meta.url).href;
const HOVEDSTAD = Object.fromEntries(LANDENE.map((l) => [l.id, byerILand(l.id).find((b) => b.hovedstad)?.id || byerILand(l.id)[0]?.id]));
const SENTRUM = { lat: 55.2, lng: -3.6, altitude: 0.3 };  // a view of the whole UK
const HOYDE = 0.12;                                      // turns "world heights" into UK zoom

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
  if (!window.Globe || !window.topojson) throw new Error('The map libraries did not load.');
  const [kart, fylker] = await Promise.all([fetch(KART_URL).then((r) => r.json()), fetch(FYLKE_URL).then((r) => r.json())]);
  const naboer = window.topojson.feature(kart, kart.objects.countries).features
    .filter((f) => f.id !== '826').map((f) => ({ ...f, landId: null }));        // the UK is drawn with the regions instead
  const former = [...naboer, ...fylker.features.map((f) => ({ ...f, landId: f.id }))];
  const kilde = document.createElement('div');
  kilde.style.cssText = 'position:absolute;right:8px;bottom:6px;font:11px sans-serif;color:rgba(255,255,255,.55);z-index:2;pointer-events:none';
  kilde.textContent = 'Region borders: ONS (OGL v3.0), contains OS data © Crown copyright';
  el.append(kilde);

  let spill = null, minGruppe = null, valgt = null, hoverId = null;

  const globe = window.Globe({ animateIn: false })(el)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true).atmosphereColor('#9fd3ef').atmosphereAltitude(0.12)
    .polygonsData(former)
    .polygonAltitude((f) => (!f.landId ? 0.001 : heltEid(f.landId) ? 0.003 : 0.002))  // løftes ikke ved hover (da skjulte fylket byene)
    .polygonCapColor((f) => (f.landId && f.landId === hoverId ? 'rgba(255,226,140,.95)' : fyllfarge(f.landId)))  // hover = lys gul
    .polygonSideColor(() => 'rgba(11,58,83,.25)')
    .polygonStrokeColor(() => FARGER.kant)
    .polygonLabel((f) => (f.landId ? landEtikett(f.landId) : ''))
    .polygonsTransitionDuration(300)
    .onPolygonHover((f) => { hoverId = f?.landId || null; el.style.cursor = f?.landId ? 'pointer' : 'grab'; globe.polygonCapColor(globe.polygonCapColor()); })
    .onPolygonClick((f) => f?.landId && valg.vedKlikk?.(HOVEDSTAD[f.landId]))
    // byene som punkter
    .pointsData([])
    .pointLat('lat').pointLng('lng').pointColor('farge').pointAltitude('hoyde').pointRadius('radius')
    .pointLabel((p) => p.etikett)
    .onPointClick((p) => p.byId && valg.vedKlikk?.(p.byId))
    // grupper som "nåler" med navn
    .htmlElementsData([])
    .htmlLat('lat').htmlLng('lng').htmlAltitude(0.003)   // lavt, ellers svever navnet ved siden av stedet når kartet er så nært
    .htmlElement((d) => {
      const n = document.createElement('div');
      n.className = 'klode-nal' + (d.min ? ' min' : '');
      n.innerHTML = `<span style="background:${d.farge}">${d.tekst}</span>`;
      return n;
    })
    .arcsData([])
    .arcStartLat('fraLat').arcStartLng('fraLng').arcEndLat('tilLat').arcEndLng('tilLng')
    .arcColor(() => ['#F59E0B', '#FDE68A']).arcStroke(0.22).arcDashLength(0.4).arcDashGap(0.15).arcDashAnimateTime(2200)
    .arcAltitudeAutoScale(0.3);

  globe.globeMaterial().color.set(FARGER.hav);
  globe.controls().autoRotate = false;          // Norge skal bli liggende i midten
  globe.controls().enableZoom = true;
  globe.controls().minDistance = 104;           // do not zoom all the way into the ground
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
    return spill && erStengt(b.id, i()) ? 'closed' : 'free';
  }
  function landEtikett(landId) {
    const l = LANDENE.find((x) => x.id === landId); if (!l) return '';
    const g = heltEid(landId);
    return `<div class="klode-etikett"><div style="font-size:1.4em">${l.flagg} <b>${esc(l.navn)}</b></div>
      ${byerILand(landId).filter((b) => vises(b, spill, i())).map((b) => `<div>${b.hovedstad ? '★ ' : ''}${esc(b.navn)} – ${byStatus(b)}</div>`).join('')}
      ${g ? `<div>🏆 The whole region is owned by <b style="color:${spill.grupper[g].farge}">${esc(spill.grupper[g].navn)}</b></div>` : ''}</div>`;
  }
  function byEtikett(b) {
    return `<div class="klode-etikett"><div style="font-size:1.3em">${b.flagg} <b>${esc(b.navn)}</b></div><div>${esc(b.landNavn)}${b.hovedstad ? ' · main city' : ''}</div><div>${byStatus(b)}</div></div>`;
  }

  function tegnPunkter() {
    const pkt = LAND.filter((b) => vises(b, spill, i())).map((b) => {
      const e = eier(b.id);
      const stengt = spill && erStengt(b.id, i());
      const farge = b.id === valgt ? '#F59E0B' : e ? (spill.grupper?.[e.gruppe]?.farge || '#888') : stengt ? '#6B7280' : '#FFFFFF';
      return {
        lat: b.lat, lng: b.lng, byId: b.id, farge,
        hoyde: e || b.id === valgt ? 0.010 : 0.008,  // lave søyler: litt over fylkene/landene (maks 0.006), men ikke så høye at de skygger for naboene
        radius: (b.id === valgt ? 0.075 : e ? 0.062 : 0.05) * (b.hovedstad ? 1.15 : 1),
        etikett: byEtikett(b),
      };
    });
    globe.pointsData(pkt);
    // gruppenes posisjon
    const perBy = {};
    const naler = Object.entries(spill?.grupper || {}).map(([gid, g]) => {
      const l = landEtterId[g.posisjon]; if (!l) return null;
      const n = (perBy[l.id] = (perBy[l.id] || 0) + 1) - 1;  // spre nåler i samme by litt
      return { lat: l.lat - n * 0.12, lng: l.lng, farge: g.farge, tekst: esc(g.navn), min: gid === minGruppe };
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
      const l = landEtterId[byId]; if (l) globe.pointOfView({ lat: l.lat, lng: l.lng, altitude: Math.max(0.2, hoyde * HOYDE) }, ms);
    },
    oversikt(ms = 1200) { globe.pointOfView(SENTRUM, ms); },
    autoRoter() { /* the UK map does not rotate */ },
  };
}
