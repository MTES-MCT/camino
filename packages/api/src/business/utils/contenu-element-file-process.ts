import { FileUpload } from 'graphql-upload'
import { join } from 'path'

import { IContenu, IContenuValeur, IDocumentRepertoire, ITitreEtape } from '../../types.js'

import { dirCreate } from '../../tools/dir-create.js'
import fileStreamCreate from '../../tools/file-stream-create.js'
import fileDelete from '../../tools/file-delete.js'
import { Section, SectionsElement } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { idGenerate } from '../../database/models/_format/id-create.js'

const sectionElementContenuAndFilesGet = (contenuValeur: IContenuValeur, sectionElement: DeepReadonly<SectionsElement>) => {
  const newFiles = [] as FileUpload[]
  let newValue = contenuValeur as IContenuValeur | null

  if (sectionElement.type === 'file') {
    const fileUpload = contenuValeur as {
      file: FileUpload
    }

    if (fileUpload?.file) {
      const fileName = `${idGenerate(4)}-${fileUpload.file.filename}`
      fileUpload.file.filename = fileName
      newFiles.push(fileUpload?.file)
      newValue = fileName
    }
  }

  return { newValue, newFiles }
}

const sectionsContenuAndFilesGet = (contenu: IContenu | undefined | null, sections: DeepReadonly<Section[]>) => {
  const newFiles = [] as FileUpload[]
  if (contenu) {
    Object.keys(contenu)
      .filter(sectionId => contenu![sectionId])
      .forEach(sectionId =>
        Object.keys(contenu![sectionId]).forEach(elementId => {
          const sectionElement = sections.find(s => s.id === sectionId)?.elements?.find(e => e.id === elementId)

          if (sectionElement) {
            const sectionElementResult = sectionElementContenuAndFilesGet(contenu[sectionId][elementId], sectionElement)

            if (!sectionElementResult || sectionElementResult.newValue === undefined || sectionElementResult.newValue === null) {
              delete contenu[sectionId][elementId]
            } else {
              contenu[sectionId][elementId] = sectionElementResult.newValue
            }

            if (sectionElementResult.newFiles.length) {
              newFiles.push(...sectionElementResult.newFiles)
            }
          }
        })
      )
  }

  return { contenu, newFiles }
}

const contenuFilesGet = (contenu: IContenu | null | undefined, sections: DeepReadonly<Section[]>) => {
  const files = [] as string[]
  if (contenu) {
    sections
      .filter(section => section.elements)
      .forEach(section =>
        section.elements!.forEach(element => {
          const contenuValeur = contenu[section.id] ? contenu[section.id][element.id] : null

          files.push(...sectionElementFilesGet(element, contenuValeur))
        })
      )
  }

  return files
}

const sectionElementFilesGet = (sectionElement: DeepReadonly<SectionsElement>, contenuValeur: IContenuValeur | null) => {
  const files = [] as string[]
  if (sectionElement.type === 'file') {
    if (contenuValeur) {
      files.push(contenuValeur as string)
    }
  }

  return files
}

const contenuFilesPathGet = (repertoire: IDocumentRepertoire, parentId: string) => `files/${repertoire}/${parentId}`

const contenuElementFilesCreate = async (newFiles: FileUpload[], repertoire: IDocumentRepertoire, parentId: string) => {
  if (newFiles.length) {
    const dirPath = `files/${repertoire}/${parentId}`
    dirCreate(join(process.cwd(), dirPath))
    // on enregistre tous les nouveaux fichiers sur le disque
    for (const file of newFiles) {
      if (file) {
        const { createReadStream } = file

        await fileStreamCreate(createReadStream(), join(process.cwd(), `${dirPath}/${file.filename}`))
      }
    }
  }
}

const contenuElementFilesDelete = async (
  repertoire: IDocumentRepertoire,
  parentId: string,
  sections: DeepReadonly<Section[]>,
  contenuGet: (etape: ITitreEtape) => IContenu | null | undefined,
  etapes?: ITitreEtape[] | null,
  oldContenu?: IContenu | null
) => {
  const dirPath = `files/${repertoire}/${parentId}`

  // on récupère tous les fichiers présents sur le disque avant la mise à jour
  const oldFiles = contenuFilesGet(oldContenu, sections)

  // on récupère tous les fichiers actuels
  const files = etapes
    ? etapes.reduce((acc, etape) => {
        acc.push(...contenuFilesGet(contenuGet(etape), sections))

        return acc
      }, [] as string[])
    : []

  // on supprime les fichiers qui ne sont plus utiles
  for (const oldFile of oldFiles) {
    if (!files.includes(oldFile)) {
      const oldFilePath = `${dirPath}/${oldFile}`
      try {
        await fileDelete(join(process.cwd(), oldFilePath))
      } catch (e) {
        console.error(`impossible de supprimer le fichier: ${oldFilePath}`, e)
      }
    }
  }
}

export { contenuElementFilesCreate, contenuElementFilesDelete, sectionsContenuAndFilesGet, contenuFilesGet, contenuFilesPathGet }
