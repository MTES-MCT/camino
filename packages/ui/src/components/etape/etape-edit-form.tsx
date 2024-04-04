import { DeepReadonly, computed, defineComponent, onMounted, ref, watch } from "vue"

import { TypeEdit } from './type-edit'
import { Bloc } from './bloc'
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
import { Etape, EtapeDocument, FullEtapeHeritage } from "camino-common/src/etape"
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
import { DateTypeEdit, EtapeDateTypeEdit } from "./date-type-edit"
import { FeatureCollectionForages, FeatureCollectionPoints, GeojsonInformations } from "camino-common/src/perimetre"
import { LoadingElement } from "../_ui/functional-loader"

export type Props = {
  etape: DeepReadonly<Etape>,
  demarcheId: DemarcheId,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  titreSlug: TitreSlug,
  user: User,
  sdomZoneIds: SDOMZoneId[],
  entreprises: Entreprise[],
  initTab?: 'points' | 'carte',
  apiClient: Pick<ApiClient, 'getEntrepriseDocuments' | 'getEtapesTypesEtapesStatuts' | 'getEtapeHeritage' | "uploadTempDocument" | "geojsonImport" | "getGeojsonByGeoSystemeId" | "geojsonPointsImport" | "geojsonForagesImport">,
  completeUpdate: (etape: DeepReadonly<Etape>, complete: boolean) => void,
  alertesUpdate: (alertes: Pick<GeojsonInformations, 'superposition_alertes' | 'sdomZoneIds'>) => void
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

      //FIXME est-ce qu’on devrait faire l’appel tout le temps ? Ou est-ce qu’on devrait arrêter de récupérer l’héritage dans l’étape quand on est en cours de modification ?

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

  const heritageData = ref<AsyncData<DeepReadonly<Pick<FullEtapeHeritage, 'heritageProps' | 'heritageContenu'>>>>({ status: 'LOADING' })
  const fondamentalesComplete = ref<boolean>(false)
  const dateTypeComplete = ref<boolean>(false)
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
    setEtape({...etape.value, ...etapeFondamentale})
  }

  const perimetreCompleteUpdate = (complete: boolean) => {
    perimetreComplete.value = complete
  }

  const dateTypeCompleteUpdate = async (etapeDateType: EtapeDateTypeEdit, complete: boolean) => {
    dateTypeComplete.value = complete
    if(isNotNullNorUndefined(etapeDateType.typeId) && isNotNullNorUndefined(etapeDateType.statutId)){
      setEtape({...etape.value, date: etapeDateType.date, typeId: etapeDateType.typeId, statutId: etapeDateType.statutId})
      await reloadHeritage()
    }
  }

  const titulairesAndAmodiataires = computed<Entreprise[]>(() => {
    const titulaireIds = etape.value.titulaires.map(({ id }) => id)
    const amodiatairesIds = etape.value.amodiataires.map(({ id }) => id)

    return props.entreprises.filter(({ id }) => titulaireIds.includes(id) || amodiatairesIds.includes(id))
  })


  const complete = computed<boolean>(() => {
    return (
      (!stepDateTypeIsVisible.value || dateTypeComplete.value) &&
      (!stepFondamentalesIsVisible.value || fondamentalesComplete.value) &&
      (!stepPerimetreIsVisible.value || perimetreComplete.value) &&
      (!stepSectionsIsVisible.value || sectionsComplete.value) &&
      (!stepDocumentsIsVisible.value || documentsComplete.value) &&
      (!stepEntrepriseDocumentsIsVisible.value || entrepriseDocumentsComplete.value) &&
      (!stepDecisionsAnnexesIsVisible.value || decisionsAnnexesComplete.value)
    )
  })

  const stepDateTypeIsVisible = computed<boolean>(() => {
    return isSuper(props.user) || isAdministrationAdmin(props.user) || isAdministrationEditeur(props.user)
  })

  const stepFondamentalesIsVisible = computed<boolean>(() => {
    return isNotNullNorUndefined(etape.value.typeId) ?  EtapesTypes[etape.value.typeId].fondamentale : false
  })

  const stepPerimetreIsVisible = computed<boolean>(() => {
    return isNotNullNorUndefined(etape.value.typeId) ?  EtapesTypes[etape.value.typeId].fondamentale : false
  })

  const stepSectionsIsVisible = computed<boolean>(() => {
    return isNotNullNorUndefinedNorEmpty([...sections.value])
  })

  const stepDocumentsIsVisible = computed<boolean>(() => {
    return isNotNullNorUndefined(etape.value.typeId) ? getDocuments(props.titreTypeId, props.demarcheTypeId, etape.value.typeId).length > 0 : false
  })

  const stepEntrepriseDocumentsIsVisible = computed<boolean>(() => {
    return isNotNullNorUndefined(etape.value.typeId) ? getEntrepriseDocuments(props.titreTypeId, props.demarcheTypeId, etape.value.typeId).length > 0 : false
  })

  const stepDecisionsAnnexesIsVisible = computed<boolean>(() => {
    return isNotNullNorUndefined(etape.value.typeId) && isNotNullNorUndefined(etape.value.statutId) ? hasEtapeAvisDocuments(props.titreTypeId, props.demarcheTypeId, etape.value.typeId, etape.value.statutId) : false
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
    return etape.value.typeId === 'mfr' && ['arm', 'axm'].includes(props.titreTypeId)
  })

  // const documentsCompleteUpdate = (etapeDocuments: EtapeDocument[], newDocumentsComplete: boolean) => {
  //   documentsComplete.value = newDocumentsComplete
  //   props.completeUpdate({ ...etape.value, etapeDocuments }, complete.value)
  // }

  // const entrepriseDocumentsCompleteUpdate = (entrepriseDocumentIds: EntrepriseDocumentId[], newEntrepriseDocumentsComplete: boolean) => {
  //   entrepriseDocumentsComplete.value = newEntrepriseDocumentsComplete
  //   props.completeUpdate({ ...etape.value, entrepriseDocumentIds }, complete.value)
  // }

   const onEtapePerimetreChange = (perimetreInfos: GeojsonInformations) => {
    setEtape({...etape.value,
    geojson4326Perimetre: perimetreInfos.geojson4326_perimetre,
    geojson4326Points: perimetreInfos.geojson4326_points,
    geojsonOriginePerimetre: perimetreInfos.geojson_origine_perimetre,
    geojsonOriginePoints: perimetreInfos.geojson_origine_points,
    geojsonOrigineGeoSystemeId: perimetreInfos.geojson_origine_geo_systeme_id
  })

    props.alertesUpdate({ superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
  }
  const onEtapePointsChange = (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => {
    setEtape({...etape.value,
    geojson4326Points: geojson4326Points,
    geojsonOriginePoints: geojsonOriginePoints,})
  }
  const onEtapeForagesChange = (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => {
    setEtape({...etape.value,
    geojson4326Forages: geojson4326Forages,
    geojsonOrigineForages: geojsonOrigineForages,})
  }

  return () =>
    <div class="mb">
      {stepDateTypeIsVisible.value ? <Bloc step={{ name: 'Type', help: null }} complete={dateTypeComplete.value}>
        <DateTypeEdit etape={props.etape} apiClient={props.apiClient} completeUpdate={dateTypeCompleteUpdate} demarcheId={props.demarcheId}/>
      </Bloc> : null}

      <LoadingElement data={heritageData.value} renderItem={(heritage) => <>
      { isNotNullNorUndefined(etape.value.typeId) ? <>
        {stepFondamentalesIsVisible.value ? <Bloc step={{ name: 'Propriétés', help: null }} complete={fondamentalesComplete.value}>
        <FondamentalesEdit
          etape={{...props.etape, typeId: etape.value.typeId, ...heritage}}
          demarcheTypeId={props.demarcheTypeId}
          titreTypeId={props.titreTypeId}
          user={props.user}
          entreprises={props.entreprises}
          completeUpdate={fondamentalesCompleteUpdate}
        />
      </Bloc> : null}


      { stepPerimetreIsVisible.value ? <Bloc step={{name: 'Périmètre', help: null}} complete={perimetreComplete.value}>
        <PerimetreEdit
          etape={{...props.etape, typeId: etape.value.typeId, ...heritage}}
          titreTypeId={props.titreTypeId}
          titreSlug={props.titreSlug}
          apiClient={props.apiClient}

          onEtapeChange={onEtapePerimetreChange}
          onPointsChange={onEtapePointsChange}
          onForagesChange={onEtapeForagesChange}
          completeUpdate={perimetreCompleteUpdate}
        />
      </Bloc> : null }


      </> : null }
      </>} />



      {/* { stepSections.value ? <Bloc step={{name: 'Propriétés spécifiques', help: isHelpVisible.value ? 'Ce bloc permet de savoir si la prospection est mécanisée ou non et s’il y a des franchissements de cours d’eau (si oui, combien ?)' : null}} complete={stepSectionsComplete.value}>
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






})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeEditForm.props = ['etape', 'demarcheId', 'demarcheTypeId', 'titreTypeId', 'titreSlug', 'user', 'sdomZoneIds', 'entreprises', 'apiClient', 'completeUpdate', 'alertesUpdate', 'initTab']
