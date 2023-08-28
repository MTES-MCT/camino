import { IContenuElement, IContenuValeur, IDocumentRepertoire } from '../../types.js'

import { documentGet } from '../../database/queries/documents.js'
import { titreEtapeGet } from '../../database/queries/titres-etapes.js'
import { documentRepertoireFind } from '../../tools/documents/document-repertoire-find.js'
import { documentFilePathFind, entrepriseDocumentFilePathFind } from '../../tools/documents/document-path-find.js'

import JSZip from 'jszip'
import { statSync, readFileSync } from 'fs'
import { User } from 'camino-common/src/roles'
import { DOWNLOAD_FORMATS, contentTypes } from 'camino-common/src/rest.js'
import { Pool } from 'pg'
import { EtapeId } from 'camino-common/src/etape.js'
import { DocumentId, EntrepriseDocumentId, entrepriseDocumentIdValidator } from 'camino-common/src/entreprise.js'
import { getEntrepriseDocuments } from './entreprises.queries.js'
import { getEntrepriseDocumentIdsByEtapeId } from '../../database/queries/titres-etapes.queries.js'
import { LargeObjectManager } from 'pg-large-object'
import { CaminoRequest } from './express-type.js'
import express from 'express'

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
    const entrepriseDocuments = await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etapeId }, pool, user)

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

    for (let i = 0; i < entrepriseDocuments.length; i++) {
      const { fullPath, fileName } = entrepriseDocumentFilePathFind(entrepriseDocuments[i].id, entrepriseDocuments[i].entreprise_id)

      if (statSync(fullPath).isFile()) {
        zip.file(fileName!, readFileSync(fullPath))
      }
    }

    const base64Data = await zip.generateAsync({ type: 'base64' })

    const nom = `documents-${etapeId}.zip`

    try {
      return {
        nom,
        format: DOWNLOAD_FORMATS.Zip,
        buffer: Buffer.from(base64Data, 'base64'),
      }
    } catch (e) {
      console.error(e)

      throw e
    }
  }

const bufferSize = 16384

export const entrepriseDocumentDownload = (pool: Pool) => {
  return async (req: CaminoRequest, res: express.Response) => {
    const user = req.auth
    const entrepriseDocumentId = entrepriseDocumentIdValidator.parse(req.params.documentId)
    const entrepriseDocuments = await getEntrepriseDocuments([entrepriseDocumentId], [], pool, user)

    if (entrepriseDocuments.length !== 1) {
      throw new Error('fichier inexistant')
    }

    const entrepriseDocument = entrepriseDocuments[0]

    const client = await pool.connect()
    try {
      const man = new LargeObjectManager({ pg: client })

      await client.query('BEGIN')

      res.header('Content-disposition', `inline; filename=${encodeURIComponent(`${entrepriseDocument.id}.${DOWNLOAD_FORMATS.PDF}`)}`)
      res.header('Content-Type', contentTypes[DOWNLOAD_FORMATS.PDF])

      // TODO 2023-08-28 condition a supprimé quand la colonne sere non null en bdd
      if (entrepriseDocument.largeobject_id) {
        await man.openAndReadableStreamAsync(entrepriseDocument.largeobject_id, bufferSize).then(([size, stream]) => {
          res.header('Content-Length', `${size}`)

          stream.pipe(res)

          stream.on('error', function () {
            client.query('ROLLBACK')
          })
          res.on('close', function () {
            client.query('COMMIT')
          })
        })
      }
    } catch (e) {
      await client.query('ROLLBACK')
      console.error(e)
      throw e
    } finally {
      client.release()
    }
  }
}

export const fichier =
  (pool: Pool) =>
  async ({ params: { documentId } }: { params: { documentId?: DocumentId | EntrepriseDocumentId } }, user: User) => {
    if (!documentId) {
      throw new Error('id du document absent')
    }

    const document = await documentGet(
      documentId,
      {
        fields: {
          type: { id: {} },
          etape: { id: {} },
          activite: { id: {} },
        },
      },
      user
    )

    const format = DOWNLOAD_FORMATS.PDF

    if (!document) {
      const entrepriseDocumentId = entrepriseDocumentIdValidator.parse(documentId)
      const entrepriseDocuments = await getEntrepriseDocuments([entrepriseDocumentId], [], pool, user)

      if (entrepriseDocuments.length !== 1) {
        throw new Error('fichier inexistant')
      }

      const entrepriseDocument = entrepriseDocuments[0]
      const { fullPath } = entrepriseDocumentFilePathFind(entrepriseDocument.id, entrepriseDocument.entreprise_id)

      return {
        nom: entrepriseDocument.id,
        format,
        filePath: fullPath,
      }
    } else {
      if (!document.fichier) {
        throw new Error('fichier inexistant')
      }

      let dossier

      const repertoire = documentRepertoireFind(document)

      if (repertoire === 'demarches') {
        dossier = document.etape!.id
      } else if (repertoire === 'activites') {
        dossier = document.activite!.id
      }

      const nom = `${document.date}-${dossier ? dossier + '-' : ''}${document.typeId}.${format}`

      const filePath = `${repertoire}/${dossier ? dossier + '/' : ''}${document.id}.${document.fichierTypeId}`

      return {
        nom,
        format,
        filePath,
      }
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
