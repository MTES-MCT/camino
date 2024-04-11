import { DeepReadonly, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { Bloc } from './bloc'
import { EtapeFondamentaleEdit, FondamentalesEdit, fondamentaleStepIsComplete, fondamentaleStepIsVisible } from './fondamentales-edit'
import { PerimetreEdit, perimetreStepIsComplete, perimetreStepIsVisible } from './perimetre-edit'
import { EntrepriseDocumentsEdit, SelectedEntrepriseDocument, entrepriseDocumentsStepIsComplete, entrepriseDocumentsStepIsVisible } from './entreprises-documents-edit'
import { EtapeDocumentsEdit, etapeDocumentsStepIsComplete, etapeDocumentsStepIsVisible } from './etape-documents-edit'
import { ApiClient } from '../../api/api-client'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { getEntrepriseDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { User, isAdministrationAdmin, isAdministrationEditeur, isSuper } from 'camino-common/src/roles'
import { hasEtapeAvisDocuments } from 'camino-common/src/permissions/titres-etapes'
import { Etape, EtapeDocument, FullEtapeHeritage, TempEtapeDocument } from 'camino-common/src/etape'
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
import { SectionsEdit, SectionsEditEtape, sectionsStepIsComplete, sectionsStepIsVisible } from './sections-edit'
import { DsfrTextarea } from '../_ui/dsfr-textarea'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'

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

type Heritage = DeepReadonly<Pick<FullEtapeHeritage, 'heritageProps' | 'heritageContenu' | 'date' | 'typeId' | 'statutId'>>
export const EtapeEditForm = defineComponent<Props>(props => {
  const [etape, setEtape] = useState(props.etape)

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
        heritageData.value = { status: 'LOADED', value: {...value, date: etape.date, typeId: etape.typeId, statutId: etape.statutId} }
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

  const setEtapeAndDocument = (etape: DeepReadonly<FullEtapeHeritage>, etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>, entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>) => {
    setEtape(etape)
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
        renderItem={heritage => <EtapeEditFormInternal {...props} etape={etape.value} heritage={heritage} entrepriseDocuments={entrepriseDocuments.value} etapeDocuments={etapeDocuments.value} setEtape={setEtapeAndDocument}/>}
      /> : null}
    </div>
  )
})

// FIXME on devrait peut-être utiliser une classe plutôt que FullEtapeHeritage, comme ça on aurait des accesseurs directs aux valeurs héritées ou non...
// Sinon, il faut faire attention à chaque fois qu'on accède à une valeur héritable, pour chercher sa valeur au bon endroit
const EtapeEditFormInternal = defineComponent<{
  etape: DeepReadonly<Etape>
  heritage: Heritage
  etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>,
  entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>,
  setEtape: (etape: DeepReadonly<FullEtapeHeritage>, etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>, entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>) => void
} & Omit<Props, 'etape' | 'completeUpdate'>>((props) => {


  // FIXME nos cerveaux du lundi --> c'est ici qu'on était, on se battait sur comment ne pas se faire avoir par nos objets et leurs valeurs héritées ou pas.
  const etapeFlattened = computed<DeepReadonly<FullEtapeHeritage>>(() => {


      const substances: Readonly<SubstanceLegaleId[]> = props.heritage.heritageProps.substances.actif ?  (props.heritage.heritageProps.substances.etape?.substances ?? []) : props.etape.substances
      const duree: number | null = props.heritage.heritageProps.duree.actif ?  props.heritage.heritageProps.duree.etape?.duree ?? null : props.etape.duree

      return {...props.etape, ...props.heritage, substances, duree}
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
  const onEtapePointsChange = (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => {
    props.setEtape({ ...etapeFlattened.value, geojson4326Points, geojsonOriginePoints }, props.etapeDocuments, props.entrepriseDocuments)
  }
  const onEtapeForagesChange = (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => {
    props.setEtape({ ...etapeFlattened.value, geojson4326Forages, geojsonOrigineForages }, props.etapeDocuments, props.entrepriseDocuments)
  }

  const sectionCompleteUpdate = (sectionsEtape: SectionsEditEtape) => {
    props.setEtape({ ...etapeFlattened.value, contenu: sectionsEtape.contenu }, props.etapeDocuments, props.entrepriseDocuments)
    // FIXME faudrait pas faire ça partout ? Et on peut pas mieux faire ?
    // if (heritageData.value.status === 'LOADED') {
    //   heritageData.value = { status: 'LOADED', value: { ...heritageData.value.value, heritageContenu: sectionsEtape.heritageContenu } }
    // }

    // FIXME à tester si on change la mécanisation
  }

  const onUpdateNotes = (notes: string) => {
    props.setEtape({ ...etapeFlattened.value, notes }, props.etapeDocuments, props.entrepriseDocuments)
  }


  const fondamentalesCompleteUpdate = (etapeFondamentale: DeepReadonly<EtapeFondamentaleEdit>,) => {
    props.setEtape({ ...etapeFlattened.value, ...etapeFondamentale }, props.etapeDocuments, props.entrepriseDocuments)
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
      {fondamentaleStepIsVisible(props.etape) ? (
        <Bloc step={{ name: 'Propriétés', help: null }} complete={fondamentaleStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId)}>
          <FondamentalesEdit
            etape={props.etape}
            demarcheTypeId={props.demarcheTypeId}
            titreTypeId={props.titreTypeId}
            user={props.user}
            entreprises={props.entreprises}
            completeUpdate={fondamentalesCompleteUpdate}
          />
        </Bloc>
      ) : null}



    {sectionsStepIsVisible(props.etape, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{
            name: 'Propriétés spécifiques',
            help: isHelpVisible.value ? 'Ce bloc permet de savoir si la prospection est mécanisée ou non et s’il y a des franchissements de cours d’eau (si oui, combien ?)' : null,
          }}
          complete={sectionsStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId)}
        >
          <SectionsEdit
            etape={props.etape}
            titreTypeId={props.titreTypeId}
            demarcheTypeId={props.demarcheTypeId}
            completeUpdate={sectionCompleteUpdate}
          />
        </Bloc>
      ) : null}

      {perimetreStepIsVisible(props.etape) ? (
        <Bloc step={{ name: 'Périmètre', help: null }} complete={perimetreStepIsComplete(props.etape)}>
          <PerimetreEdit
            etape={props.etape}
            titreTypeId={props.titreTypeId}
            titreSlug={props.titreSlug}
            apiClient={props.apiClient}
            onEtapeChange={onEtapePerimetreChange}
            onPointsChange={onEtapePointsChange}
            onForagesChange={onEtapeForagesChange}
          />
        </Bloc>
      ) : null}

      {etapeDocumentsStepIsVisible(props.etape, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc step={{ name: 'Liste des documents', help: null }} complete={etapeDocumentsStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId, props.etapeDocuments, props.sdomZoneIds)}>
          <EtapeDocumentsEdit
            apiClient={props.apiClient}
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: props.etape.typeId }}
            etapeId={props.etape.id}
            completeUpdate={documentsCompleteUpdate}
            sdomZoneIds={props.sdomZoneIds}
            user={props.user}
            // FIXME Mais si c’est hérité ça marche ?
            contenu={props.etape.contenu}
            etapeStatutId={props.etape.statutId}
          />
        </Bloc>
      ) : null}


      {entrepriseDocumentsStepIsVisible(props.etape, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{
            name: 'Documents d’entreprise',
            help: isHelpVisible.value
              ? "Les documents d’entreprise sont des documents propres à l'entreprise, et pourront être réutilisés pour la création d'un autre dossier et mis à jour si nécessaire. Ces documents d’entreprise sont consultables dans la fiche entreprise de votre société. Cette section permet de protéger et de centraliser les informations d'ordre privé relatives à la société et à son personnel."
              : null,
          }}
          complete={entrepriseDocumentsStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId, props.entrepriseDocuments)}
        >
          <EntrepriseDocumentsEdit
            entreprises={titulairesAndAmodiataires.value}
            apiClient={props.apiClient}
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: props.etape.typeId }}
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
