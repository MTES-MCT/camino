import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('ALTER TABLE entreprises_etablissements ALTER COLUMN date_debut SET NOT NULL')
  await knex.raw('ALTER TABLE entreprises_etablissements ALTER COLUMN nom SET NOT NULL')
  await knex.raw('UPDATE entreprises SET archive = false WHERE archive IS NULL')
  await knex.raw('ALTER TABLE entreprises ALTER COLUMN archive SET NOT NULL')
  await knex.raw('ALTER TABLE entreprises ALTER COLUMN archive SET DEFAULT false')
}

export const down = () => ({})
