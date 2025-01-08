import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("UPDATE titres_etapes set type_id = 'mcr' WHERE type_id = 'wre'")
}
export const down = (): void => {}
