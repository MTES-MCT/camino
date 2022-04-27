import { organismesDepartementsGet } from '../../tools/api-administrations/index'
import { Administrations } from 'camino-common/src/administrations'
import { DepartementId } from 'camino-common/src/departement'

export const administrationsUpdate = async () => {
  console.info()
  console.info('administrations…')

  // mise à jour de l'administrations grâce à l'API Administration
  const departementsIds = Object.values(Administrations)
    .map(a => a.departementId)
    .filter(
      (a: DepartementId | undefined): a is DepartementId => a !== undefined
    )
    .map(departementId => ({
      departementId,
      nom: departementId === '75' ? 'paris_ppp' : 'prefecture'
    }))

  const administrationsNew = await organismesDepartementsGet(departementsIds)

  if (!administrationsNew) return

  console.log(administrationsNew)

  // TODO 2022-04-26 mettre à jour la liste des administration
}
