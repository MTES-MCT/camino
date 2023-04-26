import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('alter table titres alter column slug set not null;')
  await knex.raw('ALTER TABLE titres_activites ALTER COLUMN "date" SET NOT NULL;')
  await knex.raw('ALTER TABLE public.titres_activites ALTER COLUMN annee SET NOT NULL;')
}

export const down = () => ({})
