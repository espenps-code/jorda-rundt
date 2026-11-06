// Jorda rundt – felles innloggingsboks for lærere (lærerside, tavle og rapporter).
// Google eller vanlig e-post + passord (f.eks. jobbmailen).
import { loggInnLaerer, testLoggInnLaerer, loggInnEpost, lagEpostkonto, nyttPassord, brukerEmulator } from './fb.js';

const FEIL = {
  'auth/invalid-email': 'E-postadressen ser ikke riktig ut.',
  'auth/missing-email': 'Skriv inn e-postadressen din.',
  'auth/missing-password': 'Skriv inn passordet.',
  'auth/invalid-credential': 'Feil e-post eller passord.',
  'auth/wrong-password': 'Feil e-post eller passord.',
  'auth/user-not-found': 'Fant ingen konto med den e-postadressen. Vil du lage en?',
  'auth/email-already-in-use': 'Det finnes allerede en konto med denne e-postadressen. Logg inn i stedet.',
  'auth/weak-password': 'Passordet må ha minst 6 tegn.',
  'auth/too-many-requests': 'For mange forsøk. Vent litt og prøv igjen.',
  'auth/popup-closed-by-user': 'Innloggingsvinduet ble lukket.',
  'auth/popup-blocked': 'Nettleseren blokkerte innloggingsvinduet. Tillat sprettoppvinduer og prøv igjen.',
  'auth/operation-not-allowed': 'E-postinnlogging er ikke slått på ennå.',
  'auth/network-request-failed': 'Fikk ikke kontakt med nettet. Sjekk tilkoblingen.',
};
const feiltekst = (e) => FEIL[e?.code] || 'Noe gikk galt: ' + (e?.message || e);

const CSS = `
.li-kort { background: #fff; color: #13283F; border-radius: 18px; padding: 22px 22px 18px; max-width: 380px; margin: 0 auto; text-align: left;
  box-shadow: 0 1px 2px rgba(12,35,64,.08), 0 10px 30px rgba(12,35,64,.18); font-family: var(--font, system-ui); }
.li-kort .knapp { width: 100%; justify-content: center; }
.li-google { display: flex; align-items: center; gap: 10px; }
.li-google svg { width: 20px; height: 20px; }
.li-skille { display: flex; align-items: center; gap: 10px; color: #4F5B6B; font-size: .85rem; margin: 16px 0 12px; }
.li-skille::before, .li-skille::after { content: ''; flex: 1; border-top: 1px solid #D9CDB2; }
.li-kort label { display: block; font-weight: 700; font-size: .85rem; margin: 10px 0 4px; color: #13283F; }
.li-kort input { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 2px solid #D9CDB2; border-radius: 10px; font: inherit; background: #FDFBF6; color: #13283F; }
.li-kort input:focus { outline: none; border-color: #1D5B8F; }
.li-kort .li-send { margin-top: 14px; }
.li-lenker { display: flex; justify-content: space-between; gap: 8px; margin-top: 12px; font-size: .88rem; flex-wrap: wrap; }
.li-lenker button { background: none; border: 0; padding: 0; color: #1D5B8F; font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.li-melding { margin: 10px 0 0; font-size: .88rem; padding: 8px 10px; border-radius: 8px; }
.li-melding.feil { background: #FBE3E0; color: #8E2019; }
.li-melding.ok { background: #DDF0E4; color: #1E4F34; }
.li-melding:empty { display: none; }
.li-tittel { font-family: var(--font-tittel, system-ui); font-weight: 800; font-size: 1.15rem; margin: 0 0 4px; color: #0C2340; }
.li-hjelp { font-size: .85rem; color: #4F5B6B; margin: 0 0 6px; }
`;

const GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

/** Tegner innloggingsboksen i et element. */
export function monterInnlogging(el) {
  if (!document.getElementById('li-css')) { const st = document.createElement('style'); st.id = 'li-css'; st.textContent = CSS; document.head.append(st); }
  let modus = 'inn'; // inn | ny | glemt
  const tegn = (melding = '', type = 'feil') => {
    const epost = el.querySelector('[name=epost]')?.value || '';
    el.innerHTML = `<div class="li-kort">
      ${modus === 'inn' ? `
        <button type="button" class="knapp lys li-google" data-google>${GOOGLE} Logg inn med Google</button>
        ${brukerEmulator ? '<button type="button" class="knapp lys mini" data-test style="margin-top:8px">Testinnlogging (emulator)</button>' : ''}
        <div class="li-skille">eller med e-post</div>` : ''}
      ${modus === 'ny' ? '<p class="li-tittel">Lag lærerkonto</p><p class="li-hjelp">Bruk gjerne jobbmailen. Elevene trenger ingen konto.</p>' : ''}
      ${modus === 'glemt' ? '<p class="li-tittel">Glemt passord?</p><p class="li-hjelp">Vi sender deg en lenke for å lage nytt passord.</p>' : ''}
      <form novalidate>
        ${modus === 'ny' ? '<label for="li-navn">Navn</label><input id="li-navn" name="navn" autocomplete="name" placeholder="F.eks. Kari Lærer">' : ''}
        <label for="li-epost">E-post</label><input id="li-epost" name="epost" type="email" autocomplete="email" placeholder="navn@skole.no" value="${epost.replace(/"/g, '&quot;')}">
        ${modus !== 'glemt' ? `<label for="li-passord">Passord</label><input id="li-passord" name="passord" type="password" autocomplete="${modus === 'ny' ? 'new-password' : 'current-password'}" ${modus === 'ny' ? 'placeholder="Minst 6 tegn"' : ''}>` : ''}
        <button class="knapp sol li-send">${modus === 'inn' ? 'Logg inn' : modus === 'ny' ? 'Lag konto og logg inn' : 'Send lenke'}</button>
      </form>
      <p class="li-melding ${type}">${melding}</p>
      <div class="li-lenker">
        ${modus === 'inn' ? '<button type="button" data-modus="ny">Lag ny konto</button><button type="button" data-modus="glemt">Glemt passord?</button>' : '<button type="button" data-modus="inn">← Tilbake til innlogging</button>'}
      </div>
    </div>`;
    const vis = (t, ty = 'feil') => { const m = el.querySelector('.li-melding'); m.className = 'li-melding ' + ty; m.textContent = t; };
    el.querySelector('[data-google]')?.addEventListener('click', () => loggInnLaerer().catch((e) => vis(feiltekst(e))));
    el.querySelector('[data-test]')?.addEventListener('click', () => testLoggInnLaerer());
    el.querySelectorAll('[data-modus]').forEach((b) => b.addEventListener('click', () => { modus = b.dataset.modus; tegn(); el.querySelector('input')?.focus(); }));
    el.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target)); const knapp = el.querySelector('.li-send'); knapp.disabled = true;
      try {
        if (modus === 'inn') await loggInnEpost(f.epost, f.passord);
        else if (modus === 'ny') {
          if (!f.navn?.trim()) throw { code: 'mangler-navn', message: 'Skriv inn navnet ditt.' };
          await lagEpostkonto(f.navn, f.epost, f.passord);
        } else { await nyttPassord(f.epost); modus = 'inn'; tegn('Sjekk innboksen (og søppelpost). Lenken for nytt passord er sendt.', 'ok'); return; }
      } catch (err) { vis(err.code === 'mangler-navn' ? err.message : feiltekst(err)); knapp.disabled = false; }
    });
  };
  tegn();
}
