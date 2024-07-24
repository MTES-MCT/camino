import TitresTitres from '../models/titres--titres'
import { TitreId } from 'camino-common/src/validators/titres'

interface LinkTitre {
  linkTo: TitreId
  linkFrom: TitreId[]
}
export const linkTitres = async (link: LinkTitre): Promise<void> => {
  await TitresTitres.query().where('titreToId', link.linkTo).delete()
  if (link.linkFrom.length) {
    await TitresTitres.query().insert(
      link.linkFrom.map(titreFromId => ({
        titreFromId,
        titreToId: link.linkTo,
      }))
    )
  }
}
