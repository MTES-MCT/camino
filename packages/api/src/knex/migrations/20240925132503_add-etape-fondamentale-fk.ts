import { Knex } from 'knex'
export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('ALTER TABLE titres_etapes ADD etape_fondamentale_id varchar NULL')
  await knex.raw('ALTER TABLE titres_etapes ADD CONSTRAINT etape_fondamentale_fk FOREIGN KEY (etape_fondamentale_id) REFERENCES public.titres_etapes(id)')
}

export const down = (): void => {}
