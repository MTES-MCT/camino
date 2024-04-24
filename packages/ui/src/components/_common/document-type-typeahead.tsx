import { Ref, computed, defineComponent, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'

type Props = {
  alwaysOpen?: boolean
  documentTypeIds: DeepReadonly<DocumentTypeId[]>
  initialValue?: DocumentTypeId
  documentTypeIdSelected: (documentTypeId: DocumentTypeId | null) => void
}

type DocumentLabel = { id: DocumentTypeId; nom: string }

export const DocumentTypeTypeahead = defineComponent<Props>(props => {
  const documentTypeSelected = ref<DocumentLabel | null>(props.initialValue ? DocumentsTypes[props.initialValue] : null) as Ref<DocumentLabel | null>
  const documentTypeUpdate = async (documentType: DocumentLabel | undefined) => {
    documentTypeSelected.value = documentType ?? null
    props.documentTypeIdSelected(isNotNullNorUndefined(documentType) ? documentType.id : null)
  }

  const sortedByUs = computed<DeepReadonly<DocumentLabel[]>>(() => [...props.documentTypeIds].map(dtId => DocumentsTypes[dtId]).sort((a, b) => a.nom.localeCompare(b.nom)))

  const documentTypeFiltered = ref<DeepReadonly<DocumentLabel[]>>(sortedByUs.value) as Ref<DeepReadonly<DocumentLabel[]>>
  const documentTypeOnInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      documentTypeFiltered.value = sortedByUs.value
    } else {
      documentTypeFiltered.value = sortedByUs.value.filter(documentType => documentType.nom.toLowerCase().includes(formatedSearch.toLowerCase()))
    }
  }

  return () => (
    <TypeAheadSingle
      overrideItem={documentTypeSelected.value}
      props={{
        alwaysOpen: props.alwaysOpen,
        items: documentTypeFiltered.value,
        itemChipLabel: item => item.nom,
        itemKey: 'id',
        placeholder: '',
        minInputLength: 0,
        onSelectItem: documentTypeUpdate,
        onInput: documentTypeOnInput,
      }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DocumentTypeTypeahead.props = ['documentTypeIdSelected', 'documentTypeIds', 'alwaysOpen', 'initialValue']
