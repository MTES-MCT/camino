import { dirCreate } from '../tools/dir-create.js'
import { DOCUMENTS_REPERTOIRES } from '../types.js'

export const filesInit = () => {
  dirCreate('files')

  for (const documentsRepertoire of DOCUMENTS_REPERTOIRES) {
    dirCreate(`files/${documentsRepertoire}`)
  }
}
