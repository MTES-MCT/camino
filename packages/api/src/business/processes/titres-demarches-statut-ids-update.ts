import { TitreId } from 'camino-common/src/validators/titres'
import { titreDemarcheUpdate } from '../../database/queries/titres-demarches'
import { titreDemarcheStatutIdFind } from '../rules/titre-demarche-statut-id-find'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'
import { getDemarches } from './titres-etapes-heritage-contenu-update.queries'
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
