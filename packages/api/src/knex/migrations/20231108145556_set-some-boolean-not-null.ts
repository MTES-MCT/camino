import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw('update documents set public_lecture = false where public_lecture is null')
  await knex.raw('update documents set entreprises_lecture = false where entreprises_lecture is null')
  await knex.raw('ALTER TABLE documents ALTER COLUMN public_lecture SET default false')
  await knex.raw('ALTER TABLE documents ALTER COLUMN public_lecture SET NOT NULL')

  await knex.raw('ALTER TABLE documents ALTER COLUMN entreprises_lecture SET default false')
  await knex.raw('ALTER TABLE documents ALTER COLUMN entreprises_lecture SET NOT NULL')

  await knex.raw('update titres_demarches set public_lecture = false where public_lecture is null')
  await knex.raw('update titres_demarches set entreprises_lecture = false where entreprises_lecture is null')
  await knex.raw('ALTER TABLE titres_demarches ALTER COLUMN public_lecture SET default false')
  await knex.raw('ALTER TABLE titres_demarches ALTER COLUMN public_lecture SET NOT NULL')

  await knex.raw('ALTER TABLE titres_demarches ALTER COLUMN entreprises_lecture SET default false')
  await knex.raw('ALTER TABLE titres_demarches ALTER COLUMN entreprises_lecture SET NOT NULL')

  await knex.raw('update titres set public_lecture = false where public_lecture is null')
  await knex.raw('update titres set entreprises_lecture = false where entreprises_lecture is null')
  await knex.raw('ALTER TABLE titres ALTER COLUMN public_lecture SET default false')
  await knex.raw('ALTER TABLE titres ALTER COLUMN public_lecture SET NOT NULL')

  await knex.raw('ALTER TABLE titres ALTER COLUMN entreprises_lecture SET default false')
  await knex.raw('ALTER TABLE titres ALTER COLUMN entreprises_lecture SET NOT NULL')

  // FIXME sticky étapes avec background
  // FIXME masquer les points par défaut si il y'en a plus que 20 (même constante que pour le tableau)
  // FIXME corriger le style des points sur la carte une fois buildé
}

export const down = () => ({})
