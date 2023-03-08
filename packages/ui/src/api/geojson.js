import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client'
import { fragmentPoint } from './fragments/point'
import { fragmentPerimetreAlerte, fragmentPerimetreInformations } from '@/api/fragments/geojson'

const pointsImporter = apiGraphQLFetch(gql`
  query PointsImporter($file: FileUpload!, $geoSystemeId: String!, $demarcheId: String!, $etapeTypeId: String!) {
    pointsImporter(fileUpload: $file, geoSystemeId: $geoSystemeId, demarcheId: $demarcheId, etapeTypeId: $etapeTypeId) {
      points {
        ...point
      }
      surface
      documentTypeIds
      alertes {
        ...perimetreAlerte
      }
    }
  }

  ${fragmentPoint}
  ${fragmentPerimetreAlerte}
`)

const perimetreInformations = apiGraphQLFetch(gql`
  query PerimetreInformations($points: [InputPoint]!, $demarcheId: String!, $etapeTypeId: String!) {
    perimetreInformations(points: $points, demarcheId: $demarcheId, etapeTypeId: $etapeTypeId) {
      ...perimetreInformations
    }
  }

  ${fragmentPerimetreInformations}
`)

const titreEtapePerimetreInformations = apiGraphQLFetch(gql`
  query TitreEtapePerimetreInformations($titreEtapeId: String!) {
    titreEtapePerimetreInformations(titreEtapeId: $titreEtapeId) {
      ...perimetreInformations
    }
  }

  ${fragmentPerimetreInformations}
`)

export { pointsImporter, perimetreInformations, titreEtapePerimetreInformations }
