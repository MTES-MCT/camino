import { Definition } from '../definition.js'
import { Couleur } from './couleurs.js'

export const DemarchesStatutsIds = {
  Accepte: 'acc',
  ClasseSansSuite: 'cls',
  Depose: 'dep',
  Desiste: 'des',
  EnConstruction: 'eco',
  FinPoliceMines: 'fpm',
  Indetermine: 'ind',
  Initie: 'ini',
  EnInstruction: 'ins',
  Rejete: 'rej',
  Termine: 'ter'
} as const

export type DemarcheStatutId = typeof DemarchesStatutsIds[keyof typeof DemarchesStatutsIds]

export type DemarcheStatut<T = DemarcheStatutId> = Definition<T> & { couleur: Couleur }

export const DemarchesStatuts: {
  [key in DemarcheStatutId]: DemarcheStatut<key>
} = {
  acc: {
    id: 'acc',
    nom: 'accepté',
    description: "La demande a fait l’objet d’une décision favorable de l'administration.\n",
    couleur: 'success',
    ordre: 6
  },
  cls: {
    id: 'cls',
    nom: 'classé sans suite',
    description: 'La demande est classée sans suite par l’administration à défaut de pouvoir mener l’instruction à son terme.\n',
    couleur: 'neutral',
    ordre: 5
  },
  dep: {
    id: 'dep',
    nom: 'déposé',
    description: 'La demande est déposée auprès du service instructeur.\n',
    couleur: 'warning',
    ordre: 2
  },
  des: {
    id: 'des',
    nom: 'désisté',
    description:
      'La demande dont le porteur se dessaisit en informant l’administration de son choix de ne pas lui donner suite. Cette démarche demeure publique si elle a fait l’objet d’une consultation du public.',
    couleur: 'neutral',
    ordre: 8
  },
  eco: {
    id: 'eco',
    nom: 'en construction',
    description: 'Le dossier de demande est en cours d’élaboration par le demandeur.',
    couleur: 'warning',
    ordre: 1
  },
  fpm: {
    id: 'fpm',
    nom: 'fin de la police des mines',
    description: 'Fin de la police des mines.',
    couleur: 'success',
    ordre: 11
  },
  ind: {
    id: 'ind',
    nom: 'indéterminé',
    description: 'Les informations contenues dans les étapes de la démarche sont insuffisantes pour en déterminer le statut.\n',
    couleur: 'warning',
    ordre: 10
  },
  ini: {
    id: 'ini',
    nom: 'initié',
    description: 'La démarche est engagée unilatéralement par l’administration, elle ne fait pas l’objet d’une demande de la part du titulaire du titre ou de l’autorisation.',
    couleur: 'warning',
    ordre: 3
  },
  ins: {
    id: 'ins',
    nom: 'en instruction',
    description: 'La demande a fait l’objet d’un examen de complétude et de recevabilité.\n',
    couleur: 'warning',
    ordre: 4
  },
  rej: {
    id: 'rej',
    nom: 'rejeté',
    description:
      "La demande a fait l’objet d’une décision défavorable de l'administration. Les textes d’applications du code minier prévoient que les décisions de rejet ne font pas l’objet d’une publication. En conséquence, les démarches qui passent au statut “rejeté” dans Camino sont dé-publiées et rendues inaccessibles aux tiers.\n",
    couleur: 'error',
    ordre: 7
  },
  ter: {
    id: 'ter',
    nom: 'terminé',
    description:
      'La démarche engagée unilatéralement par l’administration qui a fait l’objet d’une décision de l’administration. Celle-ci n’a pas fait l’objet d’une demande de la part du titulaire du titre ou de l’autorisation.\n',
    couleur: 'success',
    ordre: 9
  }
} as const

export const sortedDemarchesStatuts = Object.values(DemarchesStatuts).sort((a, b) => a.ordre - b.ordre)
