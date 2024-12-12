import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  knex.raw("UPDATE titres_etapes SET contenu = contenu - 'publication', heritage_contenu = heritage_contenu - 'publication' WHERE type_id = 'dex'")
}

export const down = (): void => {}
