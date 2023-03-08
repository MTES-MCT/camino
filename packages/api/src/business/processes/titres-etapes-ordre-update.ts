import { DemarcheId, ITitreEtape } from '../../types.js'

import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titreEtapesSortAscByDate } from '../utils/titre-etapes-sort.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getDemarches } from './titres-etapes-heritage-contenu-update.js'
import { UserNotNull } from 'camino-common/src/roles.js'

export const titresEtapesOrdreUpdate = async (user: UserNotNull, demarcheId?: DemarcheId) => {
  console.info()
  console.info('ordre des étapes…')

  const titresDemarches = await getDemarches(demarcheId)

  return titresEtapesOrdreUpdateVisibleForTesting(user, titresDemarches)
}

export const titresEtapesOrdreUpdateVisibleForTesting = async (
  user: UserNotNull,
  titresDemarches: {
    [key: DemarcheId]: {
      etapes: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>[]
      id: DemarcheId
      typeId: DemarcheTypeId
      titreTypeId: TitreTypeId
      titreId: string
    }
  }
): Promise<string[]> => {
  const titresEtapesIdsUpdated: string[] = []

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (titreDemarche.etapes) {
      const etapes = titreEtapesSortAscByDate(titreDemarche.etapes, titreDemarche.id, titreDemarche.typeId, titreDemarche.titreTypeId)
      for (let index = 0; index < etapes.length; index++) {
        const titreEtape = etapes[index]
        if (titreEtape.ordre !== index + 1) {
          await titreEtapeUpdate(titreEtape.id, { ordre: index + 1 }, user, titreDemarche.titreId)

          console.info('titre / démarche / étape : ordre (mise à jour) ->', `${titreEtape.id} : ${index + 1}`)

          titresEtapesIdsUpdated.push(titreEtape.id)
        }
      }
    }
  }

  return titresEtapesIdsUpdated
}
