import { Pool } from 'pg'
import { EtapeId, getStatutId } from 'camino-common/src/etape'
import { getCurrent } from 'camino-common/src/date'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { getParticipationOrEnqueteEtapes, updateParticipationOrEnqueteStatut } from '../../database/queries/titres-etapes.queries'
import { simpleContenuToFlattenedContenu } from 'camino-common/src/sections'

export const titresEtapesStatutUpdate = async (pool: Pool): Promise<EtapeId[]> => {
  console.info()
  console.info('statut des étapes…')

  const titresEtapesIdsUpdated: EtapeId[] = []

  const currentDate = getCurrent()
  const participationOrEnqueteEtapes = await getParticipationOrEnqueteEtapes(pool)

  for (const etape of participationOrEnqueteEtapes) {
    const newStatut: EtapeStatutId = getStatutId(
      {
        ...etape,
        statutId: etape.etape_statut_id,
        typeId: etape.type_id,
        contenu: simpleContenuToFlattenedContenu(etape.titre_type_id, etape.demarche_type_id, etape.type_id, etape.contenu, etape.heritage_contenu),
      },
      currentDate
    )

    if (newStatut !== etape.etape_statut_id) {
      await updateParticipationOrEnqueteStatut(pool, etape.id, newStatut)
      console.info('titre / démarche / étape : statut (mise à jour) ->', `${etape.id} : ${etape.etape_statut_id} => ${newStatut}`)

      titresEtapesIdsUpdated.push(etape.id)
    }
  }

  return titresEtapesIdsUpdated
}
