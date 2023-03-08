import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  const etapeIds = (await knex('titres_etapes').where('type_id', 'asl').select('id')).map(({ id }) => id)

  await knex('titres_substances').whereIn('titre_etape_id', etapeIds).delete()
  await knex('titres_titulaires').whereIn('titre_etape_id', etapeIds).delete()
  await knex('titres_amodiataires').whereIn('titre_etape_id', etapeIds).delete()
  await knex('titres_points').whereIn('titre_etape_id', etapeIds).delete()

  return knex('titres_etapes').where('type_id', 'asl').update({ heritage_props: null })
}

export const down = () => ({})
