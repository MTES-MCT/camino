import { rmSync, writeFileSync, mkdirSync } from 'fs'
import decamelize from 'decamelize'

import { ICoordonnees } from '../../types.js'
import { knex } from '../../knex.js'
import { tables } from './tables.js'

const dir = 'sources'

export const databaseToJsonExport = async () => {
  rmSync(`./${dir}`, { recursive: true, force: true })
  mkdirSync(`./${dir}`, { recursive: true })

  for (const table of tables) {
    try {
      const fileName = `${table.name.replace(/_/g, '-')}.json`
      const filePath = `${dir}/${fileName}`

      const json = format(
        await knex.from(table.name).orderBy(
          table.orderBy.map(column => {
            return { column, order: 'asc' }
          })
        )
      )

      if (json) {
        writeFileSync(filePath, JSON.stringify(json, null, 2))
      } else {
        console.error(`la table ${table.name} est vide`)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

interface IFields {
  [key: string]: IFields | string
}

const format = (elements: IFields[]) =>
  elements.map(e =>
    Object.keys(e).reduce((acc: IFields, k: string) => {
      if (e[k]) {
        acc[decamelize(k)] = fieldFormat(e, k)
      }

      return acc
    }, {})
  )

const fieldFormat = (field: IFields, key: string) => {
  if (key === 'coordonnees') {
    const coordonnees = field[key] as unknown as ICoordonnees

    return `${coordonnees.x},${coordonnees.y}`
  }

  return field[key]
}