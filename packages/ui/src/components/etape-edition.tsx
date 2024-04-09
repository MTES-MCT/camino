import { DeepReadonly, computed, defineComponent, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiClient, apiClient } from '../api/api-client'
import { DemarcheIdOrSlug, demarcheIdOrSlugValidator } from 'camino-common/src/demarche'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from './_ui/alert'
import { EtapeIdOrSlug, etapeIdOrSlugValidator } from 'camino-common/src/etape'
import { entreprisesKey, userKey } from '../moi'
import { User } from 'camino-common/src/roles'
import { Entreprise } from 'camino-common/src/entreprise'
import { useState } from '../utils/vue-tsx-utils'
import { AsyncData } from '../api/client-rest'
import { GetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { PerimetreInformations } from 'camino-common/src/perimetre'
import { LoadingElement } from './_ui/functional-loader'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { DsfrLink } from './_ui/dsfr-button'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { GraphqlEtape } from './etape/etape-api-client'
import { capitalize } from 'camino-common/src/strings'

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

  return () => (
    <>
      {isNotNullNorUndefined(demarcheIdOrSlug.value) || isNotNullNorUndefined(etapeIdOrSlug.value) ? (
        <PureEtapeEdition etapeIdOrSlug={etapeIdOrSlug.value} demarcheIdOrSlug={demarcheIdOrSlug.value} user={user} entreprises={entreprises.value} apiClient={apiClient} />
      ) : (
        <Alert small={true} title="Erreur lors du chargement, la page est introuvable" type="error" />
      )}
    </>
  )
})

export type Props = {
  etapeIdOrSlug: EtapeIdOrSlug | null
  demarcheIdOrSlug: DemarcheIdOrSlug | null
  user: User
  entreprises: Entreprise[]
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
  >
}

export const PureEtapeEdition = defineComponent<Props>(props => {
  const [etape, setEtape] = useState<AsyncData<DeepReadonly<GraphqlEtape>>>({ status: 'LOADING' })
  const [demarche, setDemarche] = useState<AsyncData<DeepReadonly<GetDemarcheByIdOrSlugValidator>>>({ status: 'LOADING' })

  const [_perimetreInfos, setPerimetreInfos] = useState<DeepReadonly<PerimetreInformations | null>>(null)

  onMounted(async () => {
    try {
      let perimetreInfos: PerimetreInformations | null = null

      // FIXME là c’est le bordel, j’ai l’impression qu’il faut qu’un seul objet qui stocke tout
      if (isNotNullNorUndefined(props.etapeIdOrSlug)) {
        const etape = await props.apiClient.getEtape(props.etapeIdOrSlug)
        setEtape({ status: 'LOADED', value: etape })
        setDemarche({
          status: 'LOADED',
          value: {
            demarche_description: etape.demarche.description,
            demarche_id: etape.titreDemarcheId,
            demarche_slug: etape.demarche.slug,
            demarche_type_id: etape.demarche.typeId,
            titre_id: etape.demarche.titre.id,
            titre_nom: etape.demarche.titre.nom,
            titre_slug: etape.demarche.titre.slug,
            titre_type_id: etape.demarche.titre.typeId,
          },
        })

        perimetreInfos = await props.apiClient.getPerimetreInfosByEtapeId(etape.id)
      } else if (isNotNullNorUndefined(props.demarcheIdOrSlug)) {
        const demarche = await props.apiClient.getDemarcheByIdOrSlug(props.demarcheIdOrSlug)
        setDemarche({ status: 'LOADED', value: demarche })

        perimetreInfos = await props.apiClient.getPerimetreInfosByDemarcheId(demarche.demarche_id)
      }

      setPerimetreInfos(perimetreInfos)
    } catch (e: any) {
      console.error('error', e)
      setDemarche({ status: 'ERROR', message: e.message ?? "Une erreur s'est produite" })
    }
  })

  const helpVisible = computed<boolean>(() => {
    // FIXME
    // if( demarche.value.status === 'LOADED' ) {
    //   return !(isSuper(props.user) || isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user)) && ['axm', 'arm'].includes(demarche.value.value.titre_type_id) && this.etapeType?.id === 'mfr'
    // }
    return false
  })

  return () => (
    <div class="dsfr">
      <LoadingElement
        data={demarche.value}
        renderItem={demarche => (
          <>
            <div>
              <DsfrLink to={{ name: 'titre', params: { id: demarche.titre_slug } }} disabled={false} title={demarche.titre_nom} icon={null} />
              <span> {'>'} </span>
              <span class="cap-first">
                {' '}
                {DemarchesTypes[demarche.demarche_type_id].nom} {demarche.demarche_description}{' '}
              </span>
            </div>

            <h1>{etape.value.status === 'LOADED' ? `Étapes - ${capitalize(EtapesTypes[etape.value.value.typeId].nom)}` : 'Création d’une étape'}</h1>

            {helpVisible.value ? (
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
                    </DsfrLink>{' '}
                  </span>
                }
                type="info"
              />
            ) : null}
          </>
        )}
      />
      {
        //     <div v-if="dateIsVisible" class="tablet-blobs">
        //       <div class="tablet-blob-1-3 tablet-pt-s pb-s">
        //         <h5>Date</h5>
        //       </div>
        //       <div class="tablet-blob-2-3">
        //         <InputDate :initialValue="newDate" :dateChanged="dateChanged" class="mb" />
        //       </div>
        //     </div>
        //     <Edit
        //       v-else
        //       :etape="editedEtape"
        //       :demarcheTypeId="demarcheType.id"
        //       :user="user"
        //       :etapeIsDemandeEnConstruction="etapeIsDemandeEnConstruction"
        //       :titreTypeId="titre.typeId"
        //       :titreSlug="titre.slug"
        //       :etapeType="etapeType"
        //       :sdomZoneIds="sdomZoneIds"
        //       @complete-update="completeUpdate"
        //       @type-complete-update="typeCompleteUpdate"
        //       @change="editChange"
        //       @alertes-update="alertesUpdate"
        //     />
        //     <div v-if="loading" class="tablet-blobs">
        //       <div class="tablet-blob-1-3" />
        //       <div class="tablet-blob-2-3">
        //         <div class="p-s bold mb">Enregistrement en cours…</div>
        //       </div>
        //     </div>
        //     <div v-else-if="dateIsVisible" class="tablet-blobs mb">
        //       <div class="tablet-blob-1-3" />
        //       <div class="tablet-blob-2-3">
        //         <button ref="date-button" class="btn btn-primary" :disabled="!newDate" :class="{ disabled: !newDate }" @click="dateUpdate">Valider</button>
        //       </div>
        //     </div>
        //     <div v-else ref="save-btn-container" class="tablet-blobs pb-m pt-m bg-bg b-0 sticky" style="z-index: 100000">
        //       <div class="tablet-blob-1-3" />
        //       <PureFormSaveBtn ref="save-btn" :alertes="alertes" :canSave="isFormComplete" :canDepose="complete" :showDepose="etapeIsDemandeEnConstruction" save="save" depose="depose" />
        //     </div>
        //   </div>
      }
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
PureEtapeEdition.props = ['etapeIdOrSlug', 'demarcheIdOrSlug', 'user', 'entreprises', 'apiClient']

// <script>
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
//     loaded() {
//       return this.$store.state.titreEtapeEdition.loaded
//     },

//     etapeId() {
//       return this.$route.params.id
//     },

//     editedEtape() {
//       return this.$store.state.titreEtapeEdition.element
//     },

//     etapeType() {
//       return this.$store.getters['titreEtapeEdition/etapeType']
//     },

//     demarche() {
//       return this.$store.state.titreEtapeEdition.metas.demarche
//     },

//     demarcheDescription() {
//       return this.demarche?.description ? `(${this.demarche.description})` : ''
//     },

//     alertes() {
//       const alertes = []
//       if (this.superposition_alertes.length > 0) {
//         alertes.push(
//           ...this.superposition_alertes.map(t => ({
//             message: `Le titre ${t.nom} au statut « ${isNotNullNorUndefined(t.titre_statut_id) ? TitresStatuts[t.titre_statut_id].nom : ''} » est superposé à ce titre`,
//             url: `/titres/${t.slug}`,
//           }))
//         )
//       }

//       // si c’est une demande d’AXM, on doit afficher une alerte si on est en zone 0 ou 1 du Sdom
//       if (['mfr', 'mcr'].includes(this.etapeType?.id) && this.titre.typeId === 'axm') {
//         const zoneId = this.sdomZoneIds.find(id => [SDOMZoneIds.Zone0, SDOMZoneIds.Zone0Potentielle, SDOMZoneIds.Zone1].includes(id))
//         if (zoneId) {
//           alertes.push({ message: `Le périmètre renseigné est dans une zone du Sdom interdite à l’exploitation minière : ${SDOMZones[zoneId].nom}` })
//         }
//       }

//       return alertes
//     },

//     demarcheType() {
//       return DemarchesTypes[this.demarche.typeId]
//     },

//     titre() {
//       return this.demarche.titre
//     },

//     dateIsVisible() {
//       return !this.editedEtape?.date
//     },

//     loading() {
//       return this.$store.state.loading.includes('titreEtapeUpdate') || this.$store.state.loading.includes('titreEtapeMetasGet') || this.$store.state.loading.includes('titreEtapeGet')
//     },

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

//   unmounted() {
//     this.$store.commit('titreEtapeEdition/reset')
//   },

//   methods: {
//     dateChanged(date) {
//       this.newDate = date
//     },
//     async init() {
//       const titreDemarcheId = this.$route.query['demarche-id']
//       await this.$store.dispatch('titreEtapeEdition/init', {
//         titreDemarcheId,
//         id: this.etapeId,
//         entreprises: this.entreprises,
//         date: this.newDate,
//       })

//       let perimetreInfos = null
//       if (isNotNullNorUndefined(this.etapeId)) {
//         perimetreInfos = await apiClient.getPerimetreInfosByEtapeId(this.etapeId)
//       } else {
//         perimetreInfos = await apiClient.getPerimetreInfosByDemarcheId(titreDemarcheId)
//       }
//       this.alertesUpdate(perimetreInfos)
//     },

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

//     completeUpdate(complete) {
//       this.complete = complete
//     },

//     typeCompleteUpdate(complete) {
//       this.typeComplete = complete
//     },

//     alertesUpdate(infos) {
//       this.superposition_alertes = infos.superposition_alertes
//       this.sdomZoneIds = infos.sdomZoneIds
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

//     dateFormat(date) {
//       return dateFormat(date)
//     },
//   },
// }
// </script>
