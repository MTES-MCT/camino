import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex('titres_substances').whereNull('ordre').update({ ordre: 0 })

  const titresSubstances: any[] = await knex('titres_substances')

  const groupByTitres: Record<string, any> = titresSubstances.reduce((acc, ts) => {
    if (!acc[ts.titreEtapeId]) {
      acc[ts.titreEtapeId] = []
    }
    acc[ts.titreEtapeId].push(ts)

    return acc
  }, {})

  for (const titreSubstances of Object.values(groupByTitres)) {
    titreSubstances.sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
    for (let index = 0; index < titreSubstances.length; index++) {
      const ts = titreSubstances[index]
      await knex('titres_substances').where('titreEtapeId', ts.titreEtapeId).where('substanceId', ts.substanceId).update('ordre', index)
    }
  }
}

export const down = () => ({})
