import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table documents drop column url')
  await knex.raw('alter table documents drop column uri')
  await knex.raw('alter table documents drop column nor')
  await knex.raw('alter table documents drop column jorf')

  await knex.raw('ALTER TABLE activites_documents ALTER COLUMN largeobject_id SET NOT NULL')
}

export const down = () => ({})
