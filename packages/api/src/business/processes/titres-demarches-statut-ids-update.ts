import { TitreId } from 'camino-common/src/titres.js'
import { titreDemarcheUpdate } from '../../database/queries/titres-demarches.js'
import { titreDemarcheStatutIdFind } from '../rules/titre-demarche-statut-id-find.js'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort.js'
import { getDemarches } from './titres-etapes-heritage-contenu-update.queries.js'
import { Pool } from 'pg'

export const titresDemarchesStatutIdUpdate = async (pool: Pool, titreId?: TitreId) => {
  console.info()
  console.info('statut des démarches…')

  const titresDemarches = await getDemarches(pool, undefined, titreId)

  const titresDemarchesUpdated: string[] = []


  for (const titreDemarche of Object.values(titresDemarches)) {
    const titreDemarcheEtapes = titreEtapesSortAscByOrdre(titreDemarche.etapes ?? [])

    const statutId = titreDemarcheStatutIdFind(titreDemarche.typeId, titreDemarcheEtapes, titreDemarche.titreTypeId, titreDemarche.id)

    if (titreDemarche.statutId !== statutId) {
      await titreDemarcheUpdate(titreDemarche.id, { statutId })

      console.info('titre / démarche : statut (mise à jour) ->', `${titreDemarche.id}: ${statutId}`)

      titresDemarchesUpdated.push(titreDemarche.id)
    }
  }

  return titresDemarchesUpdated
}
