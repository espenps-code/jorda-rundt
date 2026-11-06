// Lager databasereglene for alle spillpakker som har en egen «rot» i databasen (Europa rundt: /europa …).
// Reglene til Jorda rundt (øverst i database.rules.json) er malen; de andre spillene får en kopi der
// root.child('x') blir root.child('<rot>').child('x').
// Kjør dette hver gang database.rules.json endres eller en ny spillpakke legges til:
//   node verktoy/lag-regler.mjs        (fra JordaRundt-mappa)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fil = join(rot, 'database.rules.json');
const alt = JSON.parse(readFileSync(fil, 'utf8'));

const pakker = readdirSync(join(rot, 'pakker')).filter((p) => existsSync(join(rot, 'pakker', p, 'pakke.js')));
const rotter = [];
for (const p of pakker) {
  const { PAKKE } = await import(pathToFileURL(join(rot, 'pakker', p, 'pakke.js')).href);
  if (PAKKE.rot) rotter.push(PAKKE.rot);
}
// malen = alt som ikke er en spillpakke-rot
const mal = Object.fromEntries(Object.entries(alt.rules).filter(([k]) => !rotter.includes(k)));
const blokk = Object.fromEntries(Object.entries(mal).filter(([k]) => !k.startsWith('.')));
alt.rules = { ...mal };
for (const r of rotter) {
  const tekst = JSON.stringify(blokk).replace(/root\.child\('/g, `root.child('${r}').child('`);
  alt.rules[r] = JSON.parse(tekst);
}
writeFileSync(fil, JSON.stringify(alt, null, 2) + '\n');
console.log(`Databasereglene er oppdatert for: ${rotter.join(', ') || '(ingen ekstra spill)'}`);
