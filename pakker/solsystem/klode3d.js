// Solsystemet rundt – 3D-MODELLEN av solsystemet (three.js). Brukes av elevsiden og tavla via klode.js.
// Samme grensesnitt som kartene i de andre spillpakkene: oppdater, velg, visReise, fokus, oversikt, autoRoter.
//
// • Dra med én finger for å snu modellen. Knip med to fingre (eller bruk hjulet / knappene) for å zoome.
// • Trykk på et system for å fly dit. Når dere er nær, kan dere trykke på stedene.
// • Stedene er prikker i fargen til mannskapet som eier dem. En lysende skive under et system = ett mannskap eier alt der.
// • Planetene snurrer rundt seg selv, men står stille i banen sin – ellers måtte elevene lete etter dem hver gang.
//
// IKKE I RIKTIG MÅLESTOKK: plasseringen er den samme som på det flate kartet (kart.js) – banene er presset sammen
// og planetene forstørret. I virkeligheten ville alt unntatt Sola vært usynlige prikker.
//
// three.js og planetbildene ligger i solsystem/3d/ (ikke i spillpakken, så de ikke blir med opp i skybanken).
// Planetbilder: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0 – krediteres nederst på kartet.
import { LAND, landEtterId, byerILand } from './land.js';
import { erLaast, erStengt, innst } from '#motor/felles.js';
import { C, POS, KRETSER, utsnitt } from './kart.js';

const MAPPE = new URL('../../solsystem/3d/', import.meta.url).href;
const BILDER = ['sola', 'merkur', 'venus', 'jorda', 'mars', 'jupiter', 'saturn', 'uranus', 'neptun'];   // kretser som har eget planetbilde
const MAANEFARGE = {
  'JO-romstasjonen': '#DDE6F0', 'IN-phobos': '#8C7B6E', 'IN-deimos': '#A39685',
  'JU-io': '#E8D35A', 'JU-europa': '#D9CDB8', 'JU-ganymedes': '#9C8F80', 'JU-callisto': '#6B5E52',
  'SA-mimas': '#C9C9C9', 'SA-enceladus': '#F2F6F8', 'SA-titan': '#D9A441', 'SA-iapetus': '#8A7A66',
  'UR-miranda': '#BFC6C9', 'UR-titania': '#B8AFA6', 'UR-oberon': '#A39A92', 'NE-triton': '#D8C7C0', 'KU-charon': '#9A9490',
};
const KANTETE = ['bennu', 'vesta', 'psyche', 'arrokoth', 'halley'];   // småkropper som ikke er runde
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STIL = `
  .ss3d { position: absolute; inset: 0; overflow: hidden; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; background: radial-gradient(circle at 50% 55%, #101a36 0%, #060b1a 70%); border-radius: inherit; }
  .ss3d canvas { display: block; width: 100%; height: 100%; }
  .ss3d-lag { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .ss3d-lag > div { position: absolute; left: 0; top: 0; white-space: nowrap; will-change: transform; }
  .ss3d-krets { font: 800 14px 'Bricolage Grotesque', system-ui, sans-serif; color: #fff; text-shadow: 0 0 4px #060b1a, 0 0 4px #060b1a, 0 1px 2px #000; }
  .ss3d-sted { font: 700 13px 'Atkinson Hyperlegible', system-ui, sans-serif; color: #fff; text-shadow: 0 0 4px #060b1a, 0 0 4px #060b1a, 0 1px 2px #000; }
  .ss3d-nal { font: 800 12px 'Atkinson Hyperlegible', system-ui, sans-serif; color: #fff; padding: 2px 9px; border-radius: 999px; border: 1.5px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.5); }
  .ss3d-nal.min { border-color: #FDE68A; border-width: 2.5px; }
  .ss3d-knapper { position: absolute; right: 8px; top: 8px; display: flex; flex-direction: column; gap: 6px; z-index: 2; }
  .ss3d-knapper button { width: 44px; height: 44px; border-radius: 12px; border: 1px solid rgba(255,255,255,.35); background: rgba(12,35,64,.85); color: #fff; font: 800 20px system-ui; cursor: pointer; }
  .ss3d-merknad { position: absolute; left: 8px; bottom: 6px; right: 8px; font: 11px sans-serif; color: rgba(255,255,255,.6); pointer-events: none; }`;

/**
 * @param {HTMLElement} el
 * @param {{ vedKlikk?: (stedId)=>void, autoRoter?: boolean, kompakt?: boolean }} valg
 */
export async function lagKlode3d(el, valg = {}) {
  const THREE = await import(MAPPE + 'three.module.min.js');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });   // kaster feil hvis 3D ikke er tilgjengelig → klode.js bruker det flate kartet
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  const rot = document.createElement('div'); rot.className = 'ss3d';
  rot.setAttribute('role', 'img'); rot.setAttribute('aria-label', '3D-modell av solsystemet');
  rot.innerHTML = `<style>${STIL}</style><div class="ss3d-lag"></div>
    <div class="ss3d-knapper">${['ut|🌌|Vis hele solsystemet', 'inn|＋|Zoom inn', 'mindre|－|Zoom ut'].map((k) => { const [id, t, tittel] = k.split('|'); return `<button type="button" data-zoom="${id}" title="${tittel}" aria-label="${tittel}">${t}</button>`; }).join('')}</div>
    <div class="ss3d-merknad">Ikke i riktig målestokk · Planetbilder: Solar System Scope (CC BY 4.0)</div>`;
  rot.prepend(renderer.domElement);
  el.append(rot);
  const lag = rot.querySelector('.ss3d-lag');

  const scene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(40, 1, 5, 14000);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const kretsPos = (k) => V(k.x - C, 0, k.y - C);
  const flatPos = (id) => V(POS[id].x - C, 0, POS[id].y - C);

  // ---------- lys, stjerner og Sola ----------
  scene.add(new THREE.AmbientLight(0xa9b6d6, 1.5));        // litt lys også på nattsiden, så planetene er lette å kjenne igjen
  scene.add(new THREE.PointLight(0xfff2d6, 2.4, 0, 0));           // Sola lyser like sterkt overalt (ellers ble Neptun svart)
  {
    const n = 1600, p = new Float32Array(n * 3); let s = 11;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1), d = 5000 + r() * 1500; p.set([d * Math.sin(b) * Math.cos(a), d * Math.cos(b), d * Math.sin(b) * Math.sin(a)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.75 })));
  }
  const laster = new THREE.TextureLoader();
  /** Kule som får planetbildet sitt når det er lastet (til da – og hvis bildet mangler – har den bare en farge). */
  function kule(R, farge, bilde, { lyser = false, kantet = false } = {}) {
    const geo = kantet ? new THREE.IcosahedronGeometry(R, 1) : new THREE.SphereGeometry(R, 40, 24);
    const mat = lyser ? new THREE.MeshBasicMaterial({ color: farge }) : new THREE.MeshLambertMaterial({ color: farge, flatShading: kantet });
    if (bilde) laster.load(`${MAPPE}tekstur/${bilde}.jpg`, (t) => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.color.set('#ffffff'); mat.needsUpdate = true; }, undefined, () => {});
    return new THREE.Mesh(geo, mat);
  }
  function prikkBilde(tegn) {
    const c = document.createElement('canvas'); c.width = c.height = 64; tegn(c.getContext('2d'));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // glød rundt Sola
  {
    const glod = new THREE.Sprite(new THREE.SpriteMaterial({ map: prikkBilde((x) => { const g = x.createRadialGradient(32, 32, 6, 32, 32, 32); g.addColorStop(0, 'rgba(255,200,80,.9)'); g.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), blending: THREE.AdditiveBlending, depthWrite: false }));
    glod.scale.set(190, 190, 1); scene.add(glod);
  }

  // ---------- baner og belter ----------
  const sirkel = (r, n = 180) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push(V(r * Math.cos(a), 0, r * Math.sin(a))); } return new THREE.BufferGeometry().setFromPoints(p); };
  const baneMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
  for (const k of Object.values(KRETSER)) if (k.bane) scene.add(new THREE.LineLoop(sirkel(k.r), baneMat));
  function belte(r, bredde, antall, fro) {
    const p = new Float32Array(antall * 3); let s = fro;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < antall; i++) { const a = rnd() * Math.PI * 2, d = r + (rnd() - 0.5) * bredde; p.set([d * Math.cos(a), (rnd() - 0.5) * 6, d * Math.sin(a)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xb9b2a6, size: 1.6, transparent: true, opacity: 0.7 })));
  }
  belte(305, 26, 900, 3); belte(592, 44, 1500, 5);

  // ---------- kulene: Sola, planetene, småkroppene og månene ----------
  const snurrer = [];                 // kuler som snurrer rundt seg selv
  const eidSkive = {};                // kretsId → lysende skive som vises når ett mannskap eier hele systemet
  for (const k of Object.values(KRETSER)) {
    const m = kule(k.R, k.farge, BILDER.includes(k.id) ? k.id : null, { lyser: k.id === 'sola', kantet: KANTETE.includes(k.id) });
    m.position.copy(kretsPos(k)); scene.add(m);
    if (k.id !== 'mars') snurrer.push([m, k.id === 'sola' ? 0.0006 : 0.0022]);       // Mars står stille, så stedene på overflaten ikke «glir»
    if (k.ringer) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(k.R * 1.35, k.R * 2.05, 72), new THREE.MeshBasicMaterial({ color: 0xcdb88a, side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false }));
      ring.position.copy(m.position); ring.rotation.x = -Math.PI / 2 + 0.3; ring.rotation.y = 0.15; scene.add(ring);
    }
    if (k.hale) {                                                                    // kometen: en hale som peker bort fra Sola
      const retning = kretsPos(k).normalize();
      const hale = new THREE.Mesh(new THREE.ConeGeometry(5, 60, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xd8ecf5, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      hale.position.copy(kretsPos(k)).addScaledVector(retning, 32);
      hale.quaternion.setFromUnitVectors(V(0, 1, 0), retning.clone().negate()); scene.add(hale);
    }
    const skive = new THREE.Mesh(new THREE.CircleGeometry(k.ytterst + 22, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }));
    skive.rotation.x = -Math.PI / 2; skive.position.copy(kretsPos(k)); skive.position.y = -k.R - 3; skive.visible = false; scene.add(skive);
    eidSkive[k.id] = skive;
  }
  // Månen vår (pynt – stedene på den er egne prikker)
  const maaneSteder = LAND.filter((l) => l.kropp === 'Månen');
  const MAANE = { R: 14, pos: maaneSteder.reduce((sum, l) => sum.add(flatPos(l.id)), V(0, 0, 0)).divideScalar(maaneSteder.length || 1) };
  { const m = kule(MAANE.R, '#CFCFCF', 'maanen'); m.position.copy(MAANE.pos); scene.add(m); }

  // ---------- stedene: en prikk man kan trykke på (alltid vendt mot kamera, alltid synlig) ----------
  const prikkTex = prikkBilde((x) => { x.beginPath(); x.arc(32, 32, 27, 0, 7); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 7; x.strokeStyle = '#111827'; x.stroke(); });
  const ringTex = prikkBilde((x) => { x.beginPath(); x.arc(32, 32, 27, 0, 7); x.lineWidth = 6; x.strokeStyle = '#fff'; x.setLineDash([10, 8]); x.stroke(); });
  const valgtTex = prikkBilde((x) => { x.beginPath(); x.arc(32, 32, 28, 0, 7); x.lineWidth = 7; x.strokeStyle = '#F59E0B'; x.stroke(); });
  const steder = LAND.map((l) => {
    const k = KRETSER[l.krets], midt = kretsPos(k), flat = flatPos(l.id);
    let pos;
    if (l.kropp === 'Månen') { const d = flat.clone().sub(MAANE.pos); pos = MAANE.pos.clone().add(V(d.x, Math.sqrt(Math.max(1, MAANE.R ** 2 - d.x ** 2 - d.z ** 2)) + 1.5, d.z)); }
    else if (l.kropp) { const d = flat.clone().sub(midt); pos = midt.clone().add(V(d.x, Math.sqrt(Math.max(1, k.R ** 2 - d.x ** 2 - d.z ** 2)) + 1.5, d.z)); }   // på overflaten (Mars)
    else if (l.kart[0] === 0) pos = midt.clone().add(V(0, k.R + 4, 0));              // selve planeten / småkroppen
    else {                                                                          // en måne (eller romstasjonen) i bane rundt planeten
      const stasjon = l.type === 'stasjon';
      const m = stasjon ? new THREE.Mesh(new THREE.BoxGeometry(7, 1.6, 2.4), new THREE.MeshLambertMaterial({ color: MAANEFARGE[l.id] })) : kule(4.6, MAANEFARGE[l.id] || '#BDBDBD', null);
      m.position.copy(flat); scene.add(m); if (!stasjon) snurrer.push([m, 0.004]);
      pos = flat.clone().add(V(0, 8, 0));
    }
    const prikk = new THREE.Sprite(new THREE.SpriteMaterial({ map: prikkTex, sizeAttenuation: false, depthTest: false, transparent: true }));
    prikk.position.copy(pos); prikk.renderOrder = 10; scene.add(prikk);
    let ring = null;
    if (l.bane) { ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, sizeAttenuation: false, depthTest: false, transparent: true })); ring.position.copy(pos); ring.renderOrder = 9; scene.add(ring); }
    const navn = l.navn !== k.navn ? document.createElement('div') : null;
    if (navn) { navn.className = 'ss3d-sted'; navn.textContent = l.navn.split(' – ').pop(); lag.append(navn); }
    return { l, pos, prikk, ring, navn, skjerm: { x: 0, y: 0, synlig: false } };
  });
  const stedEtterId = Object.fromEntries(steder.map((s) => [s.l.id, s]));
  const valgtRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: valgtTex, sizeAttenuation: false, depthTest: false, transparent: true }));
  valgtRing.renderOrder = 11; valgtRing.visible = false; scene.add(valgtRing);
  const kretser = Object.values(KRETSER).map((k) => {
    const navn = document.createElement('div'); navn.className = 'ss3d-krets'; navn.textContent = k.navn; lag.append(navn);
    return { k, pos: kretsPos(k), topp: kretsPos(k).add(V(0, k.R + 14, 0)), navn, skjerm: { x: 0, y: 0, synlig: false } };
  });

  // ---------- reisen: en bue og et lite «romskip» som flyr langs den ----------
  const reiseLinje = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 }));
  const skip = new THREE.Sprite(new THREE.SpriteMaterial({ map: prikkBilde((x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, '#fff'); g.addColorStop(0.4, '#FDE68A'); g.addColorStop(1, 'rgba(245,158,11,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), sizeAttenuation: false, depthTest: false, transparent: true }));
  skip.scale.set(0.05, 0.05, 1); skip.renderOrder = 12;
  reiseLinje.visible = skip.visible = false; scene.add(reiseLinje, skip);
  let reiseKurve = null;

  // ---------- kamera: snu, zoome og fly ----------
  const UTE = () => ({ x: 0, z: 0, d: 610 / (Math.tan(kamera.fov * Math.PI / 360) * Math.min(1, kamera.aspect)), pol: 0.78 });
  const k = { x: 0, z: 0, d: 2000, az: Math.PI / 2, pol: 0.78 };    // x,z = punktet kamera ser på · d = avstand · az/pol = vinkler
  let fly = null, driv = !!valg.autoRoter, sistRort = 0;
  const klem = () => { k.d = Math.max(60, Math.min(3200, k.d)); k.pol = Math.max(0.1, Math.min(1.45, k.pol)); };
  function settKamera() {
    klem();
    kamera.position.set(k.x + k.d * Math.sin(k.pol) * Math.cos(k.az), k.d * Math.cos(k.pol), k.z + k.d * Math.sin(k.pol) * Math.sin(k.az));
    kamera.lookAt(k.x, 0, k.z);
  }
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flyTil(maal, ms = 900) {
    if (!ms || rolig) { Object.assign(k, maal); fly = null; return; }
    fly = { fra: { ...k }, til: { ...k, ...maal }, t0: performance.now(), ms };
  }
  const flyTilKrets = (id, ms) => { const u = utsnitt(id); flyTil({ x: u.x - C, z: u.y - C, d: Math.max(150, u.b * 1.35), pol: 0.85 }, ms); };
  const erNaer = () => k.d < 620;

  function tilpass() {
    const w = rot.clientWidth || 300, h = rot.clientHeight || 300;
    renderer.setSize(w, h, false); kamera.aspect = w / h; kamera.updateProjectionMatrix();
  }
  new ResizeObserver(tilpass).observe(rot); tilpass();
  Object.assign(k, UTE()); settKamera();

  // fingre og mus
  const pekere = new Map(); let flyttet = false, klype = 0;
  rot.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    pekere.set(e.pointerId, { x: e.clientX, y: e.clientY }); flyttet = false; klype = 0;
    try { rot.setPointerCapture(e.pointerId); } catch { /* ikke viktig */ }
  });
  rot.addEventListener('pointermove', (e) => {
    const p = pekere.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (pekere.size === 1) {
      if (!flyttet && Math.hypot(dx, dy) < 8) return;
      flyttet = true; fly = null; sistRort = performance.now();
      k.az += dx * 0.006; k.pol -= dy * 0.005; p.x = e.clientX; p.y = e.clientY;
    } else if (pekere.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...pekere.values()]; const avstand = Math.hypot(a.x - b.x, a.y - b.y);
      if (klype) { k.d *= klype / Math.max(1, avstand); fly = null; sistRort = performance.now(); }
      klype = avstand; flyttet = true;
    }
  });
  const slipp = (e) => {
    const var1 = pekere.size === 1 && pekere.has(e.pointerId);
    pekere.delete(e.pointerId); klype = 0;
    if (var1 && !flyttet && e.type === 'pointerup') trykk(e.clientX, e.clientY);
  };
  rot.addEventListener('pointerup', slipp); rot.addEventListener('pointercancel', slipp);
  rot.addEventListener('wheel', (e) => { e.preventDefault(); k.d *= e.deltaY > 0 ? 1.12 : 0.89; fly = null; sistRort = performance.now(); }, { passive: false });
  rot.querySelector('.ss3d-knapper').addEventListener('click', (e) => {
    const z = e.target.closest('[data-zoom]')?.dataset.zoom; if (!z) return;
    sistRort = performance.now();
    if (z === 'ut') flyTil(UTE()); else flyTil({ d: k.d * (z === 'inn' ? 0.6 : 1.6) }, 300);
  });
  /** Et trykk: nær → velg stedet under fingeren. Langt unna → fly til systemet under fingeren. */
  function trykk(cx, cy) {
    const r = rot.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
    sistRort = performance.now();
    if (erNaer()) {
      let best = null, bd = 34;
      for (const s of steder) { if (!s.skjerm.synlig) continue; const d = Math.hypot(s.skjerm.x - x, s.skjerm.y - y); if (d < bd) { bd = d; best = s; } }
      if (best) { valg.vedKlikk?.(best.l.id); return; }
    }
    let best = null, bd = Infinity;
    for (const kr of kretser) {
      if (!kr.skjerm.synlig) continue;
      const d = Math.hypot(kr.skjerm.x - x, kr.skjerm.y - y) - kr.skjerm.radius;
      if (d < 30 && d < bd) { bd = d; best = kr; }
    }
    if (best) flyTilKrets(best.k.id);
  }

  // ---------- spilltilstand ----------
  let spill = null, minGruppe = null, valgt = null, naler = [];
  const i = () => innst(spill);
  const eier = (id) => spill?.eierskap?.[id] || null;
  function heltEid(landId) {
    if (!spill) return null;
    const apne = byerILand(landId).filter((b) => !erStengt(b.id, i()));
    if (!apne.length) return null;
    const g = eier(apne[0].id)?.gruppe;
    return g && apne.every((b) => eier(b.id)?.gruppe === g) ? g : null;
  }
  function fargelegg() {
    for (const s of steder) {
      const e = eier(s.l.id), stengt = spill && erStengt(s.l.id, i());
      s.prikk.material.color.set(e ? (spill.grupper?.[e.gruppe]?.farge || '#888888') : stengt ? '#6B7280' : '#FFFFFF');
      s.laast = !!e && erLaast(e, i());
    }
    for (const kr of kretser) {
      const g = heltEid(landEtterId[kr.k.steder[0]]?.landId), farge = g && spill.grupper?.[g]?.farge;
      eidSkive[kr.k.id].visible = !!farge; if (farge) eidSkive[kr.k.id].material.color.set(farge);
    }
    for (const n of naler) n.el.remove();
    const perSted = {};
    naler = Object.entries(spill?.grupper || {}).map(([gid, g]) => {
      const s = stedEtterId[g.posisjon]; if (!s) return null;
      const el = document.createElement('div'); el.className = 'ss3d-nal' + (gid === minGruppe ? ' min' : '');
      el.style.background = g.farge || '#888'; el.textContent = g.navn || ''; lag.append(el);
      return { el, s, n: (perSted[g.posisjon] = (perSted[g.posisjon] || 0) + 1) - 1 };
    }).filter(Boolean);
    valgtRing.visible = !!stedEtterId[valgt]; if (valgtRing.visible) valgtRing.position.copy(stedEtterId[valgt].pos);
  }

  // ---------- tegning, bilde for bilde ----------
  const v = new THREE.Vector3();
  function tilSkjerm(pos, ut, w, h) {
    v.copy(pos).project(kamera);
    ut.synlig = v.z > -1 && v.z < 1 && v.x > -1.15 && v.x < 1.15 && v.y > -1.15 && v.y < 1.15;
    ut.x = (v.x + 1) / 2 * w; ut.y = (1 - v.y) / 2 * h;
  }
  const plasser = (el, x, y, vis, ax = '-50%', ay = '0') => { el.style.display = vis ? '' : 'none'; if (vis) el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${ax}, ${ay})`; };
  let synlig = true, ramme = 0;
  new IntersectionObserver((r) => { synlig = r[0].isIntersecting; }).observe(rot);
  function tegn(naa) {
    ramme = requestAnimationFrame(tegn);
    if (!synlig || document.hidden) return;                       // sparer batteri når kartet ikke vises
    if (fly) {
      const p = Math.min(1, (naa - fly.t0) / fly.ms), e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      for (const n of ['x', 'z', 'd', 'pol']) k[n] = fly.fra[n] + (fly.til[n] - fly.fra[n]) * e;
      if (p >= 1) fly = null;
    } else if (driv && !rolig && !pekere.size && naa - sistRort > 4000) k.az += 0.0009;   // tavla: sakte rundtur
    settKamera();
    if (!rolig) for (const [m, fart] of snurrer) m.rotation.y += fart;
    const w = rot.clientWidth, h = rot.clientHeight, naer = erNaer();
    const px = (naer ? 22 : w < 520 ? 6 : 8) / h;                  // prikkene har fast størrelse på skjermen: små på avstand (så planetene synes), store når dere er nær
    for (const s of steder) {
      s.prikk.scale.set(px, px, 1); if (s.ring) s.ring.scale.set(px * 1.7, px * 1.7, 1);
      tilSkjerm(s.pos, s.skjerm, w, h);
      const vis = s.skjerm.synlig && naer && s.pos.distanceTo(V(k.x, 0, k.z)) < k.d * 0.75;
      if (s.navn) {                                                // navnet står under prikken – eller til siden / over (tekst i steder.js)
        const a = px * h * 0.5 + 3, t = s.l.tekst;
        if (t === 'v') plasser(s.navn, s.skjerm.x - a, s.skjerm.y, vis, '-100%', '-50%');
        else if (t === 'h') plasser(s.navn, s.skjerm.x + a, s.skjerm.y, vis, '0', '-50%');
        else if (t === 'o') plasser(s.navn, s.skjerm.x, s.skjerm.y - a, vis, '-50%', '-100%');
        else plasser(s.navn, s.skjerm.x, s.skjerm.y + a, vis);
      }
    }
    valgtRing.scale.set(px * 1.5, px * 1.5, 1);
    for (const kr of kretser) {
      tilSkjerm(kr.pos, kr.skjerm, w, h);
      v.copy(kr.pos).add(V(kr.k.ytterst + 14, 0, 0)).project(kamera);
      kr.skjerm.radius = Math.max(16, Math.abs((v.x + 1) / 2 * w - kr.skjerm.x));
      v.copy(kr.topp).project(kamera);
      const smaa = !naer && w < 520 && ['merkur', 'venus', 'bennu'].includes(kr.k.id);   // liten skjerm: ikke navn på de minste helt inne ved Sola
      plasser(kr.navn, (v.x + 1) / 2 * w, (1 - v.y) / 2 * h, kr.skjerm.synlig && !smaa, '-50%', '-100%');
    }
    for (const n of naler) plasser(n.el, n.s.skjerm.x, n.s.skjerm.y - px * h * 0.5 - 6 - n.n * 24, n.s.skjerm.synlig, '-50%', '-100%');
    if (reiseKurve) skip.position.copy(reiseKurve.getPoint((naa % 2600) / 2600));
    renderer.render(scene, kamera);
  }
  ramme = requestAnimationFrame(tegn);

  return {
    globe: { pointOfView() {} },          // de andre kartene er jordkloder – tavla forventer at denne finnes
    oppdater(nyttSpill, gid = null) { spill = nyttSpill; minGruppe = gid; fargelegg(); },
    velg(stedId) { valgt = stedId; valgtRing.visible = !!stedEtterId[valgt]; if (valgtRing.visible) valgtRing.position.copy(stedEtterId[valgt].pos); },
    visReise(fraId, tilId) {
      const a = stedEtterId[fraId], b = stedEtterId[tilId];
      reiseLinje.visible = skip.visible = !!(a && b); reiseKurve = null;
      if (!a || !b) return;
      const midt = a.pos.clone().add(b.pos).multiplyScalar(0.5); midt.y += Math.min(160, a.pos.distanceTo(b.pos) * 0.3) + 12;
      reiseKurve = new THREE.QuadraticBezierCurve3(a.pos, midt, b.pos);
      reiseLinje.geometry.dispose(); reiseLinje.geometry = new THREE.BufferGeometry().setFromPoints(reiseKurve.getPoints(48));
    },
    fokus(stedId, _hoyde, ms = 1200) { const l = landEtterId[stedId]; if (l) flyTilKrets(l.krets, Math.min(ms, 1100)); },
    oversikt(ms = 1200) { flyTil(UTE(), Math.min(ms, 1100)); },
    autoRoter(paa) { driv = !!paa; if (paa) flyTil(UTE(), 1100); },
    stopp() { cancelAnimationFrame(ramme); renderer.dispose(); rot.remove(); },
    // til testing: zoom rett inn uten animasjon, og hvor et sted står på skjermen akkurat nå
    _test: { settNaer(stedId) { const u = utsnitt(landEtterId[stedId].krets); Object.assign(k, { x: u.x - C, z: u.y - C, d: Math.max(150, u.b * 1.35), pol: 0.85 }); fly = null; }, skjerm: (id) => stedEtterId[id].skjerm, trykk },
  };
}
