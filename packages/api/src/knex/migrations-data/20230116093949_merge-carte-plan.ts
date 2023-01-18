import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("update documents set type_id='car' where type_id='pla'")
  await knex.raw("delete from documents_types where id = 'pla'")
}

export const down = () => ({})
