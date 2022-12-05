import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.table('administrations', table => {
    table.dropColumn('nom')
    table.dropColumn('abreviation')
    table.dropColumn('service')
    table.dropColumn('url')
    table.dropColumn('email')
    table.dropColumn('telephone')
    table.dropColumn('adresse1')
    table.dropColumn('adresse2')
    table.dropColumn('code_postal')
    table.dropColumn('commune')
    table.dropColumn('cedex')
    table.dropForeign('typeid')
  })

  return knex.schema.dropTable('administrations_types')
}

export const down = () => ({})
