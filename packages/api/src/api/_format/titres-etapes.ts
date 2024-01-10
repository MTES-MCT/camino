import { ITitreEtape, IGeoJson } from '../../types.js'

import { geojsonFeatureMultiPolygon, geojsonFeatureCollectionPoints } from '../../tools/geojson.js'
import { DocumentTypeData, etapeTypeFormat } from './etapes-types.js'
import { entrepriseFormat } from './entreprises.js'
import { titreEtapeFormatFields } from './_fields.js'
import { titreDemarcheFormat } from './titres-demarches.js'

export const titreEtapeFormat = (titreEtape: ITitreEtape, fields = titreEtapeFormatFields, documentTypeData: DocumentTypeData | null = null) => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(titreEtape.demarche, fields.demarche)
  }

  if (titreEtape.type) {
    titreEtape.type = etapeTypeFormat(titreEtape, documentTypeData)
  }

  if (!fields) return titreEtape

  if (titreEtape.points && titreEtape.points.length) {
    if (fields.geojsonMultiPolygon) {
      titreEtape.geojsonMultiPolygon = geojsonFeatureMultiPolygon(titreEtape.points)
    }

    if (fields.geojsonPoints) {
      titreEtape.geojsonPoints = geojsonFeatureCollectionPoints(titreEtape.points) as unknown as IGeoJson
    }
  }

  titreEtape.titulaires = titreEtape.titulaires?.map(entrepriseFormat)

  titreEtape.amodiataires = titreEtape.amodiataires?.map(entrepriseFormat)

  return titreEtape
}
