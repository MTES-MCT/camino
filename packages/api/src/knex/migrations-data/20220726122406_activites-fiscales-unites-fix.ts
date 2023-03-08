import { UniteId } from 'camino-common/src/static/unites.js'
import { Knex } from 'knex'
const { SUBSTANCES_FISCALES_IDS, SubstancesFiscale } = require('camino-common/src/static/substancesFiscales')
const { Unites } = require('camino-common/src/static/unites')
export const up = async (knex: Knex) => {
  const activites: {
    id: string
    sections: {
      id: string
      elements: {
        id: string
        uniteId: UniteId
        referenceUniteRatio: number
        description: string
      }[]
    }[]
  }[] = await knex('titres_activites')

  for (let i = 0; i < activites.length; i++) {
    const activite = activites[i]

    let updated = false

    const substancesNeedFix = [SUBSTANCES_FISCALES_IDS['pyrite de fer'], SUBSTANCES_FISCALES_IDS['minerais de fer'], SUBSTANCES_FISCALES_IDS['schistes carbobitumineux et schistes bitumineux']]

    const sectionSubstancesFiscales = activite.sections?.find(section => section.id === 'substancesFiscales')

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

export const down = () => ({})
