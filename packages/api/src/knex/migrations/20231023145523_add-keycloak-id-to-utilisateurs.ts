import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  return knex.raw('alter table utilisateurs add keycloak_id varchar(255);')
}

export const down = () => ({})
