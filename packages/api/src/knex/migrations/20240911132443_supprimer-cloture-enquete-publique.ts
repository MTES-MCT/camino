/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { CaminoDate, daysBetween } from 'camino-common/src/date.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const { rows: etapes }: { rows: { id: EtapeId; type_id: EtapeTypeId; titre_demarche_id: DemarcheId; date: CaminoDate }[] } = await knex.raw(
    `SELECT
      id,
      type_id,
      titre_demarche_id,
      date
    FROM titres_etapes
    WHERE type_id IN ('woe', 'wce', 'epu', 'epc') AND archive IS FALSE
    ORDER BY
      titre_demarche_id ASC,
      CASE type_id
        WHEN 'woe' THEN 1
        WHEN 'epu' THEN 1
        WHEN 'wce' THEN 2
        WHEN 'epc' THEN 2
      END ASC`
  )

  for (let i = 0; i < etapes.length; i += 2) {
    const ouverture = etapes[i]
    const cloture = etapes[i + 1]

    if (ouverture.titre_demarche_id !== cloture?.titre_demarche_id || !['woe', 'epu'].includes(ouverture.type_id) || !['wce', 'epc'].includes(cloture?.type_id)) {
      throw new Error('Il manque une ouverture ou une cloture')
    }

    const contenu = {
      odlep: {
        duree: daysBetween(ouverture.date, cloture.date),
      },
    }

    // si jamais l'ouverture est une woe, on la transforme en epu au passage
    await knex.raw(`UPDATE titres_etapes SET type_id = 'epu', contenu = ? WHERE id = ?`, [contenu, ouverture.id])
    await knex.raw(`UPDATE etapes_documents SET etape_id = '${ouverture.id}' WHERE etape_id = '${cloture.id}'`)
    await knex.raw(`DELETE FROM titres_etapes WHERE id = '${cloture.id}'`)
  }
}

export const down = (): void => {}
