import { EtapesStatuts, EtapeStatutId, ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { EtapesTypes, ETAPES_TYPES, EtapeType, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { computed, ref, FunctionalComponent, watch, DeepReadonly } from 'vue'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeApiClient } from './etape-api-client'
import { CaminoDate } from 'camino-common/src/date'
import { EtapeId, EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { AsyncData } from '@/api/client-rest'
import { LoadingElement } from '../_ui/functional-loader'
import { NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefinedOrEmpty, onlyUnique } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { DsfrSelect, Item } from '../_ui/dsfr-select'

type Props = {
  etape: {
    statutId: EtapeStatutId | null
    typeId: EtapeTypeId | null
    id?: EtapeId | null
    date: CaminoDate
  }
  demarcheId: DemarcheId
  apiClient: Pick<EtapeApiClient, 'getEtapesTypesEtapesStatuts'>
  onEtapeChange: (statutId: EtapeStatutId | null, typeId: EtapeTypeId | null) => void
}

interface SelectStatutProps {
  statutId: EtapeStatutId | null
  statutIds: NonEmptyArray<EtapeStatutId>
  onStatutChange: (statutId: EtapeStatutId | null) => void
}

const SelectStatut: FunctionalComponent<SelectStatutProps> = (props: SelectStatutProps): JSX.Element | null => {
  // @ts-ignore FIXME
  const items: DeepReadonly<NonEmptyArray<Item<EtapeStatutId>>> = props.statutIds.map(statutId => ({ id: statutId, label: EtapesStatuts[statutId].nom, disabled: props.statutId === statutId }))

  const initialValue = isNotNullNorUndefined(props.statutId) ? props.statutId : props.statutIds.length === 1 ? props.statutIds[0] : null

  return <DsfrSelect initialValue={initialValue} items={items} legend={{ main: 'Statut' }} required={true} id="select-etape-statut-id" valueChanged={props.onStatutChange} />
}

export const TypeEdit = caminoDefineComponent<Props>(['etape', 'apiClient', 'onEtapeChange', 'demarcheId'], props => {
  const etapeTypeSearch = ref<string>('')
  const etapeTypeId = ref<EtapeTypeId | null>(props.etape.typeId ?? null)
  const etapeStatutId = ref<EtapeStatutId | null>(props.etape.statutId)

  const possibleEtapes = ref<AsyncData<EtapeTypeEtapeStatutWithMainStep[]>>({ status: 'LOADING' })
  const possibleStatuts = ref<EtapeStatutId[]>([])
  watch(
    () => props.etape.date,
    async newEtapeDate => {
      try {
        possibleEtapes.value = { status: 'LOADED', value: await props.apiClient.getEtapesTypesEtapesStatuts(props.demarcheId, props.etape?.id ?? null, newEtapeDate) }
        if (etapeTypeId.value) {
          possibleStatuts.value = possibleEtapes.value.value.filter(possible => possible.etapeTypeId === etapeTypeId.value).map(({ etapeStatutId }) => etapeStatutId)
        }
      } catch (e: any) {
        possibleEtapes.value = {
          status: 'ERROR',
          message: e.message ?? 'something wrong happened',
        }
      }
    },
    { immediate: true }
  )

  const etapeTypeExistante = computed<Pick<EtapeType, 'id'> | null>(() => (etapeTypeId.value ? { id: etapeTypeId.value } : null))

  const displayItemInList = (item: EtapeType, etapeTypeEtapeStatutWithMainStep: EtapeTypeEtapeStatutWithMainStep[]): JSX.Element => {
    const isMainStep = etapeTypeEtapeStatutWithMainStep.some(({ etapeTypeId, mainStep }) => etapeTypeId === item.id && mainStep)

    return isMainStep ? <strong>{item.nom}</strong> : <>{item.nom}</>
  }

  const noItemsText = computed<string | null>(() => {
    if (possibleEtapes.value.status === 'LOADED') {
      if (isNullOrUndefinedOrEmpty(possibleEtapes.value.value)) {
        if (isNotNullNorUndefined(props.etape.typeId)) {
          return `L'étape ${EtapesTypes[props.etape.typeId].nom} n'est pas possible à cette date`
        }

        return 'Il n’y a aucune étape possible à cette date.'
      }
      if (isNotNullNorUndefined(props.etape.typeId) && !possibleEtapes.value.value.some(({ etapeTypeId }) => etapeTypeId === props.etape.typeId)) {
        return `L'étape ${EtapesTypes[props.etape.typeId].nom} n'est pas possible à cette date`
      }
    }

    return null
  })

  return () => (
    <LoadingElement
      data={possibleEtapes.value}
      renderItem={items => (
        <>
          {noItemsText.value === null ? (
            <>
              <div class="fr-input-group">
                <label class="fr-label fr-mb-1w" for="select-etape-type">
                  Type *
                </label>
                <TypeAheadSingle
                  overrideItem={etapeTypeExistante.value}
                  disabled={isNotNullNorUndefined(etapeTypeId.value)}
                  props={{
                    id: 'select-etape-type',
                    placeholder: '',
                    items: [...items]
                      .sort((a, _b) => (a.mainStep ? -1 : 1))
                      .map(({ etapeTypeId }) => EtapesTypes[etapeTypeId])
                      .filter(({ nom }) => {
                        return nom.toLowerCase().includes(etapeTypeSearch.value)
                      })
                      .filter(onlyUnique),
                    minInputLength: 0,
                    itemKey: 'id',
                    itemChipLabel: item => item.nom,
                    displayItemInList: item => displayItemInList(item, items),
                    onSelectItem: (type: EtapeType | undefined) => {
                      if (type) {
                        etapeTypeSearch.value = ''
                        possibleStatuts.value = items.filter(({ etapeTypeId }) => etapeTypeId === type.id).map(({ etapeStatutId }) => etapeStatutId)
                        if (possibleStatuts.value.length === 1) {
                          etapeStatutId.value = possibleStatuts.value[0]
                        } else {
                          etapeStatutId.value = null
                        }

                        etapeTypeId.value = type.id
                        props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
                      }
                    },
                    onInput: (searchTerm: string) => (etapeTypeSearch.value = searchTerm),
                  }}
                />
              </div>
              {(etapeTypeId.value === ETAPES_TYPES.demande && etapeStatutId.value === ETAPES_STATUTS.EN_CONSTRUCTION) || !isNonEmptyArray(possibleStatuts.value) ? null : (
                <SelectStatut
                  statutIds={possibleStatuts.value}
                  statutId={etapeStatutId.value}
                  onStatutChange={statutId => {
                    etapeStatutId.value = statutId
                    props.onEtapeChange(etapeStatutId.value, etapeTypeId.value)
                  }}
                />
              )}
            </>
          ) : (
            <Alert type="warning" title={noItemsText.value} description="Veuillez modifier la date pour pouvoir choisir une étape." />
          )}
        </>
      )}
    />
  )
})
