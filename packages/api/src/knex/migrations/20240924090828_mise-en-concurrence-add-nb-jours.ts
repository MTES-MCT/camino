import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const contenu = {
    opdp: {
      duree: 30,
    },
  }
  await knex.raw("UPDATE titres_etapes SET  contenu = COALESCE(contenu || ?::jsonb, ?::jsonb) WHERE type_id ='anf'", [contenu, contenu])
}

export const down = (): void => {}
