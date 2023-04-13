import { Knex } from 'knex'
import { readFile } from 'node:fs/promises'
import path, { join } from 'node:path'
import { fileURLToPath } from 'url'

export const up = async (knex: Knex) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const sql = await readFile(join(__dirname, './20230413090214_init_schema.sql'), { encoding: 'utf-8' })
  await knex.raw(sql)
}

export const down = () => ({})
