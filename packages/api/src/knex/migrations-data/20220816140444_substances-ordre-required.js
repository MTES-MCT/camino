exports.up = async knex => {
  await knex('titres_substances').whereNull('ordre').update({ ordre: 0 })

  const titresSubstances = await knex('titres_substances')

  const groupByTitres = titresSubstances.reduce((acc, ts) => {
    if (!acc[ts.titreEtapeId]) {
      acc[ts.titreEtapeId] = []
    }
    acc[ts.titreEtapeId].push(ts)

    return acc
  }, {})

  for (const titreSubstances of Object.values(groupByTitres)) {
    titreSubstances.sort((a, b) => a.ordre - b.ordre)
    for (let index = 0; index < titreSubstances.length; index++) {
      const ts = titreSubstances[index]
      await knex('titres_substances')
        .where('titreEtapeId', ts.titreEtapeId)
        .where('substanceId', ts.substanceId)
        .update('ordre', index)
    }
  }
}

exports.down = () => ({})
