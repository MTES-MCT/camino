import { IContenuElement, IContenuValeur, IDocument, IDocumentRepertoire } from '../../types.js'

import { documentGet } from '../../database/queries/documents.js'
import { titreEtapeGet } from '../../database/queries/titres-etapes.js'
import { documentRepertoireFind } from '../../tools/documents/document-repertoire-find.js'
import { documentFilePathFind } from '../../tools/documents/document-path-find.js'

import JSZip from 'jszip'
import { statSync, readFileSync } from 'fs'
import { User } from 'camino-common/src/roles'
import { DOWNLOAD_FORMATS } from 'camino-common/src/rest.js'

export const etapeTelecharger = async ({ params: { etapeId } }: { params: { etapeId?: string } }, user: User) => {
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
        justificatifs: {
          id: {},
        },
      },
    },
    user
  )

  if (!titreEtape) throw new Error("l'étape n'existe pas")

  const documents = titreEtape!.documents
  const justificatifs = titreEtape!.justificatifs
  if ((!documents || !documents.length) && (!justificatifs || !justificatifs.length)) {
    throw new Error("aucun document n'a été trouvé pour cette demande")
  }

  let allDocs: IDocument[] = []
  if (documents?.length) allDocs = allDocs.concat(documents)
  if (justificatifs?.length) allDocs = allDocs.concat(justificatifs)

  const zip = new JSZip()

  for (let i = 0; i < allDocs!.length; i++) {
    const path = await documentFilePathFind(allDocs[i])
    const filename = path.split('/').pop()

    if (statSync(path).isFile()) {
      zip.file(filename!, readFileSync(path))
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

export const fichier = async ({ params: { documentId } }: { params: { documentId?: string } }, user: User) => {
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
        entreprise: { id: {} },
      },
    },
    user
  )

  if (!document || !document.fichier) {
    throw new Error('fichier inexistant')
  }

  let dossier

  const repertoire = documentRepertoireFind(document)

  const format = DOWNLOAD_FORMATS.PDF

  if (repertoire === 'demarches') {
    dossier = document.etape!.id
  } else if (repertoire === 'activites') {
    dossier = document.activite!.id
  } else if (repertoire === 'entreprises') {
    dossier = document.entreprise!.id
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

export const etapeFichier = async ({ params: { etapeId, fichierNom } }: { params: { etapeId?: string; fichierNom?: string } }, user: User) => {
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
