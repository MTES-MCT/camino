import { TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { ITitreDemarche, IContenusTitreEtapesIds, IContenuId } from '../../types.js'

import { titreContenuTitreEtapeFind } from '../rules/titre-prop-etape-find.js'
import { isNotNullNorUndefined, isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools.js'

export const contenusTitreEtapesIdsFind = (titreStatutId: TitreStatutId, titreDemarches: ITitreDemarche[], contenuIds?: IContenuId[] | null) => {
  if (isNullOrUndefinedOrEmpty(contenuIds)) return null

  const titrePropsEtapesIds = contenuIds.reduce((contenusTitreEtapesIds: IContenusTitreEtapesIds | null, { sectionId, elementId }) => {
    // trouve l'id de l'étape qui contient l'élément dans la section
    const titreEtape = titreContenuTitreEtapeFind({ sectionId, elementId }, titreDemarches, titreStatutId)

    // si une étape est trouvée
    if (isNotNullNorUndefined(titreEtape)) {
      if (isNullOrUndefined(contenusTitreEtapesIds)) {
        contenusTitreEtapesIds = {}
      }

      if (isNullOrUndefined(contenusTitreEtapesIds[sectionId])) {
        contenusTitreEtapesIds[sectionId] = {}
      }

      contenusTitreEtapesIds[sectionId][elementId] = titreEtape.id
    }

    return contenusTitreEtapesIds
  }, null)

  return titrePropsEtapesIds
}