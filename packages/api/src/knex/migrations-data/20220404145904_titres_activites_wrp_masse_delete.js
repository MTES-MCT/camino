exports.up = async knex => {
  const activites = await knex('titres_activites').where('typeId', 'wrp')

  for (let i = 0; i < activites.length; i++) {
    const activite = activites[i]

    let updated = false

    if (activite.contenu?.renseignementsProduction) {
      delete activite.contenu?.renseignementsProduction?.masseGranulatsExtrait
      updated = true
    }

    if (activite.sections) {
      const section = activite.sections.find(
        s => s.id === 'renseignementsProduction'
      )

      if (section) {
        section.elements = section.elements.filter(
          element => element.id !== 'masseGranulatsExtrait'
        )

        updated = true
      }
    }

    if (updated) {
      await knex('titres_activites').where('id', activite.id).update(activite)
    }
  }
}

exports.down = () => ({})
