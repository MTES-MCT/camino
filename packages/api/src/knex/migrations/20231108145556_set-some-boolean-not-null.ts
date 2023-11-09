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

  // FIXME pouvoir éditer/supprimer une étape
  // FIXME permettre de "Télécharger l'ensemble de la demande dans un fichier .zip"
  // FIXME https://preprod.camino.beta.gouv.fr/demarches/w-cx-chassiron-d-2002-pro01 le lien public externe ne s'affiche pas en tant qu'URL
  // FIXME import du périmètre qui ne fonctionne plus (nouvelle espérance prolongation 2)
  // FIXME quand on zoom sur la carte, ça scroll en haut de page
  // FIXME ancre sur les étapes
}

export const down = () => ({})
