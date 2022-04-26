import { organismesDepartementsGet } from '../../tools/api-administrations/index'
import { Administrations } from 'camino-common/src/administrations'

const administrationsUpdate = async () => {
  console.info()
  console.info('administrations…')

  // mise à jour de l'administrations grâce à l'API Administration
  const departementsIds = Object.values(Administrations)
    .map(a => a.departement_id)
    .filter((a: string | undefined): a is string => a !== undefined)
    .map(departementId => ({
      departementId,
      nom: departementId === '75' ? 'paris_ppp' : 'prefecture'
    }))

  const administrationsNew = await organismesDepartementsGet(departementsIds)

  if (!administrationsNew) return

  console.log(administrationsNew)

  // TODO 2022-04-26 mettre à jour la liste des administration
}

export { administrationsUpdate }
