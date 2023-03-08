import { Knex } from 'knex'
export const up = async (knex: Knex) => {
  await knex('titresTypes__titresStatuts').whereLike('titreTypeId', '%s').whereIn('titreStatutId', ['val', 'ech', 'dmi', 'mod']).update({
    publicLecture: true,
  })
}

export const down = () => ({})
