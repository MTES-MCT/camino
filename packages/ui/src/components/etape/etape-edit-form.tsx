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
  ETAPE_IS_NOT_BROUILLON,
  EtapeAvis,
  EtapeDocument,
  EtapeId,
  TempEtapeAvis,
  TempEtapeDocument,
} from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { SDOMZoneIds, SDOMZones } from 'camino-common/src/static/sdom'
import { Nullable, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Entreprise } from 'camino-common/src/entreprise'
import { DemarcheId } from 'camino-common/src/demarche'
import { useState } from '@/utils/vue-tsx-utils'
import { DateTypeEdit, EtapeDateTypeEdit } from './date-type-edit'
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
  etapeAvisStepIsVisible,
  etapeAvisStepIsComplete,
  dateTypeStepIsComplete,
  dateTypeStepIsVisible,
} from 'camino-common/src/permissions/etape-form'
import { EtapeAlerte, PureFormSaveBtn } from './pure-form-save-btn'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { DeposeEtapePopup } from '../demarche/depose-etape-popup'
import { EtapeAvisEdit } from './etape-avis-edit'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes'
import { CoreEtapeCreationOrModification, GetEtapeHeritagePotentiel } from './etape-api-client'
import { FlattenEtape, RestEtapeCreation } from 'camino-common/src/etape-form'
import { AsyncData } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { LoadingElement } from '../_ui/functional-loader'
import { isEtapeDeposable } from 'camino-common/src/permissions/titres-etapes'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { DsfrInputCheckbox } from '../_ui/dsfr-input-checkbox'

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
    | 'geojsonPointsImport'
    | 'geojsonForagesImport'
    | 'getEtapeDocumentsByEtapeId'
    | 'getEtapeEntrepriseDocuments'
    | 'creerEntrepriseDocument'
    | 'etapeCreer'
    | 'etapeModifier'
    | 'deposeEtape'
    | 'getEtapeAvisByEtapeId'
  >
}

type EtapeEditFormDocuments = DeepReadonly<{
  etapeDocuments: (EtapeDocument | TempEtapeDocument)[]
  entrepriseDocuments: SelectedEntrepriseDocument[]
  daeDocument: DocumentComplementaireDaeEtapeDocumentModification | null
  aslDocument: DocumentComplementaireAslEtapeDocumentModification | null
  etapeAvis: (EtapeAvis | TempEtapeAvis)[]
}>

const mergeFlattenEtapeWithNewHeritage = (
  etape: DeepReadonly<CoreEtapeCreationOrModification>,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  heritageData: DeepReadonly<GetEtapeHeritagePotentiel>
): DeepReadonly<CoreEtapeCreationOrModification> => {
  const sections = getSections(titreTypeId, demarcheTypeId, etape.typeId)
  const flattenEtape: DeepReadonly<CoreEtapeCreationOrModification> = {
    ...etape,
    contenu: sections.reduce<DeepReadonly<FlattenEtape['contenu']>>((accSection, section) => {
      const newSection = section.elements.reduce<DeepReadonly<FlattenEtape['contenu'][string]>>((accElement, element) => {
        const elementHeritage = heritageData.heritageContenu[section.id]?.[element.id] ?? { actif: false, etape: null }
        const currentHeritage: DeepReadonly<FlattenEtape['contenu'][string][string]> = etape.contenu[section.id]?.[element.id] ?? { value: null, heritee: true, etapeHeritee: null }

        // L'héritage ne peut pas être activé si le champ est obligatoire et que la valeur du champ dans l'étape héritable est null
        const canHaveHeritage: boolean = element.optionnel || isNotNullNorUndefined(elementHeritage.etape?.contenu?.[section.id]?.[element.id])
        return {
          ...accElement,
          [element.id]: {
            value: currentHeritage.heritee ? (elementHeritage.etape?.contenu?.[section.id]?.[element.id] ?? null) : currentHeritage.value,
            heritee: currentHeritage.heritee && isNotNullNorUndefined(elementHeritage.etape) && canHaveHeritage,
            etapeHeritee:
              isNotNullNorUndefined(elementHeritage.etape) && canHaveHeritage
                ? {
                    etapeTypeId: elementHeritage.etape.typeId,
                    date: elementHeritage.etape.date,
                    value: elementHeritage.etape.contenu[section.id]?.[element.id] ?? null,
                  }
                : null,
          },
        }
      }, {})

      return {
        ...accSection,
        [section.id]: newSection,
      }
    }, {}),
    duree: {
      value: etape.duree.heritee ? (heritageData.heritageProps.duree.etape?.duree ?? null) : etape.duree.value,
      heritee: etape.duree.heritee && isNotNullNorUndefined(heritageData.heritageProps.duree.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.duree.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.duree.etape.typeId,
            date: heritageData.heritageProps.duree.etape.date,
            value: heritageData.heritageProps.duree.etape.duree,
          }
        : null,
    },
    perimetre: {
      value: etape.perimetre.heritee ? (isNotNullNorUndefined(heritageData.heritageProps.perimetre.etape) ? { ...heritageData.heritageProps.perimetre.etape } : null) : etape.perimetre.value,

      heritee: etape.perimetre.heritee && isNotNullNorUndefined(heritageData.heritageProps.perimetre.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.perimetre.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.perimetre.etape.typeId,
            date: heritageData.heritageProps.perimetre.etape.date,
            value: { ...heritageData.heritageProps.perimetre.etape },
          }
        : null,
    },
    dateDebut: {
      value: etape.dateDebut.heritee ? (heritageData.heritageProps.dateDebut.etape?.dateDebut ?? null) : etape.dateDebut.value,
      heritee: etape.dateDebut.heritee && isNotNullNorUndefined(heritageData.heritageProps.dateDebut.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.dateDebut.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.dateDebut.etape.typeId,
            date: heritageData.heritageProps.dateDebut.etape.date,
            value: heritageData.heritageProps.dateDebut.etape.dateDebut,
          }
        : null,
    },
    dateFin: {
      value: etape.dateFin.heritee ? (heritageData.heritageProps.dateFin.etape?.dateFin ?? null) : etape.dateFin.value,
      heritee: etape.dateFin.heritee && isNotNullNorUndefined(heritageData.heritageProps.dateFin.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.dateFin.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.dateFin.etape.typeId,
            date: heritageData.heritageProps.dateFin.etape.date,
            value: heritageData.heritageProps.dateFin.etape.dateFin,
          }
        : null,
    },
    substances: {
      value: etape.substances.heritee ? (isNotNullNorUndefined(heritageData.heritageProps.substances.etape) ? heritageData.heritageProps.substances.etape.substances : []) : etape.substances.value,

      heritee: etape.substances.heritee && isNotNullNorUndefined(heritageData.heritageProps.substances.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.substances.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.substances.etape.typeId,
            date: heritageData.heritageProps.substances.etape.date,
            value: heritageData.heritageProps.substances.etape.substances,
          }
        : null,
    },
    amodiataires: {
      value: etape.amodiataires.heritee
        ? isNotNullNorUndefined(heritageData.heritageProps.amodiataires.etape)
          ? heritageData.heritageProps.amodiataires.etape.amodiataireIds
          : []
        : etape.amodiataires.value,

      heritee: etape.amodiataires.heritee && isNotNullNorUndefined(heritageData.heritageProps.amodiataires.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.amodiataires.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.amodiataires.etape.typeId,
            date: heritageData.heritageProps.amodiataires.etape.date,
            value: heritageData.heritageProps.amodiataires.etape.amodiataireIds,
          }
        : null,
    },
    titulaires: {
      value: etape.titulaires.heritee ? (isNotNullNorUndefined(heritageData.heritageProps.titulaires.etape) ? heritageData.heritageProps.titulaires.etape.titulaireIds : []) : etape.titulaires.value,

      heritee: etape.titulaires.heritee && isNotNullNorUndefined(heritageData.heritageProps.titulaires.etape),
      etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.titulaires.etape)
        ? {
            etapeTypeId: heritageData.heritageProps.titulaires.etape.typeId,
            date: heritageData.heritageProps.titulaires.etape.date,
            value: heritageData.heritageProps.titulaires.etape.titulaireIds,
          }
        : null,
    },
  }
  return flattenEtape
}
export const EtapeEditForm = defineComponent<Props>(props => {
  const [etape, setEtape] = useState<AsyncData<CoreEtapeCreationOrModification | null>>({ status: 'LOADED', value: null })
  const [perimetreInfos, setPerimetreInfos] = useState<DeepReadonly<Omit<PerimetreInformations, 'communes'>>>(props.perimetre)

  const [documents, setDocuments] = useState<EtapeEditFormDocuments>({
    etapeDocuments: [],
    entrepriseDocuments: [],
    daeDocument: null,
    aslDocument: null,
    etapeAvis: [],
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
      const etape = {
        ...currentEtape,
        date,
        typeId,
        statutId,
        isBrouillon: isNotNullNorUndefined(currentEtape.id) ? currentEtape.isBrouillon : canBeBrouillon(typeId),
      }
      const value = await props.apiClient.getEtapeHeritagePotentiel(etape, props.demarcheId)
      setEtape({ status: 'LOADED', value: mergeFlattenEtapeWithNewHeritage(etape, props.titreTypeId, props.demarcheTypeId, value) })
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
      if (etape.value.value.isBrouillon === ETAPE_IS_NOT_BROUILLON) {
        return (
          dateTypeStepIsComplete(etape.value.value, props.user).valid &&
          fondamentaleStepIsComplete(etape.value.value, props.demarcheTypeId, props.titreTypeId).valid &&
          sectionsStepIsComplete(etape.value.value, props.demarcheTypeId, props.titreTypeId).valid &&
          perimetreStepIsComplete(etape.value.value).valid &&
          etapeDocumentsStepIsComplete(
            etape.value.value,
            props.demarcheTypeId,
            props.titreTypeId,
            documents.value.etapeDocuments,
            props.perimetre.sdomZoneIds,
            documents.value.daeDocument,
            documents.value.aslDocument,
            props.user
          ).valid &&
          entrepriseDocumentsStepIsComplete(etape.value.value, props.demarcheTypeId, props.titreTypeId, documents.value.entrepriseDocuments).valid &&
          etapeAvisStepIsComplete(etape.value.value, documents.value.etapeAvis, props.titreTypeId, props.perimetre.communes).valid
        )
      }
      return dateTypeStepIsComplete(etape.value.value, props.user).valid && etape.value.value.isBrouillon
    }
    return false
  })

  const canDepose = computed<boolean>(() => {
    if (etape.value.status === 'LOADED' && isNotNullNorUndefined(etape.value.value)) {
      return isEtapeDeposable(
        props.user,
        props.titreTypeId,
        props.demarcheTypeId,
        etape.value.value,
        documents.value.etapeDocuments,
        documents.value.entrepriseDocuments.map(({ documentTypeId, entrepriseId }) => ({ entreprise_document_type_id: documentTypeId, entreprise_id: entrepriseId })),
        props.perimetre.sdomZoneIds,
        props.perimetre.communes,
        documents.value.daeDocument,
        documents.value.aslDocument,
        documents.value.etapeAvis
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
        contenu: Object.keys(etapeValue.contenu).reduce<DeepReadonly<RestEtapeCreation['contenu']>>((sectionsAcc, section) => {
          sectionsAcc = {
            ...sectionsAcc,
            [section]: Object.keys(etapeValue.contenu[section]).reduce<DeepReadonly<RestEtapeCreation['contenu'][string]>>((elementsAcc, element) => {
              elementsAcc = { ...elementsAcc, [element]: etapeValue.contenu[section][element].value }

              return elementsAcc
            }, {}),
          }

          return sectionsAcc
        }, {}),
        heritageContenu: Object.keys(etapeValue.contenu).reduce<DeepReadonly<RestEtapeCreation['heritageContenu']>>((sectionsAcc, section) => {
          return {
            ...sectionsAcc,
            [section]: Object.keys(etapeValue.contenu[section]).reduce<DeepReadonly<RestEtapeCreation['heritageContenu'][string]>>((elementsAcc, element) => {
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

  const showDeposeEtapePopup = ref<boolean>(false)
  const depose = () => {
    showDeposeEtapePopup.value = canDepose.value
  }

  const closeDeposePopup = () => {
    showDeposeEtapePopup.value = false
  }

  return () => (
    <form onSubmit={e => e.preventDefault()}>
      {dateTypeStepIsVisible(props.user) ? (
        <Bloc
          step={{ name: 'Informations principales', help: null }}
          complete={
            dateTypeStepIsComplete(
              etape.value.status === 'LOADED' && etape.value.value !== null
                ? etape.value.value
                : {
                    date: null,
                    statutId: null,
                    typeId: null,
                  },
              props.user
            ).valid
          }
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
                  showDepose={etapeLoaded.isBrouillon}
                  save={saveAndReroute}
                  depose={depose}
                  etapeTypeId={etapeLoaded.typeId}
                />
                {showDeposeEtapePopup.value === true ? (
                  <DeposeEtapePopup
                    close={closeDeposePopup}
                    deposeEtape={async () => {
                      const etapeIdToDepose = await save()
                      if (isNotNullNorUndefined(etapeIdToDepose)) {
                        await props.apiClient.deposeEtape(etapeIdToDepose)
                        props.goToDemarche(props.demarcheId)
                      }
                    }}
                    etapeTypeId={etapeLoaded.typeId}
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
    alertesUpdate: (alertes: Omit<DeepReadonly<PerimetreInformations>, 'communes'>) => void
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

  const avisCompleteUpdate = (etapeAvis: (EtapeAvis | TempEtapeAvis)[]) => {
    props.setEtape(props.etape, {
      ...props.documents,
      etapeAvis,
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
    props.setEtape({ ...props.etape, note: { is_avertissement: props.etape.note.is_avertissement, valeur: notes } }, props.documents)
  }
  const onUpdateNoteAvertissement = (isAvertissement: DeepReadonly<boolean>) => {
    props.setEtape({ ...props.etape, note: { valeur: props.etape.note.valeur, is_avertissement: isAvertissement } }, props.documents)
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
        <Bloc step={{ name: 'Propriétés', help: null }} complete={fondamentaleStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId).valid}>
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
          complete={sectionsStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId).valid}
        >
          <SectionsEdit etape={props.etape} titreTypeId={props.titreTypeId} demarcheTypeId={props.demarcheTypeId} completeUpdate={sectionCompleteUpdate} />
        </Bloc>
      ) : null}

      {perimetreStepIsVisible(props.etape) ? (
        <Bloc step={{ name: 'Périmètre', help: null }} complete={perimetreStepIsComplete(props.etape).valid}>
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
          complete={
            etapeDocumentsStepIsComplete(
              props.etape,
              props.demarcheTypeId,
              props.titreTypeId,
              props.documents.etapeDocuments,
              props.perimetre.sdomZoneIds,
              props.documents.daeDocument,
              props.documents.aslDocument,
              props.user
            ).valid
          }
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

      {etapeAvisStepIsVisible(props.etape, props.titreTypeId, props.perimetre.communes) ? (
        <Bloc step={{ name: 'Liste des avis', help: null }} complete={etapeAvisStepIsComplete(props.etape, props.documents.etapeAvis, props.titreTypeId, props.perimetre.communes).valid}>
          <EtapeAvisEdit
            apiClient={props.apiClient}
            tde={{ titreTypeId: props.titreTypeId, demarcheTypeId: props.demarcheTypeId, etapeTypeId: props.etape.typeId }}
            etapeId={props.etape.id}
            communeIds={props.perimetre.communes}
            onChange={avisCompleteUpdate}
            user={props.user}
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
          complete={entrepriseDocumentsStepIsComplete(props.etape, props.demarcheTypeId, props.titreTypeId, props.documents.entrepriseDocuments).valid}
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

      <DsfrTextarea initialValue={props.etape.note.valeur} class="fr-mt-2w" style="flex-grow: 1" legend={{ main: 'Notes' }} valueChanged={onUpdateNotes} />
      <DsfrInputCheckbox
        legend={{ main: 'Cette note est un avertissement', description: 'Apparait sur le résumé de la démarche' }}
        valueChanged={onUpdateNoteAvertissement}
        initialValue={props.etape.note.is_avertissement}
      />
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
