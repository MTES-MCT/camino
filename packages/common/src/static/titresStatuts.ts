import { Definition } from '../definition.js'
import { z } from 'zod'

const TitresStatutKeys = ['dmc', 'dmi', 'ech', 'ind', 'mod', 'val', 'sup'] as const

export const TitresStatutIds = {
  DemandeClassee: 'dmc',
  DemandeInitiale: 'dmi',
  Echu: 'ech',
  Indetermine: 'ind',
  ModificationEnInstance: 'mod',
  SurvieProvisoire: 'sup',
  Valide: 'val',
} as const satisfies Record<string, (typeof TitresStatutKeys)[number]>

export const titreStatutIdValidator = z.enum(TitresStatutKeys)
export type TitreStatutId = z.infer<typeof titreStatutIdValidator>

export const TitresStatuts: {
  [key in TitreStatutId]: Definition<key>
} = {
  dmc: {
    id: 'dmc',
    nom: 'demande classée',
    description: 'Titres et autorisations qui font l’objet d’une démarche initiale d’octroi classée sans suite ou rejetée. Le domaine minier reste ouvert pour les substances et usages visés.',
    ordre: 2,
  },
  dmi: {
    id: 'dmi',
    nom: 'demande initiale',
    description:
      "Titres et autorisations dont la démarche d’octroi est en cours. Le domaine minier reste ouvert pour les substances ou usages visés jusqu’à la fin de la mise en concurrence de la demande. Si la procédure d’octroi ne prévoit pas de mise en concurrence, le domaine minier reste ouvert jusqu'à l’octroi du titre ou de l’autorisation.",
    ordre: 1,
  },
  ech: {
    id: 'ech',
    nom: 'échu',
    description: 'Titres et autorisations sur lesquels le projet minier est terminé. Le domaine minier est ouvert pour les substances et les usages visés.',
    ordre: 6,
  },
  ind: {
    id: 'ind',
    nom: 'indéterminé',
    description: 'Titres et autorisations dont les informations disponibles sont insuffisantes pour en déterminer le statut.',
    ordre: 7,
  },
  mod: {
    id: 'mod',
    nom: 'valide - modification en instance',
    description:
      'Titres et autorisations qui font l’objet d’une démarche de modification de leurs propriétés fondamentales (durée, surface, titulaire, amodiataire, substances). Le domaine minier demeure fermé pour les substances et usages visés par la demande en cours, jusqu\'à ce qu\'il soit statué sur la demande de modification.\r\nTant que l’administration ne s’est pas prononcée par décision expresse, le pétitionnaire bénéficie du droit de poursuivre ses travaux dans les limites du périmètre et des substances visées par la nouvelle demande même après une décision implicite de rejet. Au delà de sa date de validité, le titre est dit en "survie provisoire".',
    ordre: 4,
  },
  sup: {
    id: 'sup',
    nom: 'valide - survie provisoire',
    description:
      'Titres et autorisations qui font l’objet d’une démarche de modification de leurs propriétés fondamentales (durée, surface, titulaire, amodiataire, substances). Le domaine minier demeure fermé pour les substances et usages visés par la demande en cours, jusqu\'à ce qu\'il soit statué sur la demande de modification.\r\nTant que l’administration ne s’est pas prononcée par décision expresse, le pétitionnaire bénéficie du droit de poursuivre ses travaux dans les limites du périmètre et des substances visées par la nouvelle demande même après une décision implicite de rejet. Au delà de sa date de validité, le titre est dit en "survie provisoire".',
    ordre: 5,
  },
  val: {
    id: 'val',
    nom: 'valide',
    description:
      "Titres et autorisations sur lesquels peuvent être mis en oeuvre un projet minier, à compter de la date d'octroi et jusqu’à l’échéance fixée. Le domaine minier est fermé pour les substances et usages visés.",
    ordre: 3,
  },
}

const TITRES_STATUTS_IDS = Object.values(TitresStatutIds)

export const isTitreStatutId = (value: string): value is TitreStatutId => TITRES_STATUTS_IDS.includes(value)

export const sortedTitresStatuts = Object.values(TitresStatuts).sort((a, b) => a.ordre - b.ordre)

export const isTitreValide = (titreStatutId: TitreStatutId) => [TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire].includes(titreStatutId)
