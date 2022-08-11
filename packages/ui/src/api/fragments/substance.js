import gql from 'graphql-tag'

export const fragmentTitreSubstance = gql`
  fragment titreSubstance on TitreSubstance {
    substanceId
    ordre
  }
`
