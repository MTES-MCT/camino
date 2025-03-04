import { IContenu } from '../../types'
import { EtapeStatutId, EtapeStatutKey, ETAPES_STATUTS, isStatut, etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, etapeTypeIdValidator, isEtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { EtapeTypeEtapeStatut } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds, DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { Departements, toDepartementId } from 'camino-common/src/static/departement'
import { Regions } from 'camino-common/src/static/region'
import { PaysId } from 'camino-common/src/static/pays'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { z } from 'zod'
import { ETAPE_IS_NOT_BROUILLON, etapeBrouillonValidator, etapeIdValidator } from 'camino-common/src/etape'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, Nullable } from 'camino-common/src/typescript-tools'
import { KM2, km2Validator } from 'camino-common/src/number'
import { concurrenceValidator, Consentement, DemarcheVisibilite } from 'camino-common/src/etape-form'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { DemarcheTypeId, isDemarcheTypeAnnulation, isDemarcheTypeProlongations, isDemarcheTypeWithPhase } from 'camino-common/src/static/demarchesTypes'

export type Concurrence = z.infer<typeof concurrenceValidator>
export interface Etape {
  // TODO 2022-07-28 : ceci pourrait être réduit en utilisant les états de 'trad'
  etapeTypeId: EtapeTypeId
  etapeStatutId: EtapeStatutId
  date: CaminoDate
  dateDebut?: CaminoDate | null
  dateFin?: CaminoDate | null
  duree?: number | null
  contenu?: IContenu
  paysId?: PaysId
  surface?: KM2
  concurrence?: Concurrence
  hasTitreFrom?: boolean
  consentement?: Consentement
}

export const globalGuards = {
  isVisibilitePublique: ({ context }) => context.visibilite === 'publique',
  isVisibiliteConfidentielle: ({ context }) => context.visibilite === 'confidentielle',
  isDemarcheStatutAcceptee: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.Accepte,
  isDemarcheStatutAccepteeEtPublie: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.AccepteEtPublie,
  isDemarcheStatutEnInstruction: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
  isDemarcheStatutEnConstruction: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnConstruction,
} as const satisfies Record<string, (value: { context: CaminoCommonContext }) => boolean>

type EventWithDateDebutFinAndDuree = {
  date: CaminoDate
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
  duree: number | null
}
type EventWithDateDebut = {
  date: CaminoDate
  dateDebut: CaminoDate | null
}
type EventWithDate = {
  date: CaminoDate
}

export const demarcheDateMiseAJourAbrogation = (context: CaminoCommonContext, event: EventWithDate): CaminoCommonContextDemarcheDates => ({
  debut: context.demarcheDates.debut,
  fin: isDemarcheTypeWithPhase(context.demarcheTypeId) ? { dateFin: event.date, duree: null } : context.demarcheDates.fin,
  effet: context.demarcheDates.effet,
})

export const demarcheDateMiseAJourRejet = (context: CaminoCommonContext, event: EventWithDateDebut): CaminoCommonContextDemarcheDates => ({
  debut: isDemarcheTypeProlongations(context.demarcheTypeId) ? getDemarcheDateDebut(context.demarcheTypeId, context.demarcheDates.debut, event) : context.demarcheDates.debut,
  fin: isDemarcheTypeProlongations(context.demarcheTypeId) ? { dateFin: event.date, duree: null } : context.demarcheDates.fin,
  effet: null,
})
export const demarcheDateMiseAJourDemande = (context: CaminoCommonContext, event: EventWithDate): CaminoCommonContextDemarcheDates => ({
  debut: isDemarcheTypeProlongations(context.demarcheTypeId) ? { dateEtape: event.date, dateDebut: null } : { dateDebut: null, dateEtape: null },
  fin: context.demarcheDates.fin,
  effet: context.demarcheDates.effet,
})
export const demarcheDateMiseAJourTous = (context: CaminoCommonContext, event: EventWithDateDebutFinAndDuree): CaminoCommonContextDemarcheDates => {
  return {
    debut: getDemarcheDateDebut(context.demarcheTypeId, context.demarcheDates.debut, event),
    fin: getDemarcheDateFin(context.demarcheTypeId, context.demarcheDates.fin, event),
    effet: getDemarcheDateEffet(context.demarcheTypeId, context.demarcheDates.effet, event),
  }
}

export const demarcheDateSuiteAClassementSansSuiteOuDesistement = (context: CaminoCommonContext, event: { date: CaminoDate }): CaminoCommonContextDemarcheDates => {
  return {
    debut: context.demarcheDates.debut,
    fin: isDemarcheTypeProlongations(context.demarcheTypeId) ? { dateFin: event.date, duree: null } : { dateFin: null, duree: null },
    effet: null,
  }
}

interface CaminoCommonContextDemarcheDates {
  debut: CaminoMachineDateDebut
  fin: CaminoMachineDateFin | CaminoMachineDateFinInfini
  effet: CaminoDate | null
}
export interface CaminoCommonContext {
  demarcheStatut: DemarcheStatutId
  demarcheTypeId: DemarcheTypeId
  demarcheDates: CaminoCommonContextDemarcheDates
  visibilite: DemarcheVisibilite
}

export const getDemarcheDateEffet = (demarcheTypeId: DemarcheTypeId, oldDateEffet: CaminoDate | null, event: { date: CaminoDate }): CaminoDate | null => {
  if (isDemarcheTypeAnnulation(demarcheTypeId)) {
    return isNotNullNorUndefined(oldDateEffet) ? oldDateEffet : event.date
  }

  return null
}

export const isDemarcheDateFinInfinie = (demarcheDateFin: CaminoMachineDateFin | CaminoMachineDateFinInfini): demarcheDateFin is CaminoMachineDateFinInfini =>
  demarcheDateFin.dateFin === 'TITRE_INFINI'
export type CaminoMachineDateDebut = { dateDebut: CaminoDate; dateEtape: null } | { dateDebut: null; dateEtape: CaminoDate } | { dateDebut: null; dateEtape: null }
export const getDemarcheDateDebut = (demarcheTypeId: DemarcheTypeId, oldDateDebut: CaminoMachineDateDebut, event: { date: CaminoDate; dateDebut: CaminoDate | null }): CaminoMachineDateDebut => {
  if (!isDemarcheTypeWithPhase(demarcheTypeId)) {
    return { dateDebut: null, dateEtape: null }
  }

  if (isNotNullNorUndefined(event.dateDebut)) {
    return { dateDebut: event.dateDebut, dateEtape: null }
  }

  if (isNotNullNorUndefined(oldDateDebut.dateDebut)) {
    return { dateDebut: oldDateDebut.dateDebut, dateEtape: null }
  }

  return { dateDebut: null, dateEtape: oldDateDebut.dateEtape ?? event.date }
}
type CaminoMachineDateFinInfini = { dateFin: 'TITRE_INFINI'; duree: null }
export type CaminoMachineDateFin = { dateFin: CaminoDate; duree: null } | { dateFin: null; duree: number } | { dateFin: null; duree: null }
export const getDemarcheDateFin = (
  demarcheTypeId: DemarcheTypeId,
  old: CaminoMachineDateFin | CaminoMachineDateFinInfini,
  event: {
    dateFin: CaminoDate | null
    duree: number | null
  }
): CaminoMachineDateFin | CaminoMachineDateFinInfini => {
  if (!isDemarcheTypeWithPhase(demarcheTypeId)) {
    return { dateFin: null, duree: null }
  }

  if (isNullOrUndefined(event.dateFin) && isNullOrUndefined(event.duree)) {
    if (isNullOrUndefined(old.dateFin) && isNullOrUndefined(old.duree)) {
      return { dateFin: 'TITRE_INFINI', duree: null }
    }

    return old
  }

  if (isNotNullNorUndefined(event.dateFin)) {
    return { dateFin: event.dateFin, duree: null }
  }
  if (isNotNullNorUndefined(event.duree)) {
    return { dateFin: null, duree: event.duree }
  }
  throw new Error(`Impossible de calculer la date de fin de la démarche old: ${old}, event: ${event}`)
}

export const titreEtapeForMachineValidator = z.object({
  ordre: z.number(),
  id: etapeIdValidator,
  typeId: etapeTypeIdValidator,
  statutId: etapeStatutIdValidator,
  date: caminoDateValidator,
  duree: z.number().nullable().optional(),
  dateDebut: caminoDateValidator.nullable().optional(),
  dateFin: caminoDateValidator.nullable().optional(),
  //TODO 2024-10-02 ce validator est utilisé pour ITitreEtape donc nous sommes obligés de mettre tous les champs suivants optional et nullable
  contenu: z.any().nullable().optional(),
  heritageContenu: z.any().nullable().optional(),
  concurrence: z
    .union([concurrenceValidator, z.literal('non-applicable')])
    .nullable()
    .optional(),
  demarcheIdsConsentement: z.array(demarcheIdValidator),
  communes: z
    .array(z.object({ id: communeIdValidator }))
    .nullable()
    .optional(),
  surface: km2Validator.nullable().optional(),
  isBrouillon: etapeBrouillonValidator,
  hasTitreFrom: z
    .union([z.boolean(), z.literal('non-applicable')])
    .nullable()
    .optional(),
})

export type TitreEtapeForMachine = z.infer<typeof titreEtapeForMachineValidator>
export const toMachineEtapes = (etapes: (Pick<Nullable<Partial<TitreEtapeForMachine>>, 'ordre'> & Omit<TitreEtapeForMachine, 'id' | 'ordre'>)[]): Etape[] => {
  // TODO 2022-10-12 si on appelle titreEtapesSortAscByOrdre on se retrouve avec une grosse dépendance cyclique
  return etapes
    .filter(dbEtape => dbEtape.isBrouillon === ETAPE_IS_NOT_BROUILLON)
    .toSorted((a, b) => a.ordre! - b.ordre!)
    .map(dbEtape => toMachineEtape(dbEtape))
}

const toMachineEtape = (dbEtape: Omit<TitreEtapeForMachine, 'id' | 'ordre'>): Etape => {
  let typeId
  if (isEtapeTypeId(dbEtape.typeId)) {
    typeId = dbEtape.typeId
  } else {
    throw new Error(`l'état ${dbEtape.typeId} est inconnu`)
  }
  let statutId
  if (isStatut(dbEtape.statutId)) {
    statutId = dbEtape.statutId
  } else {
    console.error(`le status ${dbEtape.statutId} est inconnu, ${JSON.stringify(dbEtape)}`)
    throw new Error(`le status ${dbEtape.statutId} est inconnu, ${JSON.stringify(dbEtape)}`)
  }

  const machineEtape: Etape = {
    date: dbEtape.date,
    dateDebut: dbEtape.dateDebut,
    dateFin: dbEtape.dateFin,
    duree: dbEtape.duree,
    etapeTypeId: typeId,
    etapeStatutId: statutId,
  }
  if (dbEtape.concurrence !== 'non-applicable') {
    machineEtape.concurrence = dbEtape.concurrence ?? undefined
  }
  if (dbEtape.hasTitreFrom !== 'non-applicable') {
    machineEtape.hasTitreFrom = dbEtape.hasTitreFrom ?? undefined
  }
  if (isNotNullNorUndefined(dbEtape.contenu)) {
    machineEtape.contenu = dbEtape.contenu
  }
  if (isNotNullNorUndefinedNorEmpty(dbEtape.communes)) {
    machineEtape.paysId = Regions[Departements[toDepartementId(dbEtape.communes[0].id)].regionId].paysId
  }
  if (dbEtape.surface !== null) {
    machineEtape.surface = dbEtape.surface
  }
  if (isNotNullNorUndefinedNorEmpty(dbEtape.demarcheIdsConsentement)) {
    machineEtape.consentement = 'à faire'
  } else {
    machineEtape.consentement = 'non-applicable'
  }
  return machineEtape
}

export const tags = {
  responsable: {
    [ADMINISTRATION_IDS['DGTM - GUYANE']]: 'responsableDGTM',
  },
} as const

export type Intervenant = keyof (typeof tags)['responsable']

export const intervenants = Object.keys(tags.responsable) as Array<keyof typeof tags.responsable>

export type DBEtat = {
  [key in EtapeStatutKey]?: EtapeTypeEtapeStatut<EtapeTypeId, (typeof ETAPES_STATUTS)[key]>
}
