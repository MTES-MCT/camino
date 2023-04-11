import gql from 'graphql-tag'

import { fragmentTitreEtape } from './titre-etape'

export const fragmentTitreDemarche = gql`
  fragment titreDemarche on Demarche {
    id
    description
    slug
    ordre
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
`
