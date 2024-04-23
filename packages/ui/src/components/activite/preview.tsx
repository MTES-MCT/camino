import { Activite, ActiviteDocumentId } from 'camino-common/src/activite'
import { FunctionalComponent, defineComponent, ref, computed } from 'vue'
import { Statut } from '../_common/statut'
import { getPeriode } from 'camino-common/src/static/frequence'
import { ACTIVITES_STATUTS_IDS, ActivitesStatut, ActivitesStatuts } from 'camino-common/src/static/activitesStatuts'
import { ActiviteType, ActivitesTypes } from 'camino-common/src/static/activitesTypes'
import { Sections } from '../_common/new-section'
import { Column, TableAuto } from '../_ui/table-auto'
import { getDownloadRestRoute } from '../../api/client-rest'
import { ActiviteDocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { DsfrButton, DsfrButtonIcon, DsfrLink } from '../_ui/dsfr-button'
import { isActiviteComplete } from 'camino-common/src/permissions/activites'
import { ActiviteDeposePopup } from './depose-popup'
import { ActiviteApiClient } from './activite-api-client'
import { ActiviteRemovePopup } from './remove-popup'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { capitalize } from 'camino-common/src/strings'
import { dateFormat } from 'camino-common/src/date'

interface Props {
  activite: Activite
  apiClient: Pick<ActiviteApiClient, 'deposerActivite' | 'supprimerActivite'>
}

const documentColumns = [
  { id: 'activiteDocumentTypeId', name: 'Nom', noSort: true },
  { id: 'description', name: 'Description', noSort: true },
] as const satisfies readonly Column[]

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

  const activiteStatut = computed<ActivitesStatut>(() => ActivitesStatuts[props.activite.activite_statut_id])

  const activiteType = computed<ActiviteType>(() => ActivitesTypes[props.activite.type_id])

  const statutNom = computed<string>(() => {
    return isActiviteComplete(props.activite.sections_with_value, props.activite.type_id, props.activite.activite_documents).valid
      ? activiteStatut.value.nom
      : `${activiteStatut.value.nom} (incomplet)`
  })

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

  return () => (
    <div class="dsfr">
      <div class="fr-p-2w fr-tile--shadow" style={{ border: '1px solid var(--grey-900-175)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: '1.5rem' }}>
            <h3 class="fr-mb-0">{capitalize(activiteType.value.nom)}</h3>
            <h5 class="fr-mb-0">
              <span class="cap-first">
                {props.activite.periode_id && activiteType.value.frequenceId ? <span>{getPeriode(activiteType.value.frequenceId, props.activite.periode_id)}</span> : null} {props.activite.annee}
              </span>
            </h5>
          </div>

          <div style={{ display: 'flex' }}>
            {props.activite.suppression ? <DsfrButtonIcon buttonType="tertiary" title="supprimer l'activité" onClick={removePopupOpen} icon="fr-icon-delete-bin-line" /> : null}

            {props.activite.modification ? (
              <DsfrLink
                buttonType={props.activite.deposable ? 'secondary' : 'primary'}
                label={null}
                title="modifier l'activité"
                icon="fr-icon-edit-line"
                to={`/activites/${props.activite.slug}/edition`}
                disabled={false}
              />
            ) : null}

            {props.activite.deposable ? <DsfrButton buttonType="primary" title="déposer l'activité" label="Déposer" onClick={deposePopupOpen} /> : null}
          </div>
        </div>

        <Statut color={activiteStatut.value.couleur} nom={statutNom.value} class="fr-mt-2w" />

        <div class="pb-s">
          {isNotNullNorUndefined(activiteType.value.description) && activiteType.value.description !== '' ? (
            <div class="border-b-s px-m pt-m">
              <div class="h6" v-html={activiteType.value.description} />
            </div>
          ) : null}
          {props.activite.date_saisie !== null ? (
            <div class="border-b-s px-m pt-m">
              <h5>Date de {props.activite.activite_statut_id === ACTIVITES_STATUTS_IDS.DEPOSE ? 'dépôt' : 'modification'}</h5>
              <p>{dateFormat(props.activite.date_saisie)}</p>
            </div>
          ) : null}

          <div class="border-b-s px-m pt-m">
            <Sections sections={props.activite.sections_with_value} />
          </div>

          {documentRows.length > 0 ? (
            <div class="border-b-s px-m pt-m">
              <TableAuto caption={'Documents de l’activité'} columns={documentColumns} rows={documentRows} initialSort={'firstColumnAsc'} />
            </div>
          ) : null}
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
