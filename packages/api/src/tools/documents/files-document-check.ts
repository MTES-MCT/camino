import { Index } from '../../types.js'
import { IndexFile } from './_types.js'
import { matchFuzzy } from './_utils.js'
import { titreEtapeGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { contenuFilesGet } from '../../business/utils/contenu-element-file-process.js'
import { etapeTypeSectionsFormat } from '../../api/_format/etapes-types.js'

const etapeGet = (str: string) => str.split('-').slice(0, -1).join('-')

const contenuFilesCheck = async (filePath: string) => {
  // c’est peut-être un fichier d’un contenu d’étape

  const split = filePath.split('/')

  const repertoire = split[0]
  const etapeId = split[1]
  const fileName = split[2]

  if (repertoire !== 'demarches') {
    return false
  }
  const etape = await titreEtapeGet(
    etapeId,
    { fields: { type: { id: {} } } },
    userSuper
  )
  if (etape) {
    const sections = etapeTypeSectionsFormat(
      etape.type!.sections,
      etape.sectionsSpecifiques
    )
    const contenuFiles = contenuFilesGet(etape.contenu, sections)

    if (contenuFiles.includes(fileName)) {
      return true
    }

    if (etape.decisionsAnnexesSections) {
      const decisionsAnnexesContenuFiles = contenuFilesGet(
        etape.decisionsAnnexesContenu,
        etape.decisionsAnnexesSections
      )

      if (decisionsAnnexesContenuFiles.includes(fileName)) {
        return true
      }
    }
  }

  return false
}

export const filesDocumentCheck = async (
  documentsIndex: IndexFile,
  filesIndex: Index<string>
) => {
  const filesMissing = [] as {
    name: string
    documentsHashMatches: string[]
    filesHashMatches: string[]
    filesEtapeMatches: string[]
  }[]

  for (const fileName of Object.keys(filesIndex).sort()) {
    if (
      fileName &&
      !documentsIndex[fileName] &&
      !(await contenuFilesCheck(filesIndex[fileName]))
    ) {
      filesMissing.push({
        name: filesIndex[fileName],
        documentsHashMatches: matchFuzzy(fileName, documentsIndex),
        filesHashMatches: matchFuzzy(fileName, filesIndex),
        filesEtapeMatches: matchFuzzy(fileName, filesIndex, etapeGet)
      })
    }
  }

  // trie les fichiers sans hash en base en premier
  filesMissing.sort(
    (a, b) =>
      a.documentsHashMatches.length +
      a.filesHashMatches.length +
      a.filesEtapeMatches.length -
      (b.documentsHashMatches.length +
        b.filesHashMatches.length +
        b.filesEtapeMatches.length)
  )

  if (filesMissing.length) {
    console.info(
      `${filesMissing.length} fichiers ne correspondent à aucun document dans la base de données`
    )

    filesMissing.forEach(file => {
      console.info(`- ${file.name}`)

      if (file.documentsHashMatches.length) {
        const documentsHashMatchesString = ` (${file.documentsHashMatches.length} hashe(s) en base)`

        console.info(
          `${documentsHashMatchesString}:`,
          file.documentsHashMatches.join(', ')
        )
      }

      if (
        file.filesHashMatches.length &&
        file.filesHashMatches[0] !== file.documentsHashMatches[0]
      ) {
        const filesHashMatchesString = ` (${file.filesHashMatches.length} autre(s) hashe(s) dans les fichiers)`

        console.info(
          `${filesHashMatchesString}:`,
          file.filesHashMatches.join(', ')
        )
      }

      if (
        file.filesEtapeMatches.length &&
        file.filesEtapeMatches[0] !== file.documentsHashMatches[0]
      ) {
        const filesEtapeMatchesString = ` (${file.filesEtapeMatches.length} autre(s) etape(s) dans les fichiers)`

        console.info(
          `${filesEtapeMatchesString}:`,
          file.filesEtapeMatches.join(', ')
        )
      }
    })
  } else {
    console.info(
      'tous les fichiers correspondent à des documents dans la base de données'
    )
  }
}
