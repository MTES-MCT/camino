import { ETAPES_TYPES, EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { computed, defineComponent, ref } from 'vue'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { capitalize } from 'camino-common/src/strings'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { dateFormat } from 'camino-common/src/date'
import { DsfrIcon } from '../_ui/icon'
import { EtapeStatut } from '../_common/etape-statut'
import { PropDuree } from '../etape/prop-duree'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { EtapePropEntreprisesItem, EtapePropItem } from '../etape/etape-prop-item'
import { DemarcheEtape as CommonDemarcheEtape, EntreprisesByEtapeId } from 'camino-common/src/demarche'
import { DsfrPerimetre, TabId } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Router } from 'vue-router'
import { numberFormat } from 'camino-common/src/number'
import { OmitDistributive, getValues, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { isNumberElement, valeurFind } from 'camino-common/src/sections'
import { EtapeDocuments } from '../etape/etape-documents'
import { User } from 'camino-common/src/roles'
import styles from './demarche-etape.module.css'
import { DsfrButton, DsfrButtonIcon, DsfrLink } from '../_ui/dsfr-button'
import { PureDownloads } from '../_common/downloads'
import { canEditEtape, isEtapeDeposable } from 'camino-common/src/permissions/titres-etapes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { RemoveEtapePopup } from './remove-etape-popup'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { DeposeEtapePopup } from './depose-etape-popup'
import { ApiClient } from '@/api/api-client'
// Il ne faut pas utiliser de literal dans le 'in' il n'y aura jamais d'erreur typescript
const fondamentalePropsName = 'fondamentale'

type Props = {
  etape: OmitDistributive<CommonDemarcheEtape, 'ordre'>
  demarche: {
    titulaires: Pick<EntreprisesByEtapeId, 'id' | 'nom'>[]
    administrationsLocales: AdministrationId[]
    demarche_type_id: DemarcheTypeId
    sdom_zones: SDOMZoneId[]
  }
  titre: {
    typeId: TitreTypeId
    slug: TitreSlug
    nom: string
    titreStatutId: TitreStatutId
  }
  apiClient: Pick<ApiClient, 'deleteEtape' | 'deposeEtape' | 'getGeojsonByGeoSystemeId'>
  router: Pick<Router, 'push'>
  user: User
  initTab?: TabId
}

const displayEtapeStatus = (etape_type_id: EtapeTypeId, etape_statut_id: EtapeStatutId): boolean => {
  switch (etape_type_id) {
    case ETAPES_TYPES.demande:
      return etape_statut_id !== ETAPES_STATUTS.FAIT
    default:
      return getEtapesStatuts(etape_type_id).length > 1
  }
}

export const DemarcheEtape = defineComponent<Props>(props => {
  const hasContent = computed<boolean>(() => {
    if (props.etape.notes !== null) {
      return true
    }

    const hasSectionWithValue = props.etape.sections_with_values.some(section => section.elements.filter(element => valeurFind(element) !== '–').length > 0)
    if (hasSectionWithValue) {
      return true
    }
    if (fondamentalePropsName in props.etape) {
      const { perimetre: _perimetre, ...fondamentale } = props.etape.fondamentale

      return getValues(fondamentale).some(v => isNotNullNorUndefined(v) && (!Array.isArray(v) || v.length > 0))
    }

    return false
  })

  const removePopupVisible = ref<boolean>(false)
  const removePopupOpen = () => {
    removePopupVisible.value = true
  }
  const closeRemovePopup = () => {
    removePopupVisible.value = !removePopupVisible.value
  }
  const deposePopupVisible = ref<boolean>(false)
  const deposePopupOpen = () => {
    deposePopupVisible.value = true
  }
  const closeDeposePopup = () => {
    deposePopupVisible.value = !deposePopupVisible.value
  }

  const canDownloadZip = computed<boolean>(() => props.etape.etape_type_id === ETAPES_TYPES.demande && (props.etape.entreprises_documents.length > 0 || props.etape.documents.length > 0))

  const canEditOrDeleteEtape = computed<boolean>(() =>
    canEditEtape(props.user, props.etape.etape_type_id, props.etape.etape_statut_id, props.demarche.titulaires, props.demarche.administrationsLocales, props.demarche.demarche_type_id, props.titre)
  )

  const isDeposable = computed<boolean>(() =>
    fondamentalePropsName in props.etape
      ? isEtapeDeposable(
          props.user,
          { typeId: props.titre.typeId, titreStatutId: props.titre.titreStatutId, titulaires: props.demarche.titulaires, administrationsLocales: props.demarche.administrationsLocales },
          props.demarche.demarche_type_id,
          {
            statutId: props.etape.etape_statut_id,
            typeId: props.etape.etape_type_id,
            sectionsWithValue: props.etape.sections_with_values,
            substances: props.etape.fondamentale.substances,
            duree: props.etape.fondamentale.duree,
            geojson4326Perimetre: props.etape.fondamentale.perimetre?.geojson4326_perimetre ?? null,
            decisionsAnnexesContenu: props.etape.decisions_annexes_contenu,
            decisionsAnnexesSections: props.etape.decisions_annexes_sections,
          },
          // TODO 2023-11-15 hack pas très propres en attendant de pouvoir supprimer le code vue
          props.etape.documents.map(document => ({ typeId: document.document_type_id, fichier: true })),
          props.etape.entreprises_documents,
          props.demarche.sdom_zones
        )
      : false
  )

  return () => (
    <div class="fr-pb-2w fr-pl-2w fr-pr-2w fr-tile--shadow" style={{ border: '1px solid var(--grey-900-175)' }}>
      <div class={`${styles.sticky} fr-pt-1w`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div class="fr-text--lg fr-mb-0" style={{ color: 'var(--text-title-blue-france)', fontWeight: '500' }}>
            {capitalize(EtapesTypes[props.etape.etape_type_id].nom)}
          </div>

          <div style={{ display: 'flex' }}>
            {canEditOrDeleteEtape.value ? (
              <>
                {props.etape.etape_type_id === ETAPES_TYPES.demande && props.etape.etape_statut_id === ETAPES_STATUTS.EN_CONSTRUCTION ? (
                  <DsfrButton class="fr-mr-1v" buttonType="primary" label="Déposer" title="Déposer la demande" onClick={deposePopupOpen} disabled={!isDeposable.value} />
                ) : null}
                <DsfrLink
                  icon={'fr-icon-pencil-line'}
                  disabled={false}
                  to={{ name: 'etape-edition', params: { id: props.etape.slug } }}
                  class="fr-mr-1v"
                  buttonType="secondary"
                  title="Modifier l’étape"
                  label={null}
                />
                <DsfrButtonIcon icon={'fr-icon-delete-bin-line'} class="fr-mr-1v" buttonType="secondary" title="Supprimer l’étape" onClick={removePopupOpen} />
              </>
            ) : null}
            {canDownloadZip.value ? (
              <PureDownloads
                class="fr-mr-1v"
                downloadTitle="Télécharger l’ensemble de la demande dans un fichier .zip"
                downloadRoute="/etape/zip/:etapeId"
                params={{ etapeId: props.etape.id }}
                formats={['pdf']}
                route={{ query: {} }}
              />
            ) : null}
          </div>
        </div>

        {displayEtapeStatus(props.etape.etape_type_id, props.etape.etape_statut_id) ? <EtapeStatut etapeStatutId={props.etape.etape_statut_id} /> : null}
        <div class="fr-mt-1w">
          <DsfrIcon name="fr-icon-calendar-line" color="text-title-blue-france" /> {dateFormat(props.etape.date)}
        </div>
      </div>
      {hasContent.value ? (
        <>
          <DsfrSeparator />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              alignContent: 'flex-start',
              columnGap: '16px',
              rowGap: '8px',
            }}
          >
            {fondamentalePropsName in props.etape ? (
              <>
                {props.etape.fondamentale.date_debut ? <EtapePropItem title="Date de début" text={dateFormat(props.etape.fondamentale.date_debut)} /> : null}
                {props.etape.fondamentale.duree !== null ? <EtapePropItem title="Durée" item={<PropDuree duree={props.etape.fondamentale.duree} />} /> : null}
                {props.etape.fondamentale.date_fin ? <EtapePropItem title="Date de fin" text={dateFormat(props.etape.fondamentale.date_fin)} /> : null}
                {(props.etape.fondamentale.substances?.length ?? 0) > 0 ? (
                  <EtapePropItem title="Substances" text={(props.etape.fondamentale.substances ?? []).map(s => capitalize(SubstancesLegale[s].nom)).join(', ')} />
                ) : null}
                <EtapePropEntreprisesItem title="Titulaire" entreprises={props.etape.fondamentale.titulaires} />
                <EtapePropEntreprisesItem title="Amodiataire" entreprises={props.etape.fondamentale.amodiataires} />
                {isNotNullNorUndefined(props.etape.fondamentale.perimetre) && isNotNullNorUndefined(props.etape.fondamentale.perimetre.surface) ? (
                  <EtapePropItem title="Surface" text={`${numberFormat(props.etape.fondamentale.perimetre.surface)} km² environ`} />
                ) : null}
              </>
            ) : null}
            {props.etape.sections_with_values.map(section => (
              <>
                {section.elements
                  .filter(element => valeurFind(element) !== '–')
                  .map(element => (
                    <>
                      <EtapePropItem
                        title={element.nom ?? element.id}
                        item={
                          <>
                            {element.type === 'url' ? (
                              <a target="_blank" rel="noopener noreferrer" href={valeurFind(element)} title={`${element.nom} - Lien externe`}>
                                {valeurFind(element)}
                              </a>
                            ) : (
                              <p class="cap-first">
                                {element.id === 'jorf' && element.value !== null && element.value !== '' ? (
                                  <a target="_blank" rel="noopener noreferrer" href={`https://www.legifrance.gouv.fr/jorf/id/${valeurFind(element)}`} title={`Légifrance - Lien externe`}>
                                    {valeurFind(element)}
                                  </a>
                                ) : (
                                  valeurFind(element)
                                )}
                                {element.id === 'volumeGranulatsExtrait' && element.value !== null && isNumberElement(element) ? (
                                  <span>m3. Soit l’équivalent de {numberFormat(element.value * 1.5)} tonnes.</span>
                                ) : null}
                              </p>
                            )}
                          </>
                        }
                      />
                    </>
                  ))}
              </>
            ))}
            {props.etape.notes !== null ? <EtapePropItem style={{ gridColumn: '1 / -1', whiteSpace: 'pre-line' }} title="Notes" text={props.etape.notes} /> : null}
          </div>
        </>
      ) : null}

      {fondamentalePropsName in props.etape && isNotNullNorUndefined(props.etape.fondamentale.perimetre) && isNotNullNorUndefined(props.etape.fondamentale.perimetre.geojson4326_perimetre) ? (
        <DsfrPerimetre
          class="fr-pt-2w"
          initTab={props.initTab}
          titreSlug={props.titre.slug}
          apiClient={props.apiClient}
          calculateNeighbours={false}
          perimetre={{
            geojson4326_perimetre: props.etape.fondamentale.perimetre.geojson4326_perimetre,
            geojson4326_points: props.etape.fondamentale.perimetre.geojson4326_points,
            geojson_origine_perimetre: props.etape.fondamentale.perimetre.geojson_origine_perimetre,
            geojson_origine_points: props.etape.fondamentale.perimetre.geojson_origine_points,
            geojson_origine_geo_systeme_id: props.etape.fondamentale.perimetre.geojson_origine_geo_systeme_id,
          }}
        />
      ) : null}

      <EtapeDocuments etapeDocuments={props.etape.documents} entrepriseDocuments={props.etape.entreprises_documents} titulaires={props.demarche.titulaires} user={props.user} />

      {removePopupVisible.value ? (
        <RemoveEtapePopup
          close={closeRemovePopup}
          apiClient={props.apiClient}
          demarcheTypeId={props.demarche.demarche_type_id}
          etapeTypeId={props.etape.etape_type_id}
          id={props.etape.id}
          titreTypeId={props.titre.typeId}
          titreNom={props.titre.nom}
        />
      ) : null}
      {deposePopupVisible.value ? (
        <DeposeEtapePopup
          close={closeDeposePopup}
          apiClient={props.apiClient}
          demarcheTypeId={props.demarche.demarche_type_id}
          etapeTypeId={props.etape.etape_type_id}
          id={props.etape.id}
          titreTypeId={props.titre.typeId}
          titreNom={props.titre.nom}
        />
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheEtape.props = ['demarche', 'titre', 'router', 'user', 'etape', 'apiClient', 'initTab']
