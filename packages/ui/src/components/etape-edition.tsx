import { DeepReadonly, computed, defineComponent, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient, apiClient } from '../api/api-client'
import { DemarcheId, DemarcheIdOrSlug, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from './_ui/alert'
import { Etape, EtapeIdOrSlug, etapeIdOrSlugValidator } from 'camino-common/src/etape'
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
import { EtapeEditForm } from './etape/etape-edit-form'
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
    | 'getEtapeHeritage'
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
  >
}

const helpVisible = (user: User, titreTypeId: TitreTypeId, etapeTypeId: EtapeTypeId | null): boolean => {
  return !(isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && ['axm', 'arm'].includes(titreTypeId) && etapeTypeId === 'mfr'
}

export const PureEtapeEdition = defineComponent<Props>(props => {
  const [asyncData, setAsyncData] = useState<AsyncData<DeepReadonly<{ etape: Etape; demarche: GetDemarcheByIdOrSlugValidator; perimetre: PerimetreInformations }>>>({ status: 'LOADING' })

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

// import { dateFormat } from '@/utils'
// import { InputDate } from './_ui/input-date'
// import { getCurrent } from 'camino-common/src/date'
// import { PureFormSaveBtn } from './etape/pure-form-save-btn'
// import { DeposeEtapePopup } from './demarche/depose-etape-popup'
// import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
// import { SDOMZoneIds, SDOMZones } from 'camino-common/src/static/sdom'
// import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
// import { TitresStatutIds, TitresStatuts } from 'camino-common/src/static/titresStatuts'
// import { isAdministrationAdmin, isAdministrationEditeur, isSuper } from 'camino-common/src/roles'
// import { documentTypeIdsBySdomZonesGet } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sdom'
// import { apiClient } from '../api/api-client'
// import { userKey, entreprisesKey } from '@/moi'

// // TODO 2023-06-14 Revoir comment est gérer le droit de déposer l’étape
// export default {
//   components: { Edit, InputDate, PureFormSaveBtn, DeposeEtapePopup },

//   beforeRouteLeave(_, __, next) {
//     if (this.isFormDirty && !confirm(this.promptMsg)) {
//       next(false)
//     } else {
//       next()
//     }
//   },

//   data() {
//     return {
//       complete: false,
//       isFormDirty: false,
//       typeComplete: false,
//       promptMsg: 'Quitter le formulaire sans enregistrer les changements ?',
//       newDate: getCurrent(),
//       sdomZoneIds: [],
//       superposition_alertes: [],
//     }
//   },

//   computed: {

//     etapeIsDemandeEnConstruction() {
//       return this.etapeType?.id === 'mfr' && this.editedEtape?.statutId === 'aco'
//     },

//     isPopupOpen() {
//       //FIXME
//       return false
//     },

//     isFormComplete() {
//       return (this.etapeIsDemandeEnConstruction && this.typeComplete) || this.complete
//     },

//   },
//   async created() {
//     await this.init()

//     document.addEventListener('keyup', this.keyUp)
//     window.addEventListener('beforeunload', this.beforeWindowUnload)
//   },

//   beforeUnmount() {
//     document.removeEventListener('keyup', this.keyUp)
//     window.removeEventListener('beforeunload', this.beforeWindowUnload)
//   },

//   methods: {

//     beforeWindowUnload(e) {
//       if (!this.isFormDirty) return true
//       e.returnValue = this.promptMsg
//       return this.promptMsg
//     },

//     async reroute(titreEtapeId) {
//       // TODO 2023-09-21 il faut automatiquement déplier l'étape et aller sur l'ancre
//       await this.$router.push({
//         name: 'titre',
//         params: { id: this.titre.id },
//         query: { demarcheSlug: this.demarche.slug },
//         hash: `#${titreEtapeId}`,
//       })
//     },

//     async save(reroute = true) {
//       this.isFormDirty = false

//       if (this.isFormComplete) {
//         const titreEtapeId = await this.$store.dispatch('titreEtapeEdition/upsert', {
//           etape: this.editedEtape,
//         })

//         if (titreEtapeId) {
//           if (reroute) {
//             await this.reroute(titreEtapeId)
//           }
//         }
//         return titreEtapeId
//       }

//       return undefined
//     },

//     async depose() {
//       if (this.complete) {
//         const etapeId = await this.save(false)

//         if (etapeId) {
//           //this.$store.commit('popupOpen', {
//           //  component: DeposePopup,
//           //  props: {
//           //    etapeId,
//           //    onDepotDone: async () => {
//           //      await this.reroute(etapeId)
//           //    },
//           //  },
//           //})
//         }
//       }
//     },

//     keyUp(e) {
//       if ((e.which || e.keyCode) === 13 && this.complete && !this.isPopupOpen) {
//         if (this.dateIsVisible && this.newDate) {
//           this.$refs['date-button'].focus()
//           this.dateUpdate()
//         } else if (!this.dateIsVisible && !this.loading && this.isFormComplete) {
//           this.$refs['save-btn'].focusBtn()
//           this.save()
//         }
//       }
//     },

//     editChange() {
//       if (!this.loaded) return
//       this.isFormDirty = true
//     },

//     async dateUpdate() {
//       await this.$store.dispatch('titreEtapeEdition/dateUpdate', {
//         date: this.newDate,
//       })
//     },
//   },
// }
