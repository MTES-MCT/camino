import { DeepReadonly, computed, defineComponent, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiClient, apiClient } from '../api/api-client'
import { DemarcheId, DemarcheIdOrSlug, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Alert } from './_ui/alert'
import { ETAPE_IS_NOT_BROUILLON, EtapeIdOrSlug, etapeIdOrSlugValidator } from 'camino-common/src/etape'
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
import { CaminoAccessError } from './error'

export const EtapeEdition = defineComponent(() => {
  const router = useRouter()
  const route = useRoute<'etapeEdition'>()
  const user = inject(userKey)
  const entreprises = inject(entreprisesKey, ref([]))

  const demarcheIdOrSlug = computed<DemarcheIdOrSlug | null>(() => {
    return demarcheIdOrSlugValidator.nullable().parse(route.query['demarche-id'] ?? null)
  })
  const etapeIdOrSlug = computed<EtapeIdOrSlug | null>(() => {
    return etapeIdOrSlugValidator.nullable().parse(route.params.id ?? null)
  })

  const goToDemarche = (demarcheId: DemarcheId) => {
    router.push({ name: 'demarche', params: { demarcheId } })
  }

  return () => (
    <>
      {isNotNullNorUndefined(user) && (isNotNullNorUndefined(demarcheIdOrSlug.value) || isNotNullNorUndefined(etapeIdOrSlug.value)) ? (
        <PureEtapeEdition etapeIdOrSlug={etapeIdOrSlug.value} demarcheIdOrSlug={demarcheIdOrSlug.value} user={user} entreprises={entreprises.value} apiClient={apiClient} goToDemarche={goToDemarche} />
      ) : (
        <CaminoAccessError user={user} />
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
    | 'getEtapeAvisByEtapeId'
  >
}

const helpVisible = (user: User, titreTypeId: TitreTypeId, etapeTypeId: EtapeTypeId | null): boolean => {
  return !(isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && ['axm', 'arm'].includes(titreTypeId) && etapeTypeId === 'mfr'
}

export const PureEtapeEdition = defineComponent<Props>(props => {
  const [asyncData, setAsyncData] = useState<AsyncData<DeepReadonly<{ etape: EtapeEditFormProps['etape']; demarche: GetDemarcheByIdOrSlugValidator; perimetre: PerimetreInformations }>>>({
    status: 'LOADING',
  })

  onMounted(async () => {
    try {
      if (isNotNullNorUndefined(props.etapeIdOrSlug)) {
        const { etape, demarche } = await props.apiClient.getEtape(props.etapeIdOrSlug)

        const perimetre = await props.apiClient.getPerimetreInfosByEtapeId(etape.id)
        setAsyncData({ status: 'LOADED', value: { etape, demarche, perimetre } })
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
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              notes: null,
              substances: { value: [], heritee: true, etapeHeritee: null },
              titulaires: { value: [], heritee: true, etapeHeritee: null },
              amodiataires: { value: [], heritee: true, etapeHeritee: null },
              perimetre: { value: null, heritee: true, etapeHeritee: null },
              duree: { value: null, heritee: true, etapeHeritee: null },
              dateDebut: { value: null, heritee: true, etapeHeritee: null },
              dateFin: { value: null, heritee: true, etapeHeritee: null },
              slug: null,
              titreDemarcheId: demarche.demarche_id,
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

  const octroiNom = computed(() => {
    let nom = ''
    if (asyncData.value.status === 'LOADED') {
      const { demarche } = asyncData.value.value
      nom = capitalize(DemarchesTypes[demarche.demarche_type_id].nom)
      if (isNotNullNorUndefinedNorEmpty(demarche.demarche_description)) {
        nom += ` ${demarche.demarche_description}`
      }
    }
    return nom
  })
  return () => (
    <div>
      <LoadingElement
        data={asyncData.value}
        renderItem={({ etape, demarche, perimetre }) => (
          <>
            <div>
              <DsfrLink to={{ name: 'titre', params: { id: demarche.titre_slug } }} disabled={false} title={demarche.titre_nom} icon={null} />
              <span> {'>'} </span>

              <DsfrLink to={{ name: 'demarche', params: { demarcheId: demarche.demarche_slug } }} disabled={false} title={octroiNom.value} icon={null} />
            </div>

            <h1 class="fr-mt-5w">{etape.typeId !== null ? `Étape - ${capitalize(EtapesTypes[etape.typeId].nom)}` : 'Création d’une étape'}</h1>

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
