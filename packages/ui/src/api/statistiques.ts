import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'

export const statistiquesGlobales = apiGraphQLFetch(gql`
  query StatistiquesGlobales {
    statistiquesGlobales {
      titresActivitesBeneficesEntreprise
      titresActivitesBeneficesAdministration
      recherches {
        mois
        quantite
      }
      titresModifies {
        mois
        quantite
      }
      actions
      sessionDuree
      telechargements
      demarches
      signalements
      reutilisations
    }
  }
`)
