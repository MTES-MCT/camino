import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.schema.raw('ALTER TABLE public.titres_demarches ADD demarche_date_debut varchar(10) NULL;')
  await knex.schema.raw('ALTER TABLE public.titres_demarches ADD demarche_date_fin varchar(10) NULL;')
  await knex.raw("update titres_demarches td set demarche_date_debut = ( select date_debut from titres_phases where titre_demarche_id = td.id)")
  await knex.raw("update titres_demarches td set demarche_date_fin = ( select date_fin from titres_phases where titre_demarche_id = td.id)")

  return knex.schema.dropTable('titres_phases')
}

export const down = () => ({})
