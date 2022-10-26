exports.up = async knex => {
  await knex.schema.alterTable('titres_etapes', function (table) {
    table.jsonb('administrations_locales').index()
  })

  await knex.raw(
    "update titres set props_titre_etapes_ids = props_titre_etapes_ids  - 'administrations'"
  )
  await knex.raw(`update titres_etapes te set administrations_locales = (
    select administrations from (
      select 
        titre_etape_id, 
        jsonb_agg(administration_id) as administrations 
      from (
        select * from titres_administrations_locales order by titre_etape_id, administration_id
      ) tal 
      group by titre_etape_id
    ) titre_etape_to_update where titre_etape_id = te.id
  );`)

  await knex.schema.dropTable('titresAdministrationsLocales')

  return knex.schema.dropTable('titresAdministrations')
}

exports.down = () => ({})
