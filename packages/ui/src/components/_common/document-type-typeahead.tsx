import { Ref, computed, defineComponent, ref } from 'vue'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'

type Props<T extends DocumentTypeId> = {
      alwaysOpen?:boolean
      documentTypeIds: T[]
      initialValue?: T
      documentTypeIdSelected: (documentTypeId: T | null) => void
}

export const DocumentTypeTypeahead = defineComponent(<T extends DocumentTypeId>(props: Props<T>) => {
  const documentTypeSelected = ref<{id: T, nom: string} | null>(props.initialValue ? DocumentsTypes[props.initialValue] : null) as Ref<{id: T, nom: string} | null>
  const documentTypeUpdate = async (documentType: {id: T, nom: string} | undefined) => {
    documentTypeSelected.value = documentType ?? null
    props.documentTypeIdSelected(isNotNullNorUndefined(documentType) ? documentType.id : null)
  }

  const sortedByUs = computed<{id: T, nom: string}[]>( () => [...props.documentTypeIds].map(dtId => DocumentsTypes[dtId]).sort((a, b) =>  a.nom.localeCompare(b.nom)))


  const documentTypeFiltered = ref<{id: T, nom: string}[]>(sortedByUs.value) as Ref<{id: T, nom: string}[]>
  const documentTypeOnInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      documentTypeFiltered.value = sortedByUs.value
    } else {
      documentTypeFiltered.value = sortedByUs.value.filter(
        (documentType) =>
        documentType.nom.toLowerCase().includes(formatedSearch.toLowerCase())
      )
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
