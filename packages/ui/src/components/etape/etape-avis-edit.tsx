import { EtapeAvis, EtapeAvisModification, EtapeId, TempEtapeAvis } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ApiClient } from '../../api/api-client'
import { DeepReadonly, FunctionalComponent, computed, defineComponent, onMounted, ref, watch } from 'vue'
import { isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, NonEmptyArray } from 'camino-common/src/typescript-tools'
import { LoadingElement } from '../_ui/functional-loader'
import { AsyncData } from '../../api/client-rest'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { AddEtapeAvisPopup } from './add-etape-avis-popup'
import { getAvisTypes } from 'camino-common/src/permissions/etape-form'
import { dateFormat } from 'camino-common/src/date'
import { AvisStatut } from '../_common/etape-statut'
import { AvisTypeId, AvisTypes } from 'camino-common/src/static/avisTypes'
import { CommuneId } from 'camino-common/src/static/communes'
import { getAvisVisibilityLabel } from './etape-avis'
import { User } from 'camino-common/src/roles'

interface Props {
  tde: {
    titreTypeId: TitreTypeId
    demarcheTypeId: DemarcheTypeId
    etapeTypeId: EtapeTypeId
  }
  onChange: (etapeAvis: (EtapeAvis | TempEtapeAvis)[]) => void
  etapeId: EtapeId | null
  communeIds: DeepReadonly<CommuneId[]>
  apiClient: Pick<ApiClient, 'uploadTempDocument' | 'getEtapeAvisByEtapeId'>
  user: User
}

type WithIndex = { index: number }

type EtapeAvisModificationWithIndex = EtapeAvisModification & WithIndex
export const EtapeAvisEdit = defineComponent<Props>(props => {
  const etapeAvis = ref<AsyncData<EtapeAvis[]>>({ status: 'LOADING' })

  onMounted(async () => {
    if (isNotNullNorUndefined(props.etapeId)) {
      etapeAvis.value = { status: 'LOADING' }
      try {
        const result = await props.apiClient.getEtapeAvisByEtapeId(props.etapeId)

        etapeAvis.value = { status: 'LOADED', value: result }
      } catch (e: any) {
        console.error('error', e)
        etapeAvis.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    } else {
      etapeAvis.value = { status: 'LOADED', value: [] }
    }
    if (etapeAvis.value.status === 'LOADED') {
      props.onChange(etapeAvis.value.value)
    }
  })

  return () => <LoadingElement data={etapeAvis.value} renderItem={avis => <EtapeAvisLoaded avis={avis} {...props} />} />
})

type EtapeAvisLoadedProps = { avis: EtapeAvis[] } & Props
const EtapeAvisLoaded = defineComponent<EtapeAvisLoadedProps>(props => {
  const etapeAvis = ref<EtapeAvisModificationWithIndex[]>(props.avis.map((avis, index) => ({ ...avis, index })))

  watch(
    () => etapeAvis.value,
    () => {
      props.onChange(etapeAvis.value)
    },
    { deep: true }
  )

  const addOrEditPopupOpen = ref<{ open: true; avisTypeIds: NonEmptyArray<AvisTypeId>; etapeAvis?: (EtapeAvis | TempEtapeAvis) & WithIndex } | { open: false }>({ open: false })

  const avisTypes = computed(() => {
    return getAvisTypes(props.tde.etapeTypeId, props.tde.titreTypeId, props.communeIds)
  })

  const completeRequiredAvis = computed<PropsTable['avis']>(() => {
    const avis: PropsTable['avis'] = etapeAvis.value.filter(({ avis_type_id }) => avisTypes.value.some(dt => dt.id === avis_type_id && !dt.optionnel))

    return avis
  })
  const emptyRequiredAvis = computed<AvisTypeId[]>(() => {
    const avis = avisTypes.value.filter(({ optionnel, id }) => !optionnel && !completeRequiredAvis.value.some(({ avis_type_id }) => avis_type_id === id)).map(({ id }) => id)

    return avis
  })
  const additionnalAvisTypeIds = computed<AvisTypeId[]>(() => {
    return avisTypes.value.filter(dt => dt.optionnel).map(({ id }) => id)
  })

  const additionnalAvis = computed<PropsTable['avis']>(() => {
    return etapeAvis.value.filter(({ avis_type_id }) => avisTypes.value.some(dt => dt.id === avis_type_id && dt.optionnel))
  })
  const openAddPopupAdditionnalAvis = () => {
    if (isNonEmptyArray(additionnalAvisTypeIds.value)) {
      addOrEditPopupOpen.value = { open: true, avisTypeIds: additionnalAvisTypeIds.value }
    }
  }
  const closeAddPopup = (newAvis: EtapeAvisModification | null) => {
    if (newAvis !== null && addOrEditPopupOpen.value.open) {
      const index = addOrEditPopupOpen.value.etapeAvis?.index
      if (isNullOrUndefined(index)) {
        etapeAvis.value.push({ ...newAvis, index: etapeAvis.value.length })
      } else {
        etapeAvis.value[index] = { ...newAvis, index }
      }
    }

    addOrEditPopupOpen.value = { open: false }
  }

  const addAvis = (avisTypeId: AvisTypeId) => {
    addOrEditPopupOpen.value = { open: true, avisTypeIds: [avisTypeId] }
  }
  const editAvis = (avisIndex: number) => {
    const avis = etapeAvis.value[avisIndex]
    addOrEditPopupOpen.value = { open: true, avisTypeIds: [avis.avis_type_id], etapeAvis: avis }
  }
  const removeAvis = (avisIndex: number) => {
    etapeAvis.value.splice(avisIndex, 1)
    etapeAvis.value.forEach((a, index) => {
      a.index = index
    })
  }

  const getNom = (avisTypeId: AvisTypeId) => {
    return AvisTypes[avisTypeId].nom
  }

  return () => (
    <>
      {isNotNullNorUndefinedNorEmpty(emptyRequiredAvis.value) || isNotNullNorUndefinedNorEmpty(completeRequiredAvis.value) ? (
        <EtapeAvisTable getNom={getNom} add={addAvis} edit={editAvis} delete={removeAvis} caption="Avis obligatoires" emptyRequiredAvis={emptyRequiredAvis.value} avis={completeRequiredAvis.value} />
      ) : null}

      {isNonEmptyArray(additionnalAvisTypeIds.value) ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-mt-3w">
            <EtapeAvisTable getNom={getNom} add={addAvis} edit={editAvis} delete={removeAvis} caption="Avis complémentaires" emptyRequiredAvis={[]} avis={additionnalAvis.value} />
            <DsfrButtonIcon
              style={{ alignSelf: 'end' }}
              class="fr-mt-1w"
              icon="fr-icon-add-line"
              buttonType="secondary"
              title="Ajouter un avis complémentaire"
              label="Ajouter"
              onClick={openAddPopupAdditionnalAvis}
            />
          </div>
          {addOrEditPopupOpen.value.open ? (
            <AddEtapeAvisPopup
              avisTypeIds={addOrEditPopupOpen.value.avisTypeIds}
              user={props.user}
              apiClient={props.apiClient}
              close={closeAddPopup}
              initialAvis={addOrEditPopupOpen.value.etapeAvis || null}
            />
          ) : null}
        </>
      ) : null}
    </>
  )
})

type PropsTable = {
  caption: string
  avis: ((EtapeAvis | TempEtapeAvis) & { index: number })[]
  emptyRequiredAvis: AvisTypeId[]
  getNom: (avisTypeId: AvisTypeId) => string
  add: (avisTypeId: AvisTypeId) => void
  edit: (avisIndex: number) => void
  delete: (avisIndex: number) => void
}
const EtapeAvisTable: FunctionalComponent<PropsTable> = (props: PropsTable) => {
  const deleteAvis = (index: number) => () => {
    props.delete(index)
  }
  const editAvis = (index: number) => () => {
    props.edit(index)
  }

  return (
    <div class="fr-table fr-mb-0">
      <table style={{ display: 'table' }}>
        <caption>{props.caption}</caption>
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col">Statut</th>
            <th scope="col">Visibilité</th>
            <th scope="col" style={{ display: 'flex', justifyContent: 'end' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {props.avis.map(avis => (
            <tr>
              <td>{props.getNom(avis.avis_type_id)}</td>
              <td>{dateFormat(avis.date)}</td>
              <td style={{ whiteSpace: 'pre-line' }}>{avis.description}</td>
              <td>
                <AvisStatut avisStatutId={avis.avis_statut_id} />
              </td>
              <td>{getAvisVisibilityLabel(avis.avis_visibility_id)}</td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                  <DsfrButtonIcon icon="fr-icon-edit-line" title={`Modifier l’avis de ${props.getNom(avis.avis_type_id)}`} onClick={editAvis(avis.index)} buttonType="secondary" buttonSize="sm" />
                  <DsfrButtonIcon
                    icon="fr-icon-delete-bin-line"
                    class="fr-ml-1w"
                    title={`Supprimer l’avis de ${props.getNom(avis.avis_type_id)}`}
                    onClick={deleteAvis(avis.index)}
                    buttonType="secondary"
                    buttonSize="sm"
                  />
                </div>
              </td>
            </tr>
          ))}
          {props.emptyRequiredAvis.map(avisTypeId => (
            <tr>
              <td class="fr-label--disabled">{props.getNom(avisTypeId)}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td style={{ display: 'flex', justifyContent: 'end' }}>
                <DsfrButtonIcon icon="fr-icon-add-line" title={`Ajouter un document ${props.getNom(avisTypeId)}`} onClick={() => props.add(avisTypeId)} buttonType="secondary" buttonSize="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeAvisEdit.props = ['tde', 'onChange', 'etapeId', 'apiClient', 'communeIds', 'user']
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
EtapeAvisLoaded.props = ['tde', 'onChange', 'etapeId', 'apiClient', 'avis', 'communeIds', 'user']
