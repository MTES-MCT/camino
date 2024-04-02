import { computed, defineComponent, onMounted, ref } from "vue"

import { TypeEdit } from './type-edit'
import { Bloc } from './bloc'
import { DateEdit } from './date-edit'
import { FondamentalesEdit } from './fondamentales-edit'
import { PerimetreEdit } from './perimetre-edit'
import SectionsEdit from './sections-edit.vue'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { ApiClient, apiClient } from '../../api/api-client'
import { Section, getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { EtapeType, EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { User, isAdministrationAdmin, isAdministrationEditeur, isSuper } from 'camino-common/src/roles'
import { hasEtapeAvisDocuments } from 'camino-common/src/permissions/titres-etapes'
import { Etape, EtapeDocument } from "camino-common/src/etape"
import { DemarcheTypeId } from "camino-common/src/static/demarchesTypes"
import { TitreTypeId } from "camino-common/src/static/titresTypes"
import { TitreSlug } from "camino-common/src/validators/titres"
import { SDOMZoneId } from "camino-common/src/static/sdom"
import { DeepReadonly, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from "camino-common/src/typescript-tools"
import { Entreprise, EntrepriseDocumentId } from "camino-common/src/entreprise"
import { AsyncData } from "../../api/client-rest"
import { CaminoDate } from "camino-common/src/date"
import { EtapeStatutId } from "camino-common/src/static/etapesStatuts"

type Props =   {
  etape: Etape,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  titreSlug: TitreSlug,
  user: User,
  etapeIsDemandeEnConstruction: boolean
  sdomZoneIds: SDOMZoneId[],
  entreprises: Entreprise[],
  apiClient: Pick<ApiClient, 'getEntrepriseDocuments'>,
  completeUpdate: (etape: Etape, complete: boolean) => void,
  alertesUpdate: () => void
}


export const EtapeEditForm = defineComponent<Props>((props) => {

  onMounted(() => {
    props.completeUpdate(props.etape, complete.value)
  })

  const heritageData = ref<AsyncData<unknown>>({status: 'LOADING'})
  const fondamentalesComplete = ref<boolean>( false)
      const perimetreComplete = ref<boolean>( false)
      const sectionsComplete = ref<boolean>( false)
      const documentsComplete = ref<boolean>( false)
      const entrepriseDocumentsComplete = ref<boolean>( false)
      const decisionsAnnexesComplete = ref<boolean>( false)

  const tde = computed<{titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId | null}>(() => {
    return {
      titreTypeId: props.titreTypeId,
      demarcheTypeId: props.demarcheTypeId,
      etapeTypeId: props.etape.typeId ?? null,
    }
  })

  const titulairesAndAmodiataires = computed<Entreprise[]>(() => {
    const titulaireIds = props.etape.titulaires.map(({ id }) => id)
    const amodiatairesIds = props.etape.amodiataires.map(({ id }) => id)

    return props.entreprises.filter(({ id }) => titulaireIds.includes(id) || amodiatairesIds.includes(id))
  })


  const etapeType = computed<EtapeType | null> (() => {
    if( isNotNullNorUndefined(props.etape.typeId)){
      return EtapesTypes[props.etape.typeId]
    }
    return null
  })


  const typeComplete = computed<boolean>(() => {
    if (!stepType.value) {
      return true
    }

    if (isNullOrUndefined(props.etape.date) || isNotNullNorUndefined(props.etape.typeId)) {
      return false
    }

    if (userIsAdmin.value && props.etapeIsDemandeEnConstruction) {
      return true
    }

    return isNotNullNorUndefined( props.etape.statutId)
  })

  const complete = computed<boolean>(() => {
    return (
      typeComplete.value &&
      stepFondamentalesComplete.value &&
      stepPerimetreComplete.value &&
      stepSectionsComplete.value &&
      stepDocumentsComplete.value &&
      stepEntrepriseDocumentsComplete.value &&
      stepDecisionsAnnexesComplete.value
    )
  })

  const stepFondamentalesComplete = computed<boolean>(() => {
    return !stepFondamentales.value || fondamentalesComplete.value
  })

  const stepPerimetreComplete = computed<boolean>(() => {
    return !stepFondamentales.value || perimetreComplete.value
  })

  const stepSectionsComplete = computed<boolean>(() => {
    return !stepSections.value || sectionsComplete.value
  })

  const stepDocumentsComplete = computed<boolean>(() => {
    return !stepDocuments.value || documentsComplete.value
  })

  const stepEntrepriseDocumentsComplete = computed<boolean>(() => {
    return !stepEntrepriseDocuments.value || entrepriseDocumentsComplete.value
  })

  const stepDecisionsAnnexesComplete = computed<boolean>(() => {
    return !stepDecisionsAnnexes.value || decisionsAnnexesComplete.value
  })

  const steps = computed<string[]>(() => {
    const steps = []

    if (userIsAdmin.value) {
      steps.push(        'type')
    }

    if (heritageData.value.status === 'LOADED' && isNotNullNorUndefined(etapeType.value)) {
      if (etapeType.value.fondamentale) {
        steps.push(         'fondamentales')
        steps.push(          'points')
      }
      if (isNotNullNorUndefinedNorEmpty([...sections.value])) {
        steps.push('sections')
      }
      const hasDocuments = getDocuments(props.titreTypeId, props.demarcheTypeId, etapeType.value.id).length > 0

      if (hasDocuments) {
        steps.push(          'documents')
      }

    const hasEntrepriseDocuments =  getEntrepriseDocuments(props.titreTypeId, props.demarcheTypeId, etapeType.value.id).length > 0

    if (hasEntrepriseDocuments) {
      steps.push('entrepriseDocuments')
    }

    if (hasEtapeAvisDocuments(props.titreTypeId, props.demarcheTypeId, etapeType.value.id, props.etape.statutId)) {
      steps.push('decisionsAnnexes',)
    }

    }



    return steps
  })

  const stepType = computed<boolean>(() => {
    return steps.value.some(s => s === 'type')
  })

  const stepFondamentales = computed<boolean>(() => {
    return steps.value.some(s => s === 'fondamentales')
  })

  const stepPoints = computed<boolean>(() => {
    return steps.value.some(s => s === 'points')
  })

  const stepSections = computed<boolean>(() => {
    return steps.value.some(s => s === 'sections')
  })

  const stepDocuments = computed<boolean>(() => {
    return steps.value.some(s => s === 'documents')
  })

  const stepEntrepriseDocuments = computed<boolean>(() => {
    return steps.value.some(s => s === 'entrepriseDocuments')
  })

  const stepDecisionsAnnexes = computed<boolean>(() => {
    return steps.value.some(s => s === 'decisionsAnnexes')
  })

  const userIsAdmin = computed<boolean>(() => {
    return isSuper(props.user) || isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user)
  })

  const sections = computed<DeepReadonly<Section[]>>(() => {

    if( isNullOrUndefined(props.etape.typeId)){
      return []
    }

    try {
      return getSections(props.titreTypeId, props.demarcheTypeId, props.etape.typeId)
    } catch (e) {
      return []
    }
  })

  const isHelpVisible = computed<boolean>(() => {
    return etapeType.value?.id === 'mfr' && ['arm', 'axm'].includes(props.titreTypeId)
  })

  const documentsCompleteUpdate = (etapeDocuments: EtapeDocument[], newDocumentsComplete: boolean) => {
    documentsComplete.value = newDocumentsComplete
    props.completeUpdate({...props.etape, etapeDocuments}, complete.value)
  },

  const entrepriseDocumentsCompleteUpdate = (entrepriseDocumentIds: EntrepriseDocumentId[], newEntrepriseDocumentsComplete: boolean) => {
    entrepriseDocumentsComplete.value = newEntrepriseDocumentsComplete
    props.completeUpdate({...props.etape, entrepriseDocumentIds}, complete.value)
  },

  const onDateChanged = (date: CaminoDate) => {
    props.completeUpdate({...props.etape, date}, complete.value)
  }


  const onEtapeChange =  (statutId: EtapeStatutId | null, typeId: EtapeTypeId | null) => {
    //FIXME
        //   if (this.etape.typeId !== etapeTypeId) {
    //     await this.$store.dispatch('titreEtapeEdition/heritageGet', {
    //       ...this.tde,
    //       etapeTypeId,
    //     })
    //   }
    //   // TODO 2023-01-13 Il faut que les données soient mises après l'appel au store, sinon l'étape est réinitialisée.
    //   // Pour que ça soit propre, il faut arrêter de bouger le même objet pour diverses raisons, et maintenir une étape minimaliste à part
    //   this.etape.statutId = etapeStatutId
    //   this.etape.typeId = etapeTypeId
    //   this.$emit('type-complete-update', this.typeComplete)
    //   this.$emit('update:etape', this.etape)
  }



  // async sectionsUpdate() {
  //   // FIXME à tester si on change la mécanisation
  // },




return () =>
  <div class="mb">
    { stepType.value ? <Bloc step={{name: 'Type', help: null}} complete={typeComplete.value}>
      { userIsAdmin.value ? <DateEdit date={props.etape.date} onDateChanged={onDateChanged} /> : null}

      <TypeEdit etape={etape} apiClient={apiClient} onEtapeChange={onEtapeTypeChange} />
    </Bloc>: null}

    { stepFondamentales.value ? <Bloc step={{name: 'Propriétés', help: null}} complete={stepFondamentalesComplete.value}>
      <FondamentalesEdit
        etape={props.etape}
        demarcheTypeId={props.demarcheTypeId}
        titreTypeId={props.titreTypeId}
        user={props.user}
        entreprises={props.entreprises}
        completeUpdate="fondamentalesCompleteUpdate"
      />
    </Bloc> : null }

    { stepPoints.value ? <Bloc step={{name: 'Périmètre', help: null}} complete={stepPerimetreComplete.value}>
      <PerimetreEdit
        :etape="etape"
        :titreTypeId="titreTypeId"
        :titreSlug="titreSlug"
        :apiClient="apiClient"
        :onEtapeChange="onEtapePerimetreChange"
        :onPointsChange="onEtapePointsChange"
        :onForagesChange="onEtapeForagesChange"
        :completeUpdate="perimetreCompleteUpdate"
      />
    </Bloc> : null }

    { stepSections.value ? <Bloc step={{name: 'Propriétés spécifiques', help: isHelpVisible.value ? 'Ce bloc permet de savoir si la prospection est mécanisée ou non et s’il y a des franchissements de cours d’eau (si oui, combien ?)' : null}} complete={stepSectionsComplete.value}>
      <SectionsEdit :etape="etape" :sections="sections" @update:etape="newValue => $emit('update:etape', newValue)" @complete-update="sectionsCompleteUpdate" @sections-update="sectionsUpdate" />
    </Bloc> : null }

    { stepDocuments.value ? <Bloc step={{name: 'Liste des documents', help: null}} complete={stepDocumentsComplete.value}>
      <div class="dsfr">
        <EtapeDocumentsEdit
          :apiClient="apiClient"
          :tde="tde"
          :etapeId="etape.id"
          :completeUpdate="documentsCompleteUpdate"
          :sdomZoneIds="sdomZoneIds"
          :user="user"
          :contenu="etape.contenu"
          :etapeStatutId="etape.statutId"
        />
      </div>
    </Bloc> : null }

    { stepEntrepriseDocuments.value ? <Bloc step={{name: 'Documents d’entreprise', help: isHelpVisible.value ? "Les documents d’entreprise sont des documents propres à l'entreprise, et pourront être réutilisés pour la création d'un autre dossier et mis à jour si nécessaire. Ces documents d’entreprise sont consultables dans la fiche entreprise de votre société. Cette section permet de protéger et de centraliser les informations d'ordre privé relatives à la société et à son personnel." : null}} complete={stepEntrepriseDocumentsComplete.value}>
      <EntrepriseDocumentsEdit :entreprises="titulairesAndAmodiataires" :apiClient="apiClient" :tde="tde" :etapeId="etape.id" :completeUpdate="entrepriseDocumentsCompleteUpdate" />
    </Bloc> : null }

    { stepDecisionsAnnexes.value ? <Bloc step={{name: 'Décisions annexes', help: null}} complete={stepDecisionsAnnexesComplete.value}>
      <div>FIXME</div>
    </Bloc>

    <div class="dsfr">
      <div class="fr-input-group">
        <label class="fr-label" for="notes">Notes</label>
        <textarea id="notes" v-model="etape.notes" class="fr-input" name="notes"></textarea>
      </div>
    </div>
  </div>



    // onEtapePerimetreChange(perimetreInfos) {
    //   // TODO 2023-01-13 Il faut que les données soient mises après l'appel au store, sinon l'étape est réinitialisée.
    //   // Pour que ça soit propre, il faut arrêter de bouger le même objet pour diverses raisons, et maintenir une étape minimaliste à part
    //   this.etape.geojson4326Perimetre = perimetreInfos.geojson4326_perimetre
    //   this.etape.geojson4326Points = perimetreInfos.geojson4326_points
    //   this.etape.geojsonOriginePerimetre = perimetreInfos.geojson_origine_perimetre
    //   this.etape.geojsonOriginePoints = perimetreInfos.geojson_origine_points
    //   this.etape.geojsonOrigineGeoSystemeId = perimetreInfos.geojson_origine_geo_systeme_id

    //   this.etape.geojson4326Forages = perimetreInfos.geojson4326_forages
    //   this.etape.geojsonOrigineForages = perimetreInfos.geojson_origine_forages

    //   this.$emit('alertes-update', { superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
    //   this.$emit('update:etape', this.etape)
    // },
    // onEtapePointsChange(geojson4326Points, geojsonOriginePoints) {
    //   this.etape.geojson4326Points = geojson4326Points
    //   this.etape.geojsonOriginePoints = geojsonOriginePoints
    //   this.$emit('update:etape', this.etape)
    // },
    // onEtapeForagesChange(geojson4326Forages, geojsonOrigineForages) {
    //   this.etape.geojson4326Forages = geojson4326Forages
    //   this.etape.geojsonOrigineForages = geojsonOrigineForages
    //   this.$emit('update:etape', this.etape)
    // },


})
