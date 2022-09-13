exports.up = async knex => {
  await knex('titresTypes__titresStatuts')
    .whereLike('titreTypeId', '%s')
    .whereIn('titreStatutId', ['val', 'ech', 'dmi', 'mod'])
    .update({
      publicLecture: true
    })
}

exports.down = () => ({})
