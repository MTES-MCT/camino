import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import { fragmentAdministration } from './fragments/administration'
import { fragmentAdministrations } from './fragments/administrations'

const administrationMetas = apiGraphQLFetch(
  gql`
    query AdministrationMetas {
      regions {
        id
        nom
      }

      departements {
        id
        nom
      }

      activitesTypes {
        id
        nom
      }
    }
  `
)

const administrationPermissionsMetas = apiGraphQLFetch(
  gql`
    query AdministrationPermissionsMetas {
      domaines {
        id
        nom
        titresTypes {
          id
          type {
            id
            nom
          }
        }
      }

      statuts {
        id
        nom
      }

      etapesTypes {
        id
        nom
      }
    }
  `
)

const administration = apiGraphQLFetch(gql`
  query Administration($id: ID!) {
    administration(id: $id) {
      ...administration
    }
  }

  ${fragmentAdministration}
`)

const administrations = apiGraphQLFetch(gql`
  query Administrations(
    $intervalle: Int
    $page: Int
    $colonne: String
    $ordre: String
    $noms: String
    $typesIds: [ID]
  ) {
    administrations(
      intervalle: $intervalle
      page: $page
      colonne: $colonne
      ordre: $ordre
      noms: $noms
      typesIds: $typesIds
    ) {
      elements {
        ...administrations
      }
      total
    }
  }

  ${fragmentAdministrations}
`)

const administrationModifier = apiGraphQLFetch(gql`
  mutation AdministrationModifier($administration: InputAdministration!) {
    administrationModifier(administration: $administration) {
      ...administration
    }
  }

  ${fragmentAdministration}
`)

const administrationTitreTypeUpdate = apiGraphQLFetch(gql`
  mutation AdministrationTitreTypeModifier(
    $administrationTitreType: InputAdministrationTitreType!
  ) {
    administrationTitreTypeModifier(
      administrationTitreType: $administrationTitreType
    ) {
      ...administration
    }
  }

  ${fragmentAdministration}
`)

const administrationActiviteTypeUpdate = apiGraphQLFetch(gql`
  mutation AdministrationActiviteTypeModifier(
    $administrationActiviteType: InputAdministrationActiviteType!
  ) {
    administrationActiviteTypeModifier(
      administrationActiviteType: $administrationActiviteType
    ) {
      ...administration
    }
  }

  ${fragmentAdministration}
`)

const administrationActiviteTypeEmailUpdate = apiGraphQLFetch(gql`
  mutation AdministrationActiviteTypeEmailCreer(
    $administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!
  ) {
    administrationActiviteTypeEmailCreer(
      administrationActiviteTypeEmail: $administrationActiviteTypeEmail
    ) {
      id
    }
  }
`)

const administrationActiviteTypeEmailDelete = apiGraphQLFetch(gql`
  mutation AdministrationActiviteTypeEmailSupprimer(
    $administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!
  ) {
    administrationActiviteTypeEmailSupprimer(
      administrationActiviteTypeEmail: $administrationActiviteTypeEmail
    ) {
      id
    }
  }
`)

const administrationTitreTypeTitreStatutUpdate = apiGraphQLFetch(gql`
  mutation AdministrationTitreTypeTitreStatutModifier(
    $administrationTitreTypeTitreStatut: InputAdministrationTitreTypeTitreStatut!
  ) {
    administrationTitreTypeTitreStatutModifier(
      administrationTitreTypeTitreStatut: $administrationTitreTypeTitreStatut
    ) {
      ...administration
    }
  }

  ${fragmentAdministration}
`)

const administrationTitreTypeEtapeTypeUpdate = apiGraphQLFetch(gql`
  mutation AdministrationTitreTypeEtapeTypeModifier(
    $administrationTitreTypeEtapeType: InputAdministrationTitreTypeEtapeType!
  ) {
    administrationTitreTypeEtapeTypeModifier(
      administrationTitreTypeEtapeType: $administrationTitreTypeEtapeType
    ) {
      ...administration
    }
  }

  ${fragmentAdministration}
`)

export {
  administrationMetas,
  administration,
  administrations,
  administrationModifier,
  administrationTitreTypeUpdate,
  administrationTitreTypeTitreStatutUpdate,
  administrationTitreTypeEtapeTypeUpdate,
  administrationActiviteTypeUpdate,
  administrationActiviteTypeEmailUpdate,
  administrationActiviteTypeEmailDelete,
  administrationPermissionsMetas
}
