import gql from 'graphql-tag'

export const fragmentGeojsonMultiPolygon = gql`
  fragment geojsonMultiPolygon on GeojsonMultiPolygon {
    type
    geometry {
      type
      coordinates
    }
  }
`

export const fragmentPerimetreAlerte = gql`
  fragment perimetreAlerte on PerimetreAlerte {
    message
    url
  }
`

export const fragmentPerimetreInformations = gql`
  fragment perimetreInformations on PerimetreInformations {
    surface
    documentTypeIds
    alertes {
      ...perimetreAlerte
    }
  }

  ${fragmentPerimetreAlerte}
`
