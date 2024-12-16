import { GeoSysteme, sortedGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { Unite, UNITES } from 'camino-common/src/static/unites'
import { Pays, PaysList } from 'camino-common/src/static/pays'
import { Departement, Departements } from 'camino-common/src/static/departement'
import { Region, Regions } from 'camino-common/src/static/region'
import { EtapesStatuts, EtapeStatut } from 'camino-common/src/static/etapesStatuts'
import { titresStatutsArray, TitreStatut } from 'camino-common/src/static/titresStatuts'
import { PhaseDefinition, phasesStatuts as staticPhasesStatuts } from 'camino-common/src/static/phasesStatuts'
import { ReferenceType, sortedReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { DemarcheType, sortedDemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { AdministrationType, sortedAdministrationTypes } from 'camino-common/src/static/administrations'
import { Domaine, sortedDomaines } from 'camino-common/src/static/domaines'
import { sortedTitreTypesTypes, TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { DocumentTypeDefinition, sortedDocumentTypes } from 'camino-common/src/static/documentsTypes'
import { config } from '../../../config/index'
import { TitreTypesStatutsTitresPublicLecture, titreTypesStatutsTitresPublicLecture } from 'camino-common/src/static/titresTypes_titresStatuts'
import { TitresTypes, TitreType } from 'camino-common/src/static/titresTypes'
import { DemarcheStatut, sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { Devise, sortedDevises } from 'camino-common/src/static/devise'
import { ToDocument, toDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { Definition } from 'camino-common/src/definition'

export const devises = (): Devise[] => sortedDevises

export const geoSystemes = (): GeoSysteme[] => sortedGeoSystemes

export const unites = (): Unite[] => UNITES

export const documentsTypes = (): DocumentTypeDefinition[] => sortedDocumentTypes

export const referencesTypes = (): ReferenceType[] => sortedReferencesTypes

export const domaines = (): Domaine[] => sortedDomaines

export const types = (): Definition<TitreTypeTypeId>[] => sortedTitreTypesTypes

export const statuts = (): TitreStatut[] => titresStatutsArray

export const demarchesTypes = (): DemarcheType[] => sortedDemarchesTypes

export const demarchesStatuts = (): DemarcheStatut[] => sortedDemarchesStatuts

export const etapesStatuts = (): EtapeStatut[] => Object.values(EtapesStatuts)

export const version = (): string => config().APPLICATION_VERSION

/**
 * Retourne les types d'administrations
 *
 * @returns un tableau de types d'administrations
 */
export const administrationsTypes = (): AdministrationType[] => sortedAdministrationTypes

export const pays = (): Pays[] => Object.values(PaysList)

export const departements = (): Departement[] => Object.values(Departements)

export const regions = (): Region[] => Object.values(Regions)

export const phasesStatuts = (): PhaseDefinition[] => staticPhasesStatuts

export const titresTypes = (): TitreType[] => Object.values(TitresTypes)

export const titresTypesTitresStatuts = (): TitreTypesStatutsTitresPublicLecture[] => titreTypesStatutsTitresPublicLecture

export const etapesTypesDocumentsTypes = (): ToDocument[] => toDocuments()
