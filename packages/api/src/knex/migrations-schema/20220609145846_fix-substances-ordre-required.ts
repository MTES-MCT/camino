import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.raw('CREATE UNIQUE INDEX titre_etape_id_ordre_unique on titres_substances(titre_etape_id, ordre) WHERE ordre IS NOT NULL')

  return knex.raw('CREATE UNIQUE INDEX titre_etape_id_unique on titres_substances(titre_etape_id) WHERE ordre IS NULL')
}

export const down = () => ({})
