import { DomaineId } from './domaines'

export const SUBSTANCES_LEGALES_IDS = {
  'combustibles fossiles': 'cfxx',
  "sources d'eau salée": 'selh',
  bauxite: 'aloh',
  antimoine: 'anti',
  argent: 'arge',
  arsenic: 'arse',
  or: 'auru',
  béryllium: 'bery',
  bismuth: 'bism',
  cadmium: 'cadm',
  cérium: 'ceri',
  césium: 'cesi',
  chrome: 'chro',
  cobalt: 'coba',
  'gaz carbonique': 'coox',
  cuivre: 'cuiv',
  diamant: 'diam',
  étain: 'etai',
  fer: 'ferx',
  fluorine: 'fluo',
  gallium: 'gall',
  'gîtes géothermiques basse température': 'geob',
  'gîtes géothermiques haute température': 'geoh',
  'activités géothermiques de minime importance': 'geom',
  germanium: 'germ',
  graphite: 'grap',
  'granulats marins': 'grma',
  hafnium: 'hafn',
  hélium: 'heli',
  'calcaires bitumineux': 'hydm',
  'hydrocarbures liquides ou gazeux': 'hydx',
  indium: 'indi',
  alun: 'kals',
  'sels de potassium': 'kclx',
  lithium: 'lith',
  manganèse: 'mang',
  mercure: 'merc',
  molybdène: 'moly',
  'sels de sodium': 'nacl',
  nickel: 'nick',
  niobium: 'niob',
  'non précisée(s)': 'oooo',
  phosphates: 'phos',
  platine: 'plat',
  'métaux de la mine du platine': 'plax',
  plomb: 'plom',
  radium: 'radi',
  rhénium: 'rhen',
  rubidium: 'rubi',
  'autres éléments radioactifs': 'rxxx',
  scandium: 'scan',
  'substances connexes': 'scoc',
  sélénium: 'sele',
  'stockage souterrain': 'skst',
  soufre: 'souf',
  'sulfates autres que les sulfates alcalino-terreux': 'soxx',
  tantale: 'tant',
  tellure: 'tell',
  thallium: 'thal',
  thorium: 'thor',
  titane: 'tita',
  'autres éléments de terres rares': 'trxx',
  uranium: 'uran',
  vanadium: 'vana',
  tungstène: 'wolf',
  zinc: 'zinc',
  zirconium: 'zirc',
  actinium: 'acti',
  amphibolite: 'amph',
  'andalousite / sillimanite / kyanite - (cyanite - disthène)': 'anda',
  andésite: 'ande',
  anhydrite: 'anhy',
  ardoises: 'ardo',
  'argiles communes': 'argc',
  'argiles fibreuses (attapulgites ou palygorskites, sépiolites)': 'argf',
  'argiles kaoliniques': 'argk',
  argiles: 'args',
  astate: 'asta',
  barytine: 'bary',
  basalte: 'basa',
  bitume: 'bitu',
  butane: 'buta',
  'calcaires cimentiers': 'caci',
  calcaires: 'calc',
  calcschiste: 'cals',
  'cendres volcaniques riches en silice': 'cend',
  anthracite: 'cfan',
  charbon: 'cfch',
  houille: 'cfho',
  lignite: 'cfli',
  cornéenne: 'corn',
  craie: 'crai',
  dacite: 'daci',
  diabase: 'diab',
  diatomites: 'diat',
  diorites: 'dior',
  dolérite: 'dole',
  dolomie: 'dolo',
  dysprosium: 'dysp',
  erbium: 'erbi',
  éthylène: 'ethy',
  europium: 'euro',
  faluns: 'falu',
  feldspaths: 'feld',
  gabbro: 'gabb',
  gadolinium: 'gado',
  galets: 'galt',
  'gaz naturel': 'gazn',
  'dépôt glaciaire': 'glac',
  gneiss: 'gnei',
  'granite et granulite': 'grai',
  granodiorite: 'grao',
  'grès silico-ferrugineux': 'gref',
  grès: 'gres',
  'graviers siliceux': 'grsi',
  gypse: 'gyps',
  holmium: 'holm',
  asphalte: 'hyda',
  'hydrocarbures conventionnels liquides ou gazeux': 'hydc',
  'gaz combustible': 'hydg',
  'hydrocarbures liquides': 'hydo',
  hydrocarbures: 'hydr',
  iridium: 'irid',
  kaolin: 'kaol',
  lanthane: 'lant',
  leptynite: 'lept',
  lutécium: 'lute',
  maërl: 'maer',
  minerais: 'mais',
  marbres: 'marb',
  marnes: 'marn',
  'métaux de base': 'meba',
  'métaux connexes': 'meco',
  'métaux précieux': 'mepr',
  micas: 'mica',
  micaschistes: 'mics',
  migmatite: 'migm',
  mylonites: 'mylo',
  néodyme: 'neod',
  ocres: 'ocre',
  ophite: 'ophi',
  osmium: 'osmi',
  palladium: 'pall',
  perlite: 'perl',
  phonolite: 'phon',
  'pierres précieuses': 'pipe',
  polonium: 'polo',
  porphyre: 'porp',
  pouzzolane: 'pouz',
  praséodyme: 'pras',
  prométhium: 'prom',
  protactinium: 'prot',
  propane: 'prpa',
  propylène: 'prpy',
  pyrite: 'pyri',
  quartz: 'quar',
  quartzites: 'quat',
  radon: 'rado',
  'roches ardoisières': 'rard',
  'roches détritiques grossières': 'rdet',
  rhodium: 'rhod',
  rhyolite: 'rhyo',
  ruthénium: 'ruth',
  'sables coquilliers': 'saco',
  samarium: 'sama',
  'sables moyens à grossiers': 'samg',
  'sables siliceux': 'sasi',
  'schistes bitumineux': 'scbi',
  schistes: 'schi',
  'sel gemme': 'selg',
  "puits d'eau salée": 'selp',
  sels: 'sels',
  sel: 'selx',
  serpentinite: 'serp',
  'sable extra siliceux': 'sexs',
  'sables et grès industriels': 'sgin',
  'sables et graviers alluvionnaires': 'sgra',
  'sables et graviers marins': 'sgrm',
  'sables et graviers silico-calcaires marins': 'sgsc',
  'sables et graviers siliceux marins': 'sgsm',
  silice: 'silc',
  sillimanite: 'sili',
  'silex / chert': 'silx',
  'sables a minéraux lourds': 'smil',
  'sable siliceux ou silico-calcaire': 'sssc',
  "stérile d'exploitation": 'stex',
  syénite: 'syen',
  talc: 'talc',
  technétium: 'tech',
  terbium: 'terb',
  'terre végétale': 'terv',
  thulium: 'thul',
  'tous métaux associés': 'tmas',
  tourbe: 'tour',
  trachyte: 'trac',
  tuffeau: 'tufo',
  yttrium: 'ytri',
  ytterbium: 'ytte',
  hydrogène: 'hydrog'
} as const

export type SubstanceLegaleId = typeof SUBSTANCES_LEGALES_IDS[keyof typeof SUBSTANCES_LEGALES_IDS]

export interface SubstanceLegale<T = SubstanceLegaleId> {
  id: T
  nom: string
  description?: string
  substanceParentIds?: SubstanceLegaleId[]
  domaineIds: DomaineId[]
}

export const SubstancesLegale: {
  [key in SubstanceLegaleId]: SubstanceLegale<key>
} = {
  cfxx: { id: 'cfxx', nom: 'combustibles fossiles', domaineIds: ['f'] },
  selh: { id: 'selh', domaineIds: ['m'], nom: "sources d'eau salée" },
  aloh: {
    id: 'aloh',
    domaineIds: ['m'],
    nom: 'bauxite',
    substanceParentIds: ['meba']
  },
  anti: { id: 'anti', domaineIds: ['m'], nom: 'antimoine' },
  arge: {
    id: 'arge',
    domaineIds: ['m'],
    nom: 'argent',
    substanceParentIds: ['mepr']
  },
  arse: { id: 'arse', domaineIds: ['m'], nom: 'arsenic' },
  auru: {
    id: 'auru',
    domaineIds: ['m'],
    nom: 'or',
    substanceParentIds: ['mepr']
  },
  bery: { id: 'bery', domaineIds: ['m'], nom: 'béryllium' },
  bism: { id: 'bism', domaineIds: ['m'], nom: 'bismuth' },
  cadm: { id: 'cadm', domaineIds: ['m'], nom: 'cadmium' },
  ceri: { id: 'ceri', domaineIds: ['m'], nom: 'cérium' },
  cesi: { id: 'cesi', domaineIds: ['m'], nom: 'césium' },
  chro: {
    id: 'chro',
    domaineIds: ['m'],
    nom: 'chrome',
    substanceParentIds: ['meba']
  },
  coba: { id: 'coba', domaineIds: ['m'], nom: 'cobalt' },
  coox: {
    id: 'coox',
    domaineIds: ['m'],
    nom: 'gaz carbonique',
    description: "A l'exception du gaz naturellement contenu dans les eaux qui sont ou qui viendraient à être utilisées pour l'alimentation humaine ou à des fins thérapeutiques"
  },
  cuiv: {
    id: 'cuiv',
    domaineIds: ['m'],
    nom: 'cuivre',
    substanceParentIds: ['meba']
  },
  diam: {
    id: 'diam',
    domaineIds: ['m'],
    nom: 'diamant',
    substanceParentIds: ['pipe']
  },
  etai: {
    id: 'etai',
    domaineIds: ['m'],
    nom: 'étain',
    substanceParentIds: ['meba']
  },
  ferx: {
    id: 'ferx',
    domaineIds: ['m'],
    nom: 'fer',
    substanceParentIds: ['meba', 'pyri']
  },
  fluo: { id: 'fluo', domaineIds: ['m'], nom: 'fluorine' },
  gall: { id: 'gall', domaineIds: ['m'], nom: 'gallium' },
  geob: {
    id: 'geob',
    domaineIds: ['g'],
    nom: 'gîtes géothermiques basse température'
  },
  geoh: {
    id: 'geoh',
    domaineIds: ['g'],
    nom: 'gîtes géothermiques haute température'
  },
  geom: {
    id: 'geom',
    domaineIds: ['g'],
    nom: 'activités géothermiques de minime importance'
  },
  germ: { id: 'germ', domaineIds: ['m'], nom: 'germanium' },
  grap: { id: 'grap', domaineIds: ['m'], nom: 'graphite' },
  grma: {
    id: 'grma',
    domaineIds: ['w'],
    nom: 'granulats marins',
    substanceParentIds: ['galt', 'grsi', 'maer', 'saco', 'samg', 'sasi', 'sgsc', 'sgsm']
  },
  hafn: { id: 'hafn', domaineIds: ['m'], nom: 'hafnium' },
  heli: { id: 'heli', domaineIds: ['m'], nom: 'hélium' },
  hydm: {
    id: 'hydm',
    domaineIds: ['m'],
    nom: 'calcaires bitumineux'
  },
  hydx: {
    id: 'hydx',
    domaineIds: ['h'],
    nom: 'hydrocarbures liquides ou gazeux',
    description: "A l'exeption de la tourbe",
    substanceParentIds: ['hyda', 'hydc', 'hydo', 'hydr']
  },
  indi: { id: 'indi', domaineIds: ['m'], nom: 'indium' },
  kals: { id: 'kals', domaineIds: ['m'], nom: 'alun' },
  kclx: {
    id: 'kclx',
    domaineIds: ['m'],
    nom: 'sels de potassium',
    description: "A l'état solide ou en dissolution, à l'exception de ceux contenus dans les eaux salées utilisées à des fins thérapeutiques ou de loisirs",
    substanceParentIds: ['selg', 'selp', 'sels']
  },
  lith: { id: 'lith', domaineIds: ['m'], nom: 'lithium' },
  mang: {
    id: 'mang',
    domaineIds: ['m'],
    nom: 'manganèse',
    substanceParentIds: ['meba']
  },
  merc: { id: 'merc', domaineIds: ['m'], nom: 'mercure' },
  moly: { id: 'moly', domaineIds: ['m'], nom: 'molybdène' },
  nacl: {
    id: 'nacl',
    domaineIds: ['m'],
    nom: 'sels de sodium',
    description: "A l'état solide ou en dissolution, à l'exception de ceux contenus dans les eaux salées utilisées à des fins thérapeutiques ou de loisirs",
    substanceParentIds: ['selg', 'selp', 'sels', 'selx']
  },
  nick: {
    id: 'nick',
    domaineIds: ['m'],
    nom: 'nickel',
    substanceParentIds: ['meba']
  },
  niob: { id: 'niob', domaineIds: ['m'], nom: 'niobium' },
  oooo: { id: 'oooo', domaineIds: ['m'], nom: 'non précisée(s)' },
  phos: { id: 'phos', domaineIds: ['m'], nom: 'phosphates' },
  plat: {
    id: 'plat',
    domaineIds: ['m'],
    nom: 'platine',
    substanceParentIds: ['mepr']
  },
  plax: {
    id: 'plax',
    domaineIds: ['m'],
    nom: 'métaux de la mine du platine',
    substanceParentIds: ['irid', 'mepr', 'osmi', 'pall', 'rhod', 'ruth']
  },
  plom: {
    id: 'plom',
    domaineIds: ['m'],
    nom: 'plomb',
    substanceParentIds: ['meba']
  },
  radi: { id: 'radi', domaineIds: ['r'], nom: 'radium' },
  rhen: { id: 'rhen', domaineIds: ['m'], nom: 'rhénium' },
  rubi: { id: 'rubi', domaineIds: ['m'], nom: 'rubidium' },
  rxxx: {
    id: 'rxxx',
    domaineIds: ['r'],
    nom: 'autres éléments radioactifs',
    substanceParentIds: ['acti', 'asta', 'polo', 'prot', 'radi', 'rado', 'tech']
  },
  scan: { id: 'scan', domaineIds: ['m'], nom: 'scandium' },
  scoc: {
    id: 'scoc',
    domaineIds: ['c', 'f', 'g', 'h', 'r', 's', 'w', 'm'],
    nom: 'substances connexes',
    description:
      'Substances présentes lors de l’abattage des substances principales. Elles sont à la libre disposition de l’opérateur à la condition que le titre ou l’autorisation porte la mention « et substances connexes ».',
    substanceParentIds: ['mais', 'meco', 'tmas']
  },
  sele: { id: 'sele', domaineIds: ['m'], nom: 'sélénium' },
  skst: {
    id: 'skst',
    domaineIds: ['s'],
    nom: 'stockage souterrain',
    substanceParentIds: ['buta', 'ethy', 'gazn', 'hydg', 'hydo', 'prpa', 'prpy']
  },
  souf: { id: 'souf', domaineIds: ['m'], nom: 'soufre' },
  soxx: {
    id: 'soxx',
    domaineIds: ['m'],
    nom: 'sulfates autres que les sulfates alcalino-terreux'
  },
  tant: { id: 'tant', domaineIds: ['m'], nom: 'tantale' },
  tell: { id: 'tell', domaineIds: ['m'], nom: 'tellure' },
  thal: { id: 'thal', domaineIds: ['m'], nom: 'thallium' },
  thor: { id: 'thor', domaineIds: ['r'], nom: 'thorium' },
  tita: {
    id: 'tita',
    domaineIds: ['m'],
    nom: 'titane',
    substanceParentIds: ['meba']
  },
  trxx: {
    id: 'trxx',
    domaineIds: ['m'],
    nom: 'autres éléments de terres rares',
    substanceParentIds: ['dysp', 'erbi', 'euro', 'gado', 'holm', 'lant', 'lute', 'neod', 'pras', 'prom', 'sama', 'scan', 'terb', 'thul', 'ytri', 'ytte']
  },
  uran: { id: 'uran', domaineIds: ['r'], nom: 'uranium' },
  vana: { id: 'vana', domaineIds: ['m'], nom: 'vanadium' },
  wolf: { id: 'wolf', domaineIds: ['m'], nom: 'tungstène' },
  zinc: {
    id: 'zinc',
    domaineIds: ['m'],
    nom: 'zinc',
    substanceParentIds: ['meba']
  },
  zirc: { id: 'zirc', domaineIds: ['m'], nom: 'zirconium' },
  acti: { id: 'acti', nom: 'actinium', domaineIds: ['r'] },
  amph: {
    id: 'amph',
    nom: 'amphibolite',
    domaineIds: ['c'],
    description:
      'Roche métamorphique présentant de bonnes caractéristiques géomécaniques, de couleur sombre (gris à vert foncé) riche en silicates calciques et ferromagnésiens (essentiellement hornblende, mais aussi feldspath plagioclase) et de minéraux annexes (pyroxène, micas). Elle est utilisée comme roche ornementale et de construction et comme granulat.'
  },
  anda: {
    id: 'anda',
    nom: 'andalousite / sillimanite / kyanite - (cyanite - disthène)',
    domaineIds: ['c'],
    description:
      "Minéral - Silicate d'alumine (SiAl2O5). L'andalousite, la silimanite et la Kyanite (Cyanite ou Disthème) ont la même composition chimique mais avec une structure cristalline et des propriétés physico-minéraloriques différentes (triclinique) autrement dit une variété allotropique (même formule chimique mais système cristallin différent). En France, on ne connait pas de gisement de Kyanite à ce jour. L'andalousite et la silimanite y sont exploitées et sont utilisées dans l'industrie. L'andalousite est utilisée pour ses propriétés réfractaires et son excellente résistance aux chocs thermiques. La silimanite, utilisée pour le même usage réfractaire, a toutefois des propriétés physico-minéraloriques sensiblement différentes de l'andalousite."
  },
  ande: {
    id: 'ande',
    nom: 'andésite',
    domaineIds: ['c'],
    description:
      "Roche volcanique de couleur gris-clair constituée de cristaux de silicates (plagioclases, biotite, hornblende, pyroxène) dans une matrice vitreuse, avec une bonne homogénéité texturale. Elle présente une bonne résistance mécanique et à l'abrasion."
  },
  anhy: {
    id: 'anhy',
    nom: 'anhydrite',
    domaineIds: ['c'],
    description:
      "Forme anhydre (CaSO4) du sulfate de calcium hydraté (gypse), utilisée comme charge dans l'industrie des peintures, plastiques et comme régulateur de prise dans les ciments, plus rarement comme amendement."
  },
  ardo: {
    id: 'ardo',
    nom: 'ardoises',
    domaineIds: ['c'],
    description:
      "Roche schistosée, à l'origine une argile, ayant subi un faible métamorphisme. Variétés gris-bleuté à noire dont la texture (à grains très fin et homogène) et la fissillité (débit en plaques fines) sont mis à profit pour la fabrication d'éléments de toiture, de parement et de dallage pour les variétés plus gréseuses (autres utilisations possibles: additifs pour la fabrication du clinker et des ciments)."
  },
  argc: {
    id: 'argc',
    nom: 'argiles communes',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire tendre à grain très fin, constituée de minéraux argileux à dominante de smectites-illites, ainsi que d'autres minéraux (quartz, oxydes...) de couleur gris-foncé, brune, jaune-oranger ou rougeâtre. Elles forment une pâte en présence d'eau et durcissent à la cuisson (terres-cuites). peuvent être utilisées (10 à 20%) dans la fabrication du clinker, constituant de base de tous les ciments."
  },
  argf: {
    id: 'argf',
    nom: 'argiles fibreuses (attapulgites ou palygorskites, sépiolites)',
    domaineIds: ['c'],
    description:
      "Roches sédimentaires tendre à grains fins, constituées majoritairement d'argiles alumino-magnésiennes (fibres de 1 à 3 µm de long et de 100 à 300 Angstroms de large. La différence entre la largeur des fibres permet de différentier les sépiolites des attapulgites). L'existence de micropores entre les fibres, confèrent à ces argiles une grande capacité d'absorption."
  },
  argk: {
    id: 'argk',
    nom: 'argiles kaoliniques',
    domaineIds: ['c'],
    description:
      'Roche sédimentaire tendre à grains très fins constituée principalement de kaolinite (minéral argileux blanc à crème) utilisée pour ses propriétés en céramiques communes (sanitaires) et pour matériaux réfractaires (fabrication de chamottes).'
  },
  args: {
    id: 'args',
    nom: 'argiles',
    domaineIds: ['c'],
    description: `Roches sédimentaires peu consolidées formées de minéraux argileux comme la montmorillonite (silicate d'aluminium et de magnésium hydraté) et la beidellite (silicate naturel d'aluminium hydraté). Ces phyllosilicates ont des propriétés physico-chimiques (gonflement en présence d'eau, rhéologie, adsorption, échanges cationiques...) avec de nombreuses applications dans les secteurs industriels (chimie, métallurgie, environnement, produit de collage en œnologie pour l'élimination des protéines des vins blancs et rosés. Synonyme : bentonite, "terre à foulon".`
  },
  asta: { id: 'asta', nom: 'astate', domaineIds: ['r'] },
  bary: {
    id: 'bary',
    nom: 'barytine',
    domaineIds: ['c'],
    description:
      'Minéral - Sulfate de baryum (BaSO4) présentant une forte densité (4,5) et une bonne inertie chimique utilisé comme charge minérale dans les boues de forage, les bétons spéciaux des installations nucléaires (radioprotection) et certaines peintures industrielles.'
  },
  basa: {
    id: 'basa',
    nom: 'basalte',
    domaineIds: ['c'],
    description:
      'Roche volcanique dure et massive de couleur gris-foncé à noire, constituée de fin cristaux (pyroxène et olivine) dans une masse vitreuse. Excellentes propriétés mécaniques (dureté), utilisation en tant que granulats et roche ornementale et de construction.'
  },
  bitu: { id: 'bitu', nom: 'bitume', domaineIds: ['f'] },
  buta: { id: 'buta', nom: 'butane', domaineIds: ['s'] },
  caci: { id: 'caci', nom: 'calcaires cimentiers', domaineIds: ['c'] },
  calc: {
    id: 'calc',
    nom: 'calcaires',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire (couleur blanc-beige-gris) principalement constituée de calcite (carbonate de calcium (CaCO3) faisant effervescence à l'acide). Caractéristiques pétrophysiques et géomécaniques très hétérogènes en fonction de la cristallinité, porosité, teneur en autres constituants (argiles, quartz...). Pour les variétés de haute pureté et blancheur, utilisations comme charges minérales. Autres utilisations : sidérurgie, verrerie, amendements, principale matière première pour la fabrication du clinker et de la chaux. Elle est également très employée en tant pierre ornementale et de construction et pour les granulats."
  },
  cals: {
    id: 'cals',
    nom: 'calcschiste',
    domaineIds: ['c'],
    description:
      "Roche métamorphique, d'aspect rubané, provenant de formations argileuses plus ou moins carbonatées comme les marnes et calcaires marneux. Peut être utilisée comme matière première en remplacement du calcaire et/ou des marnes dans la fabrication du clinker, le constituant de base des ciments."
  },
  cend: {
    id: 'cend',
    nom: 'cendres volcaniques riches en silice',
    domaineIds: ['c'],
    description:
      'Roche volcanique formée de fragments généralement à grains fins, peu indurée (pulvérulente) ou indurée. Elle est utilisée en tant que granulats ou comme roches ornementales et de construction.'
  },
  cfan: { id: 'cfan', nom: 'anthracite', domaineIds: ['f'] },
  cfch: { id: 'cfch', nom: 'charbon', domaineIds: ['f'] },
  cfho: { id: 'cfho', nom: 'houille', domaineIds: ['f'] },
  cfli: { id: 'cfli', nom: 'lignite', domaineIds: ['f'] },
  corn: {
    id: 'corn',
    nom: 'cornéenne',
    domaineIds: ['c'],
    description:
      "Roche métamorphique cristalline plus ou moins orientée, habituellement très dure produite sous l'action de la chaleur d'un magma en fusion (métamorphisme de contact). Les grains sont d'une grosseur homogène et ne suivent pas une orientation préférentielle. Leur composition minéralogique varie selon le degré de métamorphisme et la nature des roches initiales. Elles présentent en général de bonnes résistances au choc et à l'abrasion."
  },
  crai: {
    id: 'crai',
    nom: 'craie',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire fine, tendre, friable, de couleur blanche, composée de calcite(CaCO3) d'origine fossilifère. En amendement, est utilisée sous forme pulvérisée, broyée, concassée ou brute pour corriger les sols acides. En liant hydraulique, elle est utilisée dans des proportions de 80 à 90% dans la fabrication du clinker, le constituant de base du ciment mais sert également à la fabrication de chaux et de mortier. Pour les minéraux industriels, la pureté et la blancheur autorisent une utilisation comme charge minérale."
  },
  daci: {
    id: 'daci',
    nom: 'dacite',
    domaineIds: ['c'],
    description:
      'Roche volcanique de couleur gris-clair constituée de fins cristaux de quartz, plagioclase et silicates ferro-magnésiens baignant dans un verre. Elle est utilisée comme roche ornementale ou de construction et comme granulat.'
  },
  diab: {
    id: 'diab',
    nom: 'diabase',
    domaineIds: ['c'],
    description: "Roche métamorphique dure, d'origine volcanique à grain fin de couleur sombre (issue de dolérite). Elle est utilisé comme granulat."
  },
  diat: {
    id: 'diat',
    nom: 'diatomites',
    domaineIds: ['c'],
    description:
      'Roche sédimentaire tendre et légère formée par accumulation de carapaces siliceuses de micro-organismes en milieux lacustes ou marins. Utilisations industrielles : filtration de liquides alimentaires, charge minérale, absorbant de pollutions. En liant hydraulique, elle peut être utilisée comme additifs pour la fabrication de certains ciments.'
  },
  dior: {
    id: 'dior',
    nom: 'diorites',
    domaineIds: ['c'],
    description:
      'Roche plutonique cristalline à texture grenue et homogène, constituée de feldspaths blanchâtres et de silicates ferro-magnésiens colorés (amphiboles, biotite...). En roche ornemental et de construction, elle est sélectionnée pour son aspect décoratif. En granulat, cette roche présente de bonnes caractéristiques mécaniques.'
  },
  dole: {
    id: 'dole',
    nom: 'dolérite',
    domaineIds: ['c'],
    description:
      "Roche volcanique massive, compacte, de couleur sombre (grise à noire), composée de fins cristaux de feldspaths calciques, de pyroxène et parfois d'oxydes de fer. Elle est utilisée en tant que granulats ou en roche ornementale et de construction. On la trouve en association possible des dolérites altérées (diabases issues du métamorphisme des dolérites)."
  },
  dolo: {
    id: 'dolo',
    nom: 'dolomie',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire constituée principalement de dolomite (carbonate double de calcium et de magnésium). Utilisée comme charge minérale dans de nombreuses applications : peintures et enduits, élastomères, papiers et revêtements de sol ou dans l'industrie du verre. Au regard de ses propriétés chimiques, est utilisée comme amendement sous forme pulvérisée, broyée, pour corriger le pH des sols acides."
  },
  dysp: { id: 'dysp', nom: 'dysprosium', domaineIds: ['m'] },
  erbi: { id: 'erbi', nom: 'erbium', domaineIds: ['m'] },
  ethy: { id: 'ethy', nom: 'éthylène', domaineIds: ['s'] },
  euro: { id: 'euro', nom: 'europium', domaineIds: ['m'] },
  falu: {
    id: 'falu',
    nom: 'faluns',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire meuble d'origine détritique riche en débris de coquilles d'animaux marins. Facilement délitable et transformée en sable, elle est utilisée en tant qu'amendement agricole en substitution de carbonate de calcium ou de calcite. Par le passé, cette roche a été utilisée comme sarcophage pour conserver les corps au regard de sa porosité qui permet d'éviter la putréfaction des chairs et d'absorber les exudats."
  },
  feld: {
    id: 'feld',
    nom: 'feldspaths',
    domaineIds: ['c'],
    description:
      'Minéral - Principal constituant de nombreuses roches magmatiques dont la composition varie entre des pôles potassique (KAlSi3O8), sodique (NaAlSi3O8) et calcique (CaAl2Si2O8), utilisé en céramique et dans la verrerie.'
  },
  gabb: {
    id: 'gabb',
    nom: 'gabbro',
    domaineIds: ['c'],
    description:
      'Roche plutonique grenue de couleur sombre, contenant des feldspaths calciques et du pyroxène (olivine, biotite et hornblende associés). Cette roche présente généralement de bonnes caractéristiques mécaniques qui la rendent utilisable comme roche ornementale et de construction et comme granulat.'
  },
  gado: { id: 'gado', nom: 'gadolinium', domaineIds: ['m'] },
  galt: {
    id: 'galt',
    nom: 'galets',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  gazn: { id: 'gazn', nom: 'gaz naturel', domaineIds: ['s'] },
  glac: {
    id: 'glac',
    nom: 'dépôt glaciaire',
    domaineIds: ['c'],
    description:
      "Mélange de roches sédimentaires détritiques hétérogènes d'origine glaciaire constituées de fragments hétérométriques, unis par un ciment naturel (moraines et tillites). Les moraines se présentent sous forme de blocs, de cailloux de sables et d'argiles. Elles peuvent être valorisées comme granulat. Les tillites sont des conglomérats à éléments arrondis et anguleux, suffisamment indurées (dures) pour être valorisées également comme granulat ou comme roche ornementale et de construction."
  },
  gnei: {
    id: 'gnei',
    nom: 'gneiss',
    domaineIds: ['c'],
    description:
      'Roche métamorphique cristalline à faciès rubanné ou lenticulaire (alternance de lits clairs quartzo-feldspathiques et de lits sombres à micas, amphiboles et pyroxènes). Utilisée en tant que granulats pour ses propriétés mécaniques ou en tant que roche ornementale et de construction pour son aspect décoratif.'
  },
  grai: {
    id: 'grai',
    nom: 'granite et granulite',
    domaineIds: ['c'],
    description: `Roche plutonique cristalline à texture grenue de couleur claire (gris, rose ou jaune) composée de quartz, feldspaths et micas, sélectionnée pour son aspect décoratif. Pour les roches ornementales et de construction, une définition "commerciale" existe également et est différente de celle-ci dite "acceptation scientifique" (cf. point 2.1.156 NF EN 12670 : 2001 page 16). Pour les granulats, cette roche présente de bonnes caractéristiques de rugosité. Pour les minéraux industriels, cette roche rendue friable par l'altération (arénisation) facilite l'extraction de tout ou partie de ses constituants (quartz, feldspaths et micas). Nota : Le terme GRANULITE était utilisé autrefois pour désigner des granites de couleur claire à 2 micas (noir et blanc). qui sont valorisées pour leur aspect esthétique dans le domaine des roches ornementales et de construction.`
  },
  grao: {
    id: 'grao',
    nom: 'granodiorite',
    domaineIds: ['c'],
    description:
      "Roche plutonique grenue dont la composition est intermédiaire entre le granite et la diorite. Elle est principalement constituée de quartz (> 10 %) et de feldspaths de couleur claire. Les minéraux secondaires sont la biotite (grains sombres vert, brun ou noir), l'amphibole et le pyroxène. La Pierre de Rosette qui permit de percer le mystère des hiéroglyphes est en granodiorite."
  },
  gref: {
    id: 'gref',
    nom: 'grès silico-ferrugineux',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire de couleur brun-orangé constituée d'un mélange de silice et d'oxydes et hydroxydes de fer, utilisée en tant que minéraux industriels, comme agent colorant en céramique."
  },
  gres: {
    id: 'gres',
    nom: 'grès',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire plus ou moins indurée et stratifiée, composée de grains de quartz d'origine détritique (d'une taille comprise entre 63 µm et 2 mm) soudés par un ciment interstitiel de nature variable (calcite, oxydes de fer, silice, minéraux argileux). Dans le domaine des granulats et des roches ornementales et de construction, les propriétés mécaniques et l'aspect esthétique sont valorisés. Dans le domaine des minéraux industriels, elle est utilisée comme source de silice pour la production de ferro-silicium."
  },
  grsi: {
    id: 'grsi',
    nom: 'graviers siliceux',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  gyps: {
    id: 'gyps',
    nom: 'gypse',
    domaineIds: ['c'],
    description:
      "Minéral - Sulfate de calcium hydraté (CaSO4,2H2O). Dans le domaine des liants hydrauliques, ce minéral est utilisé pour la fabrication du plâtre et comme régulateur de prise dans les ciments. Dans le domaine des minéraux industriel, sa pureté chimique et ses caractéristiques physiques comme la blancheur lui permettent d'être utilisé comme charge minérale. Dans le domaine de l'amendement, sa propriété chimique (base) est utilisée pour corriger les sols acides."
  },
  holm: { id: 'holm', nom: 'holmium', domaineIds: ['m'] },
  hyda: { id: 'hyda', nom: 'asphalte', domaineIds: ['h'] },
  hydc: {
    id: 'hydc',
    nom: 'hydrocarbures conventionnels liquides ou gazeux',
    domaineIds: ['h']
  },
  hydg: { id: 'hydg', nom: 'gaz combustible', domaineIds: ['s'] },
  hydo: { id: 'hydo', nom: 'hydrocarbures liquides', domaineIds: ['h', 's'] },
  hydr: { id: 'hydr', nom: 'hydrocarbures', domaineIds: ['h'] },
  irid: { id: 'irid', nom: 'iridium', domaineIds: ['m'] },
  kaol: {
    id: 'kaol',
    nom: 'kaolin',
    domaineIds: ['c'],
    description:
      "Minéral - Extrait de roches granitiques ou sédimentaires composées principalement de kaolinite (silicate d'alumine hydraté Al2Si2O5(OH)4). Le kaolin est utilisé pour sa grande pureté et sa blancheur en céramique (porcelaine) ou comme charges minérales (papier, peinture, etc.). Il peut être également utilisé comme matière première en remplacement de l'argile dans la fabrication de certains clinkers pour ciments blancs (Portland)."
  },
  lant: { id: 'lant', nom: 'lanthane', domaineIds: ['m'] },
  lept: {
    id: 'lept',
    nom: 'leptynite',
    domaineIds: ['c'],
    description: 'Roche métamorphique cristallisée et orientée de couleur claire composée de quartz, feldspath et micas en faible quantité présentant une bonne résistance mécanique.'
  },
  lute: { id: 'lute', nom: 'lutécium', domaineIds: ['m'] },
  maer: {
    id: 'maer',
    nom: 'maërl',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  mais: { id: 'mais', nom: 'minerais', domaineIds: ['m'] },
  marb: {
    id: 'marb',
    nom: 'marbres',
    domaineIds: ['c'],
    description: `Roche métamorphique cristalline plus ou moins rubanée, contenant plus de 50 % de carbonates (calcite et plus rarement dolomite) dans laquelle les minéraux ont totalement recristallisé avec des traces d'oxydes métalliques ou d'impuretés lui donnant une grande variété de couleurs. Le métamorphisme de cette roche lui confère une plus grande dureté. Dans le domaine des roches ornementales, elle est sélectionnée pour son aspect décoratif, la recristallisation de ses composants favorise son polissage. Une définition "commerciale" existe également et est différente de celle-ci dite "acceptation scientifique" (cf. point 2.1.243 NF EN 12670 : 2001 page 22). Dans le domaine des granulats, elle est sélectionnée pour ses propriétés mécaniques (dureté, résistance aux chocs). Dans le domaine des liants hydrauliques, elle peut être utilisée comme matière première en remplacement du calcaire dans la fabrication du clinker, le constituant de base des ciments. Dans le domaine de l'amendement les composants calciques ou magnésiens sont particulièrement utiles pour la correction de pH des milieux acides. Dans le domaine des minéraux industriels, elle est utilisée, après calcination en carbonate de calcium, comme: - charge minérale dans de nombreuses applications industrielles (papier, peinture, plastiques, élastomères) - ou transformée en chaux pour la correction de pH des milieux acides.`
  },
  marn: {
    id: 'marn',
    nom: 'marnes',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire plus ou moins indurée (dure) et stratifiée (couches successives de sédiments) composée d'un mélange de carbonate de calcium (CaCO3) et d'argiles de différentes natures (de 35% à 65%). Usages : Dans le domaine des granulats, l'emploi de cette roche est exceptionnel bien que présent dans les couches de découverte et que ces caractéristiques mécaniques soient compatibles avec cet usage. Si elle est utilisée comme granulat, c'est principalement sous forme de remblai et encore plus exceptionnellement en granulat pour béton. Dans le domaine de l'agriculture, cette roche est employée comme amendement du fait du mélange carbonate de calcium et argile qu'elle contient. Dans le domaine des liants hydrauliques, cette roche est souvent utilisée comme matière première en remplacement du calcaire et/ou de l'argile dans la fabrication du clinker, le constituant de base des ciments. Dans le domaine des minéraux industriels, elle est exploitée en fonction de sa richesse en calcite afin de constituer des charges minérales. Nota: Les marnes ont une composition chimique intermédiaire entre les calcaires marneux (5 à 35% d'argiles) et les argiles calcareuses ou marnes argileuses (65 à 95% d'argiles)."
  },
  meba: { id: 'meba', nom: 'métaux de base', domaineIds: ['m'] },
  meco: { id: 'meco', nom: 'métaux connexes', domaineIds: ['m'] },
  mepr: { id: 'mepr', nom: 'métaux précieux', domaineIds: ['m'] },
  mica: {
    id: 'mica',
    nom: 'micas',
    domaineIds: ['c'],
    description:
      "Minéral - Silicates en feuillets riches en aluminium et potassium (micas blancs) ou en magnésium et fer (micas noirs) dont les propriétés physico-minéralogiques trouvent de nombreuses applications dans les domaines de l'isolation et des charges minérales."
  },
  mics: {
    id: 'mics',
    nom: 'micaschistes',
    domaineIds: ['c'],
    description:
      "Roche métamorphique cristallisée et schisteuse caractérisée par l'abondance de la fraction micacée et une plus faible teneur en quartz. Dans le domaine des roches ornementales et de construction, les proportions de quartz et de micas déterminent les propriétés de la roche comme la fissilité pour la production de dallage ou de couverture. Sa richesse en mica confère un aspect brillant à sa surface. Dans le domaine des minéraux industriel, cette roche est valorisée dans des applications de type charge minérale."
  },
  migm: {
    id: 'migm',
    nom: 'migmatite',
    domaineIds: ['c'],
    description: `Roche métamorphique formée d'une alternance de roches de type granite de couleur sombre et de roche de type gneiss de couleur clair. La partie de couleur claire est assimilé à la partie de la roche ayant fondu et est appelée "le mobilisat". La partie de couleur sombre constitue la partie de la roche étant restée solide et est appelée "la restite". Ses bonnes propriétés mécaniques, permettent de l'utiliser comme roche ornementale et de construction ou comme granulat.`
  },
  mylo: {
    id: 'mylo',
    nom: 'mylonites',
    domaineIds: ['c'],
    description:
      "Roche autre cataclastique résultant du cisaillement et du broyage puis de la recristallisation plus ou moins intense de roches préexistantes de différentes natures (éventuellement recristallisées) dans une zone de formation intense de failles. Elle est constituée d'une hétérogénéité de roches."
  },
  neod: { id: 'neod', nom: 'néodyme', domaineIds: ['m'] },
  ocre: {
    id: 'ocre',
    nom: 'ocres',
    domaineIds: ['c'],
    description:
      "Mélange sédimentaire naturel de kaolinite (argile), d'oxyde de fer rouge (hématite) et d'hydroxyde de fer jaune-oranger (limonite) utilisé pour la production de pigments naturels dans les peintures et les enduits."
  },
  ophi: {
    id: 'ophi',
    nom: 'ophite',
    domaineIds: ['c'],
    description:
      'Roche plutonique intermédiaire entre basalte et gabbro présentant un faciès plus ou moins altéré de couleur vert-foncé. En tant que roche ornementale et de construction elle est sélectionnée pour son aspect décoratif. Son emploi en tant que granulats est dû à sa dureté et à sa compacité.'
  },
  osmi: { id: 'osmi', nom: 'osmium', domaineIds: ['m'] },
  pall: { id: 'pall', nom: 'palladium', domaineIds: ['m'] },
  perl: {
    id: 'perl',
    nom: 'perlite',
    domaineIds: ['c'],
    description:
      "Roche volcanique de couleur claire à texture vitreuse plus ou moins hydratée et composition rhyolitique utilisée dans l'industrie pour la production d'agents filtrants et d'additifs fonctionnels. Elle est utilisée dans l'industrie pour la production d'agents filtrants et d'additifs fonctionnels."
  },
  phon: {
    id: 'phon',
    nom: 'phonolite',
    domaineIds: ['c'],
    description:
      'Roche volcanique à grain très fin, de couleur grise tirant parfois sur le vert ou le brun, qui se débite en plaques et qui, sous le choc du métal, rend un son clair (dalles sonores). Sa composition chimique est déficitaire en silice (dite sous-saturées en silice). Le silicium y représente donc moins de la moitié des cations. Ces caractéristiques mécaniques (dureté) permettent son utilisation en tant que granulat. En tant que roche ornementale et de construction, elle est utilisée comme pierre ardoisière en Auvergne. En tant que minéraux industriels, sa composition chimique sous-saturée en silice est recherchée pour les industries du verre et de la céramique.'
  },
  pipe: { id: 'pipe', nom: 'pierres précieuses', domaineIds: ['m'] },
  polo: { id: 'polo', nom: 'polonium', domaineIds: ['r'] },
  porp: {
    id: 'porp',
    nom: 'porphyre',
    domaineIds: ['c'],
    description:
      "Roche plutonique caractérisée par une texture intermédiaire constituée de cristaux de feldpaths baignant dans une matrice finement cristallisée. Dans le domaine des roches ornementales et de construction, la couleur variable de cette roche est utilisée pour son aspect décoratif. Dans le domaine des minéraux industriels, cette roche est employée pour ces propriétés mécaniques (dureté, résistance aux chocs et à l'abrasion)."
  },
  pouz: {
    id: 'pouz',
    nom: 'pouzzolane',
    domaineIds: ['c'],
    description:
      "Roche volcanique scoriacée à texture bulleuse de couleur noire ou rouge brique. Elle est donc assez rarement exploitée en roche de construction sauf dans la région de Clermont-Ferrand et sur l'île de la Réunion. Elle permet la fabrication de moellons utilisés dans le bâtiment compte tenu de leurs propriétés (isolation thermique et phonique) (voir la fiche pouzzolane de Ph. Rocher). L'exploitation en roche ornementale est marginale et est destinée la construction de rocaille décorative dans les jardins d'agrément. En tant que granulats, elle est utilisée comme agent de sablage ou comme agrégat pour la réalisation de massifs drainants. Sa texture bulleuse peu résistante mécaniquement en fait tout de même un granulat léger notamment dans les bétons spéciaux. Dans le domaine des liants hydrauliques, elle peut être utilisée comme additifs pour la fabrication de certains ciments. Dans le domaine des minéraux industriels, elle est utilisée pour ses propriétés d'isolation phonique et thermique."
  },
  pras: { id: 'pras', nom: 'praséodyme', domaineIds: ['m'] },
  prom: { id: 'prom', nom: 'prométhium', domaineIds: ['m'] },
  prot: { id: 'prot', nom: 'protactinium', domaineIds: ['r'] },
  prpa: { id: 'prpa', nom: 'propane', domaineIds: ['s'] },
  prpy: { id: 'prpy', nom: 'propylène', domaineIds: ['s'] },
  pyri: { id: 'pyri', nom: 'pyrite', domaineIds: ['m'] },
  quar: {
    id: 'quar',
    nom: 'quartz',
    domaineIds: ['c'],
    description:
      "Minéral - Oxyde de silicium (SiO2) Dans le domaine des granulats, sans grand degré de pureté le quartz est valorisé pour ses caractéristiques mécaniques et certains aspects décoratifs. Dans le domaine des minéraux industriels, sa pureté en SiO2 est recherchée pour sa résistance à l'abrasion dans les revêtements de sols ou comme agent de décapage. Elle constitue une source de silicium pour des applications verre et céramique lorsqu'il présente un très haut degré de pureté."
  },
  quat: {
    id: 'quat',
    nom: 'quartzites',
    domaineIds: ['c'],
    description:
      "Roche métamorphique massive composée principalement de quartz issue de la recristallisation et de la cimentation du quartz. Les caractéristiques mécaniques sont favorables à la production de granulats de haute qualité (forte résistance à l'abrasion) ou à une utilisation comme roche ornementale et de construction. Le tombeau de Napoléon, aux Invalides, est réalisé dans un bloc de quartzite. Dans le domaine des minéraux industriels, sa pureté est recherchée pour être utilisée comme matériaux réfractaires."
  },
  rado: { id: 'rado', nom: 'radon', domaineIds: ['r'] },
  rard: {
    id: 'rard',
    nom: 'roches ardoisières',
    domaineIds: ['c'],
    description:
      "Roche métamorphique qui est à l'origine de l'argile ayant subi un faible métamorphisme et qui est devenue schisteuse. Ces roches ardoisières ont un plan de schistocité épais et peuvent avoir une fraction gréseuse. Elle comprend notamment les lauzes qui sont utilisées comme pierres de construction (dallage ou toiture)."
  },
  rdet: {
    id: 'rdet',
    nom: 'roches détritiques grossières',
    domaineIds: ['c'],
    description:
      "Famille de roches sédimentaire détritiques (issues de la dégradation mécanique d'autres roches) constituées d'éléments grossiers (galets) arrondis (qui traduisent un transport long avant sédimentation) cimentés par des éléments plus fins de type sables et graviers. Devenues suffisamment dures (indurées) ces roches sont utilisées pour la production de granulats. En tant que roches ornementales et de construction, elles présentent des caractéristiques mécaniques et esthétiques valorisables en décoration. Cette famille regroupe les roches suivantes : les arkoses, les brèches, les conglomérats et les poudingues. Ces dernières sont celles qui sont le plus souvent utilisées comme roches ornementales."
  },
  rhod: { id: 'rhod', nom: 'rhodium', domaineIds: ['m'] },
  rhyo: {
    id: 'rhyo',
    nom: 'rhyolite',
    domaineIds: ['c'],
    description:
      'Roche volcanique effusive riche en silice de couleur claire constituée de fins cristaux de feldspaths dispersés dans une matrice vitreuse valorisée pour ses propriétés mécaniques et son aspect esthétique soit en tant que roche ornementale et de construction ou en tant que granulats.'
  },
  ruth: { id: 'ruth', nom: 'ruthénium', domaineIds: ['m'] },
  saco: {
    id: 'saco',
    nom: 'sables coquilliers',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  sama: { id: 'sama', nom: 'samarium', domaineIds: ['m'] },
  samg: {
    id: 'samg',
    nom: 'sables moyens à grossiers',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  sasi: {
    id: 'sasi',
    nom: 'sables siliceux',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  scbi: { id: 'scbi', nom: 'schistes bitumineux', domaineIds: ['f'] },
  schi: {
    id: 'schi',
    nom: 'schistes',
    domaineIds: ['c'],
    description:
      "Roche métamorphique à grains très fins peu ou pas décelables à l'œil nu présentant un débit en feuillet dû à la schistosité et à la présence de minéraux plats (micas, hornblende...) orientés. Utilisée pour ses propriétés mécaniques, cette roche est particulièrement délitable et donne des granulats de forme assez plate. Son aspect décoratif est valorisé en tant que roche ornementale et de construction."
  },
  selg: { id: 'selg', nom: 'sel gemme', domaineIds: ['m'] },
  selp: { id: 'selp', nom: "puits d'eau salée", domaineIds: ['m'] },
  sels: { id: 'sels', nom: 'sels', domaineIds: ['m'] },
  selx: { id: 'selx', nom: 'sel', domaineIds: ['m'] },
  serp: {
    id: 'serp',
    nom: 'serpentinite',
    domaineIds: ['c'],
    description:
      "Roche métamorphique de couleur jaunâtre à verdâtre (voire vert sombre) ou présentant des inclusions verdâtres (forme porphyrique) essentiellement constituée (plus de 75 %) d'antigorite (phyllosilicate magnésien). Cette roche provient de l'altération d'une péridotite en présence d'eau. Les serpentinites sont essentiellement exploitées aujourd'hui pour la production de granulats et plus rarement comme roches ornementales."
  },
  sexs: {
    id: 'sexs',
    nom: 'sable extra siliceux',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire meuble d'origine détritique presque exclusivement constituée de grains calibrés de quartz de très grande pureté (égale ou > 98% de silice), utilisée dans les industries du verre et de la céramique et comme additif fonctionnel."
  },
  sgin: {
    id: 'sgin',
    nom: 'sables et grès industriels',
    domaineIds: ['c']
  },
  sgra: {
    id: 'sgra',
    nom: 'sables et graviers alluvionnaires',
    domaineIds: ['c'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme de sables, graviers et galets de nature variable extraits d'anciens lits de cours d'eau et utilisé comme granulat encore aujourd'hui principalement dans des bétons spéciaux ou pour des couches drainantes."
  },
  sgrm: {
    id: 'sgrm',
    nom: 'sables et graviers marins',
    domaineIds: ['c'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  sgsc: {
    id: 'sgsc',
    nom: 'sables et graviers silico-calcaires marins',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  sgsm: {
    id: 'sgsm',
    nom: 'sables et graviers siliceux marins',
    domaineIds: ['w'],
    description:
      "Mélange sédimentaire meuble constituée d'éléments rocheux de nature variée sous forme sous forme de sables et graviers d'origine détritique, de nature siliceuse et calcaire extrait des fonds marins. Leur utilité est destinée au granulat."
  },
  silc: { id: 'silc', nom: 'silice', domaineIds: ['c'] },
  sili: {
    id: 'sili',
    nom: 'sillimanite',
    domaineIds: ['c'],
    description:
      "Minéral - Silicate d'alumine (SiAl2O5) de même composition chimique que l'andalousite mais avec une structure cristalline et des propriétés physico-minéralogiques sensiblement différentes."
  },
  silx: {
    id: 'silx',
    nom: 'silex / chert',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire d'origine détritique issue d'une précipitation chimique et constituée de silice calcédonieuse presque pure la rendant très dure et quelques impuretés telles que de l'eau ou des oxydes, ces derniers influant sur sa couleur. De part, la dureté de cette roche, elle est valorisée sous forme de granulat. Pour l'industrie, elle est utilisée, sous forme de galet plus ou moins arrondis dont les propriétés mécaniques permettent d'en faire des charges broyantes ou des produits abrasifs ou dont la grande pureté chimique permet de faire de la silice industrielle. [Définition de la norme européenne EN 932-3 : Roche sédimentaire composée de silice cryptocristalline ou microcristalline (cristaux indétectables à l'œil nu), se formant en général en couches ou en nodules dans le calcaire.] Préférer le terme SILEX au terme CHERT qui vaut dire la même chose. Le silex est un chert se formant dans la craie du Crétacé (cf. falaise d'Etretat)."
  },
  smil: {
    id: 'smil',
    nom: 'sables a minéraux lourds',
    domaineIds: ['c'],
    description:
      "Sables alluvionnaires ou de plage composés de minéraux lourds (rutile, zircon, barytine, grenat). L'accumulation des minéraux lourds se fait dans des placers dont l'origine est liée aux paramètres favorables de sédimentation. Ces minéraux peuvent être utilisés en industrie."
  },
  sssc: {
    id: 'sssc',
    nom: 'sable siliceux ou silico-calcaire',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire meuble d'origine détritique pouvant soit être constituée majoritairement de grains de quartz (fort % de silice mais < à 98%) soit de calcaire et de silice (silico-calcaire). Ce sable est principalement utilisé comme produits de correction pour la fabrication du clinker, le constituant de base des ciments."
  },
  stex: {
    id: 'stex',
    nom: "stérile d'exploitation",
    domaineIds: ['c'],
    description:
      "Roche d'origine diverse, caractérisée par des roches constituant des stériles d'ancienne exploitation (schiste, grès, carbonates ou roche grenue) dont les caractéristiques mécaniques et physiques permettent de les valoriser comme granulat."
  },
  syen: {
    id: 'syen',
    nom: 'syénite',
    domaineIds: ['c'],
    description:
      "Roche plutonique grenue de couleur rose à rouge, composée de feldspath alcalin (assez riche en silice). Elle se rapproche du granite et du gabbro mais ne contient pas de quartz. L'équivalent volcanique d'une syénite est un trachyte. Elle est utilisée en tant que granulats ou roche ornementale et de construction."
  },
  talc: {
    id: 'talc',
    nom: 'talc',
    domaineIds: ['c'],
    description:
      "Minéral - Silicate de magnésium hydraté (Mg3 Si4 O10 (OH)2) présentant une structure en feuillets dont les propriétés comme la dureté (1 de l'échelle de Mohs), hydrophobie, grande inertie chimique, blancheur en font un remarquable additif fonctionnel de nombreux domaines (peintures, plastiques, pharmacopée...)."
  },
  tech: { id: 'tech', nom: 'technétium', domaineIds: ['r'] },
  terb: { id: 'terb', nom: 'terbium', domaineIds: ['m'] },
  terv: {
    id: 'terv',
    nom: 'terre végétale',
    domaineIds: ['c'],
    description:
      "Horizon sédimentaire humifère constitué suivant la profondeur de l'accumulation de matière organique associée à la croissance des végétaux et de l'altération du substratum rocheux sous-jacent."
  },
  thul: { id: 'thul', nom: 'thulium', domaineIds: ['m'] },
  tmas: { id: 'tmas', nom: 'tous métaux associés', domaineIds: ['m'] },
  tour: {
    id: 'tour',
    nom: 'tourbe',
    domaineIds: ['c'],
    description:
      "Roche sédimentaire organique résultant de l'accumulation de la matière organique liée à la croissance des végétaux et de leur transformation sous certaines conditions. Elle est utilisée principalement comme amendement."
  },
  trac: {
    id: 'trac',
    nom: 'trachyte',
    domaineIds: ['c'],
    description:
      'Roche volcanique effusive de couleur gris-clair, à texture souvent poreuse constituée de fins cristaux (microlites) de feldspaths baignant dans une matrice vitreuse (du fait de sa teneur en silice assez élevée). Elle est utilisée pour ses bonnes caractéristiques mécaniques en tant que granulats et comme roches ornementales et de constructions (ex: lave de Volvic, lave de Chambois).'
  },
  tufo: {
    id: 'tufo',
    nom: 'tuffeau',
    domaineIds: ['c'],
    description: 'Roche sédimentaire blanchâtre peu stratifiée à texture crayeuse constituée de calcite, utilisée comme pierre de construction.'
  },
  ytri: { id: 'ytri', nom: 'yttrium', domaineIds: ['m'] },
  ytte: { id: 'ytte', nom: 'ytterbium', domaineIds: ['m'] },
  hydrog: { id: 'hydrog', nom: 'hydrogène', domaineIds: ['m'] }
}

export const SubstancesLegales = Object.values(SubstancesLegale)
