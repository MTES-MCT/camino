import { DeepReadonly, computed, defineComponent, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient, apiClient } from '../api/api-client'
import { DemarcheId, DemarcheIdOrSlug, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from './_ui/alert'
import { EtapeIdOrSlug, etapeIdOrSlugValidator } from 'camino-common/src/etape'
import { entreprisesKey, userKey } from '../moi'
import { User, isAdministrationAdmin, isAdministrationEditeur, isSuper } from 'camino-common/src/roles'
import { Entreprise } from 'camino-common/src/entreprise'
import { useState } from '../utils/vue-tsx-utils'
import { AsyncData } from '../api/client-rest'
import { GetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { PerimetreInformations } from 'camino-common/src/perimetre'
import { LoadingElement } from './_ui/functional-loader'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { DsfrLink } from './_ui/dsfr-button'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { capitalize } from 'camino-common/src/strings'
import { EtapeEditForm, Props as EtapeEditFormProps } from './etape/etape-edit-form'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'

export const EtapeEdition = defineComponent(() => {
  const router = useRouter()
  const user = inject(userKey)
  const entreprises = inject(entreprisesKey, ref([]))

  const demarcheIdOrSlug = computed<DemarcheIdOrSlug | null>(() => {
    return demarcheIdOrSlugValidator.nullable().parse(router.currentRoute.value.query['demarche-id'] ?? null)
  })
  const etapeIdOrSlug = computed<EtapeIdOrSlug | null>(() => {
    return etapeIdOrSlugValidator.nullable().parse(router.currentRoute.value.params.id ?? null)
  })

  const goToDemarche = (demarcheId: DemarcheId) => {
    router.push({ name: 'demarche', params: { demarcheId } })
  }

  return () => (
    <>
      {isNotNullNorUndefined(demarcheIdOrSlug.value) || isNotNullNorUndefined(etapeIdOrSlug.value) ? (
        <PureEtapeEdition etapeIdOrSlug={etapeIdOrSlug.value} demarcheIdOrSlug={demarcheIdOrSlug.value} user={user} entreprises={entreprises.value} apiClient={apiClient} goToDemarche={goToDemarche} />
      ) : (
        <Alert small={true} title="Erreur lors du chargement, la page est introuvable" type="error" />
      )}
    </>
  )
})

export type Props = {
  initTab?: 'points' | 'carte'
  etapeIdOrSlug: EtapeIdOrSlug | null
  demarcheIdOrSlug: DemarcheIdOrSlug | null
  user: User
  entreprises: Entreprise[]
  goToDemarche: (demarcheId: DemarcheId) => void
  apiClient: Pick<
    ApiClient,
    | 'getEntrepriseDocuments'
    | 'getEtapesTypesEtapesStatuts'
    | 'getEtapeHeritagePotentiel'
    | 'uploadTempDocument'
    | 'geojsonImport'
    | 'getGeojsonByGeoSystemeId'
    | 'geojsonPointsImport'
    | 'geojsonForagesImport'
    | 'getEtapeDocumentsByEtapeId'
    | 'getEtapeEntrepriseDocuments'
    | 'creerEntrepriseDocument'
    | 'getEtape'
    | 'getDemarcheByIdOrSlug'
    | 'getPerimetreInfosByDemarcheId'
    | 'getPerimetreInfosByEtapeId'
    | 'etapeCreer'
    | 'etapeModifier'
    | 'deposeEtape'
  >
}

const helpVisible = (user: User, titreTypeId: TitreTypeId, etapeTypeId: EtapeTypeId | null): boolean => {
  return !(isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && ['axm', 'arm'].includes(titreTypeId) && etapeTypeId === 'mfr'
}

export const PureEtapeEdition = defineComponent<Props>(props => {
  const [asyncData, setAsyncData] = useState<AsyncData<DeepReadonly<{ etape: EtapeEditFormProps['etape']; demarche: GetDemarcheByIdOrSlugValidator; perimetre: PerimetreInformations }>>>({ status: 'LOADING' })

  onMounted(async () => {
    try {
      if (isNotNullNorUndefined(props.etapeIdOrSlug)) {
        const etape = await props.apiClient.getEtape(props.etapeIdOrSlug)
        const demarche = {
          demarche_description: etape.demarche.description,
          demarche_id: etape.titreDemarcheId,
          demarche_slug: etape.demarche.slug,
          demarche_type_id: etape.demarche.typeId,
          titre_id: etape.demarche.titre.id,
          titre_nom: etape.demarche.titre.nom,
          titre_slug: etape.demarche.titre.slug,
          titre_type_id: etape.demarche.titre.typeId,
        }

        const perimetre = await props.apiClient.getPerimetreInfosByEtapeId(etape.id)
        setAsyncData({ status: 'LOADED', value: { etape: {...etape, heritageProps: etape.heritageProps ?? {
          dateDebut: {actif: false},
  dateFin: {actif: false},
  duree: {actif: false},
  perimetre: {actif: false},
  substances: {actif: false},
  titulaires: {actif: false},
  amodiataires: {actif: false}
        }, heritageContenu: etape.heritageContenu ?? {}}, demarche, perimetre } })
      } else if (isNotNullNorUndefined(props.demarcheIdOrSlug)) {
        const demarche = await props.apiClient.getDemarcheByIdOrSlug(props.demarcheIdOrSlug)
        const perimetre = await props.apiClient.getPerimetreInfosByDemarcheId(demarche.demarche_id)
        setAsyncData({
          status: 'LOADED',
          value: {
            etape: {
              id: null,
              contenu: {},
              date: null,
              typeId: null,
              statutId: null,
              substances: [],
              titulaires: [],
              amodiataires: [],
              geojson4326Perimetre: null,
              geojson4326Points: null,
              geojsonOriginePerimetre: null,
              geojsonOriginePoints: null,
              geojsonOrigineGeoSystemeId: null,
              geojson4326Forages: null,
              geojsonOrigineForages: null,
              surface: null,
              notes: null,
              duree: null,
              dateDebut: null,
              dateFin: null,
              heritageContenu: null,
              heritageProps: null
            },
            demarche,
            perimetre,
          },
        })
      }
    } catch (e: any) {
      console.error('error', e)
      setAsyncData({ status: 'ERROR', message: e.message ?? "Une erreur s'est produite" })
    }
  })

  return () => (
    <div class="dsfr">
      <LoadingElement
        data={asyncData.value}
        renderItem={({ etape, demarche, perimetre }) => (
          <>
            <div>
              <DsfrLink to={{ name: 'titre', params: { id: demarche.titre_slug } }} disabled={false} title={demarche.titre_nom} icon={null} />
              <span> {'>'} </span>
              <span class="cap-first">
                {' '}
                {DemarchesTypes[demarche.demarche_type_id].nom} {demarche.demarche_description}{' '}
              </span>
            </div>

            <h1>{etape.typeId !== null ? `Étapes - ${capitalize(EtapesTypes[etape.typeId].nom)}` : 'Création d’une étape'}</h1>

            {helpVisible(props.user, demarche.titre_type_id, etape.typeId) ? (
              <Alert
                small={true}
                title={
                  <span>
                    Besoin d’aide pour déposer votre demande ?{' '}
                    <DsfrLink
                      disabled={false}
                      icon={null}
                      target="_blank"
                      href="https://camino.gitbook.io/guide-dutilisation/a-propos/contact"
                      rel="noopener noreferrer"
                      label="Page contact"
                      title="Page contact - site externe"
                    >
                      Contactez-nous
                    </DsfrLink>
                  </span>
                }
                type="info"
              />
            ) : null}

            <EtapeEditForm
              initTab={props.initTab}
              etape={etape}
              demarcheId={demarche.demarche_id}
              demarcheTypeId={demarche.demarche_type_id}
              titreSlug={demarche.titre_slug}
              titreTypeId={demarche.titre_type_id}
              user={props.user}
              entreprises={props.entreprises}
              apiClient={props.apiClient}
              perimetre={perimetre}
              goToDemarche={props.goToDemarche}
            />
          </>
        )}
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureEtapeEdition.props = ['etapeIdOrSlug', 'demarcheIdOrSlug', 'user', 'entreprises', 'apiClient', 'initTab', 'goToDemarche']
