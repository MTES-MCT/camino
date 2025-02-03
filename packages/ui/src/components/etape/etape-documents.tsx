import { FunctionalComponent, computed, defineComponent } from 'vue'
import { EtapeDocument, EtapeDocumentId } from 'camino-common/src/etape'
import { User, isAdministration, isSuper } from 'camino-common/src/roles'
import { AutreDocumentTypeId, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { getDownloadRestRoute } from '../../api/client-rest'
import { Entreprise, EntrepriseId, EtapeEntrepriseDocument } from 'camino-common/src/entreprise'
import { EntrepriseDocumentLink } from '../entreprise/entreprise-documents'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { fr } from '@codegouvfr/react-dsfr'
import { Column, TableSimple } from '../_ui/table-simple'
import { TableRow } from '../_ui/table'

interface Props {
  etapeDocuments: EtapeDocument[]
  entrepriseDocuments: EtapeEntrepriseDocument[]
  entreprises: Entreprise[]
  user: User
}

export const VisibilityLabel = {
  public: 'Public',
  entreprises: 'Visible par les administrations et les entreprises titulaires',
  administrations: 'Visible par les administrations',
}

export const getVisibilityLabel = (etapeDocument: Pick<EtapeDocument, 'public_lecture' | 'entreprises_lecture'>): string => {
  if (etapeDocument.public_lecture) {
    return VisibilityLabel.public
  }

  if (etapeDocument.entreprises_lecture) {
    return VisibilityLabel.entreprises
  }

  return VisibilityLabel.administrations
}

export const sortDocumentsColumn = <T extends { document_type_id: DocumentTypeId | AutreDocumentTypeId; description: string | null }>(documents: T[]): T[] => {
  return [...documents].sort((a, b) => {
    const result = DocumentsTypes[a.document_type_id].nom.localeCompare(DocumentsTypes[b.document_type_id].nom)

    if (result === 0) {
      return (a.description ?? '').localeCompare(b.description ?? '')
    }

    return result
  })
}

type ColumnId = 'nom' | 'description' | 'visibilite'
export const EtapeDocuments = defineComponent<Props>(props => {
  const sortedEtapeDocuments = computed(() => sortDocumentsColumn(props.etapeDocuments.map(d => ({ ...d, document_type_id: d.etape_document_type_id }))))
  const sortedEntrepriseDocuments = computed(() => sortDocumentsColumn(props.entrepriseDocuments.map(d => ({ ...d, document_type_id: d.entreprise_document_type_id }))))

  const entreprisesIndex = props.entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

  const hasEntrepriseDocumentsWithDescription = computed<boolean>(() => sortedEntrepriseDocuments.value.some(({ description }) => isNotNullNorUndefinedNorEmpty(description)))

  const columns = computed<Column<ColumnId>[]>(() => {
    const rawColumn: Column<ColumnId>[] = [{ id: 'nom', contentTitle: 'Nom' }]
    if (hasEntrepriseDocumentsWithDescription.value) {
      rawColumn.push({ id: 'description', contentTitle: 'Description' })
    }
    if (isSuper(props.user) || isAdministration(props.user)) {
      rawColumn.push({ id: 'visibilite', contentTitle: 'Visibilité' })
    }
    return rawColumn
  })

  const rows = computed<TableRow<ColumnId>[]>(() => {
    const myRows: TableRow<ColumnId>[] = []
    myRows.push(
      ...sortedEtapeDocuments.value.map<TableRow<ColumnId>>(item => ({
        id: item.id,
        link: null,
        columns: {
          nom: { type: 'jsx', jsxElement: <EtapeDocumentLink documentId={item.id} documentTypeId={item.etape_document_type_id} description={item.description} />, value: item.id },
          description: { type: 'text', value: '' },
          visibilite: { type: 'text', value: isSuper(props.user) || isAdministration(props.user) ? getVisibilityLabel(item) : '' },
        },
      }))
    )
    myRows.push(
      ...sortedEntrepriseDocuments.value.map<TableRow<ColumnId>>(item => ({
        id: item.id,
        link: null,
        columns: {
          nom: {
            type: 'jsx',
            value: item.id,
            jsxElement: (
              <EntrepriseDocumentLink
                documentId={item.id}
                documentTypeId={item.entreprise_document_type_id}
                label={`${entreprisesIndex[item.entreprise_id] ?? ''} - ${DocumentsTypes[item.entreprise_document_type_id].nom} - (${item.date})`}
              />
            ),
          },
          description: { type: 'text', value: item.description ?? '' },
          visibilite: { type: 'text', value: isSuper(props.user) || isAdministration(props.user) ? 'Visible seulement par les entreprises titulaires' : '' },
        },
      }))
    )
    return myRows
  })
  return () => (
    <>
      {isNullOrUndefinedOrEmpty(props.etapeDocuments) && isNullOrUndefinedOrEmpty(props.entrepriseDocuments) ? null : (
        <TableSimple class={[fr.cx('fr-mb-0')]} caption={{ value: 'Documents', visible: false }} columns={columns.value} rows={rows.value} />
      )}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeDocuments.props = ['etapeDocuments', 'entrepriseDocuments', 'entreprises', 'user']

type EtapeDocumentLinkProps = { documentId: EtapeDocumentId; documentTypeId: DocumentTypeId | AutreDocumentTypeId; description: string | null }
const EtapeDocumentLink: FunctionalComponent<EtapeDocumentLinkProps> = props => {
  const label = isNotNullNorUndefinedNorEmpty(props.description) ? props.description : DocumentsTypes[props.documentTypeId].nom
  return (
    <a href={getDownloadRestRoute('/download/fichiers/:documentId', { documentId: props.documentId })} title={`Télécharger le document ${label} - nouvelle fenêtre`} target="_blank">
      {label}
    </a>
  )
}
