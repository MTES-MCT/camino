import { titreEtapeUpdate } from '../../database/queries/titres-etapes'
import { titreEtapesSortAscByDate } from '../utils/titre-etapes-sort'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getDemarches } from './titres-etapes-heritage-contenu-update.queries'
import { UserNotNull } from 'camino-common/src/roles'
import { DemarcheId } from 'camino-common/src/demarche'
import { Pool } from 'pg'
import { TitreId } from 'camino-common/src/validators/titres'
import { TitreEtapeForMachine, titreEtapeForMachineValidator } from '../rules-demarches/machine-common'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

export const titresEtapesOrdreUpdate = async (pool: Pool, user: DeepReadonly<UserNotNull>, demarcheId?: DemarcheId): Promise<string[]> => {
  console.info()
  console.info('ordre des étapes…')

  const titresDemarches = await getDemarches(pool, demarcheId)

  return titresEtapesOrdreUpdateVisibleForTesting(user, titresDemarches)
}

export const titresEtapesOrdreUpdateVisibleForTesting = async (
  user: DeepReadonly<UserNotNull>,
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
    if (isNotNullNorUndefinedNorEmpty(titreDemarche.etapes)) {
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
