import { Pool } from 'pg'
import { EtapeId, getStatutId } from 'camino-common/src/etape.js'
import { getCurrent } from 'camino-common/src/date.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { getParticipationEtapes, updateParticipationStatut } from '../../database/queries/titres-etapes.queries.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { simpleContenuToFlattenedContenu } from 'camino-common/src/sections.js'

export const titresEtapesStatutUpdate = async (pool: Pool): Promise<EtapeId[]> => {
  console.info()
  console.info('statut des étapes…')

  const titresEtapesIdsUpdated: EtapeId[] = []

  const currentDate = getCurrent()
  const participationEtapes = await getParticipationEtapes(pool)

  for (const etape of participationEtapes) {
    const newStatut: EtapeStatutId = getStatutId(
      {
        ...etape,
        statutId: etape.etape_statut_id,
        typeId: ETAPES_TYPES.participationDuPublic,
        contenu: simpleContenuToFlattenedContenu(etape.titre_type_id, etape.demarche_type_id, ETAPES_TYPES.participationDuPublic, etape.contenu, etape.heritage_contenu),
      },
      currentDate
    )

    if (newStatut !== etape.etape_statut_id) {
      await updateParticipationStatut(pool, etape.id, newStatut)
      console.info('titre / démarche / étape : statut (mise à jour) ->', `${etape.id} : ${etape.etape_statut_id} => ${newStatut}`)

      titresEtapesIdsUpdated.push(etape.id)
    }
  }

  return titresEtapesIdsUpdated
}
