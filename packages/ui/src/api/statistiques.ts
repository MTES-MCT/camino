import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import { QuantiteParMois } from 'camino-common/src/statistiques'

type StatistiquesGlobales = {
  statistiquesGlobales: {
    titresActivitesBeneficesEntreprise: number
    titresActivitesBeneficesAdministration: number
    recherches: QuantiteParMois[]
    titresModifies: QuantiteParMois[]
    actions: number
    sessionDuree: number
    telechargements: number
    demarches: number
    signalements: number
    reutilisations: number
  }
}
export const statistiquesGlobales: () => Promise<StatistiquesGlobales> = apiGraphQLFetch(gql`
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
