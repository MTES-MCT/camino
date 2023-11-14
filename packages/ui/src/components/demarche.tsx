import { computed, defineComponent, FunctionalComponent, onMounted, ref, watch } from 'vue'
import { Router, useRouter } from 'vue-router'
import { LoadingElement } from './_ui/functional-loader'
import { DemarcheGet, DemarcheIdOrSlug, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { AsyncData } from '@/api/client-rest'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { capitalize } from 'camino-common/src/strings'
import { TitresTypes } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { DemarcheStatut } from '@/components/_common/demarche-statut'
import { TitrePhasesTable } from './titre/titre-phases-table'
import { DsfrSeparator } from './_ui/dsfr-separator'
import { Domaines } from 'camino-common/src/static/domaines'
import { SubstancesLegale } from 'camino-common/src/static/substancesLegales'
import { territoiresFind } from 'camino-common/src/territoires'
import { isNonEmptyArray } from 'camino-common/src/typescript-tools'
import { DsfrPerimetre } from './_common/dsfr-perimetre'
import { ApiClient, apiClient } from '@/api/api-client'
import { EtapePropEntreprisesItem, EtapePropItem } from './etape/etape-prop-item'
import { DemarcheEtape } from './demarche/demarche-etape'

export const Demarche = defineComponent(() => {
  const router = useRouter()
  const store = useStore()
  const user = computed<User>(() => store.state.user.element)

  const demarcheId = computed<DemarcheIdOrSlug | null>(() => {
    const idOrSlug = Array.isArray(router.currentRoute.value.params.demarcheId) ? router.currentRoute.value.params.demarcheId[0] : router.currentRoute.value.params.demarcheId
    const validated = demarcheIdOrSlugValidator.safeParse(idOrSlug)

    if (validated.success) {
      return validated.data
    }

    return null
  })

  return () => <PureDemarche user={user.value} demarcheId={demarcheId.value} apiClient={apiClient} router={router} />
})

interface Props {
  user: User
  demarcheId: DemarcheIdOrSlug | null
  apiClient: Pick<ApiClient, 'getDemarche' | 'getTitresWithPerimetreForCarte'>
  router: Pick<Router, 'push'>
}

export const PureDemarche = defineComponent<Props>(props => {
  const demarcheData = ref<AsyncData<DemarcheGet>>({ status: 'LOADING' })

  const retrieveDemarche = async (demarcheId: DemarcheIdOrSlug | null) => {
    demarcheData.value = { status: 'LOADING' }
    await updateDemarche(demarcheId)
  }

  const updateDemarche = async (demarcheId: DemarcheIdOrSlug | null) => {
    if (demarcheId === null) {
      demarcheData.value = { status: 'ERROR', message: "Id ou slug d'activité non trouvé" }
    } else {
      try {
        const data = await props.apiClient.getDemarche(demarcheId)
        demarcheData.value = { status: 'LOADED', value: data }
      } catch (e: any) {
        console.error('error', e)
        demarcheData.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }

  watch(
    () => props.demarcheId,
    async () => {
      await updateDemarche(props.demarcheId)
    }
  )

  onMounted(async () => {
    await retrieveDemarche(props.demarcheId)
  })

  return () => (
    <div class="dsfr">
      <LoadingElement
        data={demarcheData.value}
        renderItem={demarche => (
          <div>
            <div class="fr-grid-row fr-grid-row--middle">
              <h1 style={{ margin: 0 }}>{`${capitalize(TitresTypesTypes[TitresTypes[demarche.titre.titre_type_id].typeId].nom)} - ${capitalize(DemarchesTypes[demarche.demarche_type_id].nom)}`}</h1>
              <DemarcheStatut class="fr-ml-2w" demarcheStatutId={demarche.demarche_statut_id} />
            </div>
            <CaminoRouterLink class="fr-link" title={demarche.titre.nom} to={{ name: 'titre', params: { id: demarche.titre.slug } }}>
              {capitalize(demarche.titre.nom)}
            </CaminoRouterLink>

            <DsfrSeparator />

            <div>
              <h2>Résumé</h2>
              <div class="fr-grid-row">
                <div
                  class="fr-col-12 fr-col-md-6"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    alignContent: 'flex-start',
                    columnGap: '10px',
                    rowGap: '8px',
                  }}
                >
                  <EtapePropItem title="Domaine" text={capitalize(Domaines[TitresTypes[demarche.titre.titre_type_id].domaineId].nom)} />
                  {demarche.substances.length > 0 ? (
                    <EtapePropItem
                      title={`Substance${demarche.substances.length > 1 ? 's' : ''}`}
                      text={demarche.substances.map(substance => capitalize(SubstancesLegale[substance].nom)).join(', ')}
                    />
                  ) : null}

                  <EtapePropEntreprisesItem title="Titulaire" entreprises={demarche.titulaires} />
                  <EtapePropEntreprisesItem title="Amodiataire" entreprises={demarche.amodiataires} />

                  <DisplayLocalisation communes={demarche.communes} secteurs_maritimes={demarche.secteurs_maritimes} />
                  {Object.entries(demarche.contenu).map(([label, value]) => (
                    <EtapePropItem title={label} text={value} />
                  ))}
                </div>
                <div class="fr-col-12 fr-col-md-6">
                  <TitrePhasesTable phases={demarche.titre.phases} currentPhaseSlug={demarche.slug} />
                </div>
              </div>
            </div>

            <DsfrSeparator />

            {demarche.geojsonMultiPolygon !== null ? (
              <DsfrPerimetre titreSlug={demarche.titre.slug} apiClient={props.apiClient} geojsonMultiPolygon={demarche.geojsonMultiPolygon} router={props.router} />
            ) : null}

            <h2 class="fr-pt-3w">Étapes</h2>

            <div>
              {demarche.etapes.map(etape => (
                <div class="fr-pb-1w">
                  <DemarcheEtape {...etape} titreSlug={demarche.titre.slug} router={props.router} user={props.user} />
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  )
})

const DisplayLocalisation: FunctionalComponent<Pick<DemarcheGet, 'communes' | 'secteurs_maritimes'>> = props => {
  const { departements, communes, regions, facades } = territoiresFind(
    props.communes.reduce(
      (acc, c) => ({
        ...acc,
        [c.id]: c.nom,
      }),
      {}
    ),
    props.communes,
    props.secteurs_maritimes
  )

  return (
    <>
      {isNonEmptyArray(regions) ? <EtapePropItem title={`Région${regions.length > 1 ? 's' : ''}`} text={regions.join(', ')} /> : null}
      {isNonEmptyArray(departements) ? <EtapePropItem title={`Département${departements.length > 1 ? 's' : ''}`} text={departements.join(', ')} /> : null}
      {isNonEmptyArray(communes) ? (
        <EtapePropItem
          title={communes.length > 3 ? 'Nombre de communes' : `Commune${communes.length > 1 ? 's' : ''}`}
          text={communes.length > 3 ? `${communes.length}` : communes.map(({ nom }) => nom).join(', ')}
        />
      ) : null}
      {isNonEmptyArray(facades) ? <EtapePropItem title={`Facade${facades.length > 1 ? 's' : ''}`} text={facades.map(({ facade }) => facade).join(', ')} /> : null}
    </>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureDemarche.props = ['user', 'demarcheId', 'apiClient', 'router']