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
      utilisateurs {
        rattachesAUnTypeDAdministration {
          aut
          dea
          dre
          min
          ope
          pre
        }
        rattachesAUneEntreprise
        visiteursAuthentifies
        total
      }
    }
  }
`)

export const statistiquesGuyane = apiGraphQLFetch(gql`
  query StatistiquesGuyane {
    statistiquesGuyane {
      surfaceExploration
      surfaceExploitation
      titresArm
      titresPrm
      titresAxm
      titresCxm
      annees {
        annee
        titresArm {
          demande
          octroi
          refus
          surface
        }
        titresPrm {
          demande
          octroi
          refus
          surface
        }
        titresAxm {
          demande
          octroi
          refus
          surface
        }
        titresCxm {
          demande
          octroi
          refus
          surface
        }
        orNet
        carburantConventionnel
        carburantDetaxe
        mercure
        environnementCout
        effectifs
        activitesDeposesQuantite
        activitesDeposesRatio
      }
    }
  }
`)
export const statistiquesGranulatsMarins = apiGraphQLFetch(gql`
  query StatistiquesGranulatsMarins {
    statistiquesGranulatsMarins {
      annees {
        annee
        titresPrw {
          quantite
          surface
        }
        titresPxw {
          quantite
          surface
        }
        titresCxw {
          quantite
          surface
        }
        volume
        masse
        activitesDeposesQuantite
        activitesDeposesRatio
        concessionsValides {
          quantite
          surface
        }
      }
      surfaceExploration
      surfaceExploitation
      titresInstructionExploration
      titresValPrw
      titresInstructionExploitation
      titresValCxw
    }
  }
`)
