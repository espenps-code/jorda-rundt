// Across Australia – no phrase book dictation in this game (diktat: false in pakke.js).
// The engine still expects these names, so they are here as empty versions.
export const ORD = [];
export const SPRAK = {};
export const sprakFor = () => [];
export const harDiktat = () => false;
export function rettDiktat() { return { resultat: [], riktige: 0, antall: 0 }; }
