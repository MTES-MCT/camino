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
import { titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts'
import { TitresTypes } from 'camino-common/src/static/titresTypes'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { sortedDevises } from 'camino-common/src/static/devise'
import { toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'

export const devises = () => sortedDevises

export const geoSystemes = () => sortedGeoSystemes

export const unites = () => UNITES

export const documentsTypes = () => sortedDocumentTypes

export const referencesTypes = () => sortedReferencesTypes

export const domaines = () => sortedDomaines

export const types = () => sortedTitreTypesTypes

export const statuts = () => titresStatutsArray

export const demarchesTypes = () => sortedDemarchesTypes

export const demarchesStatuts = () => sortedDemarchesStatuts

export const etapesStatuts = () => Object.values(EtapesStatuts)

export const version = () => config().APPLICATION_VERSION

/**
 * Retourne les types d'administrations
 *
 * @returns un tableau de types d'administrations
 */
export const administrationsTypes = () => sortedAdministrationTypes

export const pays = (): Pays[] => Object.values(PaysList)

export const departements = (): Departement[] => Object.values(Departements)

export const regions = (): Region[] => Object.values(Regions)

export const phasesStatuts = () => staticPhasesStatuts

export const titresTypes = () => Object.values(TitresTypes)

export const titresTypesTitresStatuts = () => titreTypesStatutsTitresPublicLecture

export const etapesTypesDocumentsTypes = () => toDocuments()
