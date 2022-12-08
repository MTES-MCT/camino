import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'

export type AdministrationMetas = {
  titresTypesTitresStatuts: {
    titreType: {
      id: TitreTypeId
    }
    titreStatutId: TitreStatutId
    titresModificationInterdit: boolean
    etapesModificationInterdit: boolean
    demarchesModificationInterdit: boolean
  }[]
  activitesTypes: {
    id: ActivitesTypesId
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
  titresTypesEtapesTypes: {
    etapeType: {
      id: EtapeTypeId
    }
    titreType: {
      id: TitreTypeId
    }
    creationInterdit: boolean
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
}

export interface AdministrationApiClient {
  administrationMetas: (
    administrationId: AdministrationId
  ) => Promise<AdministrationMetas>
}

export const administrationApiClient: AdministrationApiClient = {
  administrationMetas: async (administrationId: AdministrationId) =>
    await apiGraphQLFetch(gql`
      query Administration($id: ID!) {
        administration(id: $id) {
          titresTypesTitresStatuts {
            titreType {
              id
            }
            titreStatutId
            titresModificationInterdit
            etapesModificationInterdit
            demarchesModificationInterdit
          }
          activitesTypes {
            id
            modificationInterdit
            lectureInterdit
          }
          titresTypesEtapesTypes {
            etapeType {
              id
            }
            titreType {
              id
            }
            creationInterdit
            modificationInterdit
            lectureInterdit
          }
        }
      }
    `)({ id: administrationId })
}
