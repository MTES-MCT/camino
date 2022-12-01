import { Knex } from 'knex'
export const up = (knex: Knex) =>
  knex('utilisateurs')
    .whereIn('id', ['c7142a', '38cbc5', '24414c', '40bf91', '95177f'])
    .update({ role: 'bureau d’études' })

export const down = () => ({})
