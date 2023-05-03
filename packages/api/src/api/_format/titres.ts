import { ITitre, IGeoJson, IFields, ITitreDemarche } from '../../types.js'

import { geojsonFeatureMultiPolygon, geojsonFeatureCollectionPoints } from '../../tools/geojson.js'

import { entrepriseFormat } from './entreprises.js'
import { titreActiviteFormat } from './titres-activites.js'
import { titreDemarcheFormat } from './titres-demarches.js'
import { titreFormatFields } from './_fields.js'
import { AdministrationId, Administrations, ADMINISTRATION_TYPES } from 'camino-common/src/static/administrations.js'
import { onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes.js'

// optimisation possible pour un expert SQL
// remplacer le contenu de ce fichier
// par des requêtes SQL (dans /database/queries/titres)
// qui retournent les données directement formatées
export const titreFormat = (t: ITitre, fields: IFields = titreFormatFields) => {
  if (t.confidentiel) {
    // Si le titre est confidentiel, on a le droit de voir que son périmètre sur la carte
    t = {
      titreStatutId: t.titreStatutId,
      typeId: t.typeId,
      type: t.type,
      points: t.points,
      secteursMaritime: t.secteursMaritime,
      forets: t.forets,
      communes: t.communes,
      demarches: [] as ITitreDemarche[],
    } as ITitre
  }

  if (!fields) return t

  if (fields.geojsonMultiPolygon && t.points?.length) {
    t.geojsonMultiPolygon = geojsonFeatureMultiPolygon(t.points) as IGeoJson
  }

  if (fields.geojsonPoints && t.points?.length) {
    t.geojsonPoints = geojsonFeatureCollectionPoints(t.points) as unknown as IGeoJson
  }

  if (fields.geojsonCentre && t.coordonnees && t.propsTitreEtapesIds.points) {
    t.geojsonCentre = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [t.coordonnees.x, t.coordonnees.y],
      },
      properties: { etapeId: t.propsTitreEtapesIds.points },
    }
  }

  if (fields.demarches && t.demarches?.length) {
    t.demarches = t.demarches.map(td => titreDemarcheFormat(td, fields.demarches))
  }

  if (fields.surface && t.surfaceEtape) {
    t.surface = t.surfaceEtape.surface
  }

  if (fields.activites && t.activites?.length) {
    t.activites = t.activites.map(ta => {
      ta.titre = t

      return titreActiviteFormat(ta)
    })
  }

  if (fields.administrations) {
    t.administrations = titreAdministrationsGet(t)
  }

  t.titulaires = t.titulaires?.map(entrepriseFormat)

  t.amodiataires = t.amodiataires?.map(entrepriseFormat)

  return t
}

export const titreAdministrationsGet = (titre: ITitre): AdministrationId[] => {
  const ids: AdministrationId[] = getGestionnairesByTitreTypeId(titre.typeId)
    .filter(({ associee }) => !associee)
    .map(({ administrationId }) => administrationId)

  if (titre.administrationsLocales) {
    ids.push(...titre.administrationsLocales)
  }

  return ids
    .filter(onlyUnique)
    .map(id => Administrations[id])
    .sort((a, b) => ADMINISTRATION_TYPES[a.typeId].ordre - ADMINISTRATION_TYPES[b.typeId].ordre)
    .map(({ id }) => id)
}

export const titresFormat = (titres: ITitre[], fields = titreFormatFields) =>
  titres &&
  titres.reduce((acc: ITitre[], titre) => {
    const titreFormated = titreFormat(titre, fields)

    if (titreFormated) {
      acc.push(titreFormated)
    }

    return acc
  }, [])
