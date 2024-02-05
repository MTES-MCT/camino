import Uppy from '@uppy/core'
import Tus, { TusOptions } from '@uppy/tus'
import { errorThrow } from './_client'
import { Upload } from 'tus-js-client'
import { TempDocumentName, tempDocumentNameValidator } from 'camino-common/src/document'

const CHUNK_SIZE = 1048576 // 1 Mo
const apiUrl = '/apiUrl'

export const uploadCall = async (file: File, progressCb: (progress: number) => void): Promise<TempDocumentName> => {
  const uppy = new Uppy({
    autoProceed: true,
  })

  uppy.use<TusOptions & { onChunkComplete: Upload['options']['onChunkComplete'] }, Tus>(Tus, {
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

      if (failed.length || !successful.length) {
        reject(errorThrow(new Error('Échec du téléversement')))
      }

      const [{ uploadURL }] = successful
      console.log(successful)
      resolve(tempDocumentNameValidator.parse(uploadURL.substring(uploadURL.lastIndexOf('/') + 1)))
    })
  })
}
