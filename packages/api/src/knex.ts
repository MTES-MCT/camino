import knex, { Knex } from 'knex'
import { Model } from 'objection'

let knexInstance = null as unknown as Knex
export { knexInstance as knex }

export const knexInit = (knexConfig: Knex.Config): void => {
  knexInstance = knex(knexConfig)
  Model.knex(knexInstance)
}

export const knexInstanceSet = (knexInst: Knex): void => {
  knexInstance = knexInst
  Model.knex(knexInstance)
}
