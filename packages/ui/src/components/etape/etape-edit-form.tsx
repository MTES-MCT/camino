import { DeepReadonly, computed, defineComponent, onMounted, ref } from 'vue'
import { Bloc } from './bloc'
import { EtapeFondamentaleEdit, FondamentalesEdit } from './fondamentales-edit'
import { PerimetreEdit } from './perimetre-edit'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { ApiClient } from '../../api/api-client'
import { User } from 'camino-common/src/roles'
import {
  DocumentComplementaireAslEtapeDocumentModification,
  DocumentComplementaireDaeEtapeDocumentModification,
  Etape,
  EtapeDocument,
  EtapeId,
  EtapePropsFromHeritagePropName,
  EtapeWithHeritage,
  HeritageProp,
  TempEtapeDocument,
  flattenEtapeWithHeritage,
} from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { SDOMZoneIds, SDOMZones } from 'camino-common/src/static/sdom'
import { Nullable, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Entreprise } from 'camino-common/src/entreprise'
import { AsyncData } from '../../api/client-rest'
import { DemarcheId } from 'camino-common/src/demarche'
import { useState } from '@/utils/vue-tsx-utils'
import { DateTypeEdit, EtapeDateTypeEdit, dateTypeStepIsComplete, dateTypeStepIsVisible } from './date-type-edit'
import { FeatureCollectionForages, FeatureCollectionPoints, GeojsonInformations, PerimetreInformations } from 'camino-common/src/perimetre'
import { LoadingElement } from '../_ui/functional-loader'
import { SectionsEdit, SectionsEditEtape } from './sections-edit'
import { DsfrTextarea } from '../_ui/dsfr-textarea'
import {
  SelectedEntrepriseDocument,
  entrepriseDocumentsStepIsComplete,
  entrepriseDocumentsStepIsVisible,
  etapeDocumentsStepIsComplete,
  etapeDocumentsStepIsVisible,
  fondamentaleStepIsComplete,
  fondamentaleStepIsVisible,
  perimetreStepIsComplete,
  perimetreStepIsVisible,
  sectionsStepIsComplete,
  sectionsStepIsVisible,
} from 'camino-common/src/permissions/etape-form'
import { EtapeAlerte, PureFormSaveBtn } from './pure-form-save-btn'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { DeposeEtapePopup } from '../demarche/depose-etape-popup'
import { canBeBrouillon } from 'camino-common/src/static/etapesTypes'

export type Props = {
  etape: DeepReadonly<Etape & Pick<Nullable<EtapeWithHeritage>, 'heritageContenu' | 'heritageProps'>>
  demarcheId: DemarcheId
  demarcheTypeId: DemarcheTypeId
  titreTypeId: TitreTypeId
  titreSlug: TitreSlug
  user: User
  entreprises: DeepReadonly<Entreprise[]>
  perimetre: DeepReadonly<PerimetreInformations>
  initTab?: 'points' | 'carte'
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
    | 'etapeCreer'
    | 'etapeModifier'
    | 'deposeEtape'
  >
}

type EtapeEditFormDocuments = DeepReadonly<{
  etapeDocuments: (EtapeDocument | TempEtapeDocument)[]
  entrepriseDocuments: SelectedEntrepriseDocument[]
  daeDocument: DocumentComplementaireDaeEtapeDocumentModification | null
  aslDocument: DocumentComplementaireAslEtapeDocumentModification | null
}>

type Heritage = DeepReadonly<Pick<EtapeWithHeritage, 'heritageProps' | 'heritageContenu' | 'date' | 'typeId' | 'statutId'>>
export const EtapeEditForm = defineComponent<Props>(props => {
  const [etape, setEtape] = useState(props.etape)
  const [heritage, setHeritage] = useState<DeepReadonly<Heritage> | null>(null)
  const [perimetreInfos, setPerimetreInfos] = useState<DeepReadonly<PerimetreInformations>>(props.perimetre)

  const [documents, setDocuments] = useState<EtapeEditFormDocuments>({
    etapeDocuments: [],
    entrepriseDocuments: [],
    daeDocument: null,
    aslDocument: null,
  })
  const heritageData = ref<AsyncData<Heritage>>({ status: 'LOADING' })

  onMounted(async () => {
    if (
      isNotNullNorUndefined(props.etape.id) &&
      isNotNullNorUndefined(props.etape.date) &&
      isNotNullNorUndefined(props.etape.typeId) &&
      isNotNullNorUndefined(props.etape.statutId) &&
      isNotNullNorUndefined(props.etape.heritageContenu) &&
      isNotNullNorUndefined(props.etape.heritageProps)
    ) {
      const heritageComplete = {
        date: props.etape.date,
        typeId: props.etape.typeId,
        statutId: props.etape.statutId,
        heritageProps: props.etape.heritageProps,
        heritageContenu: props.etape.heritageContenu,
        isBrouillon: props.etape.isBrouillon,
      }
      setHeritage(heritageComplete)
      heritageData.value = { status: 'LOADED', value: heritageComplete }
    } else {
      await reloadHeritage(props.demarcheId, etape.value)
    }
  })

  const reloadHeritage = async (demarcheId: DemarcheId, etape: Pick<Etape, 'date' | 'typeId' | 'statutId' | 'id'>) => {
    if (isNotNullNorUndefined(etape.date) && isNotNullNorUndefined(etape.typeId) && isNotNullNorUndefined(etape.statutId)) {
      try {
        heritageData.value = { status: 'LOADING' }
        const value = await props.apiClient.getEtapeHeritagePotentiel(demarcheId, etape.date, etape.typeId, etape.id)
        const heritageComplete = { ...value, date: etape.date, typeId: etape.typeId, statutId: etape.statutId }
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
      setEtape({
        ...etape.value,
        date: etapeDateType.date,
        typeId: etapeDateType.typeId,
        statutId: etapeDateType.statutId,
        isBrouillon: etape.value.isBrouillon || canBeBrouillon(etapeDateType.typeId),
      })
      await reloadHeritage(props.demarcheId, etapeDateType)
    }
  }

  const stepInternalIsVisible = computed<boolean>(() => {
    return heritageData.value.status === 'LOADED'
  })

  const setEtapeAndDocument = (etape: DeepReadonly<EtapeWithHeritage>, documents: EtapeEditFormDocuments) => {
    setEtape(etape)
    setHeritage(etape)
    setDocuments(documents)
  }

  const alertes = computed<EtapeAlerte[]>(() => {
    const alertes: EtapeAlerte[] = []
    if (isNotNullNorUndefined(perimetreInfos.value) && heritageData.value.status === 'LOADED') {
      if (perimetreInfos.value.superposition_alertes.length > 0) {
        alertes.push(
          ...perimetreInfos.value.superposition_alertes.map(t => ({
            message: `Le titre ${t.nom} au statut « ${isNotNullNorUndefined(t.titre_statut_id) ? TitresStatuts[t.titre_statut_id].nom : ''} » est superposé à ce titre`,
            url: `/titres/${t.slug}`,
          }))
        )
      }

      // si c’est une demande d’AXM, on doit afficher une alerte si on est en zone 0 ou 1 du Sdom
      if (['mfr', 'mcr'].includes(heritageData.value.value.typeId) && props.titreTypeId === 'axm') {
        const zoneId = perimetreInfos.value.sdomZoneIds.find(id => [SDOMZoneIds.Zone0, SDOMZoneIds.Zone0Potentielle, SDOMZoneIds.Zone1].includes(id))
        if (zoneId) {
          alertes.push({ message: `Le périmètre renseigné est dans une zone du Sdom interdite à l’exploitation minière : ${SDOMZones[zoneId].nom}` })
        }
      }
    }

    return alertes
  })

  const demandeEnConstruction = computed<boolean>(() => {
    if (heritageData.value.status === 'LOADED') {
      return heritageData.value.value.typeId === 'mfr' && etape.value.isBrouillon
    }

    return false
  })

  const canSave = computed<boolean>(() => {
    return (dateTypeStepIsComplete(etape.value, props.user) && demandeEnConstruction.value) || canDepose.value
  })

  const canDepose = computed<boolean>(() => {
    if (isNotNullNorUndefined(heritage.value)) {
      const etapeFlattened = flattenEtapeWithHeritage(props.titreTypeId, props.demarcheTypeId, etape.value, heritage.value)

      return (
        dateTypeStepIsComplete(etape.value, props.user) &&
        fondamentaleStepIsComplete(etapeFlattened, props.demarcheTypeId, props.titreTypeId) &&
        sectionsStepIsComplete(etapeFlattened, props.demarcheTypeId, props.titreTypeId) &&
        perimetreStepIsComplete(etapeFlattened) &&
        etapeDocumentsStepIsComplete(
          etapeFlattened,
          props.demarcheTypeId,
          props.titreTypeId,
          documents.value.etapeDocuments,
          props.perimetre.sdomZoneIds,
          documents.value.daeDocument,
          documents.value.aslDocument,
          props.user
        ) &&
        entrepriseDocumentsStepIsComplete(etapeFlattened, props.demarcheTypeId, props.titreTypeId, documents.value.entrepriseDocuments)
      )
    }

    return false
  })

  const save = async () => {
    if (canSave.value && isNotNullNorUndefined(heritage.value)) {
      let etapeId: EtapeId | null
      if (isNotNullNorUndefined(props.etape.id)) {
        etapeId = await props.apiClient.etapeModifier({
          ...etape.value,
          ...heritage.value,
          id: props.etape.id,
          titreDemarcheId: props.demarcheId,
          ...documents.value,
          entrepriseDocumentIds: documents.value.entrepriseDocuments.map(({ id }) => id),
        })
      } else {
        etapeId = await props.apiClient.etapeCreer({
          ...etape.value,
          ...heritage.value,
          titreDemarcheId: props.demarcheId,
          ...documents.value,
          entrepriseDocumentIds: documents.value.entrepriseDocuments.map(({ id }) => id),
        })
      }

      return etapeId
    }

    return null
  }

  const saveAndReroute = async () => {
    const etapeId = await save()
    if (isNotNullNorUndefined(etapeId)) {
      props.goToDemarche(props.demarcheId)
    }
  }

  const etapeIdToDepose = ref<EtapeId | null>(null)
  const depose = async () => {
    if (canDepose.value) {
      const etapeId = await save()
      etapeIdToDepose.value = etapeId
    }
  }

  const closeDeposePopup = () => {
    etapeIdToDepose.value = null
  }

  return () => (
    <form onSubmit={e => e.preventDefault()}>
      {dateTypeStepIsVisible(props.user) ? (
        <Bloc step={{ name: 'Informations principales', help: null }} complete={dateTypeStepIsComplete(etape.value, props.user)}>
          <DateTypeEdit etape={props.etape} apiClient={props.apiClient} completeUpdate={dateTypeCompleteUpdate} demarcheId={props.demarcheId} />
        </Bloc>
      ) : null}
      {stepInternalIsVisible.value ? (
        <LoadingElement
          data={heritageData.value}
          renderItem={item => (
            <>
              <EtapeEditFormInternal
                {...props}
                etape={isNotNullNorUndefined(heritage.value) ? { ...etape.value, ...heritage.value } : { ...etape.value, ...item }}
                documents={documents.value}
                setEtape={setEtapeAndDocument}
                alertesUpdate={setPerimetreInfos}
              />
              <PureFormSaveBtn
                class="fr-mt-2w fr-pt-2w fr-pb-2w"
                style={{ position: 'sticky', bottom: 0, background: 'white', zIndex: 100000 }}
                alertes={alertes.value}
                canSave={canSave.value}
                canDepose={canDepose.value}
                showDepose={item.typeId === 'mfr' && etape.value.isBrouillon}
                save={saveAndReroute}
                depose={depose}
              />
              {isNotNullNorUndefined(etapeIdToDepose.value) ? (
                <DeposeEtapePopup
                  close={closeDeposePopup}
                  apiClient={{
                    ...props.apiClient,
                    deposeEtape: async titreEtapeId => {
                      await props.apiClient.deposeEtape(titreEtapeId)
                      props.goToDemarche(props.demarcheId)
                    },
                  }}
                  id={etapeIdToDepose.value}
                />
              ) : null}
            </>
          )}
        />
      ) : null}
    </form>
  )
})

const EtapeEditFormInternal = defineComponent<
  {
    etape: DeepReadonly<EtapeWithHeritage>
    documents: EtapeEditFormDocuments
    setEtape: (etape: DeepReadonly<EtapeWithHeritage>, documents: EtapeEditFormDocuments) => void
    alertesUpdate: (alertes: PerimetreInformations) => void
  } & Omit<Props, 'etape'>
>(props => {
  const etapeFlattened = computed<DeepReadonly<EtapeWithHeritage>>(() => {
    return flattenEtapeWithHeritage(props.titreTypeId, props.demarcheTypeId, props.etape, props.etape)
  })

  const documentsCompleteUpdate = (
    etapeDocuments: (EtapeDocument | TempEtapeDocument)[],
    daeDocument: DocumentComplementaireDaeEtapeDocumentModification | null,
    aslDocument: DocumentComplementaireAslEtapeDocumentModification | null
  ) => {
    props.setEtape(etapeFlattened.value, {
      ...props.documents,
      etapeDocuments,
      daeDocument,
      aslDocument,
    })
  }

  const entrepriseDocumentsCompleteUpdate = (entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>) => {
    props.setEtape(etapeFlattened.value, { ...props.documents, entrepriseDocuments })
  }

  const onEtapePerimetreChange = (perimetreInfos: GeojsonInformations) => {
    props.setEtape(
      {
        ...etapeFlattened.value,
        geojson4326Perimetre: perimetreInfos.geojson4326_perimetre,
        geojson4326Points: perimetreInfos.geojson4326_points,
        geojsonOriginePerimetre: perimetreInfos.geojson_origine_perimetre,
        geojsonOriginePoints: perimetreInfos.geojson_origine_points,
        geojsonOrigineGeoSystemeId: perimetreInfos.geojson_origine_geo_systeme_id,
      },
      props.documents
    )

    props.alertesUpdate({ superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
  }

  const onEtapePerimetreHeritageChange = (perimetre: DeepReadonly<HeritageProp<Pick<EtapeWithHeritage, 'typeId' | 'date' | EtapePropsFromHeritagePropName<'perimetre'>>>>) => {
    props.setEtape(
      {
        ...props.etape,
        heritageProps: { ...props.etape.heritageProps, perimetre },
      },
      props.documents
    )
  }
  const onEtapePointsChange = (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => {
    props.setEtape({ ...etapeFlattened.value, geojson4326Points, geojsonOriginePoints }, props.documents)
  }
  const onEtapeForagesChange = (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => {
    props.setEtape({ ...etapeFlattened.value, geojson4326Forages, geojsonOrigineForages }, props.documents)
  }

  const sectionCompleteUpdate = (sectionsEtape: SectionsEditEtape) => {
    props.setEtape({ ...etapeFlattened.value, contenu: sectionsEtape.contenu, heritageContenu: sectionsEtape.heritageContenu }, props.documents)
  }

  const onUpdateNotes = (notes: string) => {
    props.setEtape({ ...etapeFlattened.value, notes }, props.documents)
  }

  const fondamentalesCompleteUpdate = (etapeFondamentale: DeepReadonly<EtapeFondamentaleEdit>) => {
    props.setEtape({ ...props.etape, ...etapeFondamentale }, props.documents)
  }

  const titulairesAndAmodiataires = computed<Entreprise[]>(() => {
    return props.entreprises.filter(({ id }) => props.etape.titulaireIds.includes(id) || props.etape.amodiataireIds.includes(id))
  })

  const isHelpVisible = computed<boolean>(() => {
    return props.etape.typeId === 'mfr' && ['arm', 'axm'].includes(props.titreTypeId)
  })

  return () => (
    <div>
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
          <SectionsEdit etape={etapeFlattened.value} titreTypeId={props.titreTypeId} demarcheTypeId={props.demarcheTypeId} completeUpdate={sectionCompleteUpdate} />
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
        <Bloc
          step={{ name: 'Liste des documents', help: null }}
          complete={etapeDocumentsStepIsComplete(
            etapeFlattened.value,
            props.demarcheTypeId,
            props.titreTypeId,
            props.documents.etapeDocuments,
            props.perimetre.sdomZoneIds,
            props.documents.daeDocument,
            props.documents.aslDocument,
            props.user
          )}
        >
          <EtapeDocumentsEdit
            apiClient={props.apiClient}
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: etapeFlattened.value.typeId }}
            etapeId={etapeFlattened.value.id}
            completeUpdate={documentsCompleteUpdate}
            sdomZoneIds={props.perimetre.sdomZoneIds}
            user={props.user}
            contenu={etapeFlattened.value.contenu}
            isBrouillon={etapeFlattened.value.isBrouillon}
          />
        </Bloc>
      ) : null}

      {entrepriseDocumentsStepIsVisible(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{
            name: 'Documents d’entreprise',
            help:
              isHelpVisible.value && isNotNullNorUndefinedNorEmpty(titulairesAndAmodiataires.value)
                ? "Les documents d’entreprise sont des documents propres à l'entreprise, et pourront être réutilisés pour la création d'un autre dossier et mis à jour si nécessaire. Ces documents d’entreprise sont consultables dans la fiche entreprise de votre société. Cette section permet de protéger et de centraliser les informations d'ordre privé relatives à la société et à son personnel."
                : null,
          }}
          complete={entrepriseDocumentsStepIsComplete(etapeFlattened.value, props.demarcheTypeId, props.titreTypeId, props.documents.entrepriseDocuments)}
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

      <DsfrTextarea initialValue={props.etape.notes} class="fr-mt-2w" legend={{ main: 'Notes' }} valueChanged={onUpdateNotes} />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeEditForm.props = ['etape', 'demarcheId', 'demarcheTypeId', 'titreTypeId', 'titreSlug', 'user', 'perimetre', 'entreprises', 'apiClient', 'initTab', 'goToDemarche']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeEditFormInternal.props = [
  'etape',
  'demarcheId',
  'demarcheTypeId',
  'titreTypeId',
  'titreSlug',
  'user',
  'perimetre',
  'entreprises',
  'apiClient',
  'alertesUpdate',
  'initTab',
  'setEtape',
  'documents',
]
