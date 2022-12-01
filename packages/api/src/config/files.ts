import dirCreate from '../tools/dir-create.js'
import { DOCUMENTS_REPERTOIRES } from '../types.js'

export const filesInit = async () => {
  await dirCreate('files').catch()

  for (const documentsRepertoire of DOCUMENTS_REPERTOIRES) {
    await dirCreate(`files/${documentsRepertoire}`).catch()
  }
}
