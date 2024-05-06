import '../init.js'

import { organismesDepartementsGet } from '../tools/api-administrations/index.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import { DepartementId } from 'camino-common/src/static/departement.js'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const administrationsUpdate = async () => {
  console.info()
  console.info('administrations…')

  // // mise à jour de l'administrations grâce à l'API Administration
  const departementsIds = Object.values(Administrations)
    .map(a => a.departementId)
    .filter((a: DepartementId | undefined): a is DepartementId => a !== undefined)
    .map<{ departementId: DepartementId; nom: 'paris_ppp' | 'prefecture' }>(departementId => ({
      departementId,
      // TODO 2023-04-11 pour la DGTM, https://etablissements-publics.api.gouv.fr/v3/departements/973/dreal_ut
      nom: departementId === '75' ? 'paris_ppp' : 'prefecture',
    }))

  const newAdministrations = await organismesDepartementsGet(departementsIds)

  if (!newAdministrations) return

  const administrations = { ...Administrations }

  newAdministrations.forEach(a => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    administrations[a.id] = a
  })
  

  const administrationFile = join(process.cwd(), '../common/src/static/administrations.ts')
  const data = readFileSync(administrationFile, {
    encoding: 'utf-8',
  })

  const startComment = '// ----- ne pas supprimer cette ligne : début'
  const stopComment = '// ----- ne pas supprimer cette ligne : fin'
  const startIndex = data.indexOf(startComment)
  const preCode = data.slice(0, startIndex + startComment.length + 1)
  const postCode = data.slice(data.indexOf(stopComment))

  const code = JSON.stringify(administrations, null, 3)

  writeFileSync(administrationFile, preCode + code + postCode)
}

administrationsUpdate()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
