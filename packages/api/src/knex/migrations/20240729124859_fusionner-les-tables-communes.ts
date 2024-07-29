/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  // on supprime les communes sans périmètres
  await knex.raw(`
    DELETE FROM communes WHERE id IN (SELECT communes.id FROM communes LEFT JOIN communes_postgis ON communes_postgis.id = communes.id WHERE communes_postgis.id IS NULL)
  `)

  // on transfère la colonne geometry dans communes
  await knex.raw('ALTER TABLE communes ADD COLUMN "geometry" geometry')
  await knex.raw(`
    UPDATE communes
    SET "geometry" = communes_postgis."geometry"
    FROM communes_postgis
    WHERE communes.id = communes_postgis.id
  `)

  // on peut drop communes_postgis
  await knex.raw('DROP TABLE communes_postgis')
}

export const down = (): void => {}
