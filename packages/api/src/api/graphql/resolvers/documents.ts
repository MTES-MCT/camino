import { GraphQLResolveInfo } from 'graphql'
import { FileUpload } from 'graphql-upload'
import { join } from 'path'
import { Context, IDocument } from '../../../types.js'

import fileDelete from '../../../tools/file-delete.js'
import fileStreamCreate from '../../../tools/file-stream-create.js'

import { documentGet, documentCreate, documentUpdate, documentDelete } from '../../../database/queries/documents.js'

import { documentTypeGet } from '../../../database/queries/metas.js'

import { fieldsBuild } from './_fields-build.js'
import fileRename from '../../../tools/file-rename.js'
import { titreEtapeGet } from '../../../database/queries/titres-etapes.js'

import { documentInputValidate } from '../../../business/validations/document-input-validate.js'
import { documentUpdationValidate } from '../../../business/validations/document-updation-validate.js'
import { userSuper } from '../../../database/user-super.js'
import { documentFilePathFind } from '../../../tools/documents/document-path-find.js'
import { isBureauDEtudes, isEntreprise, User } from 'camino-common/src/roles.js'
import { canCreateOrEditEtape } from 'camino-common/src/permissions/titres-etapes.js'
import { newDocumentId } from '../../../database/models/_format/id-create.js'
import { EtapeId } from 'camino-common/src/etape.js'

const documentFileCreate = async (document: IDocument, fileUpload: FileUpload) => {
  const documentFilePath = documentFilePathFind(document, true)
  const { createReadStream } = await fileUpload

  await fileStreamCreate(createReadStream(), join(process.cwd(), documentFilePath))
}

const documentPermissionsCheck = async (document: IDocument, user: User) => {
  if (!user) throw new Error('droits insuffisants')

  if (document.titreEtapeId) {
    const titreEtape = await titreEtapeGet(
      document.titreEtapeId,
      {
        fields: {
          titulaires: { id: {} },
          demarche: { titre: { pointsEtape: { id: {} } } },
        },
      },
      user
    )

    if (!titreEtape) throw new Error("l’étape n'existe pas")

    if (!titreEtape.titulaires) {
      throw new Error('Les titulaires de l’étape ne sont pas chargés')
    }
    if (!titreEtape.demarche || !titreEtape.demarche.titre || titreEtape.demarche.titre.administrationsLocales === undefined || !titreEtape.demarche.titre.titreStatutId) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    if (
      !canCreateOrEditEtape(
        user,
        titreEtape.typeId,
        titreEtape.statutId,
        titreEtape.titulaires,
        titreEtape.demarche.titre.administrationsLocales ?? [],
        titreEtape.demarche.typeId,
        {
          typeId: titreEtape.demarche.titre.typeId,
          titreStatutId: titreEtape.demarche.titre.titreStatutId,
        },
        'modification'
      )
    ) {
      throw new Error('droits insuffisants')
    }
  }
}

export const documentCreer = async ({ document }: { document: IDocument }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    if (!user) {
      throw new Error('droit insuffisants')
    }

    await documentPermissionsCheck(document, user)

    const documentType = await documentTypeGet(document.typeId)

    if (!documentType) {
      throw new Error('type de document manquant')
    }

    const errors = documentInputValidate(document)

    const rulesErrors = await documentUpdationValidate(document)

    if (errors.length || rulesErrors.length) {
      throw new Error(errors.concat(rulesErrors).join(', '))
    }

    document.id = newDocumentId(document.date, document.typeId)

    // Enregistre le nouveau fichier
    // - arrivé via API (requêtes libres)
    if (document.fichierNouveau) {
      document.fichier = true
      await documentFileCreate(document, document.fichierNouveau.file)
    } else if (document.nomTemporaire) {
      // - arrivé via UI
      const pathFrom = `/files/tmp/${document.nomTemporaire}`
      const pathTo = await documentFilePathFind(document, true)

      await fileRename(pathFrom, pathTo)
    }

    if (document.publicLecture || isEntreprise(user) || isBureauDEtudes(user)) {
      document.entreprisesLecture = true
    }

    const { id } = await documentCreate(document)

    const documentUpdated = await documentGet(id, { fields }, user)

    return documentUpdated
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const documentModifier = async ({ document }: { document: IDocument }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

    if (!user) {
      throw new Error('droit insuffisants')
    }

    const documentOld = await documentGet(document.id, {}, user)
    if (!documentOld) throw new Error("le document n'existe pas")

    await documentPermissionsCheck(document, user)

    const errors = documentInputValidate(document)
    const rulesErrors = documentUpdationValidate(document)

    if (errors.length || rulesErrors.length) {
      const e = errors.concat(rulesErrors)
      throw new Error(e.join(', '))
    }

    if (document.publicLecture || isEntreprise(user) || isBureauDEtudes(user)) {
      document.entreprisesLecture = true
    }

    const documentFichierNouveau = document.fichierNouveau

    document.fichier = !!document.fichierNouveau || document.fichier

    const documentUpdated = await documentUpdate(document.id, document)

    // supprime de l'ancien fichier
    if ((documentFichierNouveau || !documentUpdated.fichier) && documentOld.fichier) {
      const documentOldFilePath = await documentFilePathFind(documentOld)

      try {
        await fileDelete(join(process.cwd(), documentOldFilePath))
      } catch (e) {
        console.info(`impossible de supprimer le fichier: ${documentOldFilePath}`)
      }
    }

    // Enregistre le nouveau fichier
    // - arrivé via API (requêtes libres)
    if (documentFichierNouveau) {
      await documentFileCreate(documentUpdated, documentFichierNouveau.file)
    } else {
      // - arrivé via UI
      if (document.nomTemporaire) {
        const pathFrom = `/files/tmp/${document.nomTemporaire}`
        const pathTo = await documentFilePathFind(document, true)

        await fileRename(pathFrom, pathTo)
      }
    }

    return await documentGet(documentUpdated.id, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const documentSupprimer = async ({ id }: { id: string }, { user }: Context) => {
  try {
    if (!user) throw new Error('droits insuffisants')

    const documentOld = await documentGet(
      id,
      {
        fields: {
          type: {
            id: {},
          },
        },
      },
      user
    )

    if (!documentOld) {
      throw new Error('aucun document avec cette id')
    }

    if (!documentOld.suppression) {
      throw new Error('droits insuffisants')
    }

    await documentPermissionsCheck(documentOld, user)

    if (documentOld.fichier) {
      const documentOldFilePath = await documentFilePathFind(documentOld)

      try {
        await fileDelete(join(process.cwd(), documentOldFilePath))
      } catch (e) {
        console.info(`impossible de supprimer le fichier: ${documentOldFilePath}`)
      }
    }

    await documentDelete(id)

    return true
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const documentsLier = async (context: Context, documentIds: string[], etapeId: EtapeId, oldParent?: { documents?: IDocument[] | null }) => {
  if (oldParent?.documents?.length) {
    // supprime les anciens documents ou ceux qui n'ont pas de fichier
    const oldDocumentsIds = oldParent.documents.map(d => d.id)
    for (const oldDocumentId of oldDocumentsIds) {
      const documentId = documentIds.find(id => id === oldDocumentId)

      if (!documentId) {
        await documentSupprimer({ id: oldDocumentId }, context)
      }
    }
  }

  // lie des documents
  for (const documentId of documentIds) {
    const document = await documentGet(documentId, { fields: {} }, userSuper)

    if (!document.titreEtapeId) {
      await documentUpdate(document.id, { titreEtapeId: etapeId })

      if (document.fichier) {
        const documentPath = documentFilePathFind(document)
        document.titreEtapeId = etapeId
        const newDocumentPath = documentFilePathFind(document, true)

        await fileRename(documentPath, newDocumentPath)
      }
    }
  }
}
