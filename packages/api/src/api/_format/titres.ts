import { ITitre, ITitreDemarche } from '../../types.js'

import { entrepriseFormat } from './entreprises.js'
import { titreActiviteFormat } from './titres-activites.js'
import { titreDemarcheFormat } from './titres-demarches.js'
import { titreFormatFields } from './_fields.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'
import { FieldsTitre } from '../../database/queries/_options'

// optimisation possible pour un expert SQL
// remplacer le contenu de ce fichier
// par des requêtes SQL (dans /database/queries/titres)
// qui retournent les données directement formatées
export const titreFormat = (t: ITitre, fields: FieldsTitre = titreFormatFields) => {
  if ((t.confidentiel ?? false) === true) {
    // Si le titre est confidentiel, on a le droit de voir que son périmètre sur la carte
    t = {
      titreStatutId: t.titreStatutId,
      typeId: t.typeId,
      secteursMaritime: t.secteursMaritime,
      forets: t.forets,
      communes: t.communes,
      demarches: [] as ITitreDemarche[],
    } as ITitre
  }

  if (isNullOrUndefined(fields)) return t

  if (fields.demarches && t.demarches?.length) {
    t.demarches = t.demarches.map(td => titreDemarcheFormat(td, fields.demarches))
  }

  if (fields.surface && t.pointsEtape) {
    t.surface = t.pointsEtape.surface
  }

  if (fields.activites && t.activites?.length) {
    t.activites = t.activites.map(ta => {
      ta.titre = t

      return titreActiviteFormat(ta)
    })
  }

  if (t.activites?.length) {
    t.activitesAbsentes = t.activites.filter(({ activiteStatutId }) => activiteStatutId === ACTIVITES_STATUTS_IDS.ABSENT).length
    t.activitesEnConstruction = t.activites.filter(({ activiteStatutId }) => activiteStatutId === ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION).length
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

  return ids.filter(onlyUnique)
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
