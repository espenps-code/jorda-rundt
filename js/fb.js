// Jorda rundt – kobling til Firebase. Legg til ?emulator i adressen for å teste lokalt.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut, connectAuthEmulator, signInWithCredential,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
  getDatabase, ref, get, set, update, push, remove, onValue, onChildAdded, onChildChanged, off,
  runTransaction, serverTimestamp, connectDatabaseEmulator, query, orderByChild, limitToLast,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';
import { firebaseConfig } from '../firebase-config.js';

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
export function loggInnElev() { return signInAnonymously(auth); }
export function loggUt() { return signOut(auth); }
export function vedInnlogging(cb) { return onAuthStateChanged(auth, cb); }

export const r = (sti) => ref(db, sti);
export {
  ref, get, set, update, push, remove, onValue, onChildAdded, onChildChanged, off,
  runTransaction, serverTimestamp, query, orderByChild, limitToLast,
};
