import '../init'

import { organismesDepartementsGet } from '../tools/api-administrations'
import { Administrations } from 'camino-common/src/static/administrations'
import { DepartementId } from 'camino-common/src/static/departement'
import { readFileSync, writeFileSync } from 'fs'

const administrationsUpdate = async () => {
  console.info()
  console.info('administrations…')

  // // mise à jour de l'administrations grâce à l'API Administration
  const departementsIds = Object.values(Administrations)
    .map(a => a.departementId)
    .filter(
      (a: DepartementId | undefined): a is DepartementId => a !== undefined
    )
    .map(departementId => ({
      departementId,
      nom: departementId === '75' ? 'paris_ppp' : 'prefecture'
    }))

  const newAdministrations = await organismesDepartementsGet(departementsIds)

  if (!newAdministrations) return

  const administrations = { ...Administrations }

  newAdministrations.forEach(a => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    administrations[a.id] = a
  })

  const data = readFileSync('packages/common/src/administrations.ts', {
    encoding: 'utf-8'
  })

  const startComment = '// ----- ne pas supprimer cette ligne : début'
  const stopComment = '// ----- ne pas supprimer cette ligne : fin'
  const startIndex = data.indexOf(startComment)
  const preCode = data.slice(0, startIndex + startComment.length + 1)
  const postCode = data.slice(data.indexOf(stopComment))

  const code = JSON.stringify(administrations, null, 3)

  writeFileSync(
    'packages/common/src/administrations.ts',
    preCode + code + postCode
  )
}

administrationsUpdate()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
