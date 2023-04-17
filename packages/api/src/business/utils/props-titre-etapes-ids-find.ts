import { CaminoDate } from 'camino-common/src/date.js'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { ITitreDemarche, IContenusTitreEtapesIds, IContenuId } from '../../types.js'

import { titreContenuTitreEtapeFind } from '../rules/titre-prop-etape-find.js'

export const contenusTitreEtapesIdsFind = (date: CaminoDate, titreStatutId: TitreStatutId, titreDemarches: ITitreDemarche[], contenuIds?: IContenuId[] | null) => {
  if (!contenuIds) return null

  const titrePropsEtapesIds = contenuIds.reduce((contenusTitreEtapesIds: IContenusTitreEtapesIds | null, { sectionId, elementId }) => {
    // trouve l'id de l'étape qui contient l'élément dans la section
    const titreEtape = titreContenuTitreEtapeFind(date, { sectionId, elementId }, titreDemarches, titreStatutId)

    // si une étape est trouvée
    if (titreEtape) {
      if (!contenusTitreEtapesIds) {
        contenusTitreEtapesIds = {}
      }

      if (!contenusTitreEtapesIds[sectionId]) {
        contenusTitreEtapesIds[sectionId] = {}
      }

      contenusTitreEtapesIds[sectionId][elementId] = titreEtape.id
    }

    return contenusTitreEtapesIds
  }, null)

  return titrePropsEtapesIds
}
