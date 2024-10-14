import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("UPDATE etapes_documents SET etape_document_type_id = 'rdr' WHERE etape_document_type_id in ('rac', 'rap')")
}

export const down = (): void => {}
