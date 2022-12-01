import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  return knex.schema
    .dropTable('travaux_etapes_types__documents_types')
    .dropTable('travaux_etapes_types__etapes_statuts')
    .dropTable('travaux_types__travaux_etapes_types')
    .dropTable('travaux_etapes_types')
    .dropTable('travaux_types')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const down = (knex: Knex) => {
  // TODO
}
