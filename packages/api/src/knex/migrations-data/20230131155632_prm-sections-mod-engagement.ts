import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  await knex.raw(
    "update titres_types__demarches_types__etapes_types set sections=(select sections from titres_types__demarches_types__etapes_types where titre_type_id='prm' and demarche_type_id='oct' and etape_type_id='mfr') where titre_type_id='prm' and demarche_type_id='oct' and etape_type_id='mod'"
  )
}

export const down = () => ({})
