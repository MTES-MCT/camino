import { demarchesStatutsGet, devisesGet } from '../../../database/queries/metas'
import { sortedGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { UNITES } from 'camino-common/src/static/unites'
import { Pays, PaysList } from 'camino-common/src/static/pays'
import { Departement, Departements } from 'camino-common/src/static/departement'
import { Region, Regions } from 'camino-common/src/static/region'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { titresStatutsArray } from 'camino-common/src/static/titresStatuts'
import { phasesStatuts as staticPhasesStatuts } from 'camino-common/src/static/phasesStatuts'
import { sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { sortedAdministrationTypes } from 'camino-common/src/static/administrations'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitreTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { sortedDocumentTypes } from 'camino-common/src/static/documentsTypes'
import { config } from '../../../config/index'

export const devises = async () => devisesGet()

export const geoSystemes = () => sortedGeoSystemes

export const unites = () => UNITES

export const documentsTypes = () => sortedDocumentTypes

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

export const version = () => config().APPLICATION_VERSION

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
