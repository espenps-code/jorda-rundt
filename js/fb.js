// MOTOREN – kobling til Firebase (samme prosjekt for alle spillpakkene). Legg til ?emulator i adressen for å teste lokalt.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut, connectAuthEmulator, signInWithCredential,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
  getDatabase, ref, get, set, update, push, remove, onValue, onChildAdded, onChildChanged, off,
  runTransaction, serverTimestamp, connectDatabaseEmulator, query, orderByChild, limitToLast,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';
import { firebaseConfig } from '../firebase-config.js';
import { PAKKE } from '#pakke/pakke.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const brukerEmulator = new URLSearchParams(location.search).has('emulator');
if (brukerEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectDatabaseEmulator(db, '127.0.0.1', 9000);
}

export function loggInnLaerer() { return signInWithPopup(auth, new GoogleAuthProvider()); }
// Bare for testing mot emulator: logg inn som en falsk Google-lærer
export function testLoggInnLaerer() { return signInWithCredential(auth, GoogleAuthProvider.credential('{"sub":"testlaerer","email":"laerer@test.no","email_verified":true}')); }
// Lærer med vanlig e-post og passord (f.eks. jobbmailen)
export function loggInnEpost(epost, passord) { return signInWithEmailAndPassword(auth, epost.trim(), passord); }
export async function lagEpostkonto(navn, epost, passord) {
  const k = await createUserWithEmailAndPassword(auth, epost.trim(), passord);
  if (navn) { await updateProfile(k.user, { displayName: navn.trim() }); await k.user.getIdToken(true); }
  return k;
}
export function nyttPassord(epost) { auth.languageCode = PAKKE.sprak || 'no'; return sendPasswordResetEmail(auth, epost.trim()); }
export function loggInnElev() { return signInAnonymously(auth); }
export function loggUt() { return signOut(auth); }
export function vedInnlogging(cb) { return onAuthStateChanged(auth, cb); }

// Hver spillpakke har sin egen «rot» i databasen (Jorda rundt: øverst, Europa rundt: /europa …),
// så spillene aldri blandes. Se pakker/<spill>/pakke.js.
export const ROT = PAKKE.rot || '';
export const r = (sti) => ref(db, ROT ? `${ROT}/${String(sti || '').replace(/^\/+/, '')}`.replace(/\/$/, '') : sti);
export {
  ref, get, set, update, push, remove, onValue, onChildAdded, onChildChanged, off,
  runTransaction, serverTimestamp, query, orderByChild, limitToLast,
};
