import JSZip from 'jszip'
import { createWriteStream } from 'node:fs'
import { User } from 'camino-common/src/roles'
import { DOWNLOAD_FORMATS, contentTypes } from 'camino-common/src/rest.js'
import { Pool } from 'pg'
import { EtapeDocument, EtapeId, etapeDocumentIdValidator } from 'camino-common/src/etape.js'
import { getEntrepriseDocumentLargeObjectIdsByEtapeId } from '../../database/queries/titres-etapes.queries.js'
import { LargeObjectManager } from 'pg-large-object'

import express from 'express'
import { join } from 'node:path'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes.js'
import { slugify } from 'camino-common/src/strings.js'
import { getLargeobjectIdByEtapeDocumentId } from './etapes.queries.js'
export type NewDownload = (params: Record<string, unknown>, user: User, pool: Pool) => Promise<{ loid: number | null; fileName: string }>

export const DOWNLOADS_DIRECTORY = 'downloads'

export const etapeTelecharger =
  (pool: Pool) =>
  async ({ params: { etapeId } }: { params: { etapeId?: EtapeId } }, user: User) => {
    if (!etapeId) {
      throw new Error("id d'étape absent")
    }

    // FIXME
    const titreEtapeSlug = ''

    // FIXME
    const documents: EtapeDocument[] = []
    const entrepriseDocuments = await getEntrepriseDocumentLargeObjectIdsByEtapeId({ titre_etape_id: etapeId }, pool, user)

    if (!documents.length && !entrepriseDocuments.length) {
      throw new Error("aucun document n'a été trouvé pour cette demande")
    }

    const zip = new JSZip()

    for (const _document of documents) {
      // FIXME
      // const path = documentFilePathFind(document)
      // const fileName = slugify(`${document.id}-${DocumentsTypes[document.typeId].nom}`)
      // if (statSync(path).isFile()) {
      //   zip.file(`${fileName}.pdf`, readFileSync(path))
      // }
    }
    const client = await pool.connect()

    try {
      const man = new LargeObjectManager({ pg: client })

      for (let i = 0; i < entrepriseDocuments.length; i++) {
        await client.query('BEGIN')

        const entrepriseDocument = entrepriseDocuments[i]
        const [_size, stream] = await man.openAndReadableStreamAsync(entrepriseDocument.largeobject_id, bufferSize)
        const fileName = slugify(`${entrepriseDocument.id}-${DocumentsTypes[entrepriseDocument.entreprise_document_type_id].nom}`)
        zip.file(`${fileName}.pdf`, stream)
      }
      const nom = `documents-${titreEtapeSlug}.zip`

      const filePath = `/${DOWNLOADS_DIRECTORY}/${nom}`
      await new Promise<void>(resolve =>
        zip
          .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
          .pipe(createWriteStream(join(process.cwd(), `files/${filePath}`)))
          .on('finish', function () {
            resolve()
          })
      )

      await client.query('COMMIT')

      return {
        nom,
        format: DOWNLOAD_FORMATS.Zip,
        filePath,
      }
    } catch (e) {
      await client.query('ROLLBACK')
      console.error(e)
      throw e
    } finally {
      client.release()
    }
  }

const bufferSize = 16384

export const streamLargeObjectInResponse = async (pool: Pool, res: express.Response, largeObjectId: number | null, documentName: string) => {
  if (largeObjectId === null) {
    throw new Error(`fichier inexistant (largeObjectId null) - ${documentName}`)
  }
  const client = await pool.connect()
  try {
    const man = new LargeObjectManager({ pg: client })

    await client.query('BEGIN')

    res.header('Content-disposition', `inline; filename=${encodeURIComponent(`${documentName}.${DOWNLOAD_FORMATS.PDF}`)}`)
    res.header('Content-Type', contentTypes[DOWNLOAD_FORMATS.PDF])

    await man.openAndReadableStreamAsync(largeObjectId, bufferSize).then(([size, stream]) => {
      res.header('Content-Length', `${size}`)

      stream.pipe(res)

      stream.on('error', function () {
        client.query('ROLLBACK')
      })
      res.on('close', function () {
        client.query('COMMIT')
      })
    })
  } catch (e) {
    await client.query('ROLLBACK')
    console.error(e)
    throw e
  } finally {
    client.release()
  }
}

export const etapeDocumentDownload: NewDownload = async (params, user, pool) => {
  const etapeDocumentId = etapeDocumentIdValidator.parse(params.documentId)
  const activiteDocumentLargeObjectId = await getLargeobjectIdByEtapeDocumentId(pool, user, etapeDocumentId)

  return { loid: activiteDocumentLargeObjectId, fileName: etapeDocumentId }
}

// FIXME
export const etapeAvisDocument: NewDownload = async (_params, _user, _pool) => {
  return { loid: null, fileName: 'null' }
}
