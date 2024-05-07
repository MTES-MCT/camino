import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE etapes_documents ALTER COLUMN largeobject_id SET NOT NULL')
}

export const down = () => ({})
