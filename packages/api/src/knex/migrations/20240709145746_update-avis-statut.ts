import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw("UPDATE etape_avis SET avis_statut_id = 'Fait' where avis_type_id = 'lettreDeSaisineDesServices'")
}

export const down = () => ({})
