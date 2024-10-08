import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("UPDATE utilisateurs set role='bureau d''études' where role='bureau d’études'")
}

export const down = (): void => {}
