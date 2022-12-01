import { ITitreDemarche } from '../../types.js'

import { titreDemarcheUpdate } from '../../database/queries/titres-demarches.js'
import { titresGet } from '../../database/queries/titres.js'
import titreDemarchesSortAsc from '../utils/titre-elements-sort-asc.js'
import { userSuper } from '../../database/user-super.js'

export const titresDemarchesOrdreUpdate = async (titresIds?: string[]) => {
  console.info()
  console.info('ordre des démarches…')

  const titres = await titresGet(
    { ids: titresIds },
    { fields: { demarches: { etapes: { id: {} } } } },
    userSuper
  )

  const titresDemarchesIdsUpdated = [] as string[]

  for (const titre of titres) {
    const titreDemarchesSorted = titreDemarchesSortAsc(
      titre.demarches!
    ) as ITitreDemarche[]

    for (const titreDemarche of titreDemarchesSorted) {
      const index: number = titreDemarchesSorted.indexOf(titreDemarche)
      if (titreDemarche.ordre !== index + 1) {
        await titreDemarcheUpdate(titreDemarche.id, {
          ordre: index + 1
        })

        console.info(
          'titre / démarche : ordre (mise à jour) ->',
          `${titreDemarche.id}: ${index + 1}`
        )

        titresDemarchesIdsUpdated.push(titreDemarche.id)
      }
    }
  }

  return titresDemarchesIdsUpdated
}
