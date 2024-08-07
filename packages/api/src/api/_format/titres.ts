import { ITitre, ITitreDemarche } from '../../types'

import { titreDemarcheFormat } from './titres-demarches'
import { titreFormatFields } from './_fields'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { FieldsTitre } from '../../database/queries/_options'

// optimisation possible pour un expert SQL
// remplacer le contenu de ce fichier
// par des requêtes SQL (dans /database/queries/titres)
// qui retournent les données directement formatées
export const titreFormat = (t: ITitre, fields: FieldsTitre = titreFormatFields): ITitre => {
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

  if (fields.demarches && isNotNullNorUndefinedNorEmpty(t.demarches)) {
    t.demarches = t.demarches.map(td => titreDemarcheFormat(td, fields.demarches))
  }

  if (fields.surface && t.pointsEtape) {
    t.surface = t.pointsEtape.surface
  }

  if (fields.activites && isNotNullNorUndefinedNorEmpty(t.activites)) {
    t.activites = t.activites.map(ta => {
      ta.titre = t

      return ta
    })
  }

  if (isNotNullNorUndefinedNorEmpty(t.activites)) {
    t.activitesAbsentes = t.activites.filter(({ activiteStatutId }) => activiteStatutId === ACTIVITES_STATUTS_IDS.ABSENT).length
    t.activitesEnConstruction = t.activites.filter(({ activiteStatutId }) => activiteStatutId === ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION).length
  }

  if (fields.administrations) {
    t.administrations = titreAdministrationsGet(t)
  }

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

export const titresFormat = (titres: ITitre[], fields = titreFormatFields): ITitre[] =>
  titres?.reduce((acc: ITitre[], titre) => {
    const titreFormated = titreFormat(titre, fields)

    if (isNotNullNorUndefined(titreFormated)) {
      acc.push(titreFormated)
    }

    return acc
  }, []) ?? []
