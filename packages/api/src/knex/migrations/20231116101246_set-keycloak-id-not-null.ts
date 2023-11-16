import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table utilisateurs add constraint check_keycloak_id_not_null check (email is null or keycloak_id is not null);')
}

export const down = () => ({})
