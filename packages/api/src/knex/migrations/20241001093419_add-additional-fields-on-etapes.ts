import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('ALTER TABLE titres_etapes ADD demarche_id_en_concurrence varchar NULL;')
  await knex.raw('ALTER TABLE titres_etapes ADD CONSTRAINT demarche_id_en_concurrence_fk FOREIGN KEY (demarche_id_en_concurrence) REFERENCES public.titres_demarches(id)')
}

export const down = (): void => {}
