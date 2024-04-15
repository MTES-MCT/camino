import { DeepReadonly, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { Bloc } from './bloc'
import { EtapeFondamentaleEdit, FondamentalesEdit } from './fondamentales-edit'
import { PerimetreEdit } from './perimetre-edit'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { ApiClient } from '../../api/api-client'
import { User} from 'camino-common/src/roles'
import { Etape, EtapeDocument, EtapePropsFromHeritagePropName, EtapeWithHeritage, HeritageProp, TempEtapeDocument, flattenEtapeWithHeritage } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Entreprise, EntrepriseDocumentId } from 'camino-common/src/entreprise'
import { AsyncData } from '../../api/client-rest'
import { DemarcheId } from 'camino-common/src/demarche'
import { useState } from '@/utils/vue-tsx-utils'
import { DateTypeEdit, EtapeDateTypeEdit, dateTypeStepIsComplete, dateTypeStepIsVisible } from './date-type-edit'
import { FeatureCollectionForages, FeatureCollectionPoints, GeojsonInformations, PerimetreInformations } from 'camino-common/src/perimetre'
import { LoadingElement } from '../_ui/functional-loader'
import { SectionsEdit, SectionsEditEtape } from './sections-edit'
import { DsfrTextarea } from '../_ui/dsfr-textarea'
import { SelectedEntrepriseDocument, entrepriseDocumentsStepIsComplete, entrepriseDocumentsStepIsVisible, etapeDocumentsStepIsComplete, etapeDocumentsStepIsVisible, fondamentaleStepIsComplete, fondamentaleStepIsVisible, perimetreStepIsComplete, perimetreStepIsVisible, sectionsStepIsComplete, sectionsStepIsVisible } from 'camino-common/src/permissions/etape-form'

export type Props = {
  etape: DeepReadonly<Etape>
  demarcheId: DemarcheId
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  user: User
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>
  entreprises: DeepReadonly<Entreprise[]>
  initTab?: 'points' | 'carte'
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
  >
  completeUpdate: (etape: DeepReadonly<Etape>) => void
  alertesUpdate: (alertes: PerimetreInformations) => void
}

type Heritage = DeepReadonly<Pick<EtapeWithHeritage, 'heritageProps' | 'heritageContenu' | 'date' | 'typeId' | 'statutId'>>
export const EtapeEditForm = defineComponent<Props>(props => {
  const [etape, setEtape] = useState(props.etape)
  const [heritage, setHeritage] = useState<DeepReadonly<Heritage> | null>(null)

  const [entrepriseDocuments, setEntrepriseDocuments] = useState<DeepReadonly<SelectedEntrepriseDocument[]>>([])
  const [etapeDocuments, setEtapeDocuments] = useState<DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>>([])
  const heritageData = ref<AsyncData<Heritage>>({ status: 'LOADING' })

  onMounted(async () => {
    await reloadHeritage(props.demarcheId, etape.value)
  })

  watch(
    () => etape.value,
    () => {
      props.completeUpdate(etape.value)
    }
  )


  const reloadHeritage = async (demarcheId: DemarcheId, etape: Pick<Etape, 'date' | 'typeId' | 'statutId'>) => {
    if (isNotNullNorUndefined(etape.date) &&isNotNullNorUndefined(etape.typeId) &&isNotNullNorUndefined(etape.statutId) ) {
      try {
        heritageData.value = { status: 'LOADING' }
        const value = await props.apiClient.getEtapeHeritage(demarcheId, etape.date, etape.typeId)
        const heritageComplete = {...value, date: etape.date, typeId: etape.typeId, statutId: etape.statutId} 
        setHeritage(heritageComplete)
        heritageData.value = { status: 'LOADED', value: heritageComplete }
      } catch (e: any) {
        console.error('error', e)
        heritageData.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }



  const dateTypeCompleteUpdate = async (etapeDateType: EtapeDateTypeEdit) => {
    if (isNotNullNorUndefined(etapeDateType.typeId) && isNotNullNorUndefined(etapeDateType.statutId)) {
      setEtape({ ...etape.value, date: etapeDateType.date, typeId: etapeDateType.typeId, statutId: etapeDateType.statutId })
      await reloadHeritage(props.demarcheId, etapeDateType)
    }
  }

  const stepInternalIsVisible = computed<boolean>(() => {
    return heritageData.value.status === 'LOADED'
  })

  const setEtapeAndDocument = (etape: DeepReadonly<EtapeWithHeritage>, etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>, entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>) => {
    console.log('setEtapeAndDocument', JSON.stringify(etape.substances))
    setEtape(etape)
    setHeritage(etape)
    setEtapeDocuments(etapeDocuments)
    setEntrepriseDocuments(entrepriseDocuments)
  }

  
  return () => (
    <div class="dsfr">
      {dateTypeStepIsVisible(props.user) ? (
        <Bloc step={{ name: 'Informations principales', help: null }} complete={dateTypeStepIsComplete(etape.value, props.user)}>
          <DateTypeEdit etape={props.etape} apiClient={props.apiClient} completeUpdate={dateTypeCompleteUpdate} demarcheId={props.demarcheId} />
        </Bloc>
      ) : null}
      {stepInternalIsVisible.value ? <LoadingElement
        data={heritageData.value}
        renderItem={item => <EtapeEditFormInternal {...props} etape={isNotNullNorUndefined(heritage.value) ? {...etape.value, ...heritage.value} : {...etape.value, ...item}} entrepriseDocuments={entrepriseDocuments.value} etapeDocuments={etapeDocuments.value} setEtape={setEtapeAndDocument}/>}
      /> : null}
    </div>
  )
})

const EtapeEditFormInternal = defineComponent<{
  etape: DeepReadonly<EtapeWithHeritage>
  etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>,
  entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>,
  setEtape: (etape: DeepReadonly<EtapeWithHeritage>, etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>, entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>) => void
} & Omit<Props, 'etape' | 'completeUpdate'>>((props) => {



  const etapeFlattened = computed<DeepReadonly<EtapeWithHeritage>>(() => {
    return flattenEtapeWithHeritage(props.etape, props.etape)
  })


  // const internalComplete = computed<boolean>(() => {
  //   return (
  //     // (!stepFondamentalesIsVisible.value || fondamentalesComplete.value) &&
  //     // (!stepPerimetreIsVisible.value || perimetreComplete.value) &&
  //     // (!stepSectionsIsVisible.value || sectionsComplete.value) &&
  //     // (!stepDocumentsIsVisible.value || documentsComplete.value) &&
  //     // (!stepEntrepriseDocumentsIsVisible.value || entrepriseDocumentsComplete.value) &&
  //   )
  // })

  const documentsCompleteUpdate = (etapeDocuments: (EtapeDocument | TempEtapeDocument)[]) => {
    props.setEtape(etapeFlattened.value, etapeDocuments, props.entrepriseDocuments)
  }

  const entrepriseDocumentsCompleteUpdate = (entrepriseDocument: DeepReadonly<SelectedEntrepriseDocument[]>) => {
    props.setEtape(etapeFlattened.value, props.etapeDocuments, entrepriseDocument)
  }

  const onEtapePerimetreChange = (perimetreInfos: GeojsonInformations) => {
    props.setEtape({
      ...etapeFlattened.value,
      geojson4326Perimetre: perimetreInfos.geojson4326_perimetre,
      geojson4326Points: perimetreInfos.geojson4326_points,
      geojsonOriginePerimetre: perimetreInfos.geojson_origine_perimetre,
      geojsonOriginePoints: perimetreInfos.geojson_origine_points,
      geojsonOrigineGeoSystemeId: perimetreInfos.geojson_origine_geo_systeme_id,
    }, props.etapeDocuments, props.entrepriseDocuments)

    props.alertesUpdate({ superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
  }

  const onEtapePerimetreHeritageChange = (perimetre: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'typeId' | 'date' | EtapePropsFromHeritagePropName<'perimetre'>>>>) => {
    props.setEtape({
      ...props.etape,
      heritageProps: {...props.etape.heritageProps, perimetre }
    }, props.etapeDocuments, props.entrepriseDocuments)
  }
  const onEtapePointsChange = (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => {
    props.setEtape({ ...etapeFlattened.value, geojson4326Points, geojsonOriginePoints }, props.etapeDocuments, props.entrepriseDocuments)
  }
  const onEtapeForagesChange = (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => {
    props.setEtape({ ...etapeFlattened.value, geojson4326Forages, geojsonOrigineForages }, props.etapeDocuments, props.entrepriseDocuments)
  }

  const sectionCompleteUpdate = (sectionsEtape: SectionsEditEtape) => {
    props.setEtape({ ...etapeFlattened.value, contenu: sectionsEtape.contenu, heritageContenu: sectionsEtape.heritageContenu }, props.etapeDocuments, props.entrepriseDocuments)

    // FIXME à tester si on change la mécanisation
  }

  const onUpdateNotes = (notes: string) => {
    props.setEtape({ ...etapeFlattened.value, notes }, props.etapeDocuments, props.entrepriseDocuments)
  }


  const fondamentalesCompleteUpdate = (etapeFondamentale: DeepReadonly<EtapeFondamentaleEdit>,) => {
    props.setEtape({ ...props.etape, ...etapeFondamentale }, props.etapeDocuments, props.entrepriseDocuments)
  }

  const titulairesAndAmodiataires = computed<Entreprise[]>(() => {
    const titulaireIds = props.etape.titulaires.map(({ id }) => id)
    const amodiatairesIds = props.etape.amodiataires.map(({ id }) => id)

    return props.entreprises.filter(({ id }) => titulaireIds.includes(id) || amodiatairesIds.includes(id))
  })

  const isHelpVisible = computed<boolean>(() => {
    return props.etape.typeId === 'mfr' && ['arm', 'axm'].includes(props.titreTypeId)
  })

  return () => <div>
      {fondamentaleStepIsVisible(etapeFlattened.value.typeId) ? (
        <Bloc step={{ name: 'Propriétés', help: null }} complete={fondamentaleStepIsComplete(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId)}>
          <FondamentalesEdit
            etape={etapeFlattened.value}
          
            demarcheTypeId={props.demarcheTypeId}
            titreTypeId={props.titreTypeId}
            user={props.user}
            entreprises={props.entreprises}
            completeUpdate={fondamentalesCompleteUpdate}
          />
        </Bloc>
      ) : null}



    {sectionsStepIsVisible(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{
            name: 'Propriétés spécifiques',
            help: isHelpVisible.value ? 'Ce bloc permet de savoir si la prospection est mécanisée ou non et s’il y a des franchissements de cours d’eau (si oui, combien ?)' : null,
          }}
          complete={sectionsStepIsComplete(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId)}
        >
          <SectionsEdit
            etape={etapeFlattened.value}
            titreTypeId={props.titreTypeId}
            demarcheTypeId={props.demarcheTypeId}
            completeUpdate={sectionCompleteUpdate}
          />
        </Bloc>
      ) : null}

      {perimetreStepIsVisible(etapeFlattened.value) ? (
        <Bloc step={{ name: 'Périmètre', help: null }} complete={perimetreStepIsComplete(etapeFlattened.value)}>
          <PerimetreEdit
            etape={etapeFlattened.value}
            titreTypeId={props.titreTypeId}
            titreSlug={props.titreSlug}
            apiClient={props.apiClient}
            initTab={props.initTab}
            onEtapeChange={onEtapePerimetreChange}
            onPointsChange={onEtapePointsChange}
            onForagesChange={onEtapeForagesChange}
            onHeritageChange={onEtapePerimetreHeritageChange}
          />
        </Bloc>
      ) : null}

      {etapeDocumentsStepIsVisible(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc step={{ name: 'Liste des documents', help: null }} complete={etapeDocumentsStepIsComplete(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId, props.etapeDocuments, props.sdomZoneIds)}>
          <EtapeDocumentsEdit
            apiClient={props.apiClient}
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: etapeFlattened.value.typeId }}
            etapeId={etapeFlattened.value.id}
            completeUpdate={documentsCompleteUpdate}
            sdomZoneIds={props.sdomZoneIds}
            user={props.user}
            // FIXME Mais si c’est hérité ça marche ?
            contenu={etapeFlattened.value.contenu}
            etapeStatutId={etapeFlattened.value.statutId}
          />
        </Bloc>
      ) : null}


      {entrepriseDocumentsStepIsVisible(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{
            name: 'Documents d’entreprise',
            help: isHelpVisible.value
              ? "Les documents d’entreprise sont des documents propres à l'entreprise, et pourront être réutilisés pour la création d'un autre dossier et mis à jour si nécessaire. Ces documents d’entreprise sont consultables dans la fiche entreprise de votre société. Cette section permet de protéger et de centraliser les informations d'ordre privé relatives à la société et à son personnel."
              : null,
          }}
          complete={entrepriseDocumentsStepIsComplete(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId, props.entrepriseDocuments)}
        >
          <EntrepriseDocumentsEdit
            entreprises={titulairesAndAmodiataires.value}
            apiClient={props.apiClient}
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: etapeFlattened.value.typeId }}
            etapeId={props.etape.id}
            completeUpdate={entrepriseDocumentsCompleteUpdate}
          />
        </Bloc>
      ) : null}

      {/* stepDecisionsAnnexes.value ? <Bloc step={{name: 'Décisions annexes', help: null}} complete={stepDecisionsAnnexesComplete.value}>
<div>FIXME</div>
</Bloc>  */}

      <DsfrTextarea initialValue={props.etape.notes} class="fr-mt-2w" legend={{ main: 'Notes' }} valueChanged={onUpdateNotes} />
    </div>
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeEditForm.props = ['etape', 'demarcheId', 'demarcheTypeId', 'titreTypeId', 'titreSlug', 'user', 'sdomZoneIds', 'entreprises', 'apiClient', 'completeUpdate', 'alertesUpdate', 'initTab']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeEditFormInternal.props = ['etape', 'demarcheId', 'demarcheTypeId', 'titreTypeId', 'titreSlug', 'user', 'sdomZoneIds', 'entreprises', 'apiClient', 'alertesUpdate', 'initTab', 'setEtape', 'etapeDocuments', 'entrepriseDocuments']
