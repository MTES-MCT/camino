import gql from 'graphql-tag'

const fragmentPointReference = gql`
  fragment pointReference on PointReference {
    id
    geoSystemeId
    coordonnees {
      x
      y
    }
    opposable
  }
`

const fragmentPoint = gql`
  fragment point on Point {
    id
    coordonnees {
      x
      y
    }
    groupe
    contour
    point
    nom
    description
    subsidiaire
    lot
    references {
      ...pointReference
    }
  }

  ${fragmentPointReference}
`

export { fragmentPoint, fragmentPointReference }
