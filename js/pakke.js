// MOTOREN – velger spillpakke. Må lastes som VANLIG script (ikke module) i <head>, før alle module-script:
//   <script src="js/pakke.js"></script>
// Spillet velges med ?pakke=europa i adressen, eller med data-pakke="europa" på <html>-taggen.
// Uten noe av dette blir det Jorda rundt («verden»). Scriptet lager et «import map», slik at
// «#pakke/…» peker på riktig mappe under pakker/, og «#motor/…» på js/.
(function () {
  var param = new URLSearchParams(location.search).get('pakke');
  var valgt = param || document.documentElement.getAttribute('data-pakke') || 'verden';
  if (!/^[a-z]{2,20}$/.test(valgt)) valgt = 'verden';
  var rot = document.currentScript.src.replace(/js\/pakke\.js(\?.*)?$/, '');
  window.SPILLPAKKE = valgt;
  // Spillpakker på andre språk enn norsk: siden holdes skjult et øyeblikk til teksten er oversatt (js/sprak.js),
  // så elevene ikke ser norsk tekst blinke forbi. Ny pakke på et annet språk? Legg den til her.
  var SPRAK = { usa: 'en', uk: 'en', australia: 'en' };
  if (SPRAK[valgt] && !document.documentElement.hasAttribute('data-oversatt')) {   // data-oversatt = siden er allerede skrevet på språket (forside, reiselogg)
    document.documentElement.lang = SPRAK[valgt];
    document.documentElement.classList.add('sprak-venter');
    document.write('<style>html.sprak-venter body{visibility:hidden}</style>');
    setTimeout(function () { document.documentElement.classList.remove('sprak-venter'); }, 4000);
  }
  window.SPILLROT = rot;
  /** Lag en lenke til en annen side i spillet, med samme spillpakke: pakkeLenke('tavle.html?spill=x') */
  window.pakkeLenke = function (sti) {
    if (valgt === 'verden') return rot + sti;
    var u = new URL(sti, rot);
    if (!u.searchParams.has('pakke')) u.searchParams.set('pakke', valgt);
    return u.href;
  };
  var kart = { imports: { '#pakke/': rot + 'pakker/' + valgt + '/', '#motor/': rot + 'js/' } };
  document.write('<script type="importmap">' + JSON.stringify(kart) + '<\/script>');
})();
