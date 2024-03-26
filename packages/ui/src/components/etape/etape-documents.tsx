import { FunctionalComponent } from 'vue'
import { EtapeDocument, EtapeDocumentId } from 'camino-common/src/etape'
import { User, isAdministration, isSuper } from 'camino-common/src/roles'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { getDownloadRestRoute } from '../../api/client-rest'
import { EtapeEntrepriseDocument } from 'camino-common/src/entreprise'
import { EntreprisesByEtapeId } from 'camino-common/src/demarche'
import { EntrepriseDocumentLink } from '../entreprise/entreprise-documents'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'

interface Props {
  etapeDocuments: EtapeDocument[]
  entrepriseDocuments: EtapeEntrepriseDocument[]
  titulaires: Pick<EntreprisesByEtapeId, 'id' | 'nom'>[]
  user: User
}

export const VisibilityLabel = {
  'public': 'Public',
  'entreprises': 'Visible seulement par les entreprises titulaires',
  'administrations': 'Visible seulement par les administrations'
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

export const EtapeDocuments: FunctionalComponent<Props> = props => {


  if (isNullOrUndefinedOrEmpty(props.etapeDocuments) && isNullOrUndefinedOrEmpty(props.entrepriseDocuments)) {
    return null
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div class=" fr-table fr-m-0">
        <table style={{ display: 'table' }} class="fr-table--no-caption fr-m-0">
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
                  <EtapeDocumentLink documentId={item.id} documentTypeId={item.etape_document_type_id} />
                </td>
                <td>{item.description}</td>
                {isSuper(props.user) || isAdministration(props.user) ? <td>{getVisibilityLabel(item)}</td> : null}
              </tr>
            ))}
            {props.entrepriseDocuments.map(item => (
              <tr>
                <td>
                  <EntrepriseDocumentLink
                    documentId={item.id}
                    documentTypeId={item.entreprise_document_type_id}
                    label={`${props.titulaires.find(entreprise => entreprise.id === item.entreprise_id)?.nom ?? ''} - ${DocumentsTypes[item.entreprise_document_type_id].nom} - (${item.date})`}
                  />
                </td>
                <td>{item.description}</td>
                {isSuper(props.user) || isAdministration(props.user) ? <td>Visible seulement par les entreprises titulaires</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type EtapeDocumentLinkProps = { documentId: EtapeDocumentId; documentTypeId: DocumentTypeId }
const EtapeDocumentLink: FunctionalComponent<EtapeDocumentLinkProps> = props => {
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
