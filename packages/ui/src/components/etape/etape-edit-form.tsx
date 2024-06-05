import { DeepReadonly, computed, defineComponent, onMounted, ref } from 'vue'
import { Bloc } from './bloc'
import { EtapeFondamentaleEdit, FondamentalesEdit } from './fondamentales-edit'
import { PerimetreEdit } from './perimetre-edit'
import { EntrepriseDocumentsEdit } from './entreprises-documents-edit'
import { EtapeDocumentsEdit } from './etape-documents-edit'
import { ApiClient } from '../../api/api-client'
import { User } from 'camino-common/src/roles'
import { DocumentComplementaireAslEtapeDocumentModification, DocumentComplementaireDaeEtapeDocumentModification, EtapeDocument, EtapeId, TempEtapeDocument } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { SDOMZoneIds, SDOMZones } from 'camino-common/src/static/sdom'
import { Nullable, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Entreprise } from 'camino-common/src/entreprise'
import { DemarcheId } from 'camino-common/src/demarche'
import { useState } from '@/utils/vue-tsx-utils'
import { DateTypeEdit, EtapeDateTypeEdit, dateTypeStepIsComplete, dateTypeStepIsVisible } from './date-type-edit'
import { FeatureCollectionForages, FeatureCollectionPoints, GeojsonInformations, PerimetreInformations } from 'camino-common/src/perimetre'
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
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes'
import { CoreEtapeCreationOrModification } from './etape-api-client'
import { FlattenEtape, GraphqlEtapeCreation } from 'camino-common/src/etape-form'
import { AsyncData } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { LoadingElement } from '../_ui/functional-loader'

export type Props = {
  etape: DeepReadonly<Pick<Nullable<FlattenEtape>, 'id' | 'date' | 'typeId' | 'statutId' | 'slug'> & Omit<FlattenEtape, 'date' | 'typeId' | 'statutId' | 'id' | 'slug'>>
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

export const EtapeEditForm = defineComponent<Props>(props => {
  const [etape, setEtape] = useState<AsyncData<CoreEtapeCreationOrModification | null>>({ status: 'LOADED', value: null })
  const [perimetreInfos, setPerimetreInfos] = useState<DeepReadonly<PerimetreInformations>>(props.perimetre)

  const [documents, setDocuments] = useState<EtapeEditFormDocuments>({
    etapeDocuments: [],
    entrepriseDocuments: [],
    daeDocument: null,
    aslDocument: null,
  })
  onMounted(async () => {
    if (isNotNullNorUndefined(props.etape.date) && isNotNullNorUndefined(props.etape.typeId) && isNotNullNorUndefined(props.etape.statutId)) {
      setEtape({ status: 'LOADED', value: { ...props.etape, date: props.etape.date, typeId: props.etape.typeId, statutId: props.etape.statutId } })
    }
  })

  const reloadHeritage = async (date: CaminoDate, typeId: EtapeTypeId, statutId: EtapeStatutId) => {
    const currentEtape = etape.value.status === 'LOADED' && isNotNullNorUndefined(etape.value.value) ? etape.value.value : props.etape
    setEtape({ status: 'LOADING' })
    try {
      const value = await props.apiClient.getEtapeHeritagePotentiel(
        {
          ...currentEtape,
          date,
          typeId,
          statutId,
          isBrouillon: isNotNullNorUndefined(currentEtape.id) ? currentEtape.isBrouillon : canBeBrouillon(typeId),
        },
        props.demarcheId,
        props.titreTypeId,
        props.demarcheTypeId
      )
      setEtape({ status: 'LOADED', value })
    } catch (e: any) {
      console.error('error', e)
      setEtape({
        status: 'ERROR',
        message: e.message ?? "Une erreur s'est produite",
      })
    }
  }

  const dateTypeCompleteUpdate = async (etapeDateType: EtapeDateTypeEdit) => {
    if (isNotNullNorUndefined(etapeDateType.date) && isNotNullNorUndefined(etapeDateType.typeId) && isNotNullNorUndefined(etapeDateType.statutId)) {
      await reloadHeritage(etapeDateType.date, etapeDateType.typeId, etapeDateType.statutId)
    }
  }

  const setEtapeAndDocument = (etape: DeepReadonly<CoreEtapeCreationOrModification>, documents: EtapeEditFormDocuments) => {
    setEtape({ status: 'LOADED', value: etape })
    setDocuments(documents)
  }

  const alertes = computed<EtapeAlerte[]>(() => {
    const alertes: EtapeAlerte[] = []
    if (isNotNullNorUndefined(perimetreInfos.value)) {
      if (perimetreInfos.value.superposition_alertes.length > 0) {
        alertes.push(
          ...perimetreInfos.value.superposition_alertes.map(t => ({
            message: `Le titre ${t.nom} au statut « ${isNotNullNorUndefined(t.titre_statut_id) ? TitresStatuts[t.titre_statut_id].nom : ''} » est superposé à ce titre`,
            url: `/titres/${t.slug}`,
          }))
        )
      }

      // si c’est une demande d’AXM, on doit afficher une alerte si on est en zone 0 ou 1 du Sdom
      if (etape.value.status === 'LOADED' && isNotNullNorUndefined(etape.value.value) && ['mfr', 'mcr'].includes(etape.value.value.typeId) && props.titreTypeId === 'axm') {
        const zoneId = perimetreInfos.value.sdomZoneIds.find(id => [SDOMZoneIds.Zone0, SDOMZoneIds.Zone0Potentielle, SDOMZoneIds.Zone1].includes(id))
        if (zoneId) {
          alertes.push({ message: `Le périmètre renseigné est dans une zone du Sdom interdite à l’exploitation minière : ${SDOMZones[zoneId].nom}` })
        }
      }
    }

    return alertes
  })

  const canSave = computed<boolean>(() => {
    if (etape.value.status === 'LOADED' && isNotNullNorUndefined(etape.value.value)) {
      return (dateTypeStepIsComplete(etape.value.value, props.user) && etape.value.value.isBrouillon) || canDepose.value
    }
    return false
  })

  const canDepose = computed<boolean>(() => {
    if (etape.value.status === 'LOADED' && isNotNullNorUndefined(etape.value.value)) {
      return (
        dateTypeStepIsComplete(etape.value.value, props.user) &&
        fondamentaleStepIsComplete(etape.value.value, props.demarcheTypeId, props.titreTypeId) &&
        sectionsStepIsComplete(etape.value.value, props.demarcheTypeId, props.titreTypeId) &&
        perimetreStepIsComplete(etape.value.value) &&
        etapeDocumentsStepIsComplete(
          etape.value.value,
          props.demarcheTypeId,
          props.titreTypeId,
          documents.value.etapeDocuments,
          props.perimetre.sdomZoneIds,
          documents.value.daeDocument,
          documents.value.aslDocument,
          props.user
        ) &&
        entrepriseDocumentsStepIsComplete(etape.value.value, props.demarcheTypeId, props.titreTypeId, documents.value.entrepriseDocuments)
      )
    }

    return false
  })

  const save = async () => {
    if (canSave.value && etape.value.status === 'LOADED' && isNotNullNorUndefined(etape.value.value)) {
      const etapeValue = etape.value.value
      let etapeId: EtapeId | null
      const heritage = {
        dateDebut: etapeValue.dateDebut.value,
        dateFin: etapeValue.dateFin.value,
        duree: etapeValue.duree.value,
        substances: etapeValue.substances.value,
        titulaireIds: etapeValue.titulaires.value,
        amodiataireIds: etapeValue.amodiataires.value,
        geojson4326Points: etapeValue.perimetre.value?.geojson4326Points ?? null,
        geojson4326Perimetre: etapeValue.perimetre.value?.geojson4326Perimetre ?? null,
        geojsonOriginePoints: etapeValue.perimetre.value?.geojsonOriginePoints ?? null,
        geojsonOrigineForages: etapeValue.perimetre.value?.geojsonOrigineForages ?? null,
        geojsonOriginePerimetre: etapeValue.perimetre.value?.geojsonOriginePerimetre ?? null,
        geojsonOrigineGeoSystemeId: etapeValue.perimetre.value?.geojsonOrigineGeoSystemeId ?? null,
        heritageProps: {
          dateDebut: { actif: etapeValue.dateDebut.heritee },
          dateFin: { actif: etapeValue.dateFin.heritee },
          duree: { actif: etapeValue.duree.heritee },
          perimetre: { actif: etapeValue.perimetre.heritee },
          substances: { actif: etapeValue.substances.heritee },
          titulaires: { actif: etapeValue.titulaires.heritee },
          amodiataires: { actif: etapeValue.amodiataires.heritee },
        },
        contenu: Object.keys(etapeValue.contenu).reduce<DeepReadonly<GraphqlEtapeCreation['contenu']>>((sectionsAcc, section) => {
          sectionsAcc = {
            ...sectionsAcc,
            [section]: Object.keys(etapeValue.contenu[section]).reduce<DeepReadonly<GraphqlEtapeCreation['contenu'][string]>>((elementsAcc, element) => {
              elementsAcc = { ...elementsAcc, [element]: etapeValue.contenu[section][element].value }

              return elementsAcc
            }, {}),
          }

          return sectionsAcc
        }, {}),
        heritageContenu: Object.keys(etapeValue.contenu).reduce<DeepReadonly<GraphqlEtapeCreation['heritageContenu']>>((sectionsAcc, section) => {
          return {
            ...sectionsAcc,
            [section]: Object.keys(etapeValue.contenu[section]).reduce<DeepReadonly<GraphqlEtapeCreation['heritageContenu'][string]>>((elementsAcc, element) => {
              return { ...elementsAcc, [element]: { actif: etapeValue.contenu[section][element].heritee } }
            }, {}),
          }
        }, {}),
      }

      if (isNotNullNorUndefined(props.etape.id)) {
        etapeId = await props.apiClient.etapeModifier({
          ...etape.value.value,
          id: props.etape.id,
          titreDemarcheId: props.demarcheId,
          ...documents.value,
          entrepriseDocumentIds: documents.value.entrepriseDocuments.map(({ id }) => id),
          ...heritage,
        })
      } else {
        etapeId = await props.apiClient.etapeCreer({
          ...etape.value.value,
          titreDemarcheId: props.demarcheId,
          ...documents.value,
          entrepriseDocumentIds: documents.value.entrepriseDocuments.map(({ id }) => id),
          ...heritage,
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
        <Bloc
          step={{ name: 'Informations principales', help: null }}
          complete={dateTypeStepIsComplete(
            etape.value.status === 'LOADED' && etape.value.value !== null
              ? etape.value.value
              : {
                  date: null,
                  id: null,
                  statutId: null,
                  typeId: null,
                },
            props.user
          )}
        >
          <DateTypeEdit etape={props.etape} apiClient={props.apiClient} completeUpdate={dateTypeCompleteUpdate} demarcheId={props.demarcheId} />
        </Bloc>
      ) : null}
      <LoadingElement
        data={etape.value}
        renderItem={etapeLoaded => (
          <>
            {isNotNullNorUndefined(etapeLoaded) ? (
              <>
                <EtapeEditFormInternal {...props} etape={etapeLoaded} documents={documents.value} setEtape={setEtapeAndDocument} alertesUpdate={setPerimetreInfos} />
                <PureFormSaveBtn
                  class="fr-mt-2w fr-pt-2w fr-pb-2w"
                  style={{ position: 'sticky', bottom: 0, background: 'white', zIndex: 100000 }}
                  alertes={alertes.value}
                  canSave={canSave.value}
                  canDepose={canDepose.value}
                  showDepose={etapeLoaded.typeId === 'mfr' && etapeLoaded.isBrouillon}
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
            ) : null}{' '}
          </>
        )}
      />
    </form>
  )
})

const EtapeEditFormInternal = defineComponent<
  {
    etape: DeepReadonly<CoreEtapeCreationOrModification>
    documents: EtapeEditFormDocuments
    setEtape: (etape: DeepReadonly<CoreEtapeCreationOrModification>, documents: EtapeEditFormDocuments) => void
    alertesUpdate: (alertes: PerimetreInformations) => void
  } & Omit<Props, 'etape'>
>(props => {
  const documentsCompleteUpdate = (
    etapeDocuments: (EtapeDocument | TempEtapeDocument)[],
    daeDocument: DocumentComplementaireDaeEtapeDocumentModification | null,
    aslDocument: DocumentComplementaireAslEtapeDocumentModification | null
  ) => {
    props.setEtape(props.etape, {
      ...props.documents,
      etapeDocuments,
      daeDocument,
      aslDocument,
    })
  }

  const entrepriseDocumentsCompleteUpdate = (entrepriseDocuments: DeepReadonly<SelectedEntrepriseDocument[]>) => {
    props.setEtape(props.etape, { ...props.documents, entrepriseDocuments })
  }

  const onEtapePerimetreChange = (perimetreInfos: GeojsonInformations) => {
    props.setEtape(
      {
        ...props.etape,
        perimetre: {
          ...props.etape.perimetre,
          value: {
            geojson4326Forages: isNotNullNorUndefined(props.etape.perimetre.value) ? props.etape.perimetre.value.geojson4326Forages : null,
            geojsonOrigineForages: isNotNullNorUndefined(props.etape.perimetre.value) ? props.etape.perimetre.value.geojsonOrigineForages : null,
            geojson4326Perimetre: perimetreInfos.geojson4326_perimetre,
            geojson4326Points: perimetreInfos.geojson4326_points,
            geojsonOriginePerimetre: perimetreInfos.geojson_origine_perimetre,
            geojsonOriginePoints: perimetreInfos.geojson_origine_points,
            geojsonOrigineGeoSystemeId: perimetreInfos.geojson_origine_geo_systeme_id,
            surface: perimetreInfos.surface,
          },
        },
      },
      props.documents
    )

    props.alertesUpdate({ superposition_alertes: perimetreInfos.superposition_alertes, sdomZoneIds: perimetreInfos.sdomZoneIds })
  }

  const onEtapePerimetreHeritageChange = (perimetre: DeepReadonly<FlattenEtape['perimetre']>) => {
    props.setEtape(
      {
        ...props.etape,
        perimetre,
      },
      props.documents
    )
  }
  const onEtapePointsChange = (geojson4326Points: FeatureCollectionPoints, geojsonOriginePoints: FeatureCollectionPoints) => {
    if (isNotNullNorUndefined(props.etape.perimetre.value)) {
      props.setEtape({ ...props.etape, perimetre: { ...props.etape.perimetre, value: { ...props.etape.perimetre.value, geojson4326Points, geojsonOriginePoints } } }, props.documents)
    }
  }
  const onEtapeForagesChange = (geojson4326Forages: FeatureCollectionForages, geojsonOrigineForages: FeatureCollectionForages) => {
    if (isNotNullNorUndefined(props.etape.perimetre.value)) {
      props.setEtape({ ...props.etape, perimetre: { ...props.etape.perimetre, value: { ...props.etape.perimetre.value, geojson4326Forages, geojsonOrigineForages } } }, props.documents)
    }
  }

  const sectionCompleteUpdate = (sectionsEtape: SectionsEditEtape) => {
    props.setEtape({ ...props.etape, contenu: sectionsEtape.contenu }, props.documents)
  }

  const onUpdateNotes = (notes: string) => {
    props.setEtape({ ...props.etape, notes }, props.documents)
  }

  const fondamentalesCompleteUpdate = (etapeFondamentale: DeepReadonly<EtapeFondamentaleEdit>) => {
    props.setEtape({ ...props.etape, ...etapeFondamentale }, props.documents)
  }

  const titulairesAndAmodiataires = computed<Entreprise[]>(() => {
    return props.entreprises.filter(({ id }) => props.etape.titulaires.value.includes(id) || props.etape.amodiataires.value.includes(id))
  })

  const isHelpVisible = computed<boolean>(() => {
    return props.etape.typeId === 'mfr' && ['arm', 'axm'].includes(props.titreTypeId)
  })

  return () => (
    <div>
      {fondamentaleStepIsVisible(props.etape.typeId) ? (
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
          <SectionsEdit etape={props.etape} titreTypeId={props.titreTypeId} demarcheTypeId={props.demarcheTypeId} completeUpdate={sectionCompleteUpdate} />
        </Bloc>
      ) : null}

      {perimetreStepIsVisible(props.etape) ? (
        <Bloc step={{ name: 'Périmètre', help: null }} complete={perimetreStepIsComplete(props.etape)}>
          <PerimetreEdit
            etape={props.etape}
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

      {etapeDocumentsStepIsVisible(props.etape, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{ name: 'Liste des documents', help: null }}
          complete={etapeDocumentsStepIsComplete(
            props.etape,
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
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: props.etape.typeId }}
            etapeId={props.etape.id}
            completeUpdate={documentsCompleteUpdate}
            sdomZoneIds={props.perimetre.sdomZoneIds}
            user={props.user}
            contenu={props.etape.contenu}
            isBrouillon={props.etape.isBrouillon}
          />
        </Bloc>
      ) : null}

      {entrepriseDocumentsStepIsVisible(props.etape, props.demarcheTypeId, props.titreTypeId) ? (
        <Bloc
          step={{
            name: 'Documents d’entreprise',
            help:
              isHelpVisible.value && isNotNullNorUndefinedNorEmpty(titulairesAndAmodiataires.value)
                ? "Les documents d’entreprise sont des documents propres à l'entreprise, et pourront être réutilisés pour la création d'un autre dossier et mis à jour si nécessaire. Ces documents d’entreprise sont consultables dans la fiche entreprise de votre société. Cette section permet de protéger et de centraliser les informations d'ordre privé relatives à la société et à son personnel."
                : null,
          }}
          complete={entrepriseDocumentsStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId, props.documents.entrepriseDocuments)}
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
