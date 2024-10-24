import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw("UPDATE titres_demarches SET type_id = 'rep' WHERE id in('tcX11cLPWgB3z6t0uPWh21ig', 'WwNTreQZ8zqHhoE2dCTuMdCu', 'JiZ0yhrafRHjwyXyzUurLp9M')")
  await knex.raw("UPDATE titres_demarches SET type_id = 'rec' WHERE type_id = 'ren'")
  await knex.raw(
    "update titres_etapes set geojson4326_perimetre = null, geojson4326_points = null, geojson_origine_points = null, geojson_origine_perimetre = null, geojson_origine_geo_systeme_id = null where id in (select te.id from titres_etapes te join titres_demarches td on td.id = te.titre_demarche_id where td.type_id = 'rec' and te.geojson4326_perimetre is not null);"
  )
}

export const down = (): void => {}
