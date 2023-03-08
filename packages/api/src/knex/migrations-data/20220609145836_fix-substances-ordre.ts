import { Knex } from 'knex'
const mostImportantSubstances = ['auru', 'nacl']
const leastImportantSubstances = ['tmas', 'suco', 'scor', 'oooo', 'rxxx', 'trxx']

export const up = async (knex: Knex) => {
  const titresEtapesSubstances = await knex('titres_substances').select('titre_etape_id').count('titre_etape_id').whereNull('ordre').groupBy('titre_etape_id')
  for (let i = 0; i < titresEtapesSubstances.length; i++) {
    const titreEtapeSubstances = titresEtapesSubstances[i]
    if (titreEtapeSubstances.count !== '1') {
      const entries = await knex('titres_substances').where('titre_etape_id', titreEtapeSubstances.titreEtapeId)
      const sorted = entries.sort((entry1, entry2) => {
        if (mostImportantSubstances.includes(entry1.substanceId)) {
          return -1
        }
        if (mostImportantSubstances.includes(entry2.substanceId)) {
          return 1
        }

        if (leastImportantSubstances.includes(entry1.substanceId)) {
          return 1
        }

        if (leastImportantSubstances.includes(entry2.substanceId)) {
          return -1
        }

        return 0
      })

      for (let j = 0; j < sorted.length; j++) {
        const titreEtapeSubstance = sorted[j]
        await knex('titres_substances').where('titre_etape_id', titreEtapeSubstance.titreEtapeId).andWhere('substanceId', titreEtapeSubstance.substanceId).update('ordre', j)
      }
    }
  }
}

export const down = () => ({})
