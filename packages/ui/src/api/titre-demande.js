import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

export const titreDemandeCreer = apiGraphQLFetch(gql`
  mutation TitreDemandeCreer($titreDemande: InputTitreDemande!) {
    titreDemandeCreer(titreDemande: $titreDemande) {
      titreEtapeId
      titreId
    }
  }
`)
