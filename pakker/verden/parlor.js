// Europa rundt / Jorda rundt – parlør. landId kan være et land («FR») eller et sted i et land («FR-nice»).
// For hvert språk: godkjente svar for de fem parlørordene, skrevet med våre bokstaver.
// Sammenligningen ignorerer store/små bokstaver, aksenter, mellomrom og tegnsetting
// (så «¿Dónde está?» = «donde esta» = «dondeesta»).
// Mangler et godkjent svar som elevene har funnet? Læreren kan godkjenne manuelt.

export const ORD = [
  { id: 'hei', norsk: 'Hei' },
  { id: 'velkommen', norsk: 'Velkommen' },
  { id: 'takk', norsk: 'Takk' },
  { id: 'hvor', norsk: 'Hvor er …' },
  { id: 'heter', norsk: 'Jeg heter …' },
];

export const SPRAK = {
  no: { navn: 'norsk', hei: ['hei', 'hallo', 'heisann'], velkommen: ['velkommen'], takk: ['takk', 'tusen takk'], hvor: ['hvor er'], heter: ['jeg heter', 'mitt navn er'] },
  en: { navn: 'engelsk', hei: ['hello', 'hi', 'hey', 'good morning'], velkommen: ['welcome'], takk: ['thank you', 'thanks', 'thank you very much', 'thanks a lot'], hvor: ['where is', 'wheres', 'where are'], heter: ['my name is', 'i am', 'im', 'i am called', 'my names'] },
  fr: { navn: 'fransk', hei: ['bonjour', 'salut', 'coucou', 'bonsoir'], velkommen: ['bienvenue'], takk: ['merci', 'merci beaucoup'], hvor: ['ou est', 'ou se trouve', 'ou sont', 'ou'], heter: ['je mappelle', 'je suis', 'mon nom est'] },
  es: { navn: 'spansk', hei: ['hola', 'buenos dias', 'buenas'], velkommen: ['bienvenido', 'bienvenida', 'bienvenidos', 'bienvenidas'], takk: ['gracias', 'muchas gracias'], hvor: ['donde esta', 'donde estan', 'donde queda', 'donde'], heter: ['me llamo', 'mi nombre es', 'soy', 'yo me llamo'] },
  pt: { navn: 'portugisisk', hei: ['ola', 'oi', 'bom dia'], velkommen: ['bem vindo', 'bem vinda', 'bem vindos', 'bem vindas', 'benvindo'], takk: ['obrigado', 'obrigada', 'muito obrigado', 'muito obrigada'], hvor: ['onde esta', 'onde fica', 'onde e', 'onde'], heter: ['meu nome e', 'eu me chamo', 'me chamo', 'chamo me', 'eu sou', 'o meu nome e'] },
  de: { navn: 'tysk', hei: ['hallo', 'guten tag', 'servus', 'gruezi', 'gruss gott', 'moin'], velkommen: ['willkommen', 'herzlich willkommen'], takk: ['danke', 'danke schon', 'danke schoen', 'vielen dank'], hvor: ['wo ist', 'wo sind', 'wo'], heter: ['ich heisse', 'mein name ist', 'ich bin'] },
  nl: { navn: 'nederlandsk', hei: ['hallo', 'hoi', 'goedendag', 'dag'], velkommen: ['welkom'], takk: ['dank je', 'dank u', 'bedankt', 'dank je wel', 'dank u wel'], hvor: ['waar is', 'waar'], heter: ['ik heet', 'mijn naam is', 'ik ben'] },
  it: { navn: 'italiensk', hei: ['ciao', 'buongiorno', 'salve'], velkommen: ['benvenuto', 'benvenuta', 'benvenuti', 'benvenute'], takk: ['grazie', 'grazie mille'], hvor: ['dove', 'dove e', 'dove si trova', 'dovè'], heter: ['mi chiamo', 'il mio nome e', 'sono', 'io mi chiamo'] },
  sv: { navn: 'svensk', hei: ['hej', 'halla', 'tjena'], velkommen: ['valkommen'], takk: ['tack', 'tack sa mycket', 'tusen tack'], hvor: ['var ar', 'var finns', 'vart ar'], heter: ['jag heter', 'mitt namn ar'] },
  da: { navn: 'dansk', hei: ['hej', 'goddag', 'hallo'], velkommen: ['velkommen'], takk: ['tak', 'mange tak', 'tusind tak'], hvor: ['hvor er'], heter: ['jeg hedder', 'mit navn er'] },
  is: { navn: 'islandsk', hei: ['hallo', 'hae', 'godan dag', 'godan daginn', 'saell', 'sael'], velkommen: ['velkomin', 'velkominn', 'velkomnir'], takk: ['takk', 'takk fyrir', 'takk fyrir mig'], hvor: ['hvar er'], heter: ['eg heiti', 'nafnid mitt er'] },
  fi: { navn: 'finsk', hei: ['hei', 'moi', 'terve', 'paivaa', 'huomenta'], velkommen: ['tervetuloa'], takk: ['kiitos', 'kiitos paljon'], hvor: ['missa on', 'missa'], heter: ['nimeni on', 'mina olen', 'olen', 'minun nimeni on'] },
  et: { navn: 'estisk', hei: ['tere', 'tervist', 'hei'], velkommen: ['tere tulemast'], takk: ['aitah', 'tanan', 'suur aitah'], hvor: ['kus on', 'kus'], heter: ['minu nimi on', 'mina olen', 'ma olen'] },
  lv: { navn: 'latvisk', hei: ['sveiki', 'labdien', 'cau', 'sveiks'], velkommen: ['laipni ludzam', 'laipni ludzu'], takk: ['paldies', 'liels paldies'], hvor: ['kur ir', 'kur'], heter: ['mani sauc', 'mans vards ir', 'es esmu'] },
  lt: { navn: 'litauisk', hei: ['labas', 'sveiki', 'laba diena'], velkommen: ['sveiki atvyke', 'sveiki atvykę', 'sveikas atvykes'], takk: ['aciu', 'labai aciu'], hvor: ['kur yra', 'kur'], heter: ['mano vardas', 'mano vardas yra', 'as esu', 'mane vadina'] },
  pl: { navn: 'polsk', hei: ['czesc', 'dzien dobry', 'witam'], velkommen: ['witamy', 'witaj', 'witajcie', 'zapraszamy'], takk: ['dziekuje', 'dzieki', 'dziekuje bardzo'], hvor: ['gdzie jest', 'gdzie'], heter: ['nazywam sie', 'mam na imie', 'jestem'] },
  cs: { navn: 'tsjekkisk', hei: ['ahoj', 'dobry den', 'cau'], velkommen: ['vitejte', 'vitame vas', 'vitej'], takk: ['dekuji', 'diky', 'dekuju'], hvor: ['kde je', 'kde'], heter: ['jmenuji se', 'jmenuju se', 'jsem'] },
  sk: { navn: 'slovakisk', hei: ['ahoj', 'dobry den', 'cau'], velkommen: ['vitajte', 'vitaj'], takk: ['dakujem', 'vdaka', 'dakujem pekne'], hvor: ['kde je', 'kde'], heter: ['volam sa', 'som', 'moje meno je'] },
  hu: { navn: 'ungarsk', hei: ['szia', 'sziasztok', 'szervusz', 'jo napot', 'hello'], velkommen: ['udvozoljuk', 'isten hozott', 'udvozollek', 'udv'], takk: ['koszonom', 'koszi', 'koszonom szepen'], hvor: ['hol van', 'hol'], heter: ['a nevem', 'nevem', 'vagyok', 'en vagyok'] },
  ro: { navn: 'rumensk', hei: ['buna', 'salut', 'buna ziua'], velkommen: ['bine ai venit', 'bine ati venit', 'bun venit'], takk: ['multumesc', 'mersi', 'multumesc frumos'], hvor: ['unde este', 'unde e', 'unde'], heter: ['ma numesc', 'numele meu este', 'sunt', 'eu sunt'] },
  sl: { navn: 'slovensk', hei: ['zivjo', 'zdravo', 'dober dan', 'oj'], velkommen: ['dobrodosli', 'dobrodosel', 'dobrodosla'], takk: ['hvala', 'hvala lepa'], hvor: ['kje je', 'kje'], heter: ['ime mi je', 'jaz sem', 'sem', 'moje ime je'] },
  bcs: { navn: 'kroatisk/serbisk/bosnisk', hei: ['bok', 'zdravo', 'dobar dan', 'cao', 'pozdrav', 'dobro jutro'], velkommen: ['dobrodosli', 'dobrodosao', 'dobrodosla'], takk: ['hvala', 'hvala lijepa', 'hvala lepo', 'fala'], hvor: ['gdje je', 'gde je', 'gdje', 'gde'], heter: ['zovem se', 'ja sam', 'moje ime je', 'ja se zovem'] },
  mk: { navn: 'makedonsk', hei: ['zdravo', 'dobar den'], velkommen: ['dobredojdovte', 'dobredojde', 'dobredojde'], takk: ['blagodaram', 'fala'], hvor: ['kade e', 'kade'], heter: ['jas se vikam', 'se vikam', 'jas sum', 'moeto ime e'] },
  bg: { navn: 'bulgarsk', hei: ['zdravei', 'zdraveite', 'zdravey', 'zdraveyte', 'zdrasti', 'dobar den', 'dobur den'], velkommen: ['dobre doshli', 'dobre doshal', 'dobre doshla'], takk: ['blagodarya', 'blagodaria', 'mersi'], hvor: ['kade e', 'kade', 'kude e', 'kude'], heter: ['kazvam se', 'az sam', 'az sum', 'imeto mi e'] },
  sq: { navn: 'albansk', hei: ['pershendetje', 'tungjatjeta', 'tung', 'ckemi', 'mirdita', 'mire dita'], velkommen: ['mire se vini', 'mire se erdhe', 'mire se erdhet', 'miresevini', 'mireseerdhe', 'mireseerdhet'], takk: ['faleminderit', 'flm', 'rrofsh'], hvor: ['ku eshte', 'ku'], heter: ['une quhem', 'quhem', 'emri im eshte', 'jam', 'une jam'] },
  el: { navn: 'gresk', hei: ['geia sou', 'geia sas', 'geia', 'yia sou', 'yia sas', 'yassou', 'yasou', 'kalimera', 'yassas', 'gia sou', 'gia sas'], velkommen: ['kalos irthate', 'kalos ilthate', 'kalosorisma', 'kalos orisate', 'kalos irthes', 'kalos ilthes'], takk: ['efcharisto', 'efharisto', 'efkharisto', 'efxaristo', 'efcharisto poli', 'efharisto poli'], hvor: ['pou einai', 'pou ine', 'pou inai', 'pou'], heter: ['me lene', 'to onoma mou einai', 'to onoma mou ine', 'onomazomai', 'eimai', 'ime'] },
  tr: { navn: 'tyrkisk', hei: ['merhaba', 'selam', 'gunaydin'], velkommen: ['hos geldiniz', 'hos geldin', 'hosgeldiniz', 'hosgeldin'], takk: ['tesekkur ederim', 'tesekkurler', 'sagol', 'sag ol', 'sagolun'], hvor: ['nerede', 'nerde', 'nerededir', 'nerede'], heter: ['benim adim', 'adim', 'ben', 'benim ismim', 'ismim'] },
  mt: { navn: 'maltesisk', hei: ['bongu', 'merhba', 'awwa', 'hello', 'ciao'], velkommen: ['merhba', 'merhba bik', 'merhba bikom'], takk: ['grazzi', 'grazzi hafna'], hvor: ['fejn hu', 'fejn hi', 'fejn'], heter: ['jien jisimni', 'jisimni', 'jien'] },
  ga: { navn: 'irsk', hei: ['dia duit', 'dia dhuit', 'dia daoibh'], velkommen: ['failte', 'cead mile failte'], takk: ['go raibh maith agat', 'go raibh maith agaibh'], hvor: ['ca bhfuil'], heter: ['is mise', 'mise'] },
  lb: { navn: 'luxemburgsk', hei: ['moien', 'gudde moien', 'hallo', 'salut'], velkommen: ['wellkomm', 'wellkommen', 'wëllkomm'], takk: ['merci', 'villmools merci', 'merci villmools'], hvor: ['wou ass', 'wou'], heter: ['ech heeschen', 'mäi numm ass', 'mai numm ass', 'ech sinn'] },
  ca: { navn: 'katalansk', hei: ['hola', 'bon dia', 'bones'], velkommen: ['benvingut', 'benvinguda', 'benvinguts', 'benvingudes'], takk: ['gracies', 'moltes gracies', 'merci'], hvor: ['on es', 'on esta', 'on'], heter: ['em dic', 'soc', 'el meu nom es', 'jo em dic'] },
  ru: { navn: 'russisk', hei: ['privet', 'zdravstvuyte', 'zdravstvuite', 'zdravstvujte', 'zdrastvuyte', 'zdrastvuite', 'dobryy den', 'dobryi den', 'dobrij den', 'dobry den'], velkommen: ['dobro pozhalovat', 'dobro pozalovat', 'dobro pojalovat'], takk: ['spasibo', 'spasiba', 'bolshoe spasibo'], hvor: ['gde', 'gde nakhoditsya', 'gde nahoditsya', 'gde nahoditsa'], heter: ['menya zovut', 'menja zovut', 'mene zovut', 'ya', 'moye imya', 'moe imya'] },
  ka: { navn: 'georgisk', hei: ['gamarjoba', 'gaumarjos', 'salami'], velkommen: ['keteli iqos tqveni mobrdzaneba', 'mogesalmebit', 'keteli iyos tkveni mobrdzaneba', 'keteli iqos'], takk: ['madloba', 'gmadlobt', 'didi madloba'], hvor: ['sad aris', 'sad', 'sada'], heter: ['me mkvia', 'chemi saxelia', 'chemi sakhelia', 'me var'] },
  hy: { navn: 'armensk', hei: ['barev', 'barev dzez', 'barev dzes', 'vonc es', 'vonts es'], velkommen: ['bari galust', 'bari ekar'], takk: ['shnorhakalutyun', 'shnorhakalutyun', 'shnorhakal em', 'merci', 'mersi'], hvor: ['vortegh e', 'ur e', 'vortex e', 'ur'], heter: ['im anuny', 'im anune', 'anuns', 'yes'] },
  az: { navn: 'aserbajdsjansk', hei: ['salam', 'salam aleykum'], velkommen: ['xos gelmisiniz', 'xos gelmisen', 'hos gelmisiniz', 'khosh gelmisiniz'], takk: ['tesekkur edirem', 'sag ol', 'sagol', 'chox sagol', 'cox sag ol'], hvor: ['haradadir', 'harada', 'hardadir', 'harda'], heter: ['menim adim', 'adim', 'men', 'menim adim'] },
  kk: { navn: 'kasakhisk', hei: ['salem', 'salemetsiz be', 'salemetsiz', 'salam'], velkommen: ['qosh keldiniz', 'kosh keldiniz', 'kosh keldingiz', 'qosh keldingiz'], takk: ['rakhmet', 'rahmet', 'raqmet', 'kop rakhmet', 'kop rahmet'], hvor: ['qayda', 'kayda', 'qaida', 'kaida'], heter: ['menin atym', 'menin esimim', 'atym', 'esimim', 'men'] },
  uz: { navn: 'usbekisk', hei: ['salom', 'assalomu alaykum', 'assalomu aleykum'], velkommen: ['xush kelibsiz', 'hush kelibsiz', 'khush kelibsiz'], takk: ['rahmat', 'rakhmat', 'katta rahmat'], hvor: ['qayerda', 'qaerda', 'kayerda', 'qani'], heter: ['mening ismim', 'ismim', 'men', 'mening otim'] },
  ky: { navn: 'kirgisisk', hei: ['salam', 'salamatsyzby', 'salamatsizbi'], velkommen: ['kosh keldiniz', 'kosh keldingiz', 'qosh keldiniz'], takk: ['rakhmat', 'rahmat', 'chong rahmat'], hvor: ['kayda', 'qayda'], heter: ['menin atym', 'atym', 'men'] },
  tg: { navn: 'tadsjikisk', hei: ['salom', 'assalomu alaykum', 'salom aleykum'], velkommen: ['khush omaded', 'hush omaded', 'xush omaded'], takk: ['rahmat', 'rakhmat', 'tashakkur', 'katta rahmat'], hvor: ['kujo', 'kuja', 'dar kujo'], heter: ['nomi man', 'man', 'nomam'] },
  tk: { navn: 'turkmensk', hei: ['salam', 'salam aleykum'], velkommen: ['hos geldiniz', 'hos geldin', 'hosh geldiniz'], takk: ['sag bol', 'sagbol', 'sag bolun', 'tagzym'], hvor: ['nirede', 'nire'], heter: ['menin adym', 'adym', 'men'] },
  mn: { navn: 'mongolsk', hei: ['sain baina uu', 'sain bainuu', 'sain uu', 'sainuu', 'sain baina'], velkommen: ['tavtai morilno uu', 'tavtai moril', 'tavtai morilogtun'], takk: ['bayarlalaa', 'bayarlala'], hvor: ['khaana baina', 'haana baina', 'khaana', 'haana', 'haan'], heter: ['minii ner', 'minii neriig', 'namaig', 'bi'] },
  zh: { navn: 'kinesisk (mandarin)', hei: ['ni hao', 'nin hao', 'nihao'], velkommen: ['huanying', 'huan ying', 'huanying guanglin'], takk: ['xiexie', 'xie xie', 'xiexie ni', 'duoxie'], hvor: ['zai nali', 'zai nar', 'zai nar', 'zai na', 'nali', 'zainali'], heter: ['wo jiao', 'wo de mingzi shi', 'wo shi', 'wo de mingzi jiao'] },
  ja: { navn: 'japansk', hei: ['konnichiwa', 'konichiwa', 'konnichi wa', 'konnitiwa', 'ohayo', 'ohayou'], velkommen: ['yokoso', 'youkoso', 'yookoso', 'irasshaimase', 'irasshai'], takk: ['arigato', 'arigatou', 'arigatou gozaimasu', 'arigato gozaimasu', 'domo arigato', 'doumo arigatou', 'domo'], hvor: ['doko desu ka', 'wa doko desu ka', 'doko', 'doko desuka', 'wa doko'], heter: ['watashi wa', 'watashi no namae wa', 'boku wa', 'to moushimasu', 'to mooshimasu', 'desu', 'watashi wa desu', 'watashi no namae wa desu'] },
  ko: { navn: 'koreansk', hei: ['annyeonghaseyo', 'annyeong haseyo', 'anyeonghaseyo', 'annyeong', 'anyong haseyo', 'annyonghaseyo'], velkommen: ['hwanyeonghamnida', 'hwanyeong hamnida', 'eoseo oseyo', 'oseo oseyo', 'hwanyeonghaeyo'], takk: ['gamsahamnida', 'kamsahamnida', 'gamsahabnida', 'gomawoyo', 'gomapseumnida', 'kamsahabnida'], hvor: ['eodi isseoyo', 'eodiyeyo', 'odi isseoyo', 'eodi', 'odi', 'eodie isseoyo', 'eodi itseoyo'], heter: ['je ireumeun', 'jeoneun', 'naneun', 'je ireumeun imnida', 'jeo neun', 'je ireum eun'] },
  th: { navn: 'thai', hei: ['sawasdee', 'sawatdee', 'sawadee', 'sawatdi', 'sawasdee krap', 'sawasdee ka', 'sawatdee khrap', 'sawatdee kha', 'sawadee krap', 'sawadee ka'], velkommen: ['yindee tonrap', 'yin dee ton rap', 'yindee tonrab', 'yin dee ton rub', 'yindee tonrub'], takk: ['khop khun', 'kob kun', 'khob khun', 'khop khun krap', 'khop khun ka', 'kob kun krap', 'kob kun ka', 'khopkhun', 'kobkun'], hvor: ['yu thi nai', 'yoo tee nai', 'yu tee nai', 'tee nai', 'thi nai', 'yoo thee nai'], heter: ['chan chue', 'phom chue', 'pom chue', 'chan cheu', 'phom cheu', 'pom cheu', 'chan chew', 'pom chew'] },
  vi: { navn: 'vietnamesisk', hei: ['xin chao', 'chao', 'chao ban'], velkommen: ['chao mung', 'hoan nghenh'], takk: ['cam on', 'cam on ban', 'cam on nhieu'], hvor: ['o dau', 'dau'], heter: ['toi ten la', 'ten toi la', 'toi la', 'minh ten la'] },
  id: { navn: 'indonesisk', hei: ['halo', 'hai', 'selamat pagi', 'selamat siang', 'apa kabar'], velkommen: ['selamat datang'], takk: ['terima kasih', 'makasih', 'terima kasih banyak'], hvor: ['di mana', 'dimana', 'mana'], heter: ['nama saya', 'saya', 'nama aku'] },
  ms: { navn: 'malayisk', hei: ['hai', 'helo', 'halo', 'apa khabar', 'selamat pagi'], velkommen: ['selamat datang'], takk: ['terima kasih', 'terima kasih banyak'], hvor: ['di mana', 'dimana', 'mana'], heter: ['nama saya', 'saya'] },
  fil: { navn: 'filippinsk (tagalog)', hei: ['kumusta', 'kamusta', 'mabuhay', 'magandang umaga', 'hello'], velkommen: ['maligayang pagdating', 'mabuhay', 'tuloy po kayo'], takk: ['salamat', 'salamat po', 'maraming salamat', 'maraming salamat po'], hvor: ['nasaan', 'saan', 'nasaan ang', 'saan ang'], heter: ['ang pangalan ko ay', 'ako si', 'pangalan ko', 'ako ay'] },
  hi: { navn: 'hindi', hei: ['namaste', 'namaskar'], velkommen: ['swagat hai', 'aapka swagat hai', 'swagat', 'svagat hai', 'aapka svagat hai', 'swagatam'], takk: ['dhanyavaad', 'dhanyavad', 'dhanyawad', 'shukriya'], hvor: ['kahan hai', 'kaha hai', 'kahaan hai', 'kahan'], heter: ['mera naam', 'mera naam hai', 'mera nam', 'main hoon', 'mai hu'] },
  ur: { navn: 'urdu', hei: ['assalam o alaikum', 'assalamu alaikum', 'salam', 'adaab', 'assalamualaikum'], velkommen: ['khush amdeed', 'khushamdeed', 'khush aamdeed'], takk: ['shukriya', 'shukria', 'bohat shukriya'], hvor: ['kahan hai', 'kaha hai', 'kahan'], heter: ['mera naam', 'mera naam hai', 'mera nam'] },
  bn: { navn: 'bengali', hei: ['nomoskar', 'namaskar', 'nomoshkar', 'assalamu alaikum', 'salam'], velkommen: ['shagotom', 'swagatam', 'sagotom', 'shagatam'], takk: ['dhonnobad', 'dhanyabad', 'dhonnobaad', 'dhonyobad'], hvor: ['kothay', 'kothay ache', 'kothai', 'kothai ache'], heter: ['amar nam', 'amar naam', 'ami'] },
  ne: { navn: 'nepali', hei: ['namaste', 'namaskar'], velkommen: ['swagat chha', 'swagatam', 'swagat cha', 'swagat'], takk: ['dhanyabad', 'dhanyabaad', 'dhanyavad', 'dhanyabaad'], hvor: ['kaha chha', 'kahaa chha', 'kaha cha', 'kata chha', 'kahan chha'], heter: ['mero naam', 'mero nam', 'ma'] },
  si: { navn: 'singalesisk', hei: ['ayubowan', 'ayubowan', 'kohomada', 'hello'], velkommen: ['sadarayen piligannawa', 'sadaraye piligannawa', 'ayubowan'], takk: ['sthuthi', 'istuti', 'stuti', 'bohoma sthuthi', 'bohoma isthuthi', 'bohoma stuti'], hvor: ['koheda', 'kohe da', 'koheda thiyenne'], heter: ['mage nama', 'magay nama', 'mama'] },
  ta: { navn: 'tamil', hei: ['vanakkam'], velkommen: ['varaverkirom', 'nalvaravu', 'varavetkirom', 'varuga'], takk: ['nandri', 'nanri', 'romba nandri'], hvor: ['enge', 'engey', 'enga'], heter: ['en peyar', 'en per', 'naan'] },
  my: { navn: 'burmesisk', hei: ['mingalaba', 'mingalarba', 'mingalar par', 'mingala ba'], velkommen: ['kyo so ba de', 'kyo so par tal', 'kyosopade'], takk: ['kyay zu tin ba de', 'kyei zu tin ba de', 'chezu tinbade', 'kyayzu tinbade', 'kyay zu', 'chezu'], hvor: ['beh mhar lae', 'be hma le', 'bae mhar lae', 'be hma'], heter: ['kyanaw nanmae', 'kyano nan me', 'kyama nanmae', 'kyanaw'] },
  km: { navn: 'khmer', hei: ['susadei', 'sousdey', 'suosdei', 'sua sdei', 'chumreap suor', 'chum reap sour'], velkommen: ['svakum', 'sva kum', 'soum svakum'], takk: ['arkun', 'orkun', 'aw kohn', 'akun', 'orkun chraen', 'arkun chraen'], hvor: ['nov ena', 'nov eana', 'neu ena', 'ena'], heter: ['knhom chmous', 'khnhom chhmuoh', 'knyom chmous', 'knhom chmuoh'] },
  lo: { navn: 'laotisk', hei: ['sabaidee', 'sabai dee', 'sabaidi'], velkommen: ['nyindee tonhab', 'yindee tonhap', 'yin dee ton hap', 'nyin dee ton hub'], takk: ['khop chai', 'khob jai', 'khop jai', 'kop chai', 'khob chai'], hvor: ['yu sai', 'yoo sai', 'yu sai', 'sai'], heter: ['khoy seu', 'khoi seu', 'koy su', 'khoy sue'] },
  dv: { navn: 'divehi', hei: ['assalaamu alaikum', 'assalamu alaikum', 'kihineh'], takk: ['shukuriyaa', 'shukuriya'] },
  dz: { navn: 'dzongkha', hei: ['kuzuzangpo', 'kuzuzangpo la', 'kuzu zangpo'], takk: ['kadrinchey', 'kadrinchey la', 'kadrin chhe'] },
  ar: { navn: 'arabisk', hei: ['marhaba', 'marhaban', 'ahlan', 'assalamu alaikum', 'as salamu alaykum', 'salam', 'salam alaikum', 'assalamualaikum'], velkommen: ['ahlan wa sahlan', 'ahlan wasahlan', 'marhaban bikum', 'ahlan bik', 'ahlan', 'marhaba'], takk: ['shukran', 'shokran', 'shukran jazilan', 'mersi'], hvor: ['ayna', 'aina', 'wein', 'wen', 'fein', 'fen', 'feen', 'ayna yaqa', 'fin'], heter: ['ismi', 'esmi', 'ana', 'ana ismi'] },
  he: { navn: 'hebraisk', hei: ['shalom'], velkommen: ['bruchim habaim', 'baruch haba', 'bruchim haba im', 'brukhim haba im', 'baruch habah'], takk: ['toda', 'toda raba', 'todah', 'todah rabah'], hvor: ['eifo', 'efo', 'eifo ze', 'eyfo'], heter: ['shmi', 'ani', 'kor im li', 'korim li'] },
  am: { navn: 'amharisk', hei: ['selam', 'tenayistilign', 'tena yistilign', 'tenastelign', 'salam'], velkommen: ['enkuan dehna metachu', 'enkwan dehna metachihu', 'enkuan dehna metah', 'enkwan dehna metah', 'enkuan dehna metachihu'], takk: ['ameseginalehu', 'amesegnalehu', 'ameseginalew', 'amesegnalew'], hvor: ['yet new', 'yet no', 'yet'], heter: ['sime', 'sime new', 'simey', 'ene'] },
  sw: { navn: 'swahili', hei: ['jambo', 'hujambo', 'habari', 'mambo', 'salama', 'habari yako'], velkommen: ['karibu', 'karibuni', 'karibu sana'], takk: ['asante', 'asante sana', 'ahsante'], hvor: ['iko wapi', 'wapi', 'ni wapi', 'yuko wapi'], heter: ['jina langu ni', 'naitwa', 'mimi ni', 'jina langu'] },
  mg: { navn: 'gassisk (malagasy)', hei: ['manao ahoana', 'salama', 'manahoana', 'akory'], velkommen: ['tonga soa'], takk: ['misaotra', 'misaotra betsaka'], hvor: ['aiza', 'aiza ny'], heter: ['ny anarako dia', 'anarako', 'ny anarako', 'izaho no'] },
  rw: { navn: 'kinyarwanda', hei: ['muraho', 'mwaramutse', 'mwiriwe', 'bite'], velkommen: ['murakaza neza', 'karibu'], takk: ['murakoze', 'murakoze cyane', 'urakoze'], hvor: ['irihe', 'iri he', 'he', 'ari he'], heter: ['nitwa', 'izina ryanjye ni', 'ndi'] },
  rn: { navn: 'kirundi', hei: ['amahoro', 'bwakeye', 'mwaramutse', 'bite'], velkommen: ['kaze', 'murakaza neza', 'karibu'], takk: ['murakoze', 'urakoze', 'murakoze cane'], hvor: ['irihe', 'iri he', 'he'], heter: ['nitwa', 'izina ryanje ni'] },
  st: { navn: 'sesotho', hei: ['lumela', 'dumela', 'lumelang', 'dumelang'], velkommen: ['o amohelehile', 'le amohelehile', 'rea u amohela', 'kamohelo'], takk: ['kea leboha', 'ke a leboha', 'kealeboha', 'ke a leboga'], hvor: ['e kae', 'kae', 'o kae'], heter: ['lebitso la ka ke', 'lebitso la ka', 'ke nna'] },
  ss: { navn: 'swati', hei: ['sawubona', 'sanibonani', 'yebo'], velkommen: ['wemukelekile', 'siyakwemukela', 'nemukelekile'], takk: ['ngiyabonga', 'siyabonga'], hvor: ['iphi', 'ikuphi', 'uphi', 'kuphi'], heter: ['libito lami ngu', 'libito lami', 'ngingu'] },
  tn: { navn: 'setswana', hei: ['dumela', 'dumelang', 'dumela rra', 'dumela mma'], velkommen: ['o amogetswe', 'le amogetswe', 're a go amogela'], takk: ['ke a leboga', 'kea leboga', 'ke itumetse'], hvor: ['kae', 'e kae', 'o kae'], heter: ['leina la me ke', 'leina la me', 'ke nna'] },
  af: { navn: 'afrikaans', hei: ['hallo', 'goeie dag', 'goeiedag', 'haai', 'more'], velkommen: ['welkom'], takk: ['dankie', 'baie dankie'], hvor: ['waar is', 'waar'], heter: ['my naam is', 'ek is', 'ek heet'] },
  zu: { navn: 'zulu', hei: ['sawubona', 'sanibonani', 'yebo'], velkommen: ['siyakwamukela', 'wamukelekile', 'namukelekile', 'siyanamukela'], takk: ['ngiyabonga', 'siyabonga', 'ngiyabonga kakhulu'], hvor: ['kuphi', 'iphi', 'uphi', 'ikuphi'], heter: ['igama lami ngu', 'igama lami', 'ngingu'] },
  sn: { navn: 'shona', hei: ['mhoro', 'mhoroi', 'mangwanani', 'masikati', 'makadii'], velkommen: ['mauya', 'titambire', 'mauya zvenyu'], takk: ['ndatenda', 'maita basa', 'tatenda', 'ndatenda zvikuru'], hvor: ['ndekupi', 'kupi', 'iripi', 'aripi'], heter: ['zita rangu ndi', 'zita rangu ndinonzi', 'ndinonzi', 'zita rangu'] },
  ny: { navn: 'chichewa', hei: ['moni', 'muli bwanji', 'mwadzuka bwanji'], velkommen: ['takulandirani', 'mwalandiridwa', 'mwalandilidwa'], takk: ['zikomo', 'zikomo kwambiri'], hvor: ['ili kuti', 'kuti', 'ali kuti'], heter: ['dzina langa ndi', 'dzina langa ndine', 'ndine', 'dzina langa'] },
  sm: { navn: 'samoansk', hei: ['talofa', 'talofa lava', 'malo'], velkommen: ['afio mai', 'susu mai', 'maliu mai', 'talofa'], takk: ['faafetai', 'faafetai lava', 'faafetai tele', "fa'afetai"], hvor: ['o fea', 'fea'], heter: ['o lou igoa o', 'o lou igoa', 'o au o', 'lou igoa'] },
  to: { navn: 'tongansk', hei: ['malo e lelei', 'malo e lelei'], velkommen: ['talitali lelei', 'talitali fiefia', 'malo e tau mai'], takk: ['malo', 'malo aupito', 'malo au pito'], hvor: ['oku i fe', 'i fe', 'fe'], heter: ['ko hoku hingoa ko', 'ko hoku hingoa', 'hoku hingoa'] },
  fj: { navn: 'fijiansk', hei: ['bula', 'ni sa bula', 'ni sa bula vinaka', 'bula vinaka', 'ni sa yadra'], velkommen: ['bula', 'bula vinaka', 'ni sa bula', 'ni sa bula vinaka', 'kidavaki'], takk: ['vinaka', 'vinaka vakalevu'], hvor: ['e vei', 'vei', 'e vei e'], heter: ['o yau o', 'na yacaqu o', 'na yacaqu', 'yacaqu'] },
  mi: { navn: 'maori', hei: ['kia ora', 'tena koe', 'tena koutou', 'morena'], velkommen: ['haere mai', 'nau mai', 'nau mai haere mai'], takk: ['kia ora', 'nga mihi', 'tena koe', 'nga mihi nui'], hvor: ['kei hea', 'kei whea'], heter: ['ko toku ingoa', 'toku ingoa', 'ko', 'ko au'] },
  tpi: { navn: 'tok pisin', hei: ['halo', 'gude', 'moning'], velkommen: ['welkam', 'welkam tru'], takk: ['tenkyu', 'tenk yu', 'tenkiu', 'tenkyu tru'], hvor: ['we stap', 'we', 'em stap we', 'stap we'], heter: ['nem bilong mi', 'nem bilong mi em', 'mi'] },
  bi: { navn: 'bislama', hei: ['halo', 'gudmoning'], velkommen: ['welkam', 'yu welkam'], takk: ['tangkyu', 'tankyu', 'tank yu', 'tangkyu tumas'], hvor: ['wea', 'stap wea', 'hem i stap wea'], heter: ['nem blong mi', 'nem blong mi hem', 'mi'] },
  tet: { navn: 'tetum', hei: ['bondia', 'botarde', 'bonoite', 'olah'], velkommen: ['benvindu', 'bemvindu'], takk: ['obrigadu', 'obrigada', 'obrigadu barak'], hvor: ['iha nebe', 'iha ne be', 'nebe'], heter: ['hau nia naran', 'hau naran', 'hau'] },
  gn: { navn: 'guarani', hei: ["mba'eichapa", 'mbaeichapa', 'maitei'], velkommen: ['tereguahe porai', 'tereguahe pora', 'eguahe porai'], takk: ['aguyje', 'aguije', 'aguyjevete'], hvor: ['moopa', "mo'opa", 'moo'], heter: ['che rera', 'che rera ha'] },
};

// Hvilke språk som godtas i hvert land (offisielle eller de mest brukte).
export const LAND_SPRAK = {
  // Europa
  NO: ['no'], SE: ['sv'], DK: ['da'], IS: ['is'], FI: ['fi', 'sv'], EE: ['et'], LV: ['lv'], LT: ['lt'], GB: ['en'], IE: ['en', 'ga'],
  DE: ['de'], AT: ['de'], CH: ['de', 'fr', 'it'], LI: ['de'], LU: ['lb', 'fr', 'de'], BE: ['nl', 'fr', 'de'], NL: ['nl'], FR: ['fr'], MC: ['fr'],
  ES: ['es', 'ca'], AD: ['ca', 'es', 'fr'], PT: ['pt'], IT: ['it'], SM: ['it'], VA: ['it'], MT: ['mt', 'en'],
  PL: ['pl'], CZ: ['cs'], SK: ['sk'], HU: ['hu'], RO: ['ro'], MD: ['ro', 'ru'], BG: ['bg'], GR: ['el'], CY: ['el', 'tr'],
  SI: ['sl'], HR: ['bcs'], BA: ['bcs'], RS: ['bcs'], ME: ['bcs'], XK: ['sq', 'bcs'], MK: ['mk', 'sq'], AL: ['sq'],
  UA: ['ru'], BY: ['ru'], RU: ['ru'],
  // Asia
  TR: ['tr'], GE: ['ka'], AM: ['hy'], AZ: ['az'], KZ: ['kk', 'ru'], UZ: ['uz', 'ru'], KG: ['ky', 'ru'], TJ: ['tg', 'ru'], TM: ['tk', 'ru'],
  MN: ['mn'], CN: ['zh'], TW: ['zh'], JP: ['ja'], KR: ['ko'], KP: ['ko'], TH: ['th'], VN: ['vi'], ID: ['id'], MY: ['ms', 'en'], BN: ['ms', 'en'],
  SG: ['en', 'zh', 'ms', 'ta'], PH: ['fil', 'en'], TL: ['tet', 'pt'], MM: ['my'], KH: ['km'], LA: ['lo'],
  IN: ['hi', 'en'], PK: ['ur', 'en'], BD: ['bn'], NP: ['ne'], LK: ['si', 'ta', 'en'], BT: ['dz', 'en'], MV: ['dv', 'en'],
  IL: ['he', 'ar'], PS: ['ar'], JO: ['ar'], LB: ['ar', 'fr'], SY: ['ar'], IQ: ['ar'], SA: ['ar'], AE: ['ar', 'en'], QA: ['ar', 'en'], KW: ['ar', 'en'], BH: ['ar', 'en'], OM: ['ar', 'en'], YE: ['ar'],
  IR: ['ar'], AF: ['ur'],
  // Afrika
  EG: ['ar'], LY: ['ar'], TN: ['ar', 'fr'], DZ: ['ar', 'fr'], MA: ['ar', 'fr'], MR: ['ar', 'fr'], SD: ['ar', 'en'], SS: ['en'], DJ: ['fr', 'ar'], SO: ['ar'], KM: ['ar', 'fr'], TD: ['fr', 'ar'], ER: ['ar', 'en'],
  ET: ['am'], KE: ['sw', 'en'], TZ: ['sw', 'en'], UG: ['en', 'sw'], RW: ['rw', 'en', 'fr', 'sw'], BI: ['rn', 'fr', 'en'],
  NG: ['en'], GH: ['en'], LR: ['en'], SL: ['en'], GM: ['en'], CM: ['fr', 'en'], ZA: ['en', 'af', 'zu'], NA: ['en', 'af'], BW: ['en', 'tn'], ZM: ['en'], ZW: ['en', 'sn'], MW: ['en', 'ny'],
  LS: ['st', 'en'], SZ: ['ss', 'en'], MU: ['en', 'fr'], SC: ['en', 'fr'], MG: ['mg', 'fr'],
  SN: ['fr'], ML: ['fr'], BF: ['fr'], NE: ['fr'], CI: ['fr'], GN: ['fr'], TG: ['fr'], BJ: ['fr'], GA: ['fr'], CG: ['fr'], CD: ['fr'], CF: ['fr'],
  GQ: ['es', 'fr', 'pt'], AO: ['pt'], MZ: ['pt'], CV: ['pt'], ST: ['pt'], GW: ['pt'],
  // Amerika
  US: ['en', 'es'], CA: ['en', 'fr'], MX: ['es'], GT: ['es'], BZ: ['en', 'es'], SV: ['es'], HN: ['es'], NI: ['es'], CR: ['es'], PA: ['es'], CU: ['es'], DO: ['es'],
  HT: ['fr'], JM: ['en'], BS: ['en'], BB: ['en'], TT: ['en'], AG: ['en'], DM: ['en'], GD: ['en'], KN: ['en'], LC: ['en'], VC: ['en'],
  CO: ['es'], VE: ['es'], EC: ['es'], PE: ['es'], BO: ['es'], PY: ['es', 'gn'], UY: ['es'], AR: ['es'], CL: ['es'], BR: ['pt'], GY: ['en'], SR: ['nl'],
  // Oseania
  AU: ['en'], NZ: ['en', 'mi'], FJ: ['en', 'fj'], PG: ['en', 'tpi'], SB: ['en'], VU: ['bi', 'en', 'fr'], WS: ['sm', 'en'], TO: ['to', 'en'],
  KI: ['en'], TV: ['en'], NR: ['en'], MH: ['en'], FM: ['en'], PW: ['en'],
  AQ: ['en'],
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
