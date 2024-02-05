import gql from 'graphql-tag'

import { fragmentTitresEntreprises } from './entreprises'

const fragmentTitres = gql`
  fragment titres on Titre {
    id
    slug
    nom
    typeId
    titreStatutId
    substances
    activitesEnConstruction
    activitesAbsentes
    titulaires {
      ...titresEntreprises
    }
    amodiataires {
      ...titresEntreprises
    }
    communes {
      id
    }
    secteursMaritime
    references {
      referenceTypeId
      nom
    }
  }

  ${fragmentTitresEntreprises}
`

export { fragmentTitres }
