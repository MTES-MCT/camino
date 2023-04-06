import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("update documents set description='' where description is null")
  await knex.raw('ALTER TABLE documents ALTER COLUMN description SET NOT NULL')
  await knex.raw("ALTER TABLE documents ALTER COLUMN description SET DEFAULT ''")
}

export const down = () => ({})
