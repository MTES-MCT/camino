import gql from 'graphql-tag'

const fragmentActiviteType = gql`
  fragment activiteType on ActiviteType {
    id
    nom
    dateDebut
    delaiMois
    ordre
    frequenceId
    sections
    description
  }
`

export { fragmentActiviteType }
