import { ITitreEtape, IGeoJson } from '../../types.js'

import {
  geojsonFeatureMultiPolygon,
  geojsonFeatureCollectionPoints
} from '../../tools/geojson.js'
import { DocumentTypeData, etapeTypeFormat } from './etapes-types.js'
import { entrepriseFormat } from './entreprises.js'
import { titreEtapeFormatFields } from './_fields.js'
import { titreDemarcheFormat } from './titres-demarches.js'
import { titreEtapeCompleteValidate } from '../../business/validations/titre-etape-updation-validate.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'

export const titreEtapeFormat = (
  titreEtape: ITitreEtape,
  fields = titreEtapeFormatFields,
  documentTypeData: DocumentTypeData | null = null
) => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(
      titreEtape.demarche,
      fields.demarche
    )
  }

  if (titreEtape.type) {
    titreEtape.type = etapeTypeFormat(
      titreEtape,
      titreEtape.sectionsSpecifiques,
      titreEtape.justificatifsTypesSpecifiques,
      documentTypeData
    )
  }

  if (!fields) return titreEtape

  if (titreEtape.points && titreEtape.points.length) {
    if (fields.geojsonMultiPolygon) {
      titreEtape.geojsonMultiPolygon = geojsonFeatureMultiPolygon(
        titreEtape.points
      ) as IGeoJson
    }

    if (fields.geojsonPoints) {
      titreEtape.geojsonPoints = geojsonFeatureCollectionPoints(
        titreEtape.points
      ) as unknown as IGeoJson
    }
  }

  if (!titreEtape.modification) {
    delete titreEtape.heritageProps
    delete titreEtape.heritageContenu
  }

  titreEtape.titulaires = titreEtape.titulaires?.map(entrepriseFormat)

  titreEtape.amodiataires = titreEtape.amodiataires?.map(entrepriseFormat)

  if (
    titreEtape.typeId === ETAPES_TYPES.demande &&
    titreEtape.statutId === ETAPES_STATUTS.EN_CONSTRUCTION &&
    titreEtape.modification
  ) {
    const errors = titreEtapeCompleteValidate(
      titreEtape,
      titreEtape.demarche!.titre!.typeId,
      titreEtape.demarche!.typeId,
      titreEtape.type!.sections!,
      titreEtape?.type?.documentsTypes ?? [],
      titreEtape.documents,
      titreEtape.type!.justificatifsTypes!,
      titreEtape.justificatifs,
      titreEtape.sdomZones
    )

    titreEtape.deposable = errors.length === 0
  }

  return titreEtape
}
