import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { titreCreate } from '../../database/queries/titres'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches'
import { titreEtapeCreate } from '../../database/queries/titres-etapes'
import { userSuper } from '../../database/user-super'
import { TitreId } from 'camino-common/src/validators/titres'

export async function etapeCreate(
  typeId?: EtapeTypeId,
  date: CaminoDate = toCaminoDate('2018-01-01'),
  titreTypeId: TitreTypeId = 'arm'
): Promise<{
  titreDemarcheId: DemarcheId
  titreEtapeId: EtapeId
  titreId: TitreId
}> {
  const titre = await titreCreate(
    {
      nom: 'mon titre',
      typeId: titreTypeId,
      titreStatutId: 'ind',
      propsTitreEtapesIds: {},
    },
    {}
  )
  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct',
  })

  const myTypeId = isNotNullNorUndefined(typeId) ? typeId : 'mfr'
  const titreEtape = await titreEtapeCreate(
    {
      typeId: myTypeId,
      statutId: 'fai',
      ordre: 1,
      titreDemarcheId: titreDemarche.id,
      date,
      isBrouillon: canBeBrouillon(myTypeId),
    },
    userSuper,
    titre.id
  )

  return { titreId: titre.id, titreDemarcheId: titreDemarche.id, titreEtapeId: titreEtape.id }
}
