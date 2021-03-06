exports.up = async knex => {
  await knex('titres_types__demarches_types').insert({
    titreTypeId: 'cxm',
    demarcheTypeId: 'fus'
  })

  await knex('titres_types__demarches_types__etapes_types').insert({
    titreTypeId: 'cxm',
    demarcheTypeId: 'fus',
    etapeTypeId: 'dex',
    ordre: 100
  })

  await knex('titres_types__demarches_types__etapes_types').insert({
    titreTypeId: 'cxm',
    demarcheTypeId: 'fus',
    etapeTypeId: 'dpu',
    ordre: 200
  })
}
exports.down = () => ({})
