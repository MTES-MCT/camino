import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex.schema.alterTable('titres_etapes', function (table) {
    table.jsonb('sdom_zones').index()
  })
  await knex.raw(`update titres_etapes te set sdom_zones = (
    select sdom from (
      select 
        titre_etape_id, 
        jsonb_agg(sdom_zone_id) as sdom 
      from (
        select * from titres__sdom_zones order by titre_etape_id, sdom_zone_id
      ) tal 
      group by titre_etape_id
    ) titre_etape_to_update where titre_etape_id = te.id
  );`)

  await knex.schema.dropTable('titres__sdom_zones')
  await knex.schema.dropTable('sdom_zones')
}

export const down = () => ({})
