import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { ActiviteDocument, ActiviteDocumentId, TempActiviteDocument } from 'camino-common/src/activite'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { ApiClient } from '@/api/api-client'
import { ActiviteDocumentLink } from './preview'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { computed, defineComponent, ref, watch } from 'vue'
import { isActiviteDocumentsComplete } from 'camino-common/src/permissions/activites'
import { AddActiviteDocumentPopup } from './add-activite-document-popup'
import { activitesTypesDocumentsTypes } from 'camino-common/src/static/activitesTypesDocumentsTypes'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'

interface Props {
  apiClient: Pick<ApiClient, 'uploadTempDocument'>
  completeUpdate: (activiteDocumentIds: ActiviteDocumentId[], tempsDocuments: TempActiviteDocument[], complete: boolean) => void
  activiteTypeId: ActivitesTypesId
  activiteDocuments: ActiviteDocument[]
}

const isTempActiviteDocument = (activiteDocument: ActiviteDocument | TempActiviteDocument): activiteDocument is TempActiviteDocument => 'tempDocumentName' in activiteDocument

const isActiviteDocument = (activiteDocument: ActiviteDocument | TempActiviteDocument): activiteDocument is ActiviteDocument => !isTempActiviteDocument(activiteDocument)
type ColumnId = 'nom' | 'description' | 'add'
export const ActiviteDocumentsEdit = defineComponent<Props>(props => {
  const addPopup = ref<boolean>(false)

  const documents = ref<(ActiviteDocument | TempActiviteDocument)[]>([])

  const isNotMandatory = isActiviteDocumentsComplete([], props.activiteTypeId).valid

  watch(
    () => props.activiteDocuments,
    () => {
      documents.value = [...props.activiteDocuments]
    },
    { immediate: true }
  )

  const hasDocumentTypes: boolean = isNotNullNorUndefined(activitesTypesDocumentsTypes[props.activiteTypeId])

  const notifyChange = () => {
    const tempActiviteDocuments = documents.value.filter(isTempActiviteDocument)
    const alreadyExistingActiviteDocumentIds = documents.value.filter(isActiviteDocument).map(({ id }) => id)
    props.completeUpdate(alreadyExistingActiviteDocumentIds, tempActiviteDocuments, isActiviteDocumentsComplete(documents.value, props.activiteTypeId).valid)
  }
  notifyChange()

  const columns: Column<ColumnId>[] = [
    { id: 'nom', contentTitle: 'Nom' },
    { id: 'description', contentTitle: 'Description' },
    { id: 'add', contentTitle: <DsfrButtonIcon icon="fr-icon-add-line" title="Ajouter un document" onClick={() => (addPopup.value = true)} /> },
  ]
  const rows = computed(() => {
    return documents.value.map<TableRow<ColumnId>>((item, index) => {
      return {
        id: `${index}`,
        link: null,
        columns: {
          nom: isTempActiviteDocument(item)
            ? { type: 'text', value: DocumentsTypes[item.activite_document_type_id].nom }
            : { type: 'jsx', jsxElement: <ActiviteDocumentLink activiteDocumentId={item.id} activiteDocumentTypeId={item.activite_document_type_id} />, value: item.activite_document_type_id },
          description: { type: 'text', value: item.description ?? '' },
          add: {
            type: 'jsx',
            jsxElement: (
              <DsfrButtonIcon
                icon="fr-icon-delete-bin-line"
                buttonType="secondary"
                title={`Supprimer le document ${DocumentsTypes[item.activite_document_type_id].nom}`}
                onClick={() => {
                  documents.value.splice(index, 1)
                  notifyChange()
                }}
              />
            ),
            value: `Supprimer le document ${index}`,
          },
        },
      }
    })
  })
  return () => (
    <div>
      {hasDocumentTypes ? <TableSimple caption={{ value: `Documents de l'activité${isNotMandatory ? ' (optionnel)' : ''}`, visible: true }} columns={columns} rows={rows.value} /> : null}
      {addPopup.value ? (
        <AddActiviteDocumentPopup
          apiClient={props.apiClient}
          activiteTypeId={props.activiteTypeId}
          close={(tempDocument: TempActiviteDocument | null) => {
            if (tempDocument !== null) {
              documents.value.push(tempDocument)
              notifyChange()
            }
            addPopup.value = false
          }}
        />
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
ActiviteDocumentsEdit.props = ['activiteDocuments', 'completeUpdate', 'activiteTypeId', 'apiClient']
