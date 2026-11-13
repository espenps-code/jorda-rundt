// Solsystemet rundt – kartet over solsystemet. Brukes av elevsiden og tavla.
// Vanligvis en 3D-modell (klode3d.js). Kan ikke 3D starte (gammel nettleser, 3D slått av, biblioteket ble ikke lastet),
// brukes det flate kartet (klode2d.js) i stedet – spillet virker like godt med det.
// Legg ?flatt i adressen for å tvinge fram det flate kartet.
export async function lagKlode(el, valg = {}) {
  if (!new URLSearchParams(location.search).has('flatt')) {
    try {
      const { lagKlode3d } = await import('./klode3d.js');
      return await lagKlode3d(el, valg);
    } catch (e) { console.warn('3D-kartet kunne ikke starte – bruker det flate kartet.', e); }
  }
  const { lagKlode2d } = await import('./klode2d.js');
  return lagKlode2d(el, valg);
}
