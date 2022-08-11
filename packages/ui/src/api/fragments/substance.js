import gql from 'graphql-tag'

const fragmentSubstance = gql`
  fragment substance on Substance {
    id
    nom
    symbole
    gerep
    description
    legales {
      id
      nom
      description
      domaine {
        id
        nom
      }
    }
  }
`

const fragmentTitreSubstance = gql`
  fragment titreSubstance on TitreSubstance {
    id
    nom
    ordre
    symbole
    gerep
    description
    legales {
      id
      nom
      description
      domaine {
        id
        nom
      }
    }
  }
`

const fragmentTitresSubstance = gql`
  fragment titresSubstance on TitreSubstance {
    id
    nom
  }
`

export { fragmentSubstance, fragmentTitreSubstance, fragmentTitresSubstance }
