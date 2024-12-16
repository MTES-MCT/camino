import { DOWNLOADS_DIRECTORY } from '../api/rest/fichiers'
import { dirCreate } from '../tools/dir-create'

export const filesInit = (): void => {
  dirCreate('files')
  dirCreate('files/tmp')
  dirCreate(`files/${DOWNLOADS_DIRECTORY}`)
}
