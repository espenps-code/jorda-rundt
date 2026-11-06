// Europa rundt – lager database-reglene for Europa ut fra reglene til Jorda rundt.
// Europa lagrer alt under /europa, så reglene er en kopi der root.child('x') blir root.child('europa').child('x').
// Kjør dette hver gang database.rules.json endres:   node europa/lag-regler.mjs   (fra JordaRundt-mappa)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fil = join(dirname(fileURLToPath(import.meta.url)), '..', 'database.rules.json');
const alt = JSON.parse(readFileSync(fil, 'utf8'));
const { europa: _gammel, ...jorda } = alt.rules;
const blokk = Object.fromEntries(Object.entries(jorda).filter(([k]) => !k.startsWith('.')));
const tekst = JSON.stringify(blokk).replace(/root\.child\('/g, "root.child('europa').child('");
alt.rules = { ...jorda, europa: JSON.parse(tekst) };
writeFileSync(fil, JSON.stringify(alt, null, 2) + '\n');
console.log('Europa-reglene er oppdatert i database.rules.json.');
