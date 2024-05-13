import { DOWNLOADS_DIRECTORY } from '../api/rest/fichiers.js'
import { dirCreate } from '../tools/dir-create.js'

export const filesInit = () => {
  dirCreate('files')
  dirCreate('files/tmp')
  dirCreate(`files/${DOWNLOADS_DIRECTORY}`)
}
