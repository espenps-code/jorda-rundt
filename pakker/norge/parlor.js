// Norge rundt – parlør-diktat. BRUKES IKKE (diktat er slått av i Norge rundt, se pakke.js), men fila må finnes for motoren.
// På de fleste steder skriver elevene parlørordene på NYNORSK,
// i Troms og Finnmark på NORDSAMISK. landId kan være et sted («55-tromso») eller et fylke («55»).
// Sammenligningen ignorerer store/små bokstaver, aksenter, mellomrom og tegnsetting.
// Mangler et godkjent svar som elevene har funnet? Læreren kan godkjenne manuelt.

export const ORD = [
  { id: 'hei', norsk: 'Hei' },
  { id: 'velkommen', norsk: 'Velkommen' },
  { id: 'takk', norsk: 'Takk' },
  { id: 'hvor', norsk: 'Hvor er …' },
  { id: 'heter', norsk: 'Jeg heter …' },
];

export const SPRAK = {
  nn: { navn: 'nynorsk', hei: ['hei', 'hallo', 'heisann'], velkommen: ['velkomen'], takk: ['takk', 'tusen takk'], hvor: ['kvar er'], heter: ['eg heiter', 'namnet mitt er'] },
  se: { navn: 'nordsamisk', hei: ['bures', 'buorre beaivi'], velkommen: ['bures boahtin'], takk: ['giitu'], hvor: ['gos lea'], heter: ['mu namma lea'] },
};

// Fylkesnummer → språk i diktaten
export const LAND_SPRAK = {
  '03': ['nn'], '11': ['nn'], '15': ['nn'], '18': ['nn'], '31': ['nn'], '32': ['nn'], '33': ['nn'], '34': ['nn'],
  '39': ['nn'], '40': ['nn'], '42': ['nn'], '46': ['nn'], '50': ['nn'], '55': ['se'], '56': ['se'],
};

// --- retting ---
const SPESIALTEGN = { 'æ': 'ae', 'ø': 'o', 'å': 'a', 'ð': 'd', 'þ': 'th', 'ß': 'ss', 'œ': 'oe', 'ł': 'l', 'đ': 'd', 'ı': 'i', 'ə': 'e', 'ŋ': 'n', 'ħ': 'h', 'ġ': 'g', 'ż': 'z' };
export function normaliser(tekst) {
  return String(tekst || '').toLowerCase()
    .replace(/[æøåðþßœłđıəŋħġż]/g, (c) => SPESIALTEGN[c])
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function sprakFor(landId) {
  // Europa rundt: landId kan være en by ("FR-nice") – da gjelder språket i landet
  const kode = LAND_SPRAK[landId] ? landId : String(landId || '').split('-')[0];
  return (LAND_SPRAK[kode] || ['en']).filter((k) => SPRAK[k]);
}

/** Retter ett svar. Godtar også at elevene skriver et navn/sted bak (f.eks. «My name is Ola»). */
export function rettOrd(landId, ordId, svar) {
  const s = normaliser(svar);
  if (!s) return false;
  for (const k of sprakFor(landId)) {
    for (const v of SPRAK[k][ordId] || []) {
      const n = normaliser(v);
      if (!n) continue;
      if (s === n) return true;
      if ((ordId === 'hvor' || ordId === 'heter') && n.length >= 4 && (s.startsWith(n) || s.endsWith(n))) return true;
    }
  }
  return false;
}

export function rettDiktat(landId, svar = []) {
  const resultat = ORD.map((o, i) => rettOrd(landId, o.id, svar[i]));
  return { resultat, riktige: resultat.filter(Boolean).length, antall: ORD.length };
}
