const {
  SUBSTANCES_FISCALES_IDS,
  SubstancesFiscale
} = require('camino-common/src/substance')
const { Unites } = require('camino-common/src/unites')
exports.up = async knex => {
  const activites = await knex('titres_activites')

  for (let i = 0; i < activites.length; i++) {
    const activite = activites[i]

    let updated = false

    const substancesNeedFix = [
      SUBSTANCES_FISCALES_IDS['pyrite de fer'],
      SUBSTANCES_FISCALES_IDS['minerais de fer'],
      SUBSTANCES_FISCALES_IDS['schistes carbobitumineux et schistes bitumineux']
    ]

    const sectionSubstancesFiscales = activite.sections?.find(
      section => section.id === 'substancesFiscales'
    )

    if (sectionSubstancesFiscales) {
      for (const element of sectionSubstancesFiscales.elements) {
        if (substancesNeedFix.includes(element.id)) {
          const sf = SubstancesFiscale[element.id]
          element.uniteId = sf.uniteId

          const unite = Unites[element.uniteId]
          element.referenceUniteRatio = unite.referenceUniteRatio
          element.description = `<b>${unite.symbole} (${unite.nom})</b> ${sf.description}`
          updated = true
        }
      }
    }
    if (updated) {
      await knex('titres_activites').where('id', activite.id).update(activite)
    }
  }
}

exports.down = () => ({})
