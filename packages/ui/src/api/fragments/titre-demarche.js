import gql from 'graphql-tag'

import { fragmentTitreEtape } from './titre-etape'
import { fragmentDemarcheType } from './metas'

export const fragmentTitreDemarche = gql`
  fragment titreDemarche on Demarche {
    id
    description
    slug
    ordre
    type {
      ...demarcheType
    }
    statutId
    phase {
      dateDebut
      dateFin
      statut {
        id
        nom
        couleur
      }
    }
    etapes {
      ...titreEtape
    }

    modification
    etapesCreation
    suppression
  }

  ${fragmentTitreEtape}
  ${fragmentDemarcheType}
`
