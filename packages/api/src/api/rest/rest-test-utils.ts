import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeBrouillon, EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TitreId } from 'camino-common/src/validators/titres'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'

export async function etapeCreate(
  typeId?: EtapeTypeId,
  date: CaminoDate = toCaminoDate('2018-01-01'),
  titreTypeId: TitreTypeId = 'arm',
  isBrouillon?: EtapeBrouillon
): Promise<{
  titreDemarcheId: DemarcheId
  titreEtapeId: EtapeId
  titreId: TitreId
}> {
  const titreId = newTitreId()
  const demarcheId = newDemarcheId()
  const etapeId = newEtapeId()
  const myTypeId = isNotNullNorUndefined(typeId) ? typeId : 'mfr'
  await insertTitreGraph({
    id: titreId,
    nom: 'mon titre',
    typeId: titreTypeId,
    titreStatutId: 'ind',
    propsTitreEtapesIds: {},
    demarches: [
      {
        id: demarcheId,
        titreId: titreId,
        typeId: 'oct',

        etapes: [
          {
            id: etapeId,
            typeId: myTypeId,
            statutId: 'fai',
            ordre: 1,
            titreDemarcheId: demarcheId,
            date,
            isBrouillon: isNotNullNorUndefined(isBrouillon) ? isBrouillon : canBeBrouillon(myTypeId),
          },
        ],
      },
    ],
  })

  return { titreId, titreDemarcheId: demarcheId, titreEtapeId: etapeId }
}
