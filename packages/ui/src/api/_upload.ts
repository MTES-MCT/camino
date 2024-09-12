import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { TempDocumentName, tempDocumentNameValidator } from 'camino-common/src/document'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'

const CHUNK_SIZE = 1048576 // 1 Mo
const apiUrl = '/apiUrl'

export const uploadCall = async (file: File, progressCb: (progress: number) => void): Promise<TempDocumentName> => {
  const uppy = new Uppy({
    autoProceed: true,
  })

  uppy.use(Tus, {
    chunkSize: CHUNK_SIZE,
    endpoint: `${apiUrl}/televersement`,
    onShouldRetry: () => {
      return false
    },
    onChunkComplete: (_, bytesAccepted, bytesTotal) => {
      progressCb((bytesAccepted / bytesTotal) * 100)
    },
  })

  uppy.addFile({
    name: file.name,
    data: file,
  })

  progressCb(0)

  return new Promise((resolve, reject) => {
    uppy.on('complete', result => {
      const { successful, failed } = result

      if (isNotNullNorUndefinedNorEmpty(failed) || isNullOrUndefinedOrEmpty(successful)) {
        reject(new Error('Échec du téléversement'))
      } else {
        const [{ uploadURL }] = successful
        if (isNullOrUndefinedOrEmpty(uploadURL)) {
          reject(new Error('Echec de la récupération du téléversement'))
        } else {
          resolve(tempDocumentNameValidator.parse(uploadURL.substring(uploadURL.lastIndexOf('/') + 1)))
        }
      }
    })
  })
}
