import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("DELETE FROM etapes_documents WHERE etape_id IN (SELECT id FROM titres_etapes WHERE type_id = 'nis')")
  await knex.raw("DELETE FROM titres_etapes WHERE type_id = 'nis'")
}

export const down = (): void => {}
