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
    typeId
    statutId
    demarcheDateDebut
    demarcheDateFin
    etapes {
      ...titreEtape
    }

    modification
    suppression
  }

  ${fragmentTitreEtape}
  ${fragmentDemarcheType}
`
