import { FunctionalComponent, capitalize, computed, defineComponent, ref } from 'vue'
import { getMostRecentValueProp, TitreGet, TitreGetDemarche } from 'camino-common/src/titres'
import { DemarcheEtapeFondamentale, DemarcheSlug, EntreprisesByEtapeId, getDemarcheContenu } from 'camino-common/src/demarche'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { DemarcheStatut } from '@/components/_common/demarche-statut'
import { isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { DemarcheEtape } from '@/components/demarche/demarche-etape'
import { getAdministrationsLocales } from 'camino-common/src/administrations'
import { Router } from 'vue-router'
import { User } from 'camino-common/src/roles'
import { DsfrPerimetre, TabId } from '@/components/_common/dsfr-perimetre'
import { EtapePropAdministrationsItem, EtapePropEntreprisesItem, EtapePropItem } from '@/components/etape/etape-prop-item'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getGestionnairesByTitreTypeId } from 'camino-common/src/static/administrationsTitresTypes'
import { ApiClient } from '@/api/api-client'
import type { DemarcheAlteration, PhaseWithAlterations, PhaseWithDateDebut, TitreTimelineEvents } from './phase'
import { SubstanceLegaleId, SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { territoiresFind } from 'camino-common/src/territoires'
import { DsfrButton, DsfrButtonIcon, DsfrLink } from '../_ui/dsfr-button'
import { canCreateEtapeByDemarche, canCreateOrEditDemarche, canDeleteDemarche } from 'camino-common/src/permissions/titres-demarches'
import { DemarcheEditPopup } from './demarche-edit-popup'
import { DemarcheRemovePopup } from './demarche-remove-popup'
import { Forets } from 'camino-common/src/static/forets'
import { SDOMZones } from 'camino-common/src/static/sdom'

type Props = {
  titre: Pick<TitreGet, 'id' | 'slug' | 'titre_type_id' | 'titre_statut_id' | 'nom'>
  phasesWithAlterations: PhaseWithAlterations
  currentDemarcheSlug: DemarcheSlug
  apiClient: Pick<ApiClient, 'deleteEtape' | 'deposeEtape' | 'getTitresWithPerimetreForCarte' | 'createDemarche' | 'updateDemarche' | 'deleteDemarche'>
  demarcheCreatedOrUpdated: (demarcheSlug: DemarcheSlug) => Promise<void>
  demarcheDeleted: () => Promise<void>
  router: Pick<Router, 'push'>
  user: User
  initTab?: TabId
}

export const TitreDemarche = defineComponent<Props>(props => {
  const demarche = computed<TitreGetDemarche | null>(() => {
    for (const phase of props.phasesWithAlterations) {
      for (const demarche of phase) {
        if (demarche.slug === props.currentDemarcheSlug) {
          return demarche
        } else if ('events' in demarche) {
          for (const event of demarche.events) {
            if (event.slug === props.currentDemarcheSlug) {
              return event
            }
          }
        }
      }
    }

    return null
  })

  // FIXME attention si le résumé utilise ça ou pas ? (gestion des droits ?)
  const phaseDemarchesAsc = computed<(PhaseWithDateDebut | DemarcheAlteration)[] | [TitreTimelineEvents] | null>(() => {
    for (let topLevelIndex = 0; topLevelIndex < props.phasesWithAlterations.length; topLevelIndex++) {
      const phase = props.phasesWithAlterations[topLevelIndex]

      for (let phaseIndex = 0; phaseIndex < phase.length; phaseIndex++) {
        const demarche = phase[phaseIndex]
        if (demarche.slug === props.currentDemarcheSlug) {
          return phase.slice(0, phaseIndex + 1) as (PhaseWithDateDebut | DemarcheAlteration)[]
        } else if ('events' in demarche) {
          for (const event of demarche.events) {
            if (event.slug === props.currentDemarcheSlug) {
              return [event]
            }
          }
        }
      }
    }

    return null
  })

  const perimetre = computed<null | DemarcheEtapeFondamentale['fondamentale']['perimetre']>(() => {
    return phaseDemarchesAsc.value !== null ? getMostRecentValueProp('perimetre', phaseDemarchesAsc.value) : null
  })

  const administrations = computed<AdministrationId[]>(() => {
    const administrationLocales =
      perimetre.value !== null
        ? getAdministrationsLocales(
            perimetre.value.communes.map(({ id }) => id),
            perimetre.value.secteurs_maritimes
          )
        : []

    const administrationGestionnaires =
      props.titre.titre_type_id !== null
        ? getGestionnairesByTitreTypeId(props.titre.titre_type_id)
            .filter(({ associee }) => !associee)
            .map(({ administrationId }) => administrationId)
        : []

    return [...administrationLocales, ...administrationGestionnaires].filter(onlyUnique)
  })

  const titulaires = computed<EntreprisesByEtapeId[] | null>(() => {
    return phaseDemarchesAsc.value !== null ? getMostRecentValueProp('titulaires', phaseDemarchesAsc.value) : null
  })

  const amodiataires = computed<EntreprisesByEtapeId[] | null>(() => {
    return phaseDemarchesAsc.value !== null ? getMostRecentValueProp('amodiataires', phaseDemarchesAsc.value) : null
  })

  const substances = computed<SubstanceLegaleId[] | null>(() => {
    return phaseDemarchesAsc.value !== null ? getMostRecentValueProp('substances', phaseDemarchesAsc.value) : null
  })

  const addDemarchePopup = ref<boolean>(false)

  const openAddDemarchePopup = () => {
    addDemarchePopup.value = true
  }
  const closeAddDemarchePopup = () => {
    addDemarchePopup.value = false
  }

  const editDemarchePopup = ref<boolean>(false)

  const openEditDemarchePopup = () => {
    editDemarchePopup.value = true
  }
  const closeEditDemarchePopup = () => {
    editDemarchePopup.value = false
  }
  const deleteDemarchePopup = ref<boolean>(false)

  const openDeleteDemarchePopup = () => {
    deleteDemarchePopup.value = true
  }
  const closeDeleteDemarchePopup = () => {
    deleteDemarchePopup.value = false
  }

  return () => (
    <>
      {demarche.value !== null && phaseDemarchesAsc.value !== null ? (
        <>
          <div class="fr-grid-row fr-grid-row--middle">
            <h2 style={{ margin: 0 }}>{`${capitalize(DemarchesTypes[demarche.value.demarche_type_id].nom)}`}</h2>
            <DemarcheStatut class="fr-ml-2w" demarcheStatutId={demarche.value.demarche_statut_id} />
            {canCreateOrEditDemarche(props.user, props.titre.titre_type_id, props.titre.titre_statut_id, administrations.value) ? (
              <>
                <DsfrButton style={{ marginLeft: 'auto' }} buttonType="primary" title="Ajouter une démarche" onClick={openAddDemarchePopup} />
                <DsfrButtonIcon icon="fr-icon-pencil-line" style={{ marginRight: 0 }} class="fr-ml-2w" buttonType="secondary" title="Modifier la description" onClick={openEditDemarchePopup} />
              </>
            ) : null}
            {canDeleteDemarche(props.user, props.titre.titre_type_id, props.titre.titre_statut_id, administrations.value, demarche.value) ? (
              <DsfrButtonIcon icon="fr-icon-delete-bin-line" class="fr-ml-2w" buttonType="secondary" title="Supprimer la démarche" onClick={openDeleteDemarchePopup} />
            ) : null}
          </div>

          {demarche.value.description !== null && demarche.value.description !== '' ? <div class="fr-grid-row fr-mt-3w">{demarche.value.description} </div> : null}

          <h4 class="fr-mt-3w fr-mb-0">Résumé</h4>

          <div class="fr-pt-2w">
            <div class="fr-grid-row">
              <div
                class="fr-col-12"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  alignContent: 'flex-start',
                  columnGap: '16px',
                  rowGap: '8px',
                }}
              >
                {isNotNullNorUndefinedNorEmpty(substances.value) ? (
                  <EtapePropItem title={`Substance${substances.value.length > 1 ? 's' : ''}`} text={substances.value.map(substance => capitalize(SubstancesLegale[substance].nom)).join(', ')} />
                ) : null}

                <EtapePropEntreprisesItem title="Titulaire" entreprises={titulaires.value} />
                <EtapePropEntreprisesItem title="Amodiataire" entreprises={amodiataires.value} />
                <EtapePropAdministrationsItem administrations={administrations.value} />

                {Object.entries(getDemarcheContenu(demarche.value.etapes, props.titre.titre_type_id)).map(([label, value]) => (
                  <EtapePropItem title={label} text={value} />
                ))}
                <DisplayLocalisation perimetre={perimetre.value} />
              </div>
            </div>
          </div>

          {isNotNullNorUndefined(perimetre.value) && isNotNullNorUndefined(perimetre.value.geojsonMultiPolygon) ? (
            <DsfrPerimetre
              class="fr-pt-3w"
              titreSlug={props.titre.slug}
              apiClient={props.apiClient}
              geojsonMultiPolygon={perimetre.value.geojsonMultiPolygon}
              router={props.router}
              initTab={props.initTab}
            />
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div class="fr-mt-3w" style={{ display: 'flex', alignContent: 'center' }}>
              <h3 class="fr-mb-0">Étapes</h3>
              {canCreateEtapeByDemarche(props.user, props.titre.titre_type_id, demarche.value.demarche_type_id, administrations.value, props.titre.titre_statut_id) ? (
                <DsfrLink
                  buttonType="primary"
                  style={{ marginLeft: 'auto' }}
                  icon={null}
                  disabled={false}
                  title="Ajouter une étape"
                  to={{ name: 'etape-creation', query: { 'demarche-id': demarche.value.slug } }}
                />
              ) : null}
            </div>
            <div class="fr-mt-3w">
              {[...demarche.value.etapes]
                .sort((a, b) => b.ordre - a.ordre)
                .map(etape => (
                  <>
                    {demarche.value !== null ? (
                      <div class="fr-pb-2w">
                        <DemarcheEtape
                          etape={etape}
                          router={props.router}
                          user={props.user}
                          titre={{ typeId: props.titre.titre_type_id, titreStatutId: props.titre.titre_statut_id, slug: props.titre.slug, nom: props.titre.nom }}
                          demarche={{
                            administrationsLocales: getAdministrationsLocales(perimetre.value?.communes.map(({ id }) => id) ?? [], perimetre.value?.secteurs_maritimes ?? []),
                            demarche_type_id: demarche.value.demarche_type_id,
                            titulaires: titulaires.value ?? [],
                            sdom_zones: perimetre.value?.sdom_zones ?? [],
                          }}
                          apiClient={props.apiClient}
                          initTab={props.initTab}
                        />
                      </div>
                    ) : null}
                  </>
                ))}
            </div>
          </div>
          {addDemarchePopup.value ? (
            <DemarcheEditPopup
              apiClient={props.apiClient}
              close={closeAddDemarchePopup}
              titreNom={props.titre.nom}
              titreTypeId={props.titre.titre_type_id}
              demarche={{ titreId: props.titre.id }}
              tabId="demarches"
              reload={props.demarcheCreatedOrUpdated}
            />
          ) : null}
          {editDemarchePopup.value ? (
            <DemarcheEditPopup
              apiClient={props.apiClient}
              close={closeEditDemarchePopup}
              titreNom={props.titre.nom}
              titreTypeId={props.titre.titre_type_id}
              demarche={{ titreId: props.titre.id, id: demarche.value.id, description: demarche.value.description, typeId: demarche.value.demarche_type_id }}
              tabId="demarches"
              reload={props.demarcheCreatedOrUpdated}
            />
          ) : null}
          {deleteDemarchePopup.value ? (
            <DemarcheRemovePopup
              apiClient={props.apiClient}
              close={closeDeleteDemarchePopup}
              titreNom={props.titre.nom}
              titreTypeId={props.titre.titre_type_id}
              demarcheId={demarche.value.id}
              demarcheTypeId={demarche.value.demarche_type_id}
              reload={props.demarcheDeleted}
            />
          ) : null}
        </>
      ) : null}
    </>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TitreDemarche.props = ['titre', 'phasesWithAlterations', 'currentDemarcheSlug', 'apiClient', 'user', 'router', 'initTab', 'demarcheCreatedOrUpdated', 'demarcheDeleted']

const DisplayLocalisation: FunctionalComponent<Pick<DemarcheEtapeFondamentale['fondamentale'], 'perimetre'>> = props => {
  if (isNullOrUndefined(props.perimetre)) {
    return null
  }
  const { departements, communes, regions, facades } = territoiresFind(
    props.perimetre.communes.reduce(
      (acc, c) => ({
        ...acc,
        [c.id]: c.nom,
      }),
      {}
    ),
    props.perimetre.communes,
    props.perimetre.secteurs_maritimes
  )

  return (
    <>
      {isNonEmptyArray(regions) ? <EtapePropItem title={`Région${regions.length > 1 ? 's' : ''}`} text={regions.join(', ')} /> : null}
      {isNonEmptyArray(departements) ? <EtapePropItem title={`Département${departements.length > 1 ? 's' : ''}`} text={departements.join(', ')} /> : null}
      {isNonEmptyArray(facades) ? <EtapePropItem title={`Facade${facades.length > 1 ? 's' : ''}`} text={facades.map(({ facade }) => facade).join(', ')} /> : null}
      {isNonEmptyArray(props.perimetre.forets) ? (
        <EtapePropItem title={`Forêt${props.perimetre.forets.length > 1 ? 's' : ''}`} text={props.perimetre.forets.map(id => Forets[id].nom).join(', ')} />
      ) : null}
      {isNonEmptyArray(props.perimetre.sdom_zones) ? (
        <EtapePropItem title={`Zone${props.perimetre.sdom_zones.length > 1 ? 's' : ''} du SDOM`} text={props.perimetre.sdom_zones.map(id => SDOMZones[id].nom).join(', ')} />
      ) : null}
      {isNonEmptyArray(communes) ? (
        <EtapePropItem style={{ gridColumn: communes.length > 3 ? '1 / -1' : 'unset' }} title={`Commune${communes.length > 1 ? 's' : ''}`} text={communes.map(({ nom }) => nom).join(', ')} />
      ) : null}
    </>
  )
}
