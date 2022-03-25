export const DOMAINES_IDS = [
  "c",
  "f",
  "g",
  "h",
  "i",
  "m",
  "r",
  "s",
  "w",
] as const;

export type DomaineId = typeof DOMAINES_IDS[number];

interface Domaine {
  id: DomaineId;
  nom: string;
  description: string;
  ordre: number;
}

export const Domaines: { [key in DomaineId]: Omit<Domaine, "id"> } = {
  c: {
    nom: "carrières",
    description:
      "Domaine couvrant les zones spéciales de carrières à terre qui incluent des substances minérales ou fossiles de carrières rares ou nécessaires pour satisfaire les besoins des consommateurs et l’intérêt économique national ou régional.",
    ordre: 3,
  },
  f: {
    nom: "combustibles fossiles",
    description:
      "Domaine minier auquel appartiennent les combustibles fossiles, la tourbe exceptée.",
    ordre: 5,
  },
  g: {
    nom: "géothermie",
    description:
      "Domaine auquel appartiennent les gîtes renfermés dans le sein de la terre dont on peut extraire de l'énergie sous forme thermique, notamment par l'intermédiaire des eaux chaudes et des vapeurs souterraines qu'ils contiennent.",
    ordre: 7,
  },
  h: {
    nom: "hydrocarbures liquides ou gazeux",
    description:
      "Domaine minier auquel appartiennent des hydrocarbures qu'ils soient sous forme liquide ou gazeuse.",
    ordre: 4,
  },
  i: {
    nom: "indéterminé",
    description: "Domaine indéterminé",
    ordre: 9,
  },
  m: {
    nom: "minéraux et métaux",
    description:
      "Domaine minier auquel appartiennent les substances minérales non énergétiques et non radioactives classées dans la catégorie des substances de mines, notemment certains métaux, gaz, sels et terres-rares.",
    ordre: 1,
  },
  r: {
    nom: "éléments radioactifs",
    description:
      "Domaine minier auquel appartiennent les substances minérales radioactives classés dans la catégorie des substances de mines.",
    ordre: 6,
  },
  s: {
    nom: "stockages souterrains",
    description:
      "Domaine auquel appartiennent les cavités souterraines naturelles ou artificielles ou formations souterraines naturelles présentant les qualités requises pour constituer des réservoirs étanches ou susceptibles d'être rendus tels, en vue du stockage de gaz naturel, d'hydrocarbures liquides, liquéfiés ou gazeux ou de produits chimiques à destination industrielle.",
    ordre: 8,
  },
  w: {
    nom: "granulats marins",
    description:
      "Domaine auquel appartiennent les substances de carrières situés dans les fonds marins du domaine public.",
    ordre: 2,
  },
};
