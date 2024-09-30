import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('ALTER TABLE titres_etapes DROP CONSTRAINT etape_fondamentale_fk')
  await knex.raw('ALTER TABLE titres_etapes DROP COLUMN etape_fondamentale_id')
}

export const down = (): void => {}
