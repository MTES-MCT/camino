import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titres', function (table) {
    table.dropForeign('domaine_id', 'titres_domaineid_foreign')
    table.dropIndex('domaine_id', 'titres_domaineid_index')
    table.dropColumn('domaine_id')
  })
}

export const down = () => ({})
