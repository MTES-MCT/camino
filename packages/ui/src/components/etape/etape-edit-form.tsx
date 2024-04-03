import { DeepReadonly, computed, defineComponent, onMounted, ref, watch } from "vue"

import { TypeEdit } from './type-edit'
import { Bloc } from './bloc'
import { DateEdit } from './date-edit'
import { EtapeFondamentaleEdit, FondamentalesEdit } from './fondamentales-edit'
import { PerimetreEdit } from './perimetre-edit'
import SectionsEdit from './sections-edit.vue'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { ApiClient } from '../../api/api-client'
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
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from "camino-common/src/typescript-tools"
import { Entreprise, EntrepriseDocumentId } from "camino-common/src/entreprise"
import { AsyncData } from "../../api/client-rest"
import { CaminoDate } from "camino-common/src/date"
import { EtapeStatutId } from "camino-common/src/static/etapesStatuts"
import { DemarcheId } from "camino-common/src/demarche"
import { useState } from "@/utils/vue-tsx-utils"

export type Props = {
  etape: DeepReadonly<Etape>,
  demarcheId: DemarcheId,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  titreSlug: TitreSlug,
  user: User,
  etapeIsDemandeEnConstruction: boolean
  sdomZoneIds: SDOMZoneId[],
  entreprises: Entreprise[],
  apiClient: Pick<ApiClient, 'getEntrepriseDocuments' | 'getEtapesTypesEtapesStatuts' | 'getEtapeHeritage'>,
  completeUpdate: (etape: DeepReadonly<Etape>, complete: boolean) => void,
  alertesUpdate: () => void
}


export const EtapeEditForm = defineComponent<Props>((props) => {

  const [etape, setEtape] = useState(props.etape)

  onMounted(async () => {
    props.completeUpdate(etape.value, complete.value)
    await reloadHeritage()
  })

  watch(() => etape.value, () => {
    props.completeUpdate(etape.value, complete.value)
  })

  const reloadHeritage = async () => {
    if (isNotNullNorUndefined(etape.value.date) && isNotNullNorUndefined(etape.value.typeId)) {

    
    try {
      heritageData.value = { status: 'LOADING' }

      
      const value = await props.apiClient.getEtapeHeritage(props.demarcheId, etape.value.date, etape.value.typeId)
      heritageData.value = {status: 'LOADED', value}
    } catch (e: any) {
      console.error('error', e)
      heritageData.value = {
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      }
    }
  }
  }


  const heritageData = ref<AsyncData<unknown>>({ status: 'LOADING' })
  const fondamentalesComplete = ref<boolean>(false)
  const perimetreComplete = ref<boolean>(false)
  const sectionsComplete = ref<boolean>(false)
  const documentsComplete = ref<boolean>(false)
  const entrepriseDocumentsComplete = ref<boolean>(false)
  const decisionsAnnexesComplete = ref<boolean>(false)

  const tde = computed<{ titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId | null }>(() => {
    return {
      titreTypeId: props.titreTypeId,
      demarcheTypeId: props.demarcheTypeId,
      etapeTypeId: etape.value.typeId ?? null,
    }
  })

  

  const fondamentalesCompleteUpdate = (etapeFondamentale: DeepReadonly<EtapeFondamentaleEdit>, complete: boolean) => {
    fondamentalesComplete.value = complete
    console.log('plop')
    setEtape({...etape.value, ...etapeFondamentale})
    // etape.value = {...etape.value, ...etapeFondamentale}
  }

  const titulairesAndAmodiataires = computed<Entreprise[]>(() => {
    const titulaireIds = etape.value.titulaires.map(({ id }) => id)
    const amodiatairesIds = etape.value.amodiataires.map(({ id }) => id)

    return props.entreprises.filter(({ id }) => titulaireIds.includes(id) || amodiatairesIds.includes(id))
  })


  const etapeType = computed<EtapeType | null>(() => {
    if (isNotNullNorUndefined(etape.value.typeId)) {
      return EtapesTypes[etape.value.typeId]
    }
    return null
  })


  const typeComplete = computed<boolean>(() => {
    if (!stepType.value) {
      return true
    }

    if (isNullOrUndefined(etape.value.date) || isNullOrUndefined(etape.value.typeId)) {
      return false
    }

    if (userIsAdmin.value && props.etapeIsDemandeEnConstruction) {
      return true
    }

    return isNotNullNorUndefined(etape.value.statutId)
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
      steps.push('type')
    }

    if (heritageData.value.status === 'LOADED' && isNotNullNorUndefined(etapeType.value)) {
      if (etapeType.value.fondamentale) {
        steps.push('fondamentales')
        steps.push('points')
      }
      if (isNotNullNorUndefinedNorEmpty([...sections.value])) {
        steps.push('sections')
      }
      const hasDocuments = getDocuments(props.titreTypeId, props.demarcheTypeId, etapeType.value.id).length > 0

      if (hasDocuments) {
        steps.push('documents')
      }

      const hasEntrepriseDocuments = getEntrepriseDocuments(props.titreTypeId, props.demarcheTypeId, etapeType.value.id).length > 0

      if (hasEntrepriseDocuments) {
        steps.push('entrepriseDocuments')
      }

      if (hasEtapeAvisDocuments(props.titreTypeId, props.demarcheTypeId, etapeType.value.id, etape.value.statutId)) {
        steps.push('decisionsAnnexes')
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

    if (isNullOrUndefined(etape.value.typeId)) {
      return []
    }

    try {
      return getSections(props.titreTypeId, props.demarcheTypeId, etape.value.typeId)
    } catch (e) {
      return []
    }
  })

  const isHelpVisible = computed<boolean>(() => {
    return etapeType.value?.id === 'mfr' && ['arm', 'axm'].includes(props.titreTypeId)
  })

  const documentsCompleteUpdate = (etapeDocuments: EtapeDocument[], newDocumentsComplete: boolean) => {
    documentsComplete.value = newDocumentsComplete
    props.completeUpdate({ ...etape.value, etapeDocuments }, complete.value)
  }

  const entrepriseDocumentsCompleteUpdate = (entrepriseDocumentIds: EntrepriseDocumentId[], newEntrepriseDocumentsComplete: boolean) => {
    entrepriseDocumentsComplete.value = newEntrepriseDocumentsComplete
    props.completeUpdate({ ...etape.value, entrepriseDocumentIds }, complete.value)
  }

  const onDateChanged = async (date: CaminoDate | null) => {
    if (isNotNullNorUndefined(date)) {
      setEtape({...etape.value, date})
      await reloadHeritage()
    }
  }




  // async sectionsUpdate() {
  //   // FIXME à tester si on change la mécanisation
  // },




  const onEtapeTypeChange = async (etapeStatutId: EtapeStatutId | null, etapeTypeId: EtapeTypeId | null) => {

    const needUpdate: boolean = etapeTypeId !== etape.value.typeId

    if (etapeStatutId !== null && etapeStatutId !== etape.value.statutId) {
      setEtape({...etape.value, statutId: etapeStatutId})
    }
    if (etapeTypeId !== null && etapeTypeId !== etape.value.typeId) {
      setEtape({...etape.value, typeId: etapeTypeId})
    }


    if (needUpdate) {
      await reloadHeritage()
    }

  }
  return () =>
    <div class="mb">
      {stepType.value ? <Bloc step={{ name: 'Type', help: null }} complete={typeComplete.value}>
        {userIsAdmin.value ? <DateEdit date={etape.value.date} onDateChanged={onDateChanged} /> : null}

        <TypeEdit etape={etape.value} demarcheId={props.demarcheId} apiClient={props.apiClient} onEtapeChange={onEtapeTypeChange} />
      </Bloc> : null}

      {stepFondamentales.value ? <Bloc step={{ name: 'Propriétés', help: null }} complete={stepFondamentalesComplete.value}>
        <FondamentalesEdit
          etape={etape.value}
          demarcheTypeId={props.demarcheTypeId}
          titreTypeId={props.titreTypeId}
          user={props.user}
          entreprises={props.entreprises}
          completeUpdate={fondamentalesCompleteUpdate}
        />
      </Bloc> : null}

      {/* { stepPoints.value ? <Bloc step={{name: 'Périmètre', help: null}} complete={stepPerimetreComplete.value}>
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
      </div> */}
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

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeEditForm.props = ['etape', 'demarcheId', 'demarcheTypeId', 'titreTypeId', 'titreSlug', 'user', 'etapeIsDemandeEnConstruction', 'sdomZoneIds', 'entreprises', 'apiClient', 'completeUpdate', 'alertesUpdate',]
