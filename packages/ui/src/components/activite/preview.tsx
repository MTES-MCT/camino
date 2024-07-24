import { Activite, ActiviteDocumentId } from 'camino-common/src/activite'
import { FunctionalComponent, defineComponent, ref, computed } from 'vue'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'
import { ActiviteType, ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { Sections } from '../_common/new-section'
import { Column, TableAuto } from '../_ui/table-auto'
import { getDownloadRestRoute } from '../../api/client-rest'
import { ActiviteDocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { DsfrButton, DsfrButtonIcon, DsfrLink } from '../_ui/dsfr-button'
import { ActiviteDeposePopup } from './depose-popup'
import { ActiviteApiClient } from './activite-api-client'
import { ActiviteRemovePopup } from './remove-popup'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { capitalize } from 'camino-common/src/strings'
import { ActiviteStatut } from '../_common/activite-statut'
import { ModifiedDate } from '../_common/modified-date'

interface Props {
  activite: Activite
  apiClient: Pick<ActiviteApiClient, 'deposerActivite' | 'supprimerActivite'>
}

const documentColumns = [
  { id: 'activiteDocumentTypeId', name: 'Nom', noSort: true },
  { id: 'description', name: 'Description', noSort: true },
] as const satisfies readonly Column[]

// TODO 2024-07-02 Supprimer la notion de deposable dans l'API, et faire comme pour le dépôt d'une étape
export const Preview = defineComponent<Props>(props => {
  const deposePopupVisible = ref(false)
  const deposePopupOpen = () => {
    deposePopupVisible.value = true
  }
  const closeDeposePopup = () => {
    deposePopupVisible.value = !deposePopupVisible.value
  }
  const removePopupVisible = ref(false)
  const removePopupOpen = () => {
    removePopupVisible.value = true
  }
  const closeRemovePopup = () => {
    removePopupVisible.value = !removePopupVisible.value
  }

  const activiteType = computed<ActiviteType>(() => ActivitesTypes[props.activite.type_id])

  const documentRows = props.activite.activite_documents.map(document => ({
    id: document.id,
    link: null,
    columns: {
      activiteDocumentTypeId: {
        component: ActiviteDocumentLink,
        props: { activiteDocumentId: document.id, activiteDocumentTypeId: document.activite_document_type_id },
        value: document.activite_document_type_id,
      },
      description: { value: document.description ?? '' },
    },
  }))

  const activiteTitle = `${capitalize(ActivitesTypes[props.activite.type_id].nom)} - ${props.activite.periode_id && activiteType.value.frequenceId ? capitalize(getPeriode(activiteType.value.frequenceId, props.activite.periode_id)) : null} ${props.activite.annee}`

  return () => (
    <div>
      <nav role="navigation" class="fr-breadcrumb" aria-label="vous êtes ici :">
        <button class="fr-breadcrumb__button" aria-expanded="false" aria-controls="breadcrumb-1">
          Voir le fil d’Ariane
        </button>
        <div class="fr-collapse" id="breadcrumb-1">
          <ol class="fr-breadcrumb__list">
            <li>
              <DsfrLink breadcrumb={true} to={{ name: 'dashboard', params: {} }} disabled={false} title="Accueil" icon={null} />{' '}
            </li>
            <li>
              <DsfrLink breadcrumb={true} to={{ name: 'activites', params: {} }} disabled={false} title="Activités" icon={null} />{' '}
            </li>
            <li>
              <DsfrLink breadcrumb={true} to={{ name: 'titre', params: { id: props.activite.titre.slug } }} disabled={false} title={props.activite.titre.nom} icon={null} />{' '}
            </li>
            <li>
              <a class="fr-breadcrumb__link" aria-current="page">
                {activiteTitle}
              </a>
            </li>
          </ol>
        </div>
      </nav>
      <div class="fr-grid-row fr-grid-row--top fr-mt-4w">
        <h1 class="fr-m-0">{activiteTitle}</h1>
        <div class="fr-m-0" style={{ marginLeft: 'auto !important', display: 'flex', gap: '1rem' }}>
          {props.activite.suppression ? <DsfrButtonIcon buttonType="tertiary" title="supprimer l'activité" onClick={removePopupOpen} icon="fr-icon-delete-bin-line" /> : null}
          {props.activite.modification ? (
            <>
              <DsfrLink
                buttonType={props.activite.deposable ? 'secondary' : 'primary'}
                label={null}
                title="modifier l'activité"
                icon="fr-icon-edit-line"
                to={{ name: 'activiteEdition', params: { activiteId: props.activite.slug } }}
                disabled={false}
              />

              {props.activite.activite_statut_id === ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION ? (
                <DsfrButton buttonType="primary" title="déposer l'activité" label="Déposer" onClick={deposePopupOpen} disabled={!props.activite.deposable} />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <div>
        <h3>{props.activite.titre.nom}</h3>

        <ActiviteStatut activiteStatutId={props.activite.activite_statut_id} />
        {isNotNullNorUndefined(props.activite.date_saisie) ? <ModifiedDate class="fr-pt-1w" modified_date={props.activite.date_saisie} /> : null}
        <div class="fr-pt-1w">
          {isNotNullNorUndefined(activiteType.value.description) && activiteType.value.description !== '' ? <div v-html={activiteType.value.description} /> : null}

          <Sections sections={props.activite.sections_with_value} />

          {documentRows.length > 0 ? <TableAuto caption={'Documents de l’activité'} columns={documentColumns} rows={documentRows} initialSort={'firstColumnAsc'} /> : null}
        </div>
      </div>
      {deposePopupVisible.value ? <ActiviteDeposePopup close={closeDeposePopup} activite={props.activite} apiClient={props.apiClient} /> : null}
      {removePopupVisible.value ? <ActiviteRemovePopup close={closeRemovePopup} activite={props.activite} apiClient={props.apiClient} /> : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Preview.props = ['activite', 'initialOpened', 'apiClient']

type ActiviteDocumentLinkProps = { activiteDocumentId: ActiviteDocumentId; activiteDocumentTypeId: ActiviteDocumentTypeId }
export const ActiviteDocumentLink: FunctionalComponent<ActiviteDocumentLinkProps> = (props: ActiviteDocumentLinkProps) => {
  return (
    <a
      href={getDownloadRestRoute('/download/activiteDocuments/:documentId', { documentId: props.activiteDocumentId })}
      title={`Télécharger le document ${DocumentsTypes[props.activiteDocumentTypeId].nom} - nouvelle fenêtre`}
      target="_blank"
    >
      {DocumentsTypes[props.activiteDocumentTypeId].nom}
    </a>
  )
}
