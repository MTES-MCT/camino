import { caminoDefineComponent, isEventWithTarget } from '@/utils/vue-tsx-utils'
import { FileUploadType } from 'camino-common/src/static/documentsTypes'

interface Props {
  accept: FileUploadType[]
  uploadFile: (file: File) => void
}

export const InputFile = caminoDefineComponent<Props>(['accept', 'uploadFile'], props => {
  const uploadFile = (e: Event) => {
    if (isEventWithTarget(e)) {
      const file = e.target.files?.item(0)
      if (file) {
        props.uploadFile(file)
      }
    }
  }

  return () => (
    <div class="dsfr">
      <div class="fr-upload-group">
        <label class="fr-label" for="file-upload">
          Ajouter un fichier
          <span class="fr-hint-text">Taille maximale : 30 Mo. Formats supportés : {props.accept.join(', ')}.</span>
        </label>
        <input class="fr-upload" type="file" id="file-upload" name="file-upload" accept={props.accept.map(a => `.${a}`).join(',')} onChange={uploadFile} />
      </div>
    </div>
  )
})
