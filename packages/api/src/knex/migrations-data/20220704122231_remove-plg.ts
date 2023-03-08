import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex('etapesTypes__documentsTypes').where('documentTypeId', 'plg').delete()
  await knex('documentsTypes').where('id', 'plg').delete()
}

export const down = () => ({})
