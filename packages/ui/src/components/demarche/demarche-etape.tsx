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
import { DemarcheEtape as CommonDemarcheEtape } from 'camino-common/src/demarche'
import { DsfrPerimetre, TabId } from '../_common/dsfr-perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { numberFormat } from 'camino-common/src/number'
import { OmitDistributive, getValues, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { valeurFind } from 'camino-common/src/sections'
import { EtapeDocuments } from '../etape/etape-documents'
import { User } from 'camino-common/src/roles'
import styles from './demarche-etape.module.css'
import { DsfrButton, DsfrButtonIcon, DsfrLink } from '../_ui/dsfr-button'
import { PureDownloads } from '../_common/downloads'
import { canDeleteEtape, canDeposeEtape, canEditEtape } from 'camino-common/src/permissions/titres-etapes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { RemoveEtapePopup } from './remove-etape-popup'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { DeposeEtapePopup } from './depose-etape-popup'
import { ApiClient } from '@/api/api-client'
import { TitreGetDemarche, getMostRecentValuePropFromEtapeFondamentaleValide } from 'camino-common/src/titres'
import { GetEtapeDocumentsByEtapeId, documentTypeIdComplementaireObligatoireASL, documentTypeIdComplementaireObligatoireDAE, etapeDocumentIdValidator, needAslAndDae } from 'camino-common/src/etape'
import { Unites } from 'camino-common/src/static/unites'
import { EntrepriseId, Entreprise } from 'camino-common/src/entreprise'
import { Badge } from '../_ui/badge'
import { CaminoRouter } from '@/typings/vue-router'
import { CommuneId } from 'camino-common/src/static/communes'
import { EtapeAvisTable } from '../etape/etape-avis'
import { FlattenEtape } from 'camino-common/src/etape-form'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
// Il ne faut pas utiliser de literal dans le 'in' il n'y aura jamais d'erreur typescript
const fondamentalePropsName = 'fondamentale'

type Props = {
  etape: OmitDistributive<CommonDemarcheEtape, 'ordre'>
  demarche: {
    titulaireIds: EntrepriseId[]
    administrationsLocales: AdministrationId[]
    demarche_type_id: DemarcheTypeId
    sdom_zones: SDOMZoneId[]
    communes: CommuneId[]
    etapes: TitreGetDemarche['etapes']
  }
  titre: {
    typeId: TitreTypeId
    slug: TitreSlug
    nom: string
    titreStatutId: TitreStatutId
  }
  apiClient: Pick<ApiClient, 'deleteEtape' | 'deposeEtape' | 'getGeojsonByGeoSystemeId'>
  router: Pick<CaminoRouter, 'push'>
  user: User
  entreprises: Entreprise[]
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

  const entreprisesIndex = props.entreprises.reduce<Record<EntrepriseId, string>>((acc, entreprise) => {
    acc[entreprise.id] = entreprise.nom

    return acc
  }, {})

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

  const canDownloadZip = computed<boolean>(() => props.etape.entreprises_documents.length + props.etape.etape_documents.length > 1)

  const canDelete = computed<boolean>(() =>
    canDeleteEtape(props.user, props.etape.etape_type_id, props.etape.is_brouillon, props.demarche.titulaireIds, props.demarche.administrationsLocales, props.demarche.demarche_type_id, props.titre)
  )

  const canEditOrDeleteEtape = computed<boolean>(
    () =>
      canEditEtape(props.user, props.etape.etape_type_id, props.etape.is_brouillon, props.demarche.titulaireIds, props.demarche.administrationsLocales, props.demarche.demarche_type_id, props.titre) ||
      canDelete.value
  )

  const daeDocument = computed<GetEtapeDocumentsByEtapeId['dae']>(() => {
    if (needAslAndDae({ etapeTypeId: props.etape.etape_type_id, demarcheTypeId: props.demarche.demarche_type_id, titreTypeId: props.titre.typeId }, props.etape.is_brouillon, props.user)) {
      const daeEtape = props.demarche.etapes.find(({ etape_type_id }) => etape_type_id === 'dae')
      if (isNotNullNorUndefined(daeEtape)) {
        return {
          id: etapeDocumentIdValidator.parse('daeId'),
          date: daeEtape.date,
          description: '',
          arrete_prefectoral: '',
          public_lecture: false,
          entreprises_lecture: true,
          etape_statut_id: daeEtape.etape_statut_id,
          etape_document_type_id: documentTypeIdComplementaireObligatoireDAE,
        }
      }
    }

    return null
  })

  const aslDocument = computed<GetEtapeDocumentsByEtapeId['asl']>(() => {
    if (needAslAndDae({ etapeTypeId: props.etape.etape_type_id, demarcheTypeId: props.demarche.demarche_type_id, titreTypeId: props.titre.typeId }, props.etape.is_brouillon, props.user)) {
      const aslEtape = props.demarche.etapes.find(({ etape_type_id }) => etape_type_id === 'asl')
      if (isNotNullNorUndefined(aslEtape)) {
        return {
          id: etapeDocumentIdValidator.parse('aslId'),
          date: aslEtape.date,
          description: '',
          public_lecture: false,
          entreprises_lecture: true,
          etape_statut_id: aslEtape.etape_statut_id,
          etape_document_type_id: documentTypeIdComplementaireObligatoireASL,
        }
      }
    }

    return null
  })

  const isDeposable = computed<boolean>(() => {
    const titulaireIds = getMostRecentValuePropFromEtapeFondamentaleValide('titulaireIds', [{ ...props.demarche, ordre: 0 }])
    const amodiataireIds = getMostRecentValuePropFromEtapeFondamentaleValide('amodiataireIds', [{ ...props.demarche, ordre: 0 }])
    const perimetre = getMostRecentValuePropFromEtapeFondamentaleValide('perimetre', [{ ...props.demarche, ordre: 0 }])
    const substances = getMostRecentValuePropFromEtapeFondamentaleValide('substances', [{ ...props.demarche, ordre: 0 }])
    const duree = getMostRecentValuePropFromEtapeFondamentaleValide('duree', [{ ...props.demarche, ordre: 0 }])

    const sections = getSections(props.titre.typeId, props.demarche.demarche_type_id, props.etape.etape_type_id)
    const sortedEtapes = [...props.demarche.etapes].sort((a, b) => b.ordre - a.ordre)
    const contenu: FlattenEtape['contenu'] = {}

    sections.forEach(section => {
      contenu[section.id] = {}
      section.elements.forEach(element => {
        let elementValue = null
        for (const etape of sortedEtapes) {
          const sectionWithValue = etape.sections_with_values.find(s => s.id === section.id)
          const elementWithValue = sectionWithValue?.elements.find(e => e.id === element.id)

          if (isNotNullNorUndefined(elementWithValue)) {
            elementValue = elementWithValue.value
            break
          }
        }

        contenu[section.id][element.id] = { value: elementValue, heritee: false, etapeHeritee: null }
      })
    })
    return canDeposeEtape(
      props.user,
      { typeId: props.titre.typeId, titreStatutId: props.titre.titreStatutId, titulaires: props.demarche.titulaireIds, administrationsLocales: props.demarche.administrationsLocales },
      props.demarche.demarche_type_id,
      {
        amodiataires: { value: amodiataireIds ?? [], heritee: false, etapeHeritee: null },
        titulaires: { value: titulaireIds ?? [], heritee: false, etapeHeritee: null },
        contenu,
        date: props.etape.date,
        typeId: props.etape.etape_type_id,
        duree: { value: duree, heritee: false, etapeHeritee: null },
        perimetre: {
          value: {
            geojson4326Forages: perimetre?.geojson4326_forages ?? null,
            geojson4326Perimetre: perimetre?.geojson4326_perimetre ?? null,
            geojson4326Points: perimetre?.geojson4326_points ?? null,
            geojsonOrigineForages: perimetre?.geojson_origine_forages ?? null,
            geojsonOrigineGeoSystemeId: perimetre?.geojson_origine_geo_systeme_id ?? null,
            geojsonOriginePoints: perimetre?.geojson_origine_points ?? null,
            geojsonOriginePerimetre: perimetre?.geojson_origine_perimetre ?? null,
            surface: perimetre?.surface ?? null,
          },
          heritee: false,
          etapeHeritee: null,
        },
        substances: { value: substances ?? [], heritee: false, etapeHeritee: null },

        isBrouillon: props.etape.is_brouillon,
        statutId: props.etape.etape_statut_id,
      },
      props.etape.etape_documents,
      props.etape.entreprises_documents,
      props.demarche.sdom_zones,
      props.demarche.communes,
      daeDocument.value,
      aslDocument.value,
      props.etape.avis_documents
    )
  })

  const isBrouillon = computed<boolean>(() => props.etape.is_brouillon)

  return () => (
    <div class="fr-pb-2w fr-pl-2w fr-pr-2w fr-tile--shadow" style={{ border: '1px solid var(--grey-900-175)' }}>
      <div class={`${styles.sticky} fr-pt-1w`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            <div class="fr-text--lg fr-mb-0" style={{ color: 'var(--text-title-blue-france)', fontWeight: '500' }}>
              {capitalize(EtapesTypes[props.etape.etape_type_id].nom)}
            </div>
            {isBrouillon.value ? <Badge class="fr-ml-1w" systemLevel="new" ariaLabel={`Brouillon de l'étape ${EtapesTypes[props.etape.etape_type_id].nom}`} label="Brouillon" /> : null}
          </div>

          <div style={{ display: 'flex' }}>
            {canEditOrDeleteEtape.value ? (
              <>
                {isBrouillon.value ? <DsfrButton class="fr-mr-1v" buttonType="primary" label="Déposer" title="Déposer l'étape" onClick={deposePopupOpen} disabled={!isDeposable.value} /> : null}
                <DsfrLink
                  icon={'fr-icon-pencil-line'}
                  disabled={false}
                  to={{ name: 'etapeEdition', params: { id: props.etape.slug } }}
                  class="fr-mr-1v"
                  buttonType="secondary"
                  title="Modifier l’étape"
                  label={null}
                />
                {canDelete.value ? <DsfrButtonIcon icon={'fr-icon-delete-bin-line'} class="fr-mr-1v" buttonType="secondary" title="Supprimer l’étape" onClick={removePopupOpen} /> : null}
              </>
            ) : null}
            {canDownloadZip.value ? (
              <PureDownloads
                class="fr-mr-1v"
                downloadTitle={`Télécharger l’ensemble des documents de l'étape "${EtapesTypes[props.etape.etape_type_id].nom}" dans un fichier .zip`}
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
                <EtapePropEntreprisesItem title="Titulaire" entreprises={props.etape.fondamentale.titulaireIds?.map(id => ({ id, nom: entreprisesIndex[id] })) ?? []} />
                <EtapePropEntreprisesItem title="Amodiataire" entreprises={props.etape.fondamentale.amodiataireIds?.map(id => ({ id, nom: entreprisesIndex[id] })) ?? []} />
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
                              <p>
                                {element.id === 'jorf' && element.value !== null && element.value !== '' ? (
                                  <a target="_blank" rel="noopener noreferrer" href={`https://www.legifrance.gouv.fr/jorf/id/${valeurFind(element)}`} title={`Légifrance - Lien externe`}>
                                    {valeurFind(element)}
                                  </a>
                                ) : (
                                  <>
                                    {valeurFind(element)} {element.type === 'number' && isNotNullNorUndefined(element.uniteId) ? Unites[element.uniteId].symbole : null}
                                  </>
                                )}
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
          titreTypeId={props.titre.typeId}
          apiClient={props.apiClient}
          calculateNeighbours={false}
          perimetre={{
            geojson4326_perimetre: props.etape.fondamentale.perimetre.geojson4326_perimetre,
            geojson4326_points: props.etape.fondamentale.perimetre.geojson4326_points,
            geojson_origine_perimetre: props.etape.fondamentale.perimetre.geojson_origine_perimetre,
            geojson_origine_points: props.etape.fondamentale.perimetre.geojson_origine_points,
            geojson_origine_geo_systeme_id: props.etape.fondamentale.perimetre.geojson_origine_geo_systeme_id,
            geojson4326_forages: props.etape.fondamentale.perimetre.geojson4326_forages,
            geojson_origine_forages: props.etape.fondamentale.perimetre.geojson_origine_forages,
            surface: props.etape.fondamentale.perimetre.surface,
          }}
        />
      ) : null}

      <EtapeDocuments etapeDocuments={props.etape.etape_documents} entrepriseDocuments={props.etape.entreprises_documents} user={props.user} entreprises={props.entreprises} />

      <EtapeAvisTable etapeAvis={props.etape.avis_documents} user={props.user} />
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
      {deposePopupVisible.value ? <DeposeEtapePopup close={closeDeposePopup} apiClient={props.apiClient} id={props.etape.id} /> : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheEtape.props = ['demarche', 'titre', 'router', 'user', 'entreprises', 'etape', 'apiClient', 'initTab']
