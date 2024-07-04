import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("ALTER TABLE titres_etapes ADD COLUMN note JSONB NOT NULL DEFAULT json_build_object('valeur', '', 'is_avertissement', false)")
  await knex.raw("UPDATE titres_etapes SET note=json_build_object('valeur', coalesce(notes, ''), 'is_avertissement', false) where notes is not null")

  await knex.raw('ALTER TABLE titres_etapes DROP COLUMN notes')
}

export const down = () => ({})
