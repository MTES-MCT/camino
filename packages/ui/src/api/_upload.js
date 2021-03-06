import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { errorThrow } from './_client'

const CHUNK_SIZE = 1048576 // 1 Mo
const apiUrl = '/apiUrl'

const uploadCall = async (file, progressCb) => {
  const uppy = new Uppy({
    autoProceed: true
  })

  uppy.use(Tus, {
    chunkSize: CHUNK_SIZE,
    endpoint: `${apiUrl}/televersement`,
    onShouldRetry: () => {
      return false
    },
    onChunkComplete: (_, bytesAccepted, bytesTotal) => {
      progressCb((bytesAccepted / bytesTotal) * 100)
    }
  })

  uppy.addFile({
    name: file.name,
    data: file
  })

  progressCb(0)

  return new Promise((resolve, reject) => {
    uppy.on('complete', result => {
      const { successful, failed } = result

      if (failed.length || !successful.length) {
        reject(errorThrow(new Error('Échec du téléversement')))
      }

      const [{ uploadURL }] = successful
      resolve(uploadURL)
    })
  })
}

export { uploadCall }
