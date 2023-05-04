import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table activites_types drop column sections;')
  await knex.raw('alter table etapes_types drop column sections;')
  await knex.raw('alter table titres_types__demarches_types__etapes_types drop column sections;')
}

export const down = () => ({})
