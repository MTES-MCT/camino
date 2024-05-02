import { isEventWithTarget } from '@/utils/vue-tsx-utils'
import { FileUploadType } from 'camino-common/src/static/documentsTypes'
import { defineComponent, ref } from 'vue'

interface Props {
  accept: FileUploadType[]
  uploadFile: (file: File) => void
}

const isDragEvent = (e: Event): e is DragEvent => {
  return 'dataTransfer' in e
}

export const InputFile = defineComponent<Props>(props => {
  const inputValue = ref<FileList | null>(null)
  const uploadFile = (e: Event) => {
    if (isEventWithTarget(e)) {
      const file = e.target.files?.item(0)
      if (file) {
        props.uploadFile(file)
      }
    }
  }

  const dropFile = (e: Event) => {
    dragHover.value = false
    e.preventDefault()
    e.stopPropagation()
    if (isDragEvent(e)) {
      const file = e.dataTransfer?.files?.item(0)
      inputValue.value = e.dataTransfer?.files ?? null
      if (file) {
        props.uploadFile(file)
      }
    }
  }

  const dragHover = ref(false)

  const onDragHover = (e: Event) => {
    dragHover.value = true
    e.preventDefault()
    e.stopPropagation()
  }
  const onDragLeave = (_e: Event) => {
    dragHover.value = false
  }

  return () => (
    <div class="fr-upload-group" style={{ opacity: dragHover.value ? '20%' : '100%' }} onDragover={onDragHover} onDragleave={onDragLeave} onDrop={dropFile}>
      <label class="fr-label" for="file-upload">
        Ajouter un fichier
        <span class="fr-hint-text">
          Taille maximale : 100 Mo. Format{props.accept.length > 1 ? 's' : null} supporté{props.accept.length > 1 ? 's' : null} : {props.accept.join(', ')}.
        </span>
      </label>
      {/* @ts-ignore files n'est pas reconnu par le typage... */}
      <input files={inputValue.value} class="fr-upload" type="file" id="file-upload" name="file-upload" accept={props.accept.map(a => `.${a}`).join(',')} onChange={uploadFile} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
InputFile.props = ['accept', 'uploadFile']
