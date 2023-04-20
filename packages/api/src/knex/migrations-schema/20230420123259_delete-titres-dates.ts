import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres drop column "date_debut"')
  await knex.raw('alter table titres drop column "date_fin"')
  await knex.raw('alter table titres drop column "date_demande"')
}

export const down = () => ({})
