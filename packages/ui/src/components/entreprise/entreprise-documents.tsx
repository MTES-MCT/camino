import { FunctionalComponent, computed, defineComponent, onMounted, ref } from 'vue'
import { LoadingElement } from '@/components/_ui/functional-loader'
import { AsyncData, getDownloadRestRoute } from '@/api/client-rest'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise'
import { dateFormat } from 'camino-common/src/date'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { AddEntrepriseDocumentPopup } from './add-entreprise-document-popup'
import { canEditEntreprise } from 'camino-common/src/permissions/entreprises'
import { User } from 'camino-common/src/roles'
import { RemoveEntrepriseDocumentPopup } from './remove-entreprise-document-popup'
import { ApiClient } from '@/api/api-client'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { fr } from '@codegouvfr/react-dsfr'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'

interface Props {
  apiClient: Pick<ApiClient, 'getEntrepriseDocuments' | 'creerEntrepriseDocument' | 'deleteEntrepriseDocument' | 'uploadTempDocument'>
  user: User
  entrepriseId: EntrepriseId
}
type ColumnId = 'nom' | 'date' | 'description' | 'actions'

export const EntrepriseDocuments = defineComponent<Props>(props => {
  const data = ref<AsyncData<EntrepriseDocument[]>>({ status: 'LOADING' })

  const addPopup = ref<boolean>(false)
  const deletePopup = ref<boolean>(false)
  const deleteDocument = ref<{ nom: string; id: EntrepriseDocumentId } | null>(null)

  const reloadDocuments = async () => {
    data.value = { status: 'LOADING' }
    const entrepriseDocuments = await props.apiClient.getEntrepriseDocuments(props.entrepriseId)
    if ('message' in entrepriseDocuments) {
      data.value = { status: 'NEW_ERROR', error: entrepriseDocuments }
    } else {
      data.value = { status: 'LOADED', value: entrepriseDocuments }
    }
  }

  onMounted(async () => {
    await reloadDocuments()
  })

  const columns = computed<Column<ColumnId>[]>(() => {
    const rawColumns: Column<ColumnId>[] = [
      { id: 'nom', contentTitle: 'Nom' },
      { id: 'date', contentTitle: 'Date' },
      { id: 'description', contentTitle: 'Description' },
    ]

    if (canEditEntreprise(props.user, props.entrepriseId)) {
      rawColumns.push({
        id: 'actions',
        class: [fr.cx('fr-cell--right')],
        contentTitle: (
          <DsfrButtonIcon
            icon="fr-icon-add-line"
            buttonType="primary"
            title="Ajouter un document"
            onClick={() => {
              addPopup.value = true
            }}
          />
        ),
      })
    }

    return rawColumns
  })

  const rows = (items: EntrepriseDocument[]): TableRow<ColumnId>[] => {
    return items.map<TableRow<ColumnId>>(item => ({
      id: item.id,
      link: null,
      columns: {
        nom: { type: 'jsx', jsxElement: <EntrepriseDocumentLink documentId={item.id} documentTypeId={item.entreprise_document_type_id} />, value: item.id },
        date: { type: 'text', value: dateFormat(item.date) },
        description: { type: 'text', value: item.description ?? '' },
        actions: {
          type: 'jsx',
          jsxElement: item.can_delete_document ? (
            <DsfrButtonIcon
              icon="fr-icon-delete-line"
              buttonType="secondary"
              class={[fr.cx('fr-mb-0')]}
              title={`Supprimer le document ${DocumentsTypes[item.entreprise_document_type_id].nom}`}
              onClick={() => {
                deleteDocument.value = { nom: DocumentsTypes[item.entreprise_document_type_id].nom, id: item.id }
                deletePopup.value = true
              }}
            />
          ) : (
            <div></div>
          ),
          value: item.id,
        },
      },
    }))
  }

  return () => (
    <div style={{ overflowX: 'auto' }}>
      <LoadingElement data={data.value} renderItem={items => <TableSimple caption={{ value: "Documents de l'entreprise", visible: true }} columns={columns.value} rows={rows(items)} />} />
      {addPopup.value ? (
        <AddEntrepriseDocumentPopup
          apiClient={{
            ...props.apiClient,
            creerEntrepriseDocument: async (entrepriseId, entrepriseDocumentInput, tempDocumentName) => {
              const document = await props.apiClient.creerEntrepriseDocument(entrepriseId, entrepriseDocumentInput, tempDocumentName)
              await reloadDocuments()

              return document
            },
          }}
          entrepriseId={props.entrepriseId}
          close={() => {
            addPopup.value = false
          }}
        />
      ) : null}
      {deletePopup.value && deleteDocument.value ? (
        <RemoveEntrepriseDocumentPopup
          apiClient={{
            deleteEntrepriseDocument: async (entrepriseId, documentId) => {
              await props.apiClient.deleteEntrepriseDocument(entrepriseId, documentId)
              await reloadDocuments()
            },
          }}
          entrepriseId={props.entrepriseId}
          entrepriseDocument={deleteDocument.value}
          close={() => {
            addPopup.value = false
            deleteDocument.value = null
          }}
        />
      ) : null}
    </div>
  )
})

type EntrepriseDocumentLinkProps = { documentId: EntrepriseDocumentId; documentTypeId: DocumentTypeId; label?: string }
export const EntrepriseDocumentLink: FunctionalComponent<EntrepriseDocumentLinkProps> = (props: EntrepriseDocumentLinkProps) => {
  const label = isNotNullNorUndefined(props.label) ? props.label : DocumentsTypes[props.documentTypeId].nom

  return (
    <a href={getDownloadRestRoute('/download/entrepriseDocuments/:documentId', { documentId: props.documentId })} title={`Télécharger le document ${label} - nouvelle fenêtre`} target="_blank">
      {label}
    </a>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EntrepriseDocuments.props = ['apiClient', 'entrepriseId', 'user']
