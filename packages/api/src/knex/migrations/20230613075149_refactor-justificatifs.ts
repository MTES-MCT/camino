import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.schema.dropTable('titres_demarches_liens')
  await knex.schema.dropTable('titres_types__demarches_types__etapes_types__justificatifs_t')
  await knex.schema.dropTable('etapes_types__justificatifs_types')
  await knex.schema.dropTable('entreprises__documents_types')
}

export const down = () => ({})
