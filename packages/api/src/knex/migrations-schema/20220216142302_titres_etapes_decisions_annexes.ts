import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  return knex.schema.table('titres_etapes', table => {
    table.specificType('decisions_annexes_sections', 'jsonb[]')
    table.json('decisions_annexes_contenu')
  })
}

export const down = () => ({})
