import { TempDocumentName } from "camino-common/src/document.js"
import { createReadStream } from "fs"
import { join } from "path"
import { Pool } from "pg"
import { LargeObjectManager } from "pg-large-object"
import { z } from "zod"

const bufferSize = 16384

export const largeObjectIdValidator = z.number().brand('LargeObjectId')
export type LargeObjectId =z.infer<typeof largeObjectIdValidator>
export const createLargeObject = async (pool: Pool, tmpFileName: TempDocumentName): Promise<LargeObjectId> => {
  const client = await pool.connect()
  try {
    const man = new LargeObjectManager({ pg: client })

    await client.query('BEGIN')

    const [oid, stream] = await man.createAndWritableStreamAsync(bufferSize)

    const promise = new Promise<LargeObjectId>((resolve, reject) => {
      const pathFrom = join(process.cwd(), `/files/tmp/${tmpFileName}`)
      const fileStream = createReadStream(pathFrom)
      fileStream.on('error', function (e) {
        reject(e)
      })
      fileStream.pipe(stream)
      stream.on('finish', function () {
        client.query('COMMIT')
        resolve(largeObjectIdValidator.parse(oid))
      })
      stream.on('error', function (e) {
        reject(e)
      })
    })

    return await promise
  } catch (e: any) {
    await client.query('ROLLBACK')
    console.error(e)
    throw new Error('error during largeobject creation')
  } finally {
    client.release()
  }
}