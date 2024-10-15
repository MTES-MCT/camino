import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("UPDATE titres_etapes SET type_id = 'dex', statut_id = 'acc' WHERE type_id='dux'")
}

export const down = (): void => {}
