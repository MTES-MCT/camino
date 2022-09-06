exports.up = async knex => {
  await knex.raw(
    "update titres_etapes set substances='[]'::jsonb where substances is null"
  )
  await knex.raw(
    "alter table titres_etapes alter column substances set default '[]'::jsonb"
  )
  await knex.raw(
    'alter table titres_etapes alter column substances set not null'
  )
}

exports.down = () => ({})
