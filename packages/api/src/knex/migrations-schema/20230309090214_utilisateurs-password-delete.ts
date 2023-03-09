import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table utilisateurs drop column "mot_de_passe"')
  await knex.raw('alter table utilisateurs drop column "preferences"')
  await knex.raw('alter table utilisateurs drop column "refresh_token"')
}

export const down = () => ({})
