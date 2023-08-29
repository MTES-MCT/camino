/* eslint-disable */

// FIXME
import { getEntrepriseDocuments } from '../api/rest/entreprises.queries.js'
import { userSuper } from '../database/user-super.js'
import '../init.js'
import pg, { Pool } from 'pg'
import { knex } from '../knex.js'
import { LargeObjectManager } from 'pg-large-object'
import { join } from 'path'
import { createReadStream } from 'node:fs'
import { EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise.js'

const entrepriseDocumentFilePathFind = (_documentId: EntrepriseDocumentId, _entrepriseId: EntrepriseId) => {
  throw new Error('error')
}

const createLargeObject = (pool: Pool, fullPath: string) =>
  new Promise<number>(async (resolve, reject) => {
    const client = await pool.connect()
    try {
      const man = new LargeObjectManager({ pg: client })

      await client.query('BEGIN')

      await man.createAndWritableStreamAsync(16384).then(([oid, stream]) => {
        const pathFrom = join(process.cwd(), fullPath)
        const fileStream = createReadStream(pathFrom)
        fileStream.pipe(stream)
        stream.on('finish', function () {
          client.query('COMMIT')

          resolve(oid)
        })
        stream.on('error', function (e) {
          console.error(e)
          client.query('ROLLBACK')
          reject('error during largeobject creation')
        })
      })
    } catch (e: any) {
      await client.query('ROLLBACK')
      console.error(e)
      reject(e)
    } finally {
      client.release()
    }
  })

export const launchMigration = async () => {
  const pool = new pg.Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    idleTimeoutMillis: 60000,
  })

  const entreprisesDocuments = await getEntrepriseDocuments([], [], pool, userSuper)

  console.time('migration')
  console.log('documents à migrer : ', entreprisesDocuments.length)
  for (const document of entreprisesDocuments) {
    const { fullPath } = entrepriseDocumentFilePathFind(document.id, document.entreprise_id)

    console.log('fichier : ', fullPath)

    try {
      const oid = await createLargeObject(pool, fullPath)

      await knex.raw(`update entreprises_documents set largeobject_id='${oid}' where id='${document.id}';`)
    } catch (e: any) {
      console.error('pas la ', fullPath)
    }
  }
  console.timeEnd('migration')
}

launchMigration()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
