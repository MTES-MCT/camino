import { Definition } from '../definition.js'
import { z } from 'zod'

const IDS = ['m', 'c', 'f', 'g', 'h', 'r', 's', 'w'] as const
export const domaineIdValidator = z.enum(IDS)
export type DomaineId = z.infer<typeof domaineIdValidator>

export const DOMAINES_IDS = {
  METAUX: 'm',
  CARRIERES: 'c',
  FOSSILES: 'f',
  GEOTHERMIE: 'g',
  HYDROCARBURE: 'h',
  RADIOACTIF: 'r',
  SOUTERRAIN: 's',
  GRANULATS_MARINS: 'w',
} as const satisfies Record<string, DomaineId>

type Domaine<T = DomaineId> = Definition<T>
export const Domaines: { [key in DomaineId]: Domaine<key> } = {
  c: {
    id: 'c',
    nom: 'carrières',
    description:
      'Domaine couvrant les zones spéciales de carrières à terre qui incluent des substances minérales ou fossiles de carrières rares ou nécessaires pour satisfaire les besoins des consommateurs et l’intérêt économique national ou régional.',
  },
  f: {
    id: 'f',
    nom: 'combustibles fossiles',
    description: 'Domaine minier auquel appartiennent les combustibles fossiles, la tourbe exceptée.',
  },
  g: {
    id: 'g',
    nom: 'géothermie',
    description:
      "Domaine auquel appartiennent les gîtes renfermés dans le sein de la terre dont on peut extraire de l'énergie sous forme thermique, notamment par l'intermédiaire des eaux chaudes et des vapeurs souterraines qu'ils contiennent.",
  },
  h: {
    id: 'h',
    nom: 'hydrocarbures liquides ou gazeux',
    description: "Domaine minier auquel appartiennent des hydrocarbures qu'ils soient sous forme liquide ou gazeuse.",
  },
  m: {
    id: 'm',
    nom: 'minéraux et métaux',
    description:
      'Domaine minier auquel appartiennent les substances minérales non énergétiques et non radioactives classées dans la catégorie des substances de mines, notemment certains métaux, gaz, sels et terres-rares.',
  },
  r: {
    id: 'r',
    nom: 'éléments radioactifs',
    description: 'Domaine minier auquel appartiennent les substances minérales radioactives classés dans la catégorie des substances de mines.',
  },
  s: {
    id: 's',
    nom: 'stockages souterrains',
    description:
      "Domaine auquel appartiennent les cavités souterraines naturelles ou artificielles ou formations souterraines naturelles présentant les qualités requises pour constituer des réservoirs étanches ou susceptibles d'être rendus tels, en vue du stockage de gaz naturel, d'hydrocarbures liquides, liquéfiés ou gazeux ou de produits chimiques à destination industrielle.",
  },
  w: {
    id: 'w',
    nom: 'granulats marins',
    description: 'Domaine auquel appartiennent les substances de carrières situés dans les fonds marins du domaine public.',
  },
}

export const sortedDomaines = Object.values(Domaines).sort((a, b) => a.nom.localeCompare(b.nom))

export const domainesIds = Object.values(DOMAINES_IDS)

export const isDomaineId = (domaineId: string | null | undefined): domaineId is DomaineId => domainesIds.includes(domaineId)
