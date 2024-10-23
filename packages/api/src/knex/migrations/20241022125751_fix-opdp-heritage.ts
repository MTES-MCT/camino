/* eslint-disable sql/no-unsafe-query */

import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const anfEtapes = await knex.raw(`SELECT * from titres_etapes where type_id = 'anf'`)
  for (const etape of anfEtapes.rows) {
    const contenu = { ...etape.contenu, anf: etape.contenu.opdp }
    delete contenu.opdp
    await knex.raw('UPDATE titres_etapes SET  contenu =  ?::jsonb WHERE id =?', [contenu, etape.id])
  }

  const epuEtapes = await knex.raw(`SELECT * from titres_etapes where type_id = 'epu'`)
  for (const etape of epuEtapes.rows) {
    if (isNotNullNorUndefined(etape.contenu?.opdp)) {
      const contenu = { ...etape.contenu, epu: etape.contenu.opdp }
      delete contenu.opdp
      await knex.raw('UPDATE titres_etapes SET  contenu =  ?::jsonb WHERE id =?', [contenu, etape.id])
    }
  }
}

export const down = (): void => {}
