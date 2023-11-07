import { FunctionalComponent } from 'vue'
import { EtapeDocument } from 'camino-common/src/etape'
import { User, isAdministration, isSuper } from 'camino-common/src/roles'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { getDownloadRestRoute } from '../../api/client-rest'
import { DocumentId } from 'camino-common/src/entreprise'

interface Props {
  etapeDocuments: EtapeDocument[]
  user: User
}
export const EtapeDocuments: FunctionalComponent<Props> = props => {
  const getVisibilityLabel = (etapeDocument: EtapeDocument): string => {
    if (etapeDocument.public_lecture) {
      return 'Public'
    }

    if (etapeDocument.entreprises_lecture) {
      return 'Visible seulement par les entreprises titulaires'
    }

    return 'Visible seulemement par les administrations'
  }

  return (
    <>
      {props.etapeDocuments.length > 0 ? (
        <div class="fr-container">
          <div class=" fr-table">
            <table style={{ display: 'table' }}>
              <caption>Documents</caption>
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Description</th>
                  {isSuper(props.user) || isAdministration(props.user) ? <th scope="col">Visibilité</th> : null}
                </tr>
              </thead>
              <tbody>
                {props.etapeDocuments.map(item => (
                  <tr>
                    <td>
                      <EtapeDocumentLink documentId={item.id} documentTypeId={item.document_type_id} />
                    </td>
                    <td>{item.description}</td>
                    {isSuper(props.user) || isAdministration(props.user) ? <td>{getVisibilityLabel(item)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  )
}

type EtapeDocumentLinkProps = { documentId: DocumentId; documentTypeId: DocumentTypeId }
export const EtapeDocumentLink: FunctionalComponent<EtapeDocumentLinkProps> = props => {
  return (
    <a
      href={getDownloadRestRoute('/download/fichiers/:documentId', { documentId: props.documentId })}
      title={`Télécharger le document ${DocumentsTypes[props.documentTypeId].nom} - nouvelle fenêtre`}
      target="_blank"
    >
      {DocumentsTypes[props.documentTypeId].nom}
    </a>
  )
}
