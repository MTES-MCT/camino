import { FunctionalComponent } from 'vue'
import { EtapeAvisId, EtapeAvis } from 'camino-common/src/etape'
import { User, isAdministration, isSuper } from 'camino-common/src/roles'
import { getDownloadRestRoute } from '../../api/client-rest'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { AvisTypeId, AvisTypes, AvisVisibilityId } from 'camino-common/src/static/avisTypes'
import { AvisStatut } from '../_common/etape-statut'
import { dateFormat } from 'camino-common/src/date'
import { VisibilityLabel } from './etape-documents'

interface Props {
  etapeAvis: EtapeAvis[]
  user: User
}

export const getAvisVisibilityLabel = (avisVisibility: AvisVisibilityId): string => {
  const value = {
    Public: VisibilityLabel.public,
    Administrations: VisibilityLabel.administrations,
    TitulairesEtAdministrations: VisibilityLabel.entreprises,
  } as const satisfies { [key in AvisVisibilityId]: string }

  return value[avisVisibility]
}

// FIXME storybook
export const EtapeAvisTable: FunctionalComponent<Props> = props => {
  if (isNullOrUndefinedOrEmpty(props.etapeAvis)) {
    return null
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div class=" fr-table fr-m-0">
        <table style={{ display: 'table' }} class="fr-table--no-caption fr-m-0">
          <caption>Avis</caption>
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">Statut</th>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              {isSuper(props.user) || isAdministration(props.user) ? <th scope="col">Visibilité</th> : null}
            </tr>
          </thead>
          <tbody>
            {props.etapeAvis.map(item => (
              <tr>
                <td>{item.has_file ? <EtapeAvisLink avisId={item.id} avisTypeId={item.avis_type_id} /> : AvisTypes[item.avis_type_id].nom}</td>
                <td>
                  <AvisStatut avisStatutId={item.avis_statut_id} />
                </td>
                <td>{dateFormat(item.date)}</td>
                <td>{item.description}</td>
                {isSuper(props.user) || isAdministration(props.user) ? <td>{getAvisVisibilityLabel(item.avis_visibility_id)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type EtapeAvisLinkProps = { avisId: EtapeAvisId; avisTypeId: AvisTypeId }
const EtapeAvisLink: FunctionalComponent<EtapeAvisLinkProps> = props => {
  return (
    <a
      href={getDownloadRestRoute('/download/avisDocument/:etapeAvisId', { etapeAvisId: props.avisId })}
      title={`Télécharger l'avis ${AvisTypes[props.avisTypeId].nom} - nouvelle fenêtre`}
      target="_blank"
    >
      {AvisTypes[props.avisTypeId].nom}
    </a>
  )
}
