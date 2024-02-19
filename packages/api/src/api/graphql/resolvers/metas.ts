import { IDocumentRepertoire } from '../../../types.js'

import { demarchesStatutsGet, devisesGet, documentsTypesGet } from '../../../database/queries/metas.js'

import { sortedGeoSystemes } from 'camino-common/src/static/geoSystemes.js'
import { UNITES } from 'camino-common/src/static/unites.js'
import { Pays, PaysList } from 'camino-common/src/static/pays.js'
import { Departement, Departements } from 'camino-common/src/static/departement.js'
import { Region, Regions } from 'camino-common/src/static/region.js'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts.js'
import { titresStatutsArray } from 'camino-common/src/static/titresStatuts.js'
import { phasesStatuts as staticPhasesStatuts } from 'camino-common/src/static/phasesStatuts.js'
import { sortedReferencesTypes } from 'camino-common/src/static/referencesTypes.js'
import { sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { sortedAdministrationTypes } from 'camino-common/src/static/administrations.js'
import { sortedDomaines } from 'camino-common/src/static/domaines.js'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes.js'

export const devises = async () => devisesGet()

export const geoSystemes = () => sortedGeoSystemes

export const unites = () => UNITES

export const documentsTypes = async ({ repertoire, typeId }: { repertoire: IDocumentRepertoire; typeId?: string }) => {
  try {
    return await documentsTypesGet({ repertoire, typeId })
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const referencesTypes = () => sortedReferencesTypes

export const domaines = () => sortedDomaines

export const types = () => sortedTitreTypesTypes

export const statuts = () => titresStatutsArray

export const demarchesTypes = () => sortedDemarchesTypes

export const demarchesStatuts = async () => {
  try {
    return await demarchesStatutsGet()
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const etapesStatuts = () => Object.values(EtapesStatuts)

export const version = () => process.env.APPLICATION_VERSION

/**
 * Retourne les types d'administrations
 *
 * @returns un tableau de types d'administrations
 */
export const administrationsTypes = () => {
  try {
    return sortedAdministrationTypes
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const pays = (): Pays[] => Object.values(PaysList)

export const departements = (): Departement[] => Object.values(Departements)

export const regions = (): Region[] => Object.values(Regions)

export const phasesStatuts = () => staticPhasesStatuts
