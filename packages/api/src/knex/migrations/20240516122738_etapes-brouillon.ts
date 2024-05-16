/* eslint-disable sql/no-unsafe-query */
import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres_etapes add column is_brouillon BOOLEAN NOT NULL DEFAULT FALSE')
  await knex.raw(`UPDATE titres_etapes SET statut_id = 'fai', is_brouillon = true WHERE titres_etapes.statut_id = 'aco'`)
}

export const down = () => ({})
