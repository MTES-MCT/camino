import gql from 'graphql-tag'

import { fragmentDemarchesTitre } from './titre'

export const fragmentDemarches = gql`
  fragment demarches on Demarche {
    id
    slug
    ordre
    titre {
      ...demarchesTitre
    }
    typeId
    statutId

    modification
    suppression
  }

  ${fragmentDemarchesTitre}
`