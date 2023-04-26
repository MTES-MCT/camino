import { GraphQLResolveInfo } from 'graphql'
import { FileUpload } from 'graphql-upload'
import { join } from 'path'
import cryptoRandomString from 'crypto-random-string'

import { Context, IDocument, ITitreEtape } from '../../../types.js'

import fileDelete from '../../../tools/file-delete.js'
import fileStreamCreate from '../../../tools/file-stream-create.js'

import { documentsGet, documentGet, documentCreate, documentUpdate, documentDelete } from '../../../database/queries/documents.js'

import { documentTypeGet } from '../../../database/queries/metas.js'

import { fieldsBuild } from './_fields-build.js'
import fileRename from '../../../tools/file-rename.js'
import { titreEtapeGet } from '../../../database/queries/titres-etapes.js'
import { titreActiviteGet } from '../../../database/queries/titres-activites.js'

import { documentInputValidate } from '../../../business/validations/document-input-validate.js'
import { documentUpdationValidate } from '../../../business/validations/document-updation-validate.js'
import { entrepriseGet } from '../../../database/queries/entreprises.js'
import { userSuper } from '../../../database/user-super.js'
import { documentFilePathFind } from '../../../tools/documents/document-path-find.js'
import { isBureauDEtudes, isEntreprise, User } from 'camino-common/src/roles.js'
import { canEditEntreprise } from 'camino-common/src/permissions/entreprises.js'
import { canCreateOrEditEtape } from 'camino-common/src/permissions/titres-etapes.js'

const errorEtapesAssocieesUpdate = (etapesAssociees: ITitreEtape[], action: 'supprimer' | 'modifier') =>
  `impossible de ${action} ce document lié ${etapesAssociees.length > 1 ? 'aux étapes' : 'à l’étape'} ${etapesAssociees.map(e => e.id).join(', ')}`

const documentFileCreate = async (document: IDocument, fileUpload: FileUpload) => {
  const documentFilePath = await documentFilePathFind(document, true)
  const { createReadStream } = await fileUpload

  await fileStreamCreate(createReadStream(), join(process.cwd(), documentFilePath))
}

export const documents = async ({ entreprisesIds }: { entreprisesIds?: string[] }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)
    const documents = await documentsGet({ entreprisesIds }, { fields }, user)

    return documents
  } catch (e) {
    console.error(e)

    throw e
  }
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
  } else if (document.entrepriseId) {
    const entreprise = await entrepriseGet(document.entrepriseId, { fields: {} }, user)

    if (!entreprise) throw new Error("l'entreprise n'existe pas")

    if (!canEditEntreprise(user, entreprise.id)) throw new Error('droits insuffisants')
  } else if (document.titreActiviteId) {
    // si l'activité est récupérée depuis la base
    // alors on a le droit de la visualiser, donc de l'éditer
    const activite = await titreActiviteGet(document.titreActiviteId, { fields: { type: { titresTypes: { id: {} } }, titre: { id: {} } } }, user)

    if (!activite) throw new Error("l'activité n'existe pas")

    if (!activite.modification) throw new Error('droits insuffisants')
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

    const errors = await documentInputValidate(document)

    const rulesErrors = await documentUpdationValidate(document)

    if (errors.length || rulesErrors.length) {
      throw new Error(errors.concat(rulesErrors).join(', '))
    }

    const hash = cryptoRandomString({ length: 8 })
    document.id = `${document.date}-${document.typeId}-${hash}`

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

    if (documentOld.etapesAssociees && documentOld.etapesAssociees.length > 0) {
      throw new Error(errorEtapesAssocieesUpdate(documentOld.etapesAssociees, 'modifier'))
    }

    const errors = await documentInputValidate(document)
    const rulesErrors = await documentUpdationValidate(document)

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
            activitesTypes: { id: {} },
          },
          etapesAssociees: { id: {} },
        },
      },
      user
    )

    if (!documentOld) {
      throw new Error('aucun document avec cette id')
    }

    if (documentOld.etapesAssociees && documentOld.etapesAssociees.length > 0) {
      throw new Error(errorEtapesAssocieesUpdate(documentOld.etapesAssociees, 'supprimer'))
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

export const documentsLier = async (context: Context, documentIds: string[], parentId: string, propParentId: 'titreActiviteId' | 'titreEtapeId', oldParent?: { documents?: IDocument[] | null }) => {
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

    if (!document[propParentId]) {
      await documentUpdate(document.id, { [propParentId]: parentId })

      if (document.fichier) {
        const documentPath = await documentFilePathFind(document)
        document[propParentId] = parentId

        const newDocumentPath = await documentFilePathFind(document, true)

        await fileRename(documentPath, newDocumentPath)
      }
    }
  }
}
