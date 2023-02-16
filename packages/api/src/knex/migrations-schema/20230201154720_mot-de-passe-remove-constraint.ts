import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw(
    'alter table utilisateurs alter column "mot_de_passe" drop not null'
  )
}

export const down = () => ({})
