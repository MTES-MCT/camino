import { Couleur } from './couleurs.js'

export const ETAPES_STATUTS = {
  ACCEPTE: 'acc',
  DEFAVORABLE_AVEC_RESERVES: 'dre',
  EN_COURS: 'enc',
  FAIT: 'fai',
  DEPOSE: 'dep',
  EXEMPTE: 'exe',
  REQUIS: 'req',
  COMPLETE: 'com',
  INCOMPLETE: 'inc',
  FAVORABLE: 'fav',
  DEFAVORABLE: 'def',
  FAVORABLE_AVEC_RESERVE: 'fre',
  AJOURNE: 'ajo',
  REJETE: 'rej',
  TERMINE: 'ter',
  EN_CONSTRUCTION: 'aco',
  NON_APPLICABLE: 'nul',
  PROGRAMME: 'pro'
} as const
export type EtapeStatutId = (typeof ETAPES_STATUTS)[keyof typeof ETAPES_STATUTS]
export type EtapeStatutKey = keyof typeof ETAPES_STATUTS

const etapesStatutsIds = Object.values(ETAPES_STATUTS)

export const isStatut = (statut: string): statut is EtapeStatutId => {
  return etapesStatutsIds.includes(statut)
}

export const isEtapeStatutKey = (etapeStatutKey: string): etapeStatutKey is EtapeStatutKey => {
  return etapeStatutKey in ETAPES_STATUTS
}

export interface EtapeStatut<T = EtapeStatutId> {
  id: T
  nom: string
  couleur: Couleur
  description?: string
}
export const EtapesStatuts: { [key in EtapeStatutId]: EtapeStatut<key> } = {
  acc: {
    id: 'acc',
    nom: 'accepté',
    description: "La demande a fait l’objet d’une décision favorable de l'administration.",
    couleur: 'success'
  },
  aco: {
    id: 'aco',
    nom: 'en construction',
    couleur: 'warning'
  },
  ajo: {
    id: 'ajo',
    nom: 'ajourné',
    couleur: 'warning'
  },
  com: {
    id: 'com',
    nom: 'complet',
    couleur: 'success'
  },
  def: {
    id: 'def',
    nom: 'défavorable',
    couleur: 'error'
  },
  dep: {
    id: 'dep',
    nom: 'déposé',
    couleur: 'success'
  },
  dre: {
    id: 'dre',
    nom: 'défavorable avec réserves',
    couleur: 'warning'
  },
  enc: {
    id: 'enc',
    nom: 'en cours',
    couleur: 'success'
  },
  exe: {
    id: 'exe',
    nom: 'exempté',
    couleur: 'success'
  },
  fai: {
    id: 'fai',
    nom: 'fait',
    couleur: 'success'
  },
  fav: {
    id: 'fav',
    nom: 'favorable',
    couleur: 'success'
  },
  fre: {
    id: 'fre',
    nom: 'favorable avec réserves',
    couleur: 'warning'
  },
  inc: {
    id: 'inc',
    nom: 'incomplet',
    couleur: 'error'
  },
  nul: {
    id: 'nul',
    nom: 'non applicable',
    couleur: 'neutral'
  },
  pro: {
    id: 'pro',
    nom: 'programmé',
    couleur: 'warning'
  },
  rej: {
    id: 'rej',
    nom: 'rejeté',
    description:
      "La demande a fait l’objet d’une décision défavorable de l'administration. Les textes d’applications du code minier prévoient que les décisions de rejet ne font pas l’objet d’une publication. En conséquence, les démarches qui passent au statut “rejeté” dans Camino sont dé-publiées et rendues inaccessibles aux tiers.\n",
    couleur: 'error'
  },
  req: {
    id: 'req',
    nom: 'requis',
    couleur: 'neutral'
  },
  ter: {
    id: 'ter',
    nom: 'terminé',
    description:
      'La démarche engagée unilatéralement par l’administration qui a fait l’objet d’une décision de l’administration. Celle-ci n’a pas fait l’objet d’une demande de la part du titulaire du titre ou de l’autorisation.\n',
    couleur: 'neutral'
  }
}
