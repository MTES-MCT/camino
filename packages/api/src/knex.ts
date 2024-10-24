import knex, { Knex } from 'knex'
import { Model } from 'objection'

let knexInstance = null as unknown as Knex
export { knexInstance as knex }

export const knexInit = (knexConfig: Knex.Config) => {
  knexInstance = knex(knexConfig)
  Model.knex(knexInstance)
}

export const knexInstanceSet = (knexInst: Knex) => {
  knexInstance = knexInst
  Model.knex(knexInstance)
}
