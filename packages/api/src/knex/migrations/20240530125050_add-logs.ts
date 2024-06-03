import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw(
    'CREATE TABLE logs(datetime timestamp with time zone NOT NULL default now(), path character varying(255), method character varying(6) NOT NULL, body jsonb default null, utilisateur_id character varying(255) NOT NULL)'
  )
  await knex.raw('ALTER TABLE logs ADD CONSTRAINT logs__utilisateur_id__foreign FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)')
}

export const down = () => ({})
