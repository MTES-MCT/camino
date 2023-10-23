import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  // FIXME add 'set not null if email is not null' once migration is done
  return knex.raw('alter table utilisateurs add keycloak_id varchar(255);')
}

export const down = () => ({})
