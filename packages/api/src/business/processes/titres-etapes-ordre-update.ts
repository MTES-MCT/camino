import { titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { titreEtapesSortAscByDate } from '../utils/titre-etapes-sort.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getDemarches } from './titres-etapes-heritage-contenu-update.queries.js'
import { UserNotNull } from 'camino-common/src/roles.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { Pool } from 'pg'
import { TitreId } from 'camino-common/src/validators/titres.js'
import { TitreEtapeForMachine, titreEtapeForMachineValidator } from '../rules-demarches/machine-common.js'

export const titresEtapesOrdreUpdate = async (pool: Pool, user: UserNotNull, demarcheId?: DemarcheId) => {
  console.info()
  console.info('ordre des étapes…')

  const titresDemarches = await getDemarches(pool, demarcheId)

  return titresEtapesOrdreUpdateVisibleForTesting(user, titresDemarches)
}

export const titresEtapesOrdreUpdateVisibleForTesting = async (
  user: UserNotNull,
  titresDemarches: {
    [key: DemarcheId]: {
      etapes: TitreEtapeForMachine[]
      id: DemarcheId
      typeId: DemarcheTypeId
      titreTypeId: TitreTypeId
      titreId: TitreId
    }
  }
): Promise<string[]> => {
  const titresEtapesIdsUpdated: string[] = []

  for (const titreDemarche of Object.values(titresDemarches)) {
    if (titreDemarche.etapes) {
      const etapesMachine = titreDemarche.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))

      const etapes = titreEtapesSortAscByDate(etapesMachine, titreDemarche.id, titreDemarche.typeId, titreDemarche.titreTypeId)
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
