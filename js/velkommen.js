// MOTOREN – velkomst-slideshow når en gruppe kommer til et nytt sted.
// Innholdet ligger i hver spillpakke: pakker/<spill>/velkommen.js (fakta + bildetitler)
// og pakker/<spill>/velkommen-bilder.js (ferdig oppslåtte Wikimedia-bilder med fotograf og lisens,
// lages av verktoy/hent-velkomstbilder.mjs). Pakker uten velkommen.js får bare en enkel velkomst.
//
// Bruk: visVelkommen({ sted, ord, telt, vedOvernatting })

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let data = null;
async function hentData() {
  if (data) return data;
  try { data = await import('#pakke/velkommen.js'); } catch { data = { VELKOMMEN: {}, BILDER: {} }; }
  return data;
}

// Små «nysgjerrig»-setninger på slutten av faktasidene – sier ingenting som står i reiseloggen
const TEASER = [
  'Resten må dere finne ut selv i reiseloggen! 🔎',
  'Hva mer finnes her? Det er deres oppdrag å finne ut! 🕵️',
  'Dette er bare begynnelsen – reiseloggen venter! 📓',
  'Hvor mye mer klarer dere å finne ut? 🧭',
];

function lagSider(sted, ord, info, bilder, telt) {
  const fakta = info?.f || [];
  // b[0] = velkomstbildet, b[1] = bildet til fakta 1, b[2] = bildet til fakta 2 («-» eller manglende = uten bilde)
  const bildeListe = (info?.b || []).map((t) => {
    const [tittel, tekst] = String(t).split('|');
    const b = bilder[tittel];
    return b ? { ...b, tekst: tekst || tittel } : null;
  });
  const bilde = (n) => bildeListe[n] || null;
  // Undertittel: bare det spillet allerede viser i toppen (by/land/fylke) + verdensdel/landsdel
  const under = !sted.landNavn || sted.landNavn === sted.navn
    ? [sted.by && `📍 ${sted.by}`, sted.kontinent].filter(Boolean).map(esc).join(' · ')
    : ord.region === 'fylke'
      ? [sted.landNavn, sted.kontinent].filter(Boolean).map(esc).join(' · ')
      : esc(sted.landNavn);

  const sider = [{
    type: 'start', bilde: bilde(0),
    html: `<div class="vk-flagg">${sted.flagg || '📍'}</div>
      <div class="vk-merke">Dere har kommet fram!</div>
      <h2>Velkommen til ${esc(sted.navn)}!</h2>
      ${under ? `<p class="vk-under">${under}</p>` : ''}`,
  }];
  fakta.forEach((f, n) => sider.push({
    type: 'fakta', bilde: bilde(n + 1),
    html: `<div class="vk-merke">💡 Visste dere at …</div><p class="vk-fakta">${esc(f)}</p>
      ${n === fakta.length - 1 ? `<p class="vk-teaser">${TEASER[(sted.navn.length + n) % TEASER.length]}</p>` : ''}`,
  }));
  sider.push({
    type: 'slutt', bilde: null,
    html: `<img class="vk-ikon" src="${window.SPILLROT || ''}ikoner/${telt ? 'seng' : 'hotell'}.webp" alt="">
      <h2>Nå må dere finne et sted å overnatte!</h2>
      <p class="vk-under">Dere trenger tre netter i ${esc(sted.by || sted.navn)} før dere kan gjøre noe annet her.${telt && sted.telt ? ' Kanskje teltet er et godt valg?' : ''}</p>
      <button class="knapp sol vk-finn" data-vk="ferdig">🛏️ Finn overnatting</button>`,
  });
  return sider;
}

let apen = null;

const CSS = `
.vk-bakgrunn { position: fixed; inset: 0; z-index: 950; background: #04101F; animation: vk-inn .4s ease; }
.vk-bakgrunn.vk-ut { opacity: 0; transition: opacity .35s; }
@keyframes vk-inn { from { opacity: 0; } }
.vk-scene { position: absolute; inset: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding: 16px 16px 84px; }
.vk-bilde { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: vk-zoom 14s ease-out forwards; }
@keyframes vk-zoom { from { transform: scale(1.0); } to { transform: scale(1.09); } }
.vk-luftpost { position: absolute; inset: 0; background: radial-gradient(circle at 30% 20%, #1F5390, #0C2340 70%); }
.vk-luftpost::after { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 12px; background: var(--luftpost); }
.vk-skygge { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(4,16,31,.45) 0%, rgba(4,16,31,0) 25%, rgba(4,16,31,0) 45%, rgba(4,16,31,.75) 100%); pointer-events: none; }
.vk-uten-bilde { justify-content: center; }
.vk-hopp { position: absolute; top: max(14px, env(safe-area-inset-top)); right: 14px; z-index: 3; background: rgba(4,16,31,.55); color: #fff; border: 1px solid rgba(255,255,255,.35); border-radius: 999px; padding: .55em 1.1em; font: 700 .95rem var(--font); cursor: pointer; min-height: 44px; backdrop-filter: blur(6px); }
.vk-kort { position: relative; z-index: 2; background: var(--papir); color: var(--blekk); border-radius: 22px; padding: 1.3rem 1.6rem 1.4rem; width: min(100%, 640px); box-shadow: 0 20px 60px rgba(0,0,0,.45); text-align: center; animation: vk-opp .45s cubic-bezier(.2,.9,.3,1.2); border-top: 8px solid transparent; border-image: var(--luftpost) 8; border-image-width: 8px 0 0 0; }
@keyframes vk-opp { from { transform: translateY(30px); opacity: 0; } }
.vk-kort h2 { font-size: clamp(1.7rem, 4.5vw, 2.6rem); margin: .1em 0 .2em; color: var(--hav); }
.vk-flagg { font: 3.4rem/1 var(--font-tittel); margin-top: -3.2rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,.3)); }
.vk-merke { display: inline-block; font: 500 .8rem var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--korall); margin-bottom: .3rem; }
.vk-under { font-size: 1.1rem; color: var(--blekk-2); margin: .2rem 0 0; }
.vk-fakta { font: 700 clamp(1.15rem, 2.8vw, 1.45rem)/1.4 var(--font); margin: .2rem 0 0; color: var(--blekk); }
.vk-teaser { margin: .8rem 0 0; color: var(--hav-3); font-weight: 700; }
.vk-slutt { padding-top: 1.6rem; }
.vk-ikon { width: 110px; height: 110px; object-fit: contain; margin: -4.5rem auto .2rem; display: block; filter: drop-shadow(0 6px 12px rgba(0,0,0,.25)); animation: vk-hopp 1.6s ease-in-out infinite; }
@keyframes vk-hopp { 50% { transform: translateY(-8px); } }
.vk-finn { margin-top: 1rem; font: 800 1.25rem var(--font-tittel); padding: .8em 1.6em; min-height: 56px; }
.vk-kreditt { position: absolute; z-index: 2; left: 12px; right: 12px; bottom: 64px; text-align: center; font: 500 .68rem var(--font-mono); color: rgba(255,255,255,.75); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vk-bunn { position: absolute; z-index: 3; left: 0; right: 0; bottom: max(10px, env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: center; gap: 1.2rem; }
.vk-pil { width: 52px; height: 52px; border-radius: 50%; border: 0; background: var(--sol); color: var(--hav); font: 800 1.6rem/1 var(--font); cursor: pointer; box-shadow: 0 4px 0 #B9801A; display: grid; place-items: center; }
.vk-pil:active { transform: translateY(3px); box-shadow: 0 1px 0 #B9801A; }
.vk-prikker { display: flex; gap: .45rem; }
.vk-prikker i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.35); transition: all .25s; }
.vk-prikker i.aktiv { background: var(--sol); width: 26px; border-radius: 6px; }
@media (prefers-reduced-motion: reduce) { .vk-bilde, .vk-ikon, .vk-kort { animation: none; } }
`;
function leggTilCss() {
  if (document.getElementById('vk-css')) return;
  const s = document.createElement('style'); s.id = 'vk-css'; s.textContent = CSS; document.head.append(s);
}

/** Vis slideshowet. Returnerer et løfte som løses når det lukkes ("overnatting" eller "lukket"). */
export async function visVelkommen({ sted, ord = {}, telt = false, vedOvernatting } = {}) {
  if (!sted || apen) return;
  leggTilCss();
  const { VELKOMMEN = {}, BILDER = {} } = await hentData();
  const sider = lagSider(sted, ord, VELKOMMEN[sted.id], BILDER, telt);
  // last bildene på forhånd så overgangene blir myke
  sider.forEach((s) => { if (s.bilde) { const i = new Image(); i.src = s.bilde.u; } });

  return new Promise((ferdig) => {
    let n = 0;
    const bg = document.createElement('div');
    bg.className = 'vk-bakgrunn';
    bg.setAttribute('role', 'dialog'); bg.setAttribute('aria-modal', 'true'); bg.setAttribute('aria-label', `Velkommen til ${sted.navn}`);
    apen = bg;
    const lukk = (grunn) => {
      document.removeEventListener('keydown', tast); bg.classList.add('vk-ut');
      setTimeout(() => bg.remove(), 350); apen = null;
      if (grunn === 'overnatting') vedOvernatting?.();
      ferdig(grunn);
    };
    const tast = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); gaa(1); }
      else if (e.key === 'ArrowLeft') gaa(-1);
      else if (e.key === 'Escape') lukk('lukket');
    };
    const gaa = (d) => { const ny = n + d; if (ny < 0) return; if (ny >= sider.length) return lukk('overnatting'); n = ny; tegn(); };

    function tegn() {
      const s = sider[n]; const b = s.bilde;
      const kreditt = b ? `<a class="vk-kreditt" href="${esc(b.s)}" target="_blank" rel="noopener">📷 ${esc(b.tekst)} · Foto: ${esc(b.a || 'ukjent')} · ${esc(b.l || 'Wikimedia Commons')}</a>` : '';
      bg.innerHTML = `
        <div class="vk-scene ${b ? '' : 'vk-uten-bilde'}">
          ${b ? `<img class="vk-bilde" src="${esc(b.u)}" alt="${esc(b.tekst)}">` : `<div class="vk-luftpost"></div>`}
          <div class="vk-skygge"></div>
          <button class="vk-hopp" data-vk="hopp">${n === sider.length - 1 ? 'Lukk' : 'Hopp over'} ✕</button>
          <div class="vk-kort vk-${s.type}">${s.html}</div>
          ${kreditt}
          <div class="vk-bunn">
            <button class="vk-pil" data-vk="-1" aria-label="Forrige" ${n === 0 ? 'style="visibility:hidden"' : ''}>←</button>
            <div class="vk-prikker">${sider.map((_, k) => `<i class="${k === n ? 'aktiv' : ''}"></i>`).join('')}</div>
            <button class="vk-pil" data-vk="1" aria-label="Neste" ${n === sider.length - 1 ? 'style="visibility:hidden"' : ''}>→</button>
          </div>
        </div>`;
      const img = bg.querySelector('.vk-bilde');
      if (img) img.onerror = () => { img.replaceWith(Object.assign(document.createElement('div'), { className: 'vk-luftpost' })); bg.querySelector('.vk-kreditt')?.remove(); };
      bg.querySelectorAll('[data-vk]').forEach((k) => k.onclick = (e) => {
        e.stopPropagation(); const v = k.dataset.vk;
        if (v === 'hopp') lukk(n === sider.length - 1 ? 'lukket' : 'overnatting');
        else if (v === 'ferdig') lukk('overnatting');
        else gaa(Number(v));
      });
      (bg.querySelector('.vk-finn') || bg.querySelector('[data-vk="1"]'))?.focus({ preventScroll: true });
    }
    // sveip på nettbrett
    let x0 = null;
    bg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    bg.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) gaa(dx < 0 ? 1 : -1); });
    document.addEventListener('keydown', tast);
    document.body.append(bg); tegn();
  });
}

export const velkomstApen = () => !!apen;
