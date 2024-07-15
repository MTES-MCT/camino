import { UserNotNull } from 'camino-common/src/roles.js'
import { Pool } from 'pg'
import { EtapeId } from 'camino-common/src/etape.js'
import { CaminoDate, dateAddDays, getCurrent, isBefore } from 'camino-common/src/date.js'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { getParticipationEtapes } from '../../database/queries/titres-etapes.queries.js'

export const titresEtapesStatutUpdate = async (pool: Pool, user: UserNotNull, etapeId?: EtapeId): Promise<EtapeId[]> => {
  console.info()
  console.info('statut des étapes…')

  const titresEtapesIdsUpdated: EtapeId[] = []

  const currentDate = getCurrent()
  const participationEtapes: { dureeParticipation: number; date: CaminoDate; id: EtapeId; etape_statut_id: EtapeStatutId }[] = await getParticipationEtapes(pool, etapeId)

  for (const etape of participationEtapes) {
    let newStatut: EtapeStatutId

    if (isBefore(currentDate, etape.date)) {
      newStatut = ETAPES_STATUTS.PROGRAMME
    } else if (isBefore(currentDate, dateAddDays(etape.date, etape.dureeParticipation))) {
      newStatut = ETAPES_STATUTS.EN_COURS
    } else {
      newStatut = ETAPES_STATUTS.TERMINE
    }

    if (newStatut !== etape.etape_statut_id) {
      console.info('titre / démarche / étape : statut (mise à jour) ->', `${etape.id} : ${etape.etape_statut_id} => ${newStatut}`)

      titresEtapesIdsUpdated.push(etape.id)
    }
  }

  return titresEtapesIdsUpdated
}
