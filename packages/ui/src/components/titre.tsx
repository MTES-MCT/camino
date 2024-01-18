import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { Router, useRouter } from 'vue-router'
import { LoadingElement } from './_ui/functional-loader'
import { DemarcheEtapeFondamentale, DemarcheSlug, demarcheSlugValidator } from 'camino-common/src/demarche'
import { AsyncData } from '@/api/client-rest'
import { useStore } from 'vuex'
import { User, isEntrepriseOrBureauDEtude, isSuper } from 'camino-common/src/roles'
import { capitalize } from 'camino-common/src/strings'
import { TitresTypes } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { TabId } from './_common/dsfr-perimetre'
import { ApiClient, apiClient } from '@/api/api-client'
import { Domaine } from '@/components/_common/domaine'
import { DsfrButton, DsfrButtonIcon, DsfrLink } from './_ui/dsfr-button'
import { TitreStatut } from './_common/titre-statut'
import { caminoFiltres } from 'camino-common/src/filters'
import { ReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { TableSortEvent } from './_ui/table'
import { activitesColonneIdAnnee } from './activites'
import { CaminoDate, dateFormat, getCurrent } from 'camino-common/src/date'
import { Alert } from './_ui/alert'
import { titreIdOrSlugValidator, TitreIdOrSlug, TitreGet, getMostRecentValueProp, TitreId } from 'camino-common/src/titres'
import { TitresLinkForm } from './titre/titres-link-form'
import { canReadTitreActivites } from 'camino-common/src/permissions/activites'
import { TitreTimeline } from './titre/titre-timeline'
import { CommuneId } from 'camino-common/src/static/communes'
import { canDeleteTitre, canEditTitre, canHaveActivites } from 'camino-common/src/permissions/titres'
import { TitreDemarche } from '@/components/titre/titre-demarche'
import { isNotNullNorUndefined, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { DsfrIcon } from './_ui/icon'
import { DsfrSeparator } from './_ui/dsfr-separator'
import { TitreAbonnerButton } from './titre/titre-abonner-button'
import { EditPopup } from './titre/edit-popup'
import { RemovePopup } from './titre/remove-popup'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getAdministrationsLocales } from 'camino-common/src/administrations'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes'
import { DemarcheEditPopup } from './titre/demarche-edit-popup'
import { PhaseWithAlterations, phaseWithAlterations } from './titre/phase'
import { SecteursMaritimes } from 'camino-common/src/static/facades'
import { EtapeId } from 'camino-common/src/etape'

const activitesSort: TableSortEvent = {
  colonne: activitesColonneIdAnnee,
  ordre: 'desc',
}

export const Titre = defineComponent(() => {
  const router = useRouter()
  const store = useStore()
  const user = computed<User>(() => store.state.user.element)

  const titreIdOrSlug = computed<TitreIdOrSlug | null>(() => {
    const idOrSlug = Array.isArray(router.currentRoute.value.params.id) ? router.currentRoute.value.params.id[0] : router.currentRoute.value.params.id
    const validated = titreIdOrSlugValidator.safeParse(idOrSlug)

    if (validated.success) {
      return validated.data
    }

    return null
  })

  const currentDemarcheSlug = computed<DemarcheSlug | null>(() => {
    const demarcheId = router.currentRoute.value.query.demarcheSlug

    return demarcheSlugValidator.optional().parse(Array.isArray(demarcheId) ? demarcheId[0] : demarcheId) ?? null
  })

  const overriddenApiClient: ApiClient = {
    ...apiClient,
    deleteEtape: async (titreEtapeId: EtapeId) => {
      try {
        await apiClient.deleteEtape(titreEtapeId)
      } catch (e) {
        store.dispatch(
          'messageAdd',
          {
            value: `Impossible de supprimer cette étape`,
            type: 'error',
          },
          { root: true }
        )
        throw e
      }
    },
  }

  return () => (
    <PureTitre user={user.value} titreIdOrSlug={titreIdOrSlug.value} currentDemarcheSlug={currentDemarcheSlug.value} apiClient={overriddenApiClient} router={router} currentDate={getCurrent()} />
  )
})

interface Props {
  user: User
  titreIdOrSlug: TitreIdOrSlug | null
  currentDemarcheSlug: DemarcheSlug | null
  currentDate: CaminoDate
  apiClient: Pick<
    ApiClient,
    | 'getTitreById'
    | 'getTitresWithPerimetreForCarte'
    | 'deleteEtape'
    | 'deposeEtape'
    | 'loadTitreLinks'
    | 'loadLinkableTitres'
    | 'linkTitres'
    | 'titreUtilisateurAbonne'
    | 'getTitreUtilisateurAbonne'
    | 'editTitre'
    | 'removeTitre'
    | 'createDemarche'
    | 'updateDemarche'
    | 'deleteDemarche'
    | 'getGeojsonByGeoSystemeId'
  >
  router: Pick<Router, 'push' | 'replace'>
  initTab?: TabId
}

export const PureTitre = defineComponent<Props>(props => {
  const titreData = ref<AsyncData<TitreGet>>({ status: 'LOADING' })

  const retrieveTitre = async () => {
    const titreId: TitreId | null = titreData.value.status === 'LOADED' ? titreData.value.value.id : null
    if (titreId !== null) {
      await updateTitre(titreId)
    }
  }

  const reloadAfterRemoveTitre = () => {
    props.router.push({ name: 'homepage' })
  }

  const demarcheCreatedOrUpdated = async (demarcheSlug: DemarcheSlug) => {
    await retrieveTitre()
    props.router.push({ name: 'titre', params: { id: props.titreIdOrSlug }, query: { demarcheSlug } })
  }

  const demarcheDeleted = async () => {
    await retrieveTitre()
  }

  const updateTitre = async (titreIdOrSlug: TitreIdOrSlug | null) => {
    titreData.value = { status: 'LOADING' }

    if (titreIdOrSlug === null) {
      titreData.value = { status: 'ERROR', message: "Id ou slug d'activité non trouvé" }
    } else {
      try {
        const data = await props.apiClient.getTitreById(titreIdOrSlug)
        titreData.value = { status: 'LOADED', value: data }

        let demarcheSlug = props.currentDemarcheSlug

        if ((props.currentDemarcheSlug === null || isNullOrUndefined(data.demarches.find(({ slug }) => slug === props.currentDemarcheSlug))) && phases.value.length > 0) {
          demarcheSlug = phases.value[phases.value.length - 1][phases.value[phases.value.length - 1].length - 1].slug
        }

        if (data.slug !== props.titreIdOrSlug || demarcheSlug !== props.currentDemarcheSlug) {
          props.router.replace({ name: 'titre', params: { id: data.slug }, query: { demarcheSlug } })
        }
      } catch (e: any) {
        console.error('error', e)
        titreData.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }

  watch(
    () => props.titreIdOrSlug,
    async () => {
      if (titreData.value.status !== 'LOADED' || (titreData.value.value.id !== props.titreIdOrSlug && titreData.value.value.slug !== props.titreIdOrSlug)) {
        await updateTitre(props.titreIdOrSlug)
      }
    }
  )

  watch(
    () => titreData.value,
    async () => {
      if (titreData.value.status === 'LOADED') {
        const titre = titreData.value.value

        showActivitesLink.value =
          canHaveActivites({ titreTypeId: titreData.value.value.titre_type_id, communes: communes.value, secteursMaritime: secteursMaritime.value, demarches: titreData.value.value.demarches }) &&
          (await canReadTitreActivites(
            props.user,
            () => Promise.resolve(titre.titre_type_id),
            () => Promise.resolve(administrations.value),
            () => {
              const titulaires = getMostRecentValueProp('titulaires', titre.demarches) ?? []
              const amodiataires = getMostRecentValueProp('amodiataires', titre.demarches) ?? []

              return Promise.resolve([...titulaires, ...amodiataires].map(({ id }) => id))
            }
          ))
      } else {
        showActivitesLink.value = false
      }
    }
  )

  onMounted(async () => {
    await updateTitre(props.titreIdOrSlug)
  })

  const customApiClient = computed<Props['apiClient']>(() => ({
    ...props.apiClient,
    deleteEtape: async titreEtapeId => {
      if (titreData.value.status === 'LOADED') {
        await props.apiClient.deleteEtape(titreEtapeId)
        await retrieveTitre()
      }
    },
    deposeEtape: async titreEtapeId => {
      if (titreData.value.status === 'LOADED') {
        await props.apiClient.deposeEtape(titreEtapeId)
        await retrieveTitre()
      }
    },
  }))

  const showActivitesLink = ref<boolean>(false)

  const perimetre = computed<null | DemarcheEtapeFondamentale['fondamentale']['perimetre']>(() => {
    return titreData.value.status === 'LOADED' && titreData.value.value.demarches !== null ? getMostRecentValueProp('perimetre', titreData.value.value.demarches) : null
  })

  const administrations = computed<AdministrationId[]>(() => {
    if (titreData.value.status === 'LOADED') {
      const administrationLocales =
        perimetre.value !== null
          ? getAdministrationsLocales(
              perimetre.value.communes.map(({ id }) => id),
              perimetre.value.secteurs_maritimes
            )
          : []

      const administrationGestionnaires =
        titreData.value.value.titre_type_id !== null
          ? getGestionnairesByTitreTypeId(titreData.value.value.titre_type_id)
              .filter(({ associee }) => !associee)
              .map(({ administrationId }) => administrationId)
          : []

      return [...administrationLocales, ...administrationGestionnaires].filter(onlyUnique)
    } else {
      return []
    }
  })

  const communes = computed<{ id: CommuneId }[]>(() => {
    if (perimetre.value !== null) {
      return perimetre.value.communes
    }

    return []
  })

  const secteursMaritime = computed<SecteursMaritimes[]>(() => {
    if (perimetre.value !== null) {
      return perimetre.value.secteurs_maritimes
    }

    return []
  })

  const titreLinkFormTitre = computed(() => {
    if (titreData.value.status === 'LOADED') {
      return { id: titreData.value.value.id, typeId: titreData.value.value.titre_type_id, administrations: administrations.value, demarches: titreData.value.value.demarches }
    }

    return null
  })

  const phases = computed<PhaseWithAlterations>(() => {
    if (titreData.value.status === 'LOADED') {
      return phaseWithAlterations(titreData.value.value.demarches, props.currentDate)
    }

    return []
  })

  const editerTitrePopup = ref<boolean>(false)
  const openEditerTitrePopup = () => {
    editerTitrePopup.value = true
  }

  const closeEditPopup = () => {
    editerTitrePopup.value = false
  }
  const supprimerTitrePopup = ref<boolean>(false)
  const openDeleteTitrePopup = () => {
    supprimerTitrePopup.value = true
  }

  const closeDeletePopup = () => {
    supprimerTitrePopup.value = false
  }

  const hasNoPhases = computed<boolean>(() => {
    return phases.value.length === 0
  })

  const addDemarchePopup = ref<boolean>(false)

  const openAddDemarchePopup = () => {
    addDemarchePopup.value = true
  }
  const closeAddDemarchePopup = () => {
    addDemarchePopup.value = false
  }

  return () => (
    <div class="dsfr">
      <LoadingElement
        data={titreData.value}
        renderItem={titre => (
          <div>
            <div class="fr-grid-row fr-grid-row--top">
              <h1 style={{ maxWidth: '400px' }} class="fr-m-0">
                {capitalize(titre.nom)}
              </h1>
              <TitreStatut class="fr-ml-2w" titreStatutId={titre.titre_statut_id} style={{ alignSelf: 'center' }} />

              <div class="fr-m-0" style={{ marginLeft: 'auto !important', display: 'flex' }}>
                <DsfrLink
                  class="fr-btn fr-btn--secondary fr-pl-2w fr-pr-2w"
                  style={{ marginLeft: 'auto', display: 'flex' }}
                  disabled={false}
                  icon={null}
                  title="Signaler une erreur"
                  href={`mailto:camino@beta.gouv.fr?subject=Erreur ${titre.slug}&body=Bonjour, j'ai repéré une erreur sur le titre ${window.location.href} :`}
                  target="_blank"
                  rel="noopener external"
                />
                {canEditTitre(props.user, titre.titre_type_id, titre.titre_statut_id) ? (
                  <DsfrButtonIcon icon="fr-icon-pencil-line" buttonType="secondary" class="fr-ml-2w" title="Éditer le titre" onClick={openEditerTitrePopup} />
                ) : null}
                {canDeleteTitre(props.user) ? (
                  <DsfrButtonIcon icon="fr-icon-delete-bin-line" class="fr-ml-2w" title="Supprimer le titre" buttonType="secondary" onClick={openDeleteTitrePopup} />
                ) : null}
                <TitreAbonnerButton class="fr-ml-2w" titreId={titre.id} user={props.user} apiClient={props.apiClient} />
              </div>
            </div>
            <div class="fr-grid-row fr-grid-row--middle fr-mt-1w">
              <h3 class="fr-m-0">{capitalize(TitresTypesTypes[TitresTypes[titre.titre_type_id].typeId].nom)}</h3>
              <Domaine class="fr-ml-2w" domaineId={TitresTypes[titre.titre_type_id].domaineId} />
            </div>
            {titre.references.length > 0 ? (
              <div class="fr-mt-2w">
                Références
                {titre.references.map(reference => (
                  <div key={reference.nom} style={{ fontWeight: 500 }}>
                    {ReferencesTypes[reference.referenceTypeId].nom} : {reference.nom}
                  </div>
                ))}
              </div>
            ) : null}

            <div class="fr-grid-row fr-grid-row--middle fr-mt-4w">
              {titre.titre_last_modified_date !== null ? (
                <div>
                  <DsfrIcon name="fr-icon-calendar-line" class="fr-mr-1w" size="sm" color="text-title-blue-france" />
                  Modifié le {dateFormat(titre.titre_last_modified_date)}
                </div>
              ) : null}

              {isSuper(props.user) ? (
                <DsfrLink
                  style={{ marginLeft: 'auto' }}
                  disabled={false}
                  icon={null}
                  title="Journaux du titre"
                  label="Journaux du titre"
                  to={{ name: 'journaux', query: { [caminoFiltres.titresIds.id]: titre.id } }}
                />
              ) : null}
            </div>
            <div>
              {titre.titre_doublon !== null ? (
                <Alert
                  small={true}
                  type="warning"
                  class="fr-mt-2w"
                  title={
                    <>
                      Le titre est en doublon avec : <DsfrLink disabled={false} icon={null} title={titre.titre_doublon?.nom ?? ''} to={{ name: 'titre', params: { id: titre.titre_doublon?.id } }} />.
                    </>
                  }
                />
              ) : null}
              {showActivitesLink.value && isNotNullNorUndefined(titre.nb_activites_to_do) ? (
                <>
                  {titre.nb_activites_to_do === 0 ? (
                    <DsfrLink
                      disabled={false}
                      icon={null}
                      class="fr-mt-2w"
                      title="Consulter les rapports d'activités"
                      label="Consulter les rapports d'activités"
                      buttonType="secondary"
                      to={{ name: 'activites', query: { [caminoFiltres.titresIds.id]: titre.id, ...activitesSort } }}
                    />
                  ) : (
                    <Alert
                      class="fr-mt-2w"
                      small={true}
                      type={isEntrepriseOrBureauDEtude(props.user) ? 'warning' : 'info'}
                      title={
                        <>
                          Il manque {titre.nb_activites_to_do} {(titre.nb_activites_to_do ?? 0) > 1 ? "rapports d'activités" : "rapport d'activité"}.{' '}
                          <DsfrLink
                            disabled={false}
                            icon={null}
                            title={`Remplir ${(titre.nb_activites_to_do ?? 0) > 1 ? "les rapports d'activités" : "le rapport d'activité"}`}
                            to={{ name: 'activites', query: { [caminoFiltres.titresIds.id]: titre.id, ...activitesSort } }}
                          />
                        </>
                      }
                    />
                  )}
                </>
              ) : null}
              {titreLinkFormTitre.value !== null ? <TitresLinkForm user={props.user} titre={titreLinkFormTitre.value} apiClient={props.apiClient} /> : null}
            </div>

            <DsfrSeparator />

            {hasNoPhases.value ? <DsfrButton style={{ marginLeft: 'auto' }} buttonType="primary" title="Ajouter une démarche" onClick={openAddDemarchePopup} /> : null}
            {props.currentDemarcheSlug !== null ? (
              <>
                <TitreTimeline class="fr-pt-4w fr-pb-4w" phasesWithAlterations={phases.value} currentDemarcheSlug={props.currentDemarcheSlug} titreSlug={titre.slug} />
                <TitreDemarche
                  titre={titre}
                  demarcheCreatedOrUpdated={demarcheCreatedOrUpdated}
                  demarcheDeleted={demarcheDeleted}
                  demarches={titre.demarches}
                  currentDemarcheSlug={props.currentDemarcheSlug}
                  user={props.user}
                  apiClient={customApiClient.value}
                  router={props.router}
                  initTab={props.initTab}
                />
              </>
            ) : null}
            {editerTitrePopup.value ? <EditPopup close={closeEditPopup} apiClient={props.apiClient} titre={titre} reload={retrieveTitre} /> : null}
            {supprimerTitrePopup.value ? (
              <RemovePopup apiClient={props.apiClient} close={closeDeletePopup} titreId={titre.id} titreNom={titre.nom} titreTypeId={titre.titre_type_id} reload={reloadAfterRemoveTitre} />
            ) : null}
            {addDemarchePopup.value ? (
              <DemarcheEditPopup
                apiClient={props.apiClient}
                close={closeAddDemarchePopup}
                titreNom={titre.nom}
                titreTypeId={titre.titre_type_id}
                demarche={{ titreId: titre.id }}
                tabId="demarches"
                reload={demarcheCreatedOrUpdated}
              />
            ) : null}
          </div>
        )}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureTitre.props = ['user', 'titreIdOrSlug', 'apiClient', 'router', 'initTab', 'currentDemarcheSlug', 'currentDate']
