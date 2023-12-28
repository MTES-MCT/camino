import { Definition } from '../definition.js'
import { Couleur } from './couleurs.js'
import { z } from 'zod'

const IDS = ['acc', 'cls', 'dep', 'des', 'eco', 'fpm', 'ind', 'ini', 'ins', 'rej', 'ter'] as const
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
  Termine: 'ter',
} as const satisfies Record<string, (typeof IDS)[number]>

export const demarcheStatutIdValidator = z.enum(IDS)
export type DemarcheStatutId = z.infer<typeof demarcheStatutIdValidator>

type DemarcheStatut<T = DemarcheStatutId> = Definition<T> & { couleur: Couleur }

// TODO 2023-10-24 utiliser les couleurs de Sarah
// Attention, impact dans titre/demarche.vue
export const DemarchesStatuts: {
  [key in DemarcheStatutId]: DemarcheStatut<key>
} = {
  acc: {
    id: 'acc',
    nom: 'accepté',
    description: "La demande a fait l’objet d’une décision favorable de l'administration.\n",
    couleur: 'success',
  },
  cls: {
    id: 'cls',
    nom: 'classé sans suite',
    description: 'La demande est classée sans suite par l’administration à défaut de pouvoir mener l’instruction à son terme.\n',
    couleur: 'neutral',
  },
  dep: {
    id: 'dep',
    nom: 'déposé',
    description: 'La demande est déposée auprès du service instructeur.\n',
    couleur: 'warning',
  },
  des: {
    id: 'des',
    nom: 'désisté',
    description:
      'La demande dont le porteur se dessaisit en informant l’administration de son choix de ne pas lui donner suite. Cette démarche demeure publique si elle a fait l’objet d’une consultation du public.',
    couleur: 'neutral',
  },
  eco: {
    id: 'eco',
    nom: 'en construction',
    description: 'Le dossier de demande est en cours d’élaboration par le demandeur.',
    couleur: 'warning',
  },
  fpm: {
    id: 'fpm',
    nom: 'fin de la police des mines',
    description: 'Fin de la police des mines.',
    couleur: 'success',
  },
  ind: {
    id: 'ind',
    nom: 'indéterminé',
    description: 'Les informations contenues dans les étapes de la démarche sont insuffisantes pour en déterminer le statut.\n',
    couleur: 'warning',
  },
  ini: {
    id: 'ini',
    nom: 'initié',
    description: 'La démarche est engagée unilatéralement par l’administration, elle ne fait pas l’objet d’une demande de la part du titulaire du titre ou de l’autorisation.',
    couleur: 'warning',
  },
  ins: {
    id: 'ins',
    nom: 'en instruction',
    description: 'La demande a fait l’objet d’un examen de complétude et de recevabilité.\n',
    couleur: 'warning',
  },
  rej: {
    id: 'rej',
    nom: 'rejeté',
    description:
      "La demande a fait l’objet d’une décision défavorable de l'administration. Les textes d’applications du code minier prévoient que les décisions de rejet ne font pas l’objet d’une publication. En conséquence, les démarches qui passent au statut “rejeté” dans Camino sont dé-publiées et rendues inaccessibles aux tiers.\n",
    couleur: 'error',
  },
  ter: {
    id: 'ter',
    nom: 'terminé',
    description:
      'La démarche engagée unilatéralement par l’administration qui a fait l’objet d’une décision de l’administration. Celle-ci n’a pas fait l’objet d’une demande de la part du titulaire du titre ou de l’autorisation.\n',
    couleur: 'success',
  },
} as const

export const sortedDemarchesStatuts = Object.values(DemarchesStatuts).sort((a, b) => a.nom.localeCompare(b.nom))

export const isDemarcheStatutNonStatue = (demarcheStatutId: DemarcheStatutId | null | undefined): boolean =>
  [DemarchesStatutsIds.EnConstruction, DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(demarcheStatutId)

export const isDemarcheStatutNonValide = (demarcheStatutId: DemarcheStatutId | null | undefined): boolean =>
  [DemarchesStatutsIds.Rejete, DemarchesStatutsIds.Desiste, DemarchesStatutsIds.ClasseSansSuite].includes(demarcheStatutId)
