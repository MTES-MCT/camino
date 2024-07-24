import { IContenu } from '../../types'
import { EtapeStatutId, EtapeStatutKey, ETAPES_STATUTS, isStatut, etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, etapeTypeIdValidator, isEtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { EtapeTypeEtapeStatut } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { Departements, toDepartementId } from 'camino-common/src/static/departement'
import { Regions } from 'camino-common/src/static/region'
import { PaysId } from 'camino-common/src/static/pays'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { z } from 'zod'
import { ETAPE_IS_NOT_BROUILLON, etapeBrouillonValidator, etapeIdValidator } from 'camino-common/src/etape'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { km2Validator } from 'camino-common/src/number'
export interface Etape {
  // TODO 2022-07-28 : ceci pourrait être réduit en utilisant les états de 'trad'
  etapeTypeId: EtapeTypeId
  etapeStatutId: EtapeStatutId
  date: CaminoDate
  contenu?: IContenu
  paysId?: PaysId
  surface?: number
}

export interface CaminoCommonContext {
  demarcheStatut: DemarcheStatutId
  visibilite: 'confidentielle' | 'publique'
}

export const titreEtapeForMachineValidator = z.object({
  ordre: z.number(),
  id: etapeIdValidator,
  typeId: etapeTypeIdValidator,
  statutId: etapeStatutIdValidator,
  date: caminoDateValidator,
  contenu: z.any().nullable().optional().default(null),
  heritageContenu: z.any().nullable().optional().default(null),
  communes: z
    .array(z.object({ id: communeIdValidator }))
    .nullable()
    .optional()
    .default(null),
  surface: km2Validator.nullable().optional().default(null),
  isBrouillon: etapeBrouillonValidator,
})

export type TitreEtapeForMachine = z.infer<typeof titreEtapeForMachineValidator>

export const toMachineEtapes = (etapes: (Pick<Partial<TitreEtapeForMachine>, 'ordre'> & Omit<TitreEtapeForMachine, 'id' | 'ordre'>)[]): Etape[] => {
  // TODO 2022-10-12 si on appelle titreEtapesSortAscByOrdre on se retrouve avec une grosse dépendance cyclique
  return etapes
    .slice()
    .filter(dbEtape => dbEtape.isBrouillon === ETAPE_IS_NOT_BROUILLON)
    .sort((a, b) => a.ordre! - b.ordre!)
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
    etapeTypeId: typeId,
    etapeStatutId: statutId,
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

  return machineEtape
}

export const tags = {
  responsable: {
    [ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']]: 'responsablePTMG',
    [ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]: 'responsableONF',
    [ADMINISTRATION_IDS['DGTM - GUYANE']]: 'responsableDGTM',
  },
} as const

export type Intervenant = keyof (typeof tags)['responsable']

export const intervenants = Object.keys(tags.responsable) as Array<keyof typeof tags.responsable>

export type DBEtat = {
  [key in EtapeStatutKey]?: EtapeTypeEtapeStatut<EtapeTypeId, (typeof ETAPES_STATUTS)[key]>
}
