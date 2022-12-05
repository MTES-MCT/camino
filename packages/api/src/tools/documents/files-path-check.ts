import { Index } from '../../types.js'
import { IndexFile } from './_types.js'

export const filesPathCheck = (
  documentsIndex: IndexFile,
  filesIndex: Index<string>,
  display = true
): string[] => {
  const filesPathInvalid = Object.keys(filesIndex)
    .sort()
    .filter(
      fileName =>
        fileName &&
        documentsIndex[fileName] &&
        filesIndex[fileName] !== documentsIndex[fileName].path
    )

  if (display) {
    if (filesPathInvalid.length) {
      console.info(
        `${filesPathInvalid.length} fichiers ne sont pas au bon endroit sur le disque`
      )
      filesPathInvalid.forEach(file =>
        console.info(`- ${filesIndex[file]} -> ${documentsIndex[file].path}`)
      )
    } else {
      console.info('tous les fichiers sont au bon endroit sur le disque')
    }
  }

  return filesPathInvalid
}
