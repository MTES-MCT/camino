import JSZip from 'jszip'
import { createWriteStream } from 'node:fs'
import { User } from 'camino-common/src/roles'
import { DOWNLOAD_FORMATS, contentTypes } from 'camino-common/src/rest.js'
import { Pool } from 'pg'
import { EtapeId, etapeDocumentIdValidator } from 'camino-common/src/etape.js'
import { getEntrepriseDocumentLargeObjectIdsByEtapeId, getEtapeDocumentLargeObjectIdsByEtapeId } from '../../database/queries/titres-etapes.queries.js'
import { LargeObjectManager } from 'pg-large-object'

import express from 'express'
import { join } from 'node:path'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes.js'
import { slugify } from 'camino-common/src/strings.js'
import { administrationsLocalesByEtapeId, entreprisesTitulairesOuAmoditairesByEtapeId, getEtapeDataForEdition, getLargeobjectIdByEtapeDocumentId } from './etapes.queries.js'
import { memoize } from 'camino-common/src/typescript-tools.js'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
export type NewDownload = (params: Record<string, unknown>, user: User, pool: Pool) => Promise<{ loid: number | null; fileName: string }>

export const DOWNLOADS_DIRECTORY = 'downloads'

export const etapeTelecharger =
  (pool: Pool) =>
  async ({ params: { etapeId } }: { params: { etapeId?: EtapeId } }, user: User) => {
    if (!etapeId) {
      throw new Error("id d'étape absent")
    }

    const etapeData = await getEtapeDataForEdition(pool, etapeId)

    const titreTypeId = memoize(() => Promise.resolve(etapeData.titre_type_id))
    const administrationsLocales = memoize(() => administrationsLocalesByEtapeId(etapeId, pool))
    const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByEtapeId(etapeId, pool))

    const documents = await getEtapeDocumentLargeObjectIdsByEtapeId(etapeId, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
      demarche_type_id: etapeData.demarche_type_id,
      titre_public_lecture: etapeData.titre_public_lecture,
      entreprises_lecture: etapeData.demarche_entreprises_lecture,
      public_lecture: etapeData.demarche_public_lecture,
    })
    const entrepriseDocuments = await getEntrepriseDocumentLargeObjectIdsByEtapeId({ titre_etape_id: etapeId }, pool, user)

    if (!documents.length && !entrepriseDocuments.length) {
      throw new Error(`aucun document n'a été trouvé pour l'étape "${EtapesTypes[etapeData.etape_type_id].nom}"`)
    }

    const zip = new JSZip()

    const client = await pool.connect()

    try {
      const man = new LargeObjectManager({ pg: client })

      for (let i = 0; i < documents.length; i++) {
        await client.query('BEGIN')

        const document = documents[i]
        const [_size, stream] = await man.openAndReadableStreamAsync(document.largeobject_id, bufferSize)
        const fileName = slugify(`${document.id}-${DocumentsTypes[document.etape_document_type_id].nom}`)
        zip.file(`${fileName}.pdf`, stream)
      }
      for (let i = 0; i < entrepriseDocuments.length; i++) {
        await client.query('BEGIN')

        const entrepriseDocument = entrepriseDocuments[i]
        const [_size, stream] = await man.openAndReadableStreamAsync(entrepriseDocument.largeobject_id, bufferSize)
        const fileName = slugify(`${entrepriseDocument.id}-${DocumentsTypes[entrepriseDocument.entreprise_document_type_id].nom}`)
        zip.file(`${fileName}.pdf`, stream)
      }
      const nom = `documents-${etapeData.etape_slug}.zip`

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
