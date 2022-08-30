import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

import {
  fragmentActiviteType,
  fragmentActiviteStatut,
  fragmentActiviteTypeTitreType,
  fragmentActiviteTypeDocumentType,
  fragmentActiviteTypePays
} from './fragments/metas-activites'

import { fragmentTitreTypeType } from './fragments/metas'

const activitesMetas = apiGraphQLFetch(
  gql`
    query MetasActivites {
      activitesTypes {
        ...activiteType
      }
      activitesStatuts {
        ...activiteStatut
      }

      types {
        ...titreTypeType
      }

      statuts {
        id
        nom
        couleur
      }

      entreprises {
        elements {
          id
          nom
        }
      }
    }

    ${fragmentActiviteType}

    ${fragmentActiviteStatut}

    ${fragmentTitreTypeType}
  `
)

const activitesTypes = apiGraphQLFetch(
  gql`
    query ActivitesTypes {
      activitesTypes {
        ...activiteType
      }
    }

    ${fragmentActiviteType}
  `
)

const activitesStatuts = apiGraphQLFetch(
  gql`
    query ActivitesStatuts {
      activitesStatuts {
        ...activiteStatut
      }
    }

    ${fragmentActiviteStatut}
  `
)

const activitesTypesDocumentsTypes = apiGraphQLFetch(
  gql`
    query ActivitesTypesDocumentsTypes {
      activitesTypesDocumentsTypes {
        ...activiteTypeDocumentType
      }
    }

    ${fragmentActiviteTypeDocumentType}
  `
)

const activitesTypesPays = apiGraphQLFetch(
  gql`
    query ActivitesTypesPays {
      activitesTypesPays {
        ...activiteTypePays
      }
    }

    ${fragmentActiviteTypePays}
  `
)

export {
  activitesMetas,
  activitesTypes,
  activitesStatuts,
  activitesTypesDocumentsTypes,
  activitesTypesPays
}
