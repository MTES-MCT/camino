import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw(
    "delete from titres_types__demarches_types__etapes_types where titre_type_id like '%i'"
  )
  await knex.raw(
    "delete from titres_types__demarches_types where titre_type_id like '%i'"
  )
  await knex.raw("delete from titres_types where domaine_id = 'i'")
  await knex.raw("delete from domaines where id = 'i'")
}

export const down = () => ({})
