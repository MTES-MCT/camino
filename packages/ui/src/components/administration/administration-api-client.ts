import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { Utilisateur } from '@/api/api-client'

export type ActiviteTypeEmail = {
  email: string
  activiteTypeId: ActivitesTypesId
}

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
  administrationActivitesTypesEmails: (
    administrationId: AdministrationId
  ) => Promise<ActiviteTypeEmail[]>
  administrationUtilisateurs: (
    administrationId: AdministrationId
  ) => Promise<Utilisateur[]>
  administrationActiviteTypeEmailUpdate: (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => Promise<void>
  administrationActiviteTypeEmailDelete: (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => Promise<void>

  administrationMetas: (
    administrationId: AdministrationId
  ) => Promise<AdministrationMetas>
}

export const administrationApiClient: AdministrationApiClient = {
  administrationActivitesTypesEmails: async (
    administrationId: AdministrationId
  ) =>
    await apiGraphQLFetch(gql`
      query AdministrationActivitesTypesEmails($id: ID!) {
        administrationActivitesTypesEmails(id: $id) {
          email
          activiteTypeId
        }
      }
    `)({ id: administrationId }),

  administrationUtilisateurs: async (administrationId: AdministrationId) => {
    const { utilisateurs } = await apiGraphQLFetch(gql`
      query AdministrationUtilisateurs($id: ID!) {
        administration(id: $id) {
          utilisateurs {
            id
            nom
            prenom
            role
            email
          }
        }
      }
    `)({
      id: administrationId
    })
    return utilisateurs
  },
  administrationActiviteTypeEmailUpdate: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailCreer(
        $administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!
      ) {
        administrationActiviteTypeEmailCreer(
          administrationActiviteTypeEmail: $administrationActiviteTypeEmail
        ) {
          id
        }
      }
    `)(activiteTypeEmail),

  administrationActiviteTypeEmailDelete: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailSupprimer(
        $administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!
      ) {
        administrationActiviteTypeEmailSupprimer(
          administrationActiviteTypeEmail: $administrationActiviteTypeEmail
        ) {
          id
        }
      }
    `)(activiteTypeEmail),

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
