import { IContenuElement, IContenuValeur, IDocumentRepertoire } from '../../types.js'

import { documentGet } from '../../database/queries/documents.js'
import { titreEtapeGet } from '../../database/queries/titres-etapes.js'
import { documentRepertoireFind } from '../../tools/documents/document-repertoire-find.js'
import { documentFilePathFind } from '../../tools/documents/document-path-find.js'

import JSZip from 'jszip'
import { statSync, readFileSync } from 'fs'
import { User } from 'camino-common/src/roles'
import { DOWNLOAD_FORMATS, contentTypes } from 'camino-common/src/rest.js'
import { Pool } from 'pg'
import { EtapeId } from 'camino-common/src/etape.js'
import { DocumentId } from 'camino-common/src/entreprise.js'
import { getEntrepriseDocumentLargeObjectIdsByEtapeId } from '../../database/queries/titres-etapes.queries.js'
import { LargeObjectManager } from 'pg-large-object'

import express from 'express'
export type NewDownload = (params: Record<string, unknown>, user: User, pool: Pool) => Promise<{ loid: number | null; fileName: string }>

export const etapeTelecharger =
  (pool: Pool) =>
  async ({ params: { etapeId } }: { params: { etapeId?: EtapeId } }, user: User) => {
    if (!etapeId) {
      throw new Error("id d'étape absent")
    }
    const titreEtape = await titreEtapeGet(
      etapeId,
      {
        fields: {
          documents: {
            id: {},
          },
        },
      },
      user
    )

    if (!titreEtape) throw new Error("l'étape n'existe pas")

    const documents = titreEtape.documents ?? []
    const entrepriseDocuments = await getEntrepriseDocumentLargeObjectIdsByEtapeId({ titre_etape_id: etapeId }, pool, user)

    if (!documents.length && !entrepriseDocuments.length) {
      throw new Error("aucun document n'a été trouvé pour cette demande")
    }

    const zip = new JSZip()

    for (let i = 0; i < documents.length; i++) {
      const path = documentFilePathFind(documents[i])
      const filename = path.split('/').pop()

      if (statSync(path).isFile()) {
        zip.file(filename!, readFileSync(path))
      }
    }
    const client = await pool.connect()

    try {
      const man = new LargeObjectManager({ pg: client })

      for (let i = 0; i < entrepriseDocuments.length; i++) {
        await client.query('BEGIN')

        const entrepriseDocument = entrepriseDocuments[i]
        // TODO 2023-08-28 condition a supprimé quand la colonne sere non null en bdd
        if (entrepriseDocument.largeobject_id) {
          const [_size, stream] = await man.openAndReadableStreamAsync(entrepriseDocument.largeobject_id, bufferSize)
          zip.file(`${entrepriseDocument.id}.pdf`, stream)
        }
      }
      const base64Data = await zip.generateAsync({ type: 'base64' })
      await client.query('COMMIT')

      const nom = `documents-${etapeId}.zip`

      return {
        nom,
        format: DOWNLOAD_FORMATS.Zip,
        buffer: Buffer.from(base64Data, 'base64'),
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
    throw new Error('fichier inexistant')
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

export const fichier =
  (_pool: Pool) =>
  async ({ params: { documentId } }: { params: { documentId?: DocumentId } }, user: User) => {
    if (!documentId) {
      throw new Error('id du document absent')
    }

    const document = await documentGet(
      documentId,
      {
        fields: {
          type: { id: {} },
          etape: { id: {} },
        },
      },
      user
    )

    const format = DOWNLOAD_FORMATS.PDF

    if (!document.fichier) {
      throw new Error('fichier inexistant')
    }

    let dossier

    const repertoire = documentRepertoireFind(document)

    if (repertoire === 'demarches') {
      dossier = document.etape!.id
    }

    const nom = `${document.date}-${dossier ? dossier + '-' : ''}${document.typeId}.${format}`

    const filePath = `${repertoire}/${dossier ? dossier + '/' : ''}${document.id}.${document.fichierTypeId}`

    return {
      nom,
      format,
      filePath,
    }
  }

const etapeIdPathGet = (etapeId: string, fichierNom: string, contenu: IContenuValeur, heritageContenu: { actif: boolean; etapeId?: string | null }): null | string => {
  if (Array.isArray(contenu)) {
    const contenuArray = contenu as IContenuElement[]
    for (let i = 0; i < contenuArray.length; i++) {
      const contenuElement = contenuArray[i]
      for (const contenuElementAttr of Object.keys(contenuElement)) {
        const etapeIdFound = etapeIdPathGet(etapeId, fichierNom, contenuElement[contenuElementAttr], heritageContenu)
        if (etapeIdFound) {
          return etapeIdFound
        }
      }
    }
  } else if (contenu === fichierNom) {
    if (heritageContenu.actif) {
      return heritageContenu.etapeId!
    } else {
      return etapeId
    }
  }

  return null
}

export const etapeFichier =
  (_pool: Pool) =>
  async ({ params: { etapeId, fichierNom } }: { params: { etapeId?: EtapeId; fichierNom?: string } }, user: User) => {
    if (!etapeId) {
      throw new Error('id de l’étape absent')
    }
    if (!fichierNom) {
      throw new Error('nom du fichier absent')
    }

    const etape = await titreEtapeGet(etapeId, { fields: {} }, user)

    if (!etape) {
      throw new Error('fichier inexistant')
    }

    let etapeIdPath

    if (etape.contenu) {
      // recherche dans quel élément de quelle section est stocké ce fichier, pour savoir si l’héritage est activé
      for (const sectionId of Object.keys(etape.contenu)) {
        for (const elementId of Object.keys(etape.contenu[sectionId])) {
          etapeIdPath = etapeIdPathGet(etape.id, fichierNom, etape.contenu[sectionId][elementId], etape.heritageContenu![sectionId][elementId])
        }
      }
    }

    if (!etapeIdPath && etape.decisionsAnnexesContenu) {
      etapeIdPath = etape.id
    }

    if (!etapeIdPath) {
      throw new Error('fichier inexistant')
    }
    const repertoire = 'demarches' as IDocumentRepertoire

    const filePath = `${repertoire}/${etapeIdPath}/${fichierNom}`

    return {
      nom: fichierNom.slice(5),
      format: DOWNLOAD_FORMATS.PDF,
      filePath,
    }
  }
